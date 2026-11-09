// This 
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { isValidPhoneNumber } from 'libphonenumber-js';
import crypto from 'node:crypto';
import { pool } from '../db';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();
const sessionCookie = 'session';
const isProduction = process.env.NODE_ENV === 'production';

function jwtSecret(): string {
	if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured.');
	return process.env.JWT_SECRET;
}

function cookieOptions(rememberMe = false) {
	return {
		httpOnly: true,
		sameSite: isProduction ? 'none' : 'lax' as const,
		secure: isProduction,
		maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000,
		domain: process.env.COOKIE_DOMAIN || undefined,
	};
}

function setSessionCookie(res: Parameters<Router['post']>[1] extends never ? never : any, user: any, rememberMe = false): void {
	const expiresIn = rememberMe ? '30d' : '8h';
	const token = jwt.sign(
		{ role: user.role, technicianId: user.technician_id ?? undefined },
		jwtSecret(),
		{ subject: user.id, expiresIn }
	);
	res.cookie(sessionCookie, token, cookieOptions(rememberMe));
}

function publicUser(user: any) {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
		phone: user.phone ?? undefined,
		town: user.town ?? undefined,
		technicianId: user.technician_id ?? undefined,
	};
}

function validPassword(password: unknown): password is string {
	return typeof password === 'string' && password.length >= 10 && password.length <= 128 && /[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password);
}

router.post('/forgot-password', async (req, res) => {
	const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
	if (!email) return res.status(400).json({ error: 'A valid email address is required.' });
	try {
		const result = await pool.query('SELECT id FROM users WHERE lower(email) = $1', [email]);
		if (!result.rows[0]) return res.json({ message: 'If an account exists, password reset instructions have been created.' });
		const token = crypto.randomBytes(32).toString('hex');
		const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
		await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1 OR expires_at < now()', [result.rows[0].id]);
		await pool.query('INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval \'30 minutes\')', [result.rows[0].id, tokenHash]);
		res.json({ message: 'Reset instructions created. Use the reset token to set a new password.', resetToken: token });
	} catch (error) { console.error(error); res.status(500).json({ error: 'Could not create a password reset request.' }); }
});

router.post('/reset-password', async (req, res) => {
	const { token, password } = req.body ?? {};
	if (typeof token !== 'string' || !validPassword(password)) return res.status(400).json({ error: 'Use a valid token and a password with at least 10 characters, one uppercase letter, and one special character.' });
	const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const result = await client.query('SELECT user_id FROM password_reset_tokens WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now() FOR UPDATE', [tokenHash]);
		if (!result.rows[0]) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'This reset token is invalid or expired.' }); }
		await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [await bcrypt.hash(password, 12), result.rows[0].user_id]);
		await client.query('UPDATE password_reset_tokens SET used_at = now() WHERE token_hash = $1', [tokenHash]);
		await client.query('COMMIT');
		res.json({ message: 'Password updated successfully.' });
	} catch (error) { await client.query('ROLLBACK'); console.error(error); res.status(500).json({ error: 'Could not reset password.' }); } finally { client.release(); }
});

router.post('/register', async (req, res) => {
	const { name, email, password, role = 'client', phone, town = 'Kampala', trade } = req.body ?? {};
	const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

	if (typeof name !== 'string' || !name.trim() || name.trim().length > 150 || !cleanEmail || cleanEmail.length > 255 || typeof password !== 'string' || !['client', 'technician'].includes(role)) {
		res.status(400).json({ error: 'Name, email, password, and a valid role are required.' });
		return;
	}
	if (!validPassword(password)) {
		res.status(400).json({ error: 'Password must be at least 10 characters and include an uppercase letter and a special character.' });
		return;
	}
	if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
		res.status(400).json({ error: 'A valid email address is required.' });
		return;
	}
	if (typeof phone !== 'string' || !isValidPhoneNumber(phone)) {
		res.status(400).json({ error: 'A valid international phone number is required.' });
		return;
	}

	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const passwordHash = await bcrypt.hash(password, 12);
		let technicianId: string | null = null;

		if (role === 'technician') {
			if (!trade?.trim() || !phone?.trim()) {
				await client.query('ROLLBACK');
				res.status(400).json({ error: 'Technician trade and phone are required.' });
				return;
			}
			const technician = await client.query(
				`INSERT INTO technicians
					(name, trade, phone, email, town, hourly_rate_ugx, bio)
				 VALUES ($1, $2, $3, $4, $5, 30000, $6)
				 RETURNING id`,
				[name.trim(), trade.trim(), phone.trim(), cleanEmail, town.trim(), `Newly registered service technician in ${town.trim()}.`]
			);
			technicianId = technician.rows[0].id;
		}

		const userResult = await client.query(
			`INSERT INTO users (name, email, role, phone, town, technician_id, password_hash)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)
			 RETURNING id, name, email, role, phone, town, technician_id`,
			[name.trim(), cleanEmail, role, phone?.trim() || null, town.trim(), technicianId, passwordHash]
		);
		await client.query('COMMIT');
		setSessionCookie(res, userResult.rows[0]);
		res.status(201).json({ user: publicUser(userResult.rows[0]) });
	} catch (error: any) {
		await client.query('ROLLBACK');
		if (error?.code === '23505') {
			res.status(409).json({ error: 'An account or technician with this email already exists.' });
			return;
		}
		console.error(error);
		res.status(500).json({ error: 'Registration failed.' });
	} finally {
		client.release();
	}
});

router.post('/login', async (req, res) => {
	const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
	const password = req.body?.password;
	const rememberMe = req.body?.rememberMe === true;
	if (!email || !password) {
		res.status(400).json({ error: 'Email and password are required.' });
		return;
	}

	try {
		const result = await pool.query(
			`SELECT id, name, email, role, phone, town, technician_id, password_hash
			 FROM users WHERE lower(email) = $1`,
			[email]
		);
		const user = result.rows[0];
		if (!user || !(await bcrypt.compare(password, user.password_hash))) {
			res.status(401).json({ error: 'Invalid email or password.' });
			return;
		}
		setSessionCookie(res, user, rememberMe);
		res.json({ user: publicUser(user) });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Login failed.' });
	}
});

router.post('/logout', (_req, res) => {
	res.clearCookie(sessionCookie, {
		domain: process.env.COOKIE_DOMAIN || undefined,
		sameSite: isProduction ? 'none' : 'lax',
		secure: isProduction,
	});
	res.status(204).send();
});

router.get('/users', requireAuth, requireRole('admin'), async (_req, res) => {
	try {
		const result = await pool.query(
			`SELECT id, name, email, role, phone, town, technician_id
			 FROM users ORDER BY created_at DESC`
		);
		res.json({ users: result.rows.map(publicUser) });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Could not load user accounts.' });
	}
});

router.get('/me', requireAuth, async (req, res) => {
	try {
		const result = await pool.query(
			`SELECT id, name, email, role, phone, town, technician_id FROM users WHERE id = $1`,
			[req.user!.id]
		);
		if (!result.rows[0]) {
			res.status(401).json({ error: 'User account no longer exists.' });
			return;
		}
		res.json({ user: publicUser(result.rows[0]) });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Could not load the current user.' });
	}
});

// Update the authenticated user's profile and synchronize a linked technician record.
router.patch('/me', requireAuth, async (req, res) => {
	const updates = ['name', 'phone', 'town'].filter((field) => req.body?.[field] !== undefined);
	if (!updates.length) {
		res.status(400).json({ error: 'At least one profile update is required.' });
		return;
	}

	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const values: any[] = updates.map((field) => typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field]);
		const assignments = updates.map((field, index) => `${field} = $${index + 1}`);
		values.push(req.user!.id);
		const userResult = await client.query(
			`UPDATE users SET ${assignments.join(', ')} WHERE id = $${values.length}
			 RETURNING id, name, email, role, phone, town, technician_id`,
			values
		);
		const user = userResult.rows[0];
		if (!user) {
			await client.query('ROLLBACK');
			res.status(404).json({ error: 'User account not found.' });
			return;
		}

		if (user.technician_id) {
			const technicianFields = updates.filter((field) => ['name', 'phone', 'town'].includes(field));
			if (technicianFields.length) {
				const technicianValues: any[] = technicianFields.map((field) => user[field]);
				technicianValues.push(user.technician_id);
				await client.query(
					`UPDATE technicians SET ${technicianFields.map((field, index) => `${field} = $${index + 1}`).join(', ')}, updated_at = now()
					 WHERE id = $${technicianValues.length}`,
					technicianValues
				);
			}
		}
		await client.query('COMMIT');
		res.json({ user: publicUser(user) });
	} catch (error) {
		await client.query('ROLLBACK');
		console.error(error);
		res.status(500).json({ error: 'Could not update profile.' });
	} finally {
		client.release();
	}
});

export default router;

