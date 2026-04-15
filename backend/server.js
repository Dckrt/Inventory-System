const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// DATABASE CONNECTION
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "inventory_db"
});

db.connect(err => {
  if (err) {
    console.log("DB ERROR:", err);
  } else {
    console.log("MySQL Connected");
  }
});

// ================= AUTH =================

// LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username=? AND password=?",
    [username, password],
    (err, result) => {
      if (result.length > 0) {
        res.json({ status: "success", role: result[0].role });
      } else {
        res.json({ status: "invalid" });
      }
    }
  );
});

// REGISTER
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "INSERT INTO users (username, password, role) VALUES (?, ?, 'staff')",
    [username, password],
    () => res.json({ status: "registered" })
  );
});

// ================= INVENTORY =================

// GET ITEMS
app.get("/items", (req, res) => {
  db.query("SELECT * FROM products", (err, result) => {
    res.json(result);
  });
});

// ADD ITEM
app.post("/items", (req, res) => {
  const { name, quantity } = req.body;

  db.query(
    "INSERT INTO products (name, quantity) VALUES (?, ?)",
    [name, quantity],
    () => {
      db.query(
        "INSERT INTO activity_logs (item_name, action, quantity, date) VALUES (?, 'ADD', ?, NOW())",
        [name, quantity]
      );
      res.json({ msg: "added" });
    }
  );
});

// DELETE
app.delete("/items/:id", (req, res) => {
  db.query("DELETE FROM products WHERE id=?", [req.params.id]);
  res.json({ msg: "deleted" });
});

// STOCK IN
app.post("/stock-in/:id", (req, res) => {
  db.query(
    "UPDATE products SET quantity = quantity + 1 WHERE id=?",
    [req.params.id]
  );
  res.json({ msg: "added" });
});

// STOCK OUT
app.post("/stock-out/:id", (req, res) => {
  db.query(
    "UPDATE products SET quantity = quantity - 1 WHERE id=?",
    [req.params.id]
  );
  res.json({ msg: "deducted" });
});

// ACTIVITY
app.get("/activity", (req, res) => {
  db.query("SELECT * FROM activity_logs", (err, result) => {
    res.json(result);
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));