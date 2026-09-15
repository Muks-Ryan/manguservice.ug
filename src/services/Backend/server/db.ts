// This file is part of the Mangu Service UG project. 
// It is responsible for setting up the database connection using the pg library.

import pg from "pg";        // Import the pg library for PostgreSQL database interaction
import dotenv from "dotenv"; // Import dotenv to load environment variables from a .env file

dotenv.config(); // Load environment variables from a .env file

const dbPort = Number(process.env.DB_PORT || 5432);
const isProduction = process.env.NODE_ENV === "production";

const baseConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: Number.isFinite(dbPort) ? dbPort : 5432,
      database: process.env.DB_NAME || "mangu_db",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    };

// Create a new PostgreSQL connection pool using environment variables for configuration
export const pool = new pg.Pool(baseConfig);