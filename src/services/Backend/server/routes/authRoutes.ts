// This 
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();
const sessionCookie = 'session';
const isProduction = process.env.NODE_ENV === 'production';

function jwtSecret(): string {
	if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured.');
	return process.env.JWT_SECRET;
}

function cookieOptions() {
	return {
		httpOnly: true,
		sameSite: isProduction ? 'none' : 'lax' as const,
		secure: isProduction,
		maxAge: 8 * 60 * 60 * 1000,
		domain: process.env.COOKIE_DOMAIN || undefined,
	};
}

function setSessionCookie(res: Parameters<Router['post']>[1] extends never ? never : any, user: any): void {
	const token = jwt.sign(
		{ role: user.role, technicianId: user.technician_id ?? undefined },
		jwtSecret(),
		{ subject: user.id, expiresIn: '8h' }
	);
	res.cookie(sessionCookie, token, cookieOptions());
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

router.post('/register', async (req, res) => {
	const { name, email, password, role = 'client', phone, town = 'Kampala', trade } = req.body ?? {};
	const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

	if (typeof name !== 'string' || !name.trim() || name.trim().length > 150 || !cleanEmail || cleanEmail.length > 255 || typeof password !== 'string' || !['client', 'technician'].includes(role)) {
		res.status(400).json({ error: 'Name, email, password, and a valid role are required.' });
		return;
	}
	if (password.length < 8 || password.length > 128) {
		res.status(400).json({ error: 'Password must be at least 8 characters.' });
		return;
	}
	if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
		res.status(400).json({ error: 'A valid email address is required.' });
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
		setSessionCookie(res, user);
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

