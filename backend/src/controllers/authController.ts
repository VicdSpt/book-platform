import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../lib/supabase";

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback-secret-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ─── Helper: Generate JWT Token ───────────────────────────
const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId }, // Payload: data stored in token
    JWT_SECRET, // Secret key used to sign
    { expiresIn: JWT_EXPIRES_IN }, // Token expires after 7 days
  );
};

// ─── POST /api/auth/register ──────────────────────────────
export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    // Validate input
    if (!email || !username || !password) {
      return res.status(400).json({
        error: "Email, username, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (existingUser) {
      return res.status(400).json({
        error: "User with this email or username already exists",
      });
    }

    // Hash the password (10 = salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        email,
        username,
        password: hashedPassword,
      })
      .select("id, email, username, created_at")
      .single();

    if (error) throw error;

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(201).json({
      message: "Account created successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register" });
  }
};

// ─── POST /api/auth/login ─────────────────────────────────
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    // Use same error message for wrong email OR wrong password
    // (Don't reveal which one is wrong - security best practice)
    if (error || !user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare provided password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user.id);

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!; // Set by authenticate middleware

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, username, created_at")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
};
