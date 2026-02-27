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
    console.log("✅ Users table ready");

    // Create programs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS programs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        acronym VARCHAR(10) NOT NULL UNIQUE,
        color VARCHAR(50) NOT NULL DEFAULT '#3b82f6',
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_acronym (acronym),
        INDEX idx_created_by (created_by)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✅ Programs table ready");

    // Create ebooks table (with program_id instead of course)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ebooks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        program_id INT NOT NULL,
        year_level VARCHAR(10) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT NOT NULL,
        cover_image_path VARCHAR(500),
        uploaded_by INT NOT NULL,
        downloads INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_program_id (program_id),
        INDEX idx_year_level (year_level),
        INDEX idx_uploaded_by (uploaded_by)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✅ Ebooks table ready");

    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    return false;
  }
};

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connection test successful");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection test failed:", error.message);
    return false;
  }
};

export default pool;
