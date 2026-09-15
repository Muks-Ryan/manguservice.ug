// This file is part of the Mangu Service UG project.
// It is responsible for setting up the database connection using the pg library.

// Import necessary libraries for server setup
import express from "express"; // Import express for creating the server
import cors from "cors"; // Import cors for handling Cross-Origin Resource Sharing
import cookieParser from "cookie-parser"; // Import cookie-parser for parsing cookies
import dotenv from "dotenv"; // Import dotenv to load environment variables from a .env file
import helmet from "helmet"; // Import helmet for securing HTTP headers
import rateLimit from "express-rate-limit"; // Import rateLimit to slow repeated requests

import authRoutes from "./routes/authRoutes"; // Import authentication routes
import technicianRoutes from "./routes/technicianRoutes"; // Import technician routes

dotenv.config(); // Load environment variables from .env file

const isProduction = process.env.NODE_ENV === 'production';

// Fail fast when production authentication, database, or public frontend configuration is incomplete.
if (isProduction) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters in production.');
  }

  if (!process.env.FRONTEND_URL) {
    throw new Error('FRONTEND_URL must be set in production so CORS and secure cookies match the public domain.');
  }

  const hasDatabaseConfig = Boolean(process.env.DATABASE_URL || (process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD));
  if (!hasDatabaseConfig) {
    throw new Error('A production database connection is required. Provide DATABASE_URL or DB_HOST/DB_NAME/DB_USER/DB_PASSWORD.');
  }
}

const app = express();  // Create an instance of the express application

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet()); // Use helmet to secure HTTP headers
app.use(express.json({ limit: '100kb' })); // Parse bounded JSON request bodies
app.use(cookieParser()); // Use cookie-parser to parse cookies

// Limit authentication attempts and general API traffic before reaching route handlers.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false });
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false });

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Configure CORS to allow requests from the configured frontend origin(s)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
}));

app.use('/api', apiLimiter); // Apply a general request limit to API endpoints
app.use('/api/auth', authLimiter); // Apply a stricter limit to authentication endpoints

// Define routes for authentication and technician-related operations
app.use("/api/auth", authRoutes);
app.use("/api/technicians", technicianRoutes);

// Define a health check endpoint to verify that the server is running
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' }); // Respond with a simple health check status
});

const port = Number(process.env.PORT || 4000);

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`); // Log a message indicating that the server is running
});


  