import { Router } from 'express';
import { pool } from '../db';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

const technicianSelect = `
	id, name, trade, phone, email, town,
	hourly_rate_ugx AS "hourlyRateUgx", bio, status,
	created_at AS "createdAt", updated_at AS "updatedAt"
`;

router.get('/', async (req, res) => {
	const values: string[] = [];
	const conditions: string[] = [];
	const addFilter = (column: string, value: unknown, operator = '=') => {
		if (typeof value === 'string' && value.trim() && value !== 'ALL') {
			values.push(operator === 'ILIKE' ? `%${value.trim()}%` : value.trim());
			conditions.push(`${column} ${operator} $${values.length}`);
		}
	};

	addFilter('trade', req.query.trade);
	addFilter('town', req.query.town);
	addFilter('status', req.query.status);
	if (typeof req.query.search === 'string' && req.query.search.trim()) {
		values.push(`%${req.query.search.trim()}%`);
		conditions.push(`(name ILIKE $${values.length} OR trade ILIKE $${values.length} OR town ILIKE $${values.length} OR bio ILIKE $${values.length})`);
	}

	try {
		const query = `SELECT ${technicianSelect} FROM technicians${conditions.length ? ` WHERE ${conditions.join(' AND ')}` : ''} ORDER BY created_at DESC`;
		const result = await pool.query(query, values);
		res.json({ technicians: result.rows });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Could not load technicians.' });
	}
});

router.get('/:id', async (req, res) => {
	try {
		const result = await pool.query(`SELECT ${technicianSelect} FROM technicians WHERE id = $1`, [req.params.id]);
		if (!result.rows[0]) {
			res.status(404).json({ error: 'Technician not found.' });
			return;
		}
		res.json({ technician: result.rows[0] });
	} catch (error) {
		res.status(500).json({ error: 'Could not load technician.' });
	}
});

router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
	const { name, trade, phone, email, town, hourlyRateUgx, bio, status = 'Available' } = req.body ?? {};
	if (![name, trade, phone, email, town, bio].every((value) => typeof value === 'string' && value.trim())) {
		res.status(400).json({ error: 'Name, trade, phone, email, town, and bio are required.' });
		return;
	}
	try {
		const result = await pool.query(
			`INSERT INTO technicians (name, trade, phone, email, town, hourly_rate_ugx, bio, status)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			 RETURNING ${technicianSelect}`,
			[name.trim(), trade.trim(), phone.trim(), email.trim().toLowerCase(), town.trim(), Number(hourlyRateUgx), bio.trim(), status]
		);
		res.status(201).json({ technician: result.rows[0] });
	} catch (error: any) {
		if (error?.code === '23505') {
			res.status(409).json({ error: 'A technician with this email already exists.' });
			return;
		}
		res.status(500).json({ error: 'Could not create technician.' });
	}
});

router.patch('/:id', requireAuth, async (req, res) => {
	const user = req.user!;
	if (user.role !== 'admin' && !(user.role === 'technician' && user.technicianId === req.params.id)) {
		res.status(403).json({ error: 'You may only update your own technician profile.' });
		return;
	}

	const allowed = ['name', 'trade', 'phone', 'email', 'town', 'hourlyRateUgx', 'bio', 'status'] as const;
	const updates = allowed.filter((field) => req.body?.[field] !== undefined);
	if (!updates.length) {
		res.status(400).json({ error: 'At least one update is required.' });
		return;
	}
	const columnMap: Record<string, string> = { hourlyRateUgx: 'hourly_rate_ugx' };
	const values = updates.map((field) => field === 'email' ? String(req.body[field]).trim().toLowerCase() : req.body[field]);
	const assignments = updates.map((field, index) => `${columnMap[field] || field} = $${index + 1}`);
	values.push(req.params.id);

	try {
		const result = await pool.query(
			`UPDATE technicians SET ${assignments.join(', ')}, updated_at = now()
			 WHERE id = $${values.length}
			 RETURNING ${technicianSelect}`,
			values
		);
		if (!result.rows[0]) {
			res.status(404).json({ error: 'Technician not found.' });
			return;
		}
		res.json({ technician: result.rows[0] });
	} catch (error: any) {
		if (error?.code === '23505') {
			res.status(409).json({ error: 'A technician with this email already exists.' });
			return;
		}
		res.status(500).json({ error: 'Could not update technician.' });
	}
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
	try {
		const result = await pool.query('DELETE FROM technicians WHERE id = $1 RETURNING id', [req.params.id]);
		if (!result.rows[0]) {
			res.status(404).json({ error: 'Technician not found.' });
			return;
		}
		res.status(204).send();
	} catch (error) {
		res.status(500).json({ error: 'Could not delete technician.' });
	}
});

export default router;
