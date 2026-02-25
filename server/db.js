// server/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Initialize database tables
export const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully");

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        firstname VARCHAR(100) NOT NULL,
        lastname VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Users table ready");

    // Create ebooks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ebooks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        course VARCHAR(50) NOT NULL,
        year_level VARCHAR(10) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT NOT NULL,
        cover_image_path VARCHAR(500),
        uploaded_by INT NOT NULL,
        downloads INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_course (course),
        INDEX idx_year_level (year_level),
        INDEX idx_uploaded_by (uploaded_by)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Ebooks table ready");

    connection.release();
    return true;
  } catch (error) {
    console.error("Database initialization failed:", error.message);
    return false;
  }
};

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Database connection test successful");
    connection.release();
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error.message);
    return false;
  }
};

export default pool;
