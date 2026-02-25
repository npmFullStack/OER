// server/createAdmin.js
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  try {
    console.log("\n📝 Create Admin User\n");

    const firstname = await question("First name: ");
    const lastname = await question("Last name: ");
    const email = await question("Email: ");
    const password = await question("Password: ");

    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Check if user exists
    const [existing] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existing.length > 0) {
      console.log("\n❌ User with this email already exists!");
      await connection.end();
      rl.close();
      process.exit(1);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await connection.execute(
      "INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)",
      [firstname, lastname, email, hashedPassword],
    );

    console.log("\n✅ User created successfully!");
    console.log(`   User ID: ${result.insertId}`);
    console.log(`   Email: ${email}`);

    await connection.end();
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating user:", error.message);
    rl.close();
    process.exit(1);
  }
}

createAdmin();
