// This file is part of the backend service for managing bookings in the application. 
// It defines routes for creating, retrieving, and updating bookings. The routes are protected by authentication and role-based access control middleware.

//  This block of code imports necessary modules and sets up the router for handling booking-related requests. It includes middleware for authentication and role checking, and defines SQL queries for interacting with the database.
import { Router } from 'express';
import { pool } from '../db';
import { requireAuth, requireRole } from '../middleware/auth';

// This block of code defines the router for handling booking-related requests. It includes middleware for authentication and role checking, and defines SQL queries for interacting with the database.
const router = Router();
const bookingSelect = `
  b.id, b.client_id AS "clientId", b.technician_id AS "technicianId",
  u.name AS "clientName", t.name AS "technicianName", t.trade, t.town,
  b.service_description AS "serviceDescription", b.scheduled_for AS "scheduledFor",
  b.estimated_hours AS "estimatedHours", b.estimated_cost_ugx AS "estimatedCostUgx",
  b.status, b.created_at AS "createdAt", b.updated_at AS "updatedAt"
`;

// This line applies the requireAuth middleware to all routes defined in this router, ensuring that only authenticated users can access these endpoints.
router.use(requireAuth);

// This block of code defines a GET route for retrieving bookings. 
// It checks the user's role and constructs a SQL query to fetch bookings based on whether the user is a client or a technician. The results are returned in JSON format.
router.get('/', async (req, res) => {
  const user = req.user!;
  const values: string[] = [];
  let condition = '';
  if (user.role === 'client') {
    values.push(user.id);
    condition = 'WHERE b.client_id = $1';
  } else if (user.role === 'technician') {
    if (!user.technicianId) return res.json({ bookings: [] });
    values.push(user.technicianId);
    condition = 'WHERE b.technician_id = $1';
  }
  try {
    const result = await pool.query(`SELECT ${bookingSelect} FROM bookings b JOIN users u ON u.id = b.client_id JOIN technicians t ON t.id = b.technician_id ${condition} ORDER BY b.scheduled_for ASC`, values);
    res.json({ bookings: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not load bookings.' });
  }
});

// This block of code defines a POST route for creating a new booking.
// It validates the input data, checks if the specified technician is available, and inserts a new booking into the database. The newly created booking is returned in JSON format.
router.post('/', requireRole('client'), async (req, res) => {
  const { technicianId, serviceDescription, scheduledFor, estimatedHours } = req.body ?? {};
  const hours = Number(estimatedHours);
  const date = new Date(scheduledFor);
  if (typeof technicianId !== 'string' || typeof serviceDescription !== 'string' || !serviceDescription.trim() || !Number.isFinite(hours) || hours <= 0 || hours > 24 || Number.isNaN(date.getTime()) || date <= new Date()) {
    res.status(400).json({ error: 'Provide a valid technician, service description, future date, and hours between 0 and 24.' });
    return;
  }
  try {
    const result = await pool.query(
      `INSERT INTO bookings (client_id, technician_id, service_description, scheduled_for, estimated_hours, estimated_cost_ugx)
       SELECT $1, t.id, $2, $3, $4, t.hourly_rate_ugx * $4
       FROM technicians t WHERE t.id = $5 AND t.status IN ('Available', 'Active')
       RETURNING id`,
      [req.user!.id, serviceDescription.trim(), date.toISOString(), hours, technicianId]
    );
    if (!result.rows[0]) {
      res.status(409).json({ error: 'That technician is not currently available for booking.' });
      return;
    }
    const booking = await pool.query(`SELECT ${bookingSelect} FROM bookings b JOIN users u ON u.id = b.client_id JOIN technicians t ON t.id = b.technician_id WHERE b.id = $1`, [result.rows[0].id]);
    res.status(201).json({ booking: booking.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not create booking.' });
  }
});

// This block of code defines a PATCH route for updating the status of an existing booking.
// It checks the user's role and validates the requested status change.
//  If valid, it updates the booking's status in the database and returns the updated booking in JSON format.
router.patch('/:id/status', async (req, res) => {
  const user = req.user!;
  const { status } = req.body ?? {};
  const allowed = user.role === 'client' ? ['Cancelled'] : user.role === 'technician' ? ['Accepted', 'Declined', 'Completed'] : ['Accepted', 'Declined', 'Cancelled', 'Completed'];
  if (typeof status !== 'string' || !allowed.includes(status)) {
    res.status(400).json({ error: 'That status transition is not allowed.' });
    return;
  }
  const values = [status, req.params.id];
  let ownership = '';
  if (user.role === 'client') { values.push(user.id); ownership = 'AND client_id = $3'; }
  try {
    if (user.role === 'technician') {
      const profile = await pool.query(
        `SELECT technician_id AS "technicianId"
         FROM users
         WHERE id = $1 AND role = 'technician'`,
        [user.id]
      );
      const technicianId = profile.rows[0]?.technicianId;
      if (!technicianId) {
        return res.status(403).json({ error: 'Technician profile is not linked.' });
      }
      values.push(technicianId);
      ownership = 'AND technician_id = $3';
    }

    const result = await pool.query(
      `UPDATE bookings
       SET status = CAST($1 AS booking_status), updated_at = now()
       WHERE id = $2 ${ownership}
       AND ((status = 'Pending' AND CAST($1 AS booking_status) IN ('Accepted', 'Declined', 'Cancelled'))
         OR (status = 'Accepted' AND CAST($1 AS booking_status) IN ('Cancelled', 'Completed')))
       RETURNING id`,
      values
    );
    if (!result.rows || result.rows.length === 0) {
      return res.status(409).json({ error: 'Booking not found or that status change is no longer allowed.' });
    }

    const updatedId = result.rows[0].id;
    const booking = await pool.query(
      `SELECT ${bookingSelect}
       FROM bookings b
       JOIN users u ON u.id = b.client_id
       JOIN technicians t ON t.id = b.technician_id
       WHERE b.id = $1`,
      [updatedId]
    );
    return res.json({ booking: booking.rows[0] });
  } catch (error) {
    console.error('Database Error Details:', error);
    return res.status(500).json({ error: 'Could not update booking.' });
  }
});

export default router;