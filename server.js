/**
 * User Authentication System
 *
 * Features:
 *  - Registration with hashed passwords (bcrypt)
 *  - Login issuing a signed JWT
 *  - Middleware that protects routes using the JWT
 *
 * Users are stored in a local JSON file (users.json) to keep the project
 * dependency-free. To use MongoDB instead, replace readUsers()/writeUsers()
 * with a Mongoose `User` model (still hash passwords with bcrypt the same way).
 *
 * IMPORTANT: JWT_SECRET below is a placeholder for local development only.
 * In production, always load secrets from environment variables, never
 * hard-code them in source control.
 */

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const USERS_FILE = path.join(__dirname, "users.json");
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret-change-me";
const TOKEN_EXPIRY = "2h";

app.use(cors());
app.use(express.json());

// ---------- Data access layer ----------
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [], nextId: 1 }, null, 2));
  }
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
}

function writeUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

// ---------- Auth middleware ----------
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed Authorization header." });
  }

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, email }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

// ---------- Routes ----------

// Register
app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  const db = readUsers();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: db.nextId, email, passwordHash };
  db.users.push(user);
  db.nextId += 1;
  writeUsers(db);

  res.status(201).json({ message: "Account created. You can now log in." });
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const db = readUsers();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

  res.json({ token, user: { id: user.id, email: user.email } });
});

// Protected route — requires a valid JWT
app.get("/api/profile", requireAuth, (req, res) => {
  res.json({
    message: "This is a protected route.",
    user: req.user,
  });
});

app.get("/", (req, res) => {
  res.send("Auth API running. Routes: POST /api/auth/register, POST /api/auth/login, GET /api/profile (protected)");
});

app.listen(PORT, () => {
  console.log(`Auth API listening on http://localhost:${PORT}`);
});
