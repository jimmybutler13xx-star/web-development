/**
 * Full-Stack CRUD Application — Backend
 *
 * A REST API for managing tasks, built with Express.
 * Data is persisted to a local JSON file (db.json) to keep the project
 * dependency-free and easy to run. To use a real database instead:
 *   - MongoDB: swap the readDB/writeDB helpers for Mongoose model calls.
 *   - PostgreSQL: swap them for a `pg` Pool query layer.
 * The route handlers below are already structured so that swap only
 * touches the data-access functions, not the route logic.
 */

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;
const DB_FILE = path.join(__dirname, "db.json");

app.use(cors());
app.use(express.json());

// ---------- Data access layer (swap this out for a real DB) ----------
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ tasks: [], nextId: 1 }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ---------- Routes: /api/tasks (CRUD) ----------

// CREATE
app.post("/api/tasks", (req, res) => {
  const { title, description = "" } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required." });
  }

  const db = readDB();
  const task = {
    id: db.nextId,
    title: title.trim(),
    description: description.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  db.tasks.push(task);
  db.nextId += 1;
  writeDB(db);

  res.status(201).json(task);
});

// READ all
app.get("/api/tasks", (req, res) => {
  const db = readDB();
  res.json(db.tasks);
});

// READ one
app.get("/api/tasks/:id", (req, res) => {
  const db = readDB();
  const task = db.tasks.find(t => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found." });
  res.json(task);
});

// UPDATE
app.put("/api/tasks/:id", (req, res) => {
  const db = readDB();
  const task = db.tasks.find(t => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found." });

  const { title, description, completed } = req.body;
  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description.trim();
  if (completed !== undefined) task.completed = Boolean(completed);

  writeDB(db);
  res.json(task);
});

// DELETE
app.delete("/api/tasks/:id", (req, res) => {
  const db = readDB();
  const index = db.tasks.findIndex(t => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Task not found." });

  const [deleted] = db.tasks.splice(index, 1);
  writeDB(db);
  res.json(deleted);
});

app.get("/", (req, res) => {
  res.send("CRUD API is running. Try GET /api/tasks");
});

app.listen(PORT, () => {
  console.log(`CRUD API listening on http://localhost:${PORT}`);
});
