import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const caPath = path.join(__dirname, 'Config', 'ca.pem');
dotenv.config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 25422,
  ssl: {
      rejectUnauthorized: true,
      // You can download the CA certificate from Aiven dashboard and provide the path here:
      ca: fs.readFileSync(caPath), 
    },
});

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL database connected successfully');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};

testConnection();

export default pool;