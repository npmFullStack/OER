// server/routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "./db.js";
import { createResponse } from "./helper.js";
import { authenticateToken as authMiddleware } from "./authMiddleware.js";

const router = express.Router();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

router.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res
        .status(400)
        .json(createResponse(false, "Please provide all required fields"));
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json(createResponse(false, "Please provide a valid email"));
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json(createResponse(false, "Password must be at least 6 characters"));
    }

    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existingUsers.length > 0) {
      return res
        .status(400)
        .json(createResponse(false, "User with this email already exists"));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      `INSERT INTO users (firstname, lastname, email, password) 
       VALUES (?, ?, ?, ?)`,
      [firstname, lastname, email, hashedPassword],
    );

    const [newUser] = await pool.query(
      "SELECT id, firstname, lastname, email, created_at FROM users WHERE id = ?",
      [result.insertId],
    );

    const token = jwt.sign(
      {
        id: newUser[0].id,
        email: newUser[0].email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE },
    );

    res.status(201).json(
      createResponse(true, "User registered successfully", {
        token,
        user: newUser[0],
      }),
    );
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json(createResponse(false, "Server error during registration"));
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(createResponse(false, "Please provide email and password"));
    }

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(401).json(createResponse(false, "Invalid credentials"));
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json(createResponse(false, "Invalid credentials"));
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE },
    );

    const userWithoutPassword = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    res.json(
      createResponse(true, "Login successful", {
        token,
        user: userWithoutPassword,
      }),
    );
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json(createResponse(false, "Server error during login"));
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, firstname, lastname, email, created_at FROM users WHERE id = ?",
      [req.user.id],
    );

    if (users.length === 0) {
      return res.status(404).json(createResponse(false, "User not found"));
    }

    res.json(createResponse(true, "User retrieved successfully", users[0]));
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json(createResponse(false, "Server error"));
  }
});

export default router;
