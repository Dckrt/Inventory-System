const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "milktea_secret_2024";

// ── DATABASE POOL ─────────────────────────────────────────
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",        // ← Change this if your MySQL has a password
  database: "milktea_db",
  waitForConnections: true,
  connectionLimit: 10
});

// Test connection on startup
db.getConnection()
  .then(conn => { console.log("✅ MySQL connected to milktea_db"); conn.release(); })
  .catch(err => {
    console.error("❌ MySQL connection failed:", err.message);
    console.error("   Make sure MySQL is running and you imported database.sql");
  });

// ── AUTH MIDDLEWARE ───────────────────────────────────────
const auth = (roles = []) => async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token. Please login." });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    if (roles.length && !roles.includes(decoded.role)) {
      return res.status(403).json({ message: "Access denied." });
    }
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token. Please login again." });
  }
};

// ── SUPER ADMIN LOGIN ─────────────────────────────────────
app.post("/superadmin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.query("SELECT * FROM super_admins WHERE username = ?", [username]);
    if (!rows.length) return res.json({ status: "invalid" });
    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.json({ status: "invalid" });
    const token = jwt.sign({ id: rows[0].id, role: "superadmin", username: rows[0].username }, SECRET, { expiresIn: "8h" });
    res.json({ status: "success", token, role: "superadmin" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── SHOP USER LOGIN ───────────────────────────────────────
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.query(
      `SELECT u.*, s.name as shop_name, s.theme_color, s.logo_text, s.is_setup
       FROM users u JOIN shops s ON u.shop_id = s.id
       WHERE u.username = ?`,
      [username]
    );
    if (!rows.length) return res.json({ status: "invalid" });
    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.json({ status: "invalid" });
    const token = jwt.sign(
      { id: rows[0].id, role: rows[0].role, shop_id: rows[0].shop_id, username: rows[0].username },
      SECRET, { expiresIn: "8h" }
    );
    res.json({
      status: "success", token,
      role: rows[0].role,
      shop_id: rows[0].shop_id,
      shop_name: rows[0].shop_name,
      theme_color: rows[0].theme_color,
      logo_text: rows[0].logo_text,
      is_setup: rows[0].is_setup
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── REGISTER (self-register new shop) ────────────────────
app.post("/register", async (req, res) => {
  const { shop_name, username, password, theme_color = "#D50036" } = req.body;
  if (!shop_name || !username || !password)
    return res.status(400).json({ message: "All fields are required." });
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [existing] = await conn.query("SELECT id FROM users WHERE username = ?", [username]);
    if (existing.length) {
      await conn.rollback();
      return res.status(400).json({ message: "Username already taken. Try another." });
    }
    const [shopResult] = await conn.query(
      "INSERT INTO shops (name, theme_color, logo_text) VALUES (?, ?, ?)",
      [shop_name, theme_color, shop_name]
    );
    const hashed = await bcrypt.hash(password, 10);
    await conn.query(
      "INSERT INTO users (username, password, role, shop_id) VALUES (?, ?, 'admin', ?)",
      [username, hashed, shopResult.insertId]
    );
    await conn.commit();
    res.json({ status: "registered" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally { conn.release(); }
});

// ── SUPER ADMIN: MANAGE SHOPS ─────────────────────────────
app.get("/superadmin/shops", auth(["superadmin"]), async (req, res) => {
  try {
    const [shops] = await db.query(`
      SELECT s.*,
        COUNT(DISTINCT u.id) as user_count,
        COUNT(DISTINCT i.id) as ingredient_count
      FROM shops s
      LEFT JOIN users u ON u.shop_id = s.id
      LEFT JOIN ingredients i ON i.shop_id = s.id
      GROUP BY s.id ORDER BY s.created_at DESC
    `);
    res.json(shops);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post("/superadmin/shops", auth(["superadmin"]), async (req, res) => {
  const { shop_name, admin_username, admin_password, theme_color = "#D50036", logo_text } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [shopResult] = await conn.query(
      "INSERT INTO shops (name, theme_color, logo_text) VALUES (?, ?, ?)",
      [shop_name, theme_color, logo_text || shop_name]
    );
    const hashed = await bcrypt.hash(admin_password, 10);
    await conn.query(
      "INSERT INTO users (username, password, role, shop_id) VALUES (?, ?, 'admin', ?)",
      [admin_username, hashed, shopResult.insertId]
    );
    await conn.commit();
    res.json({ status: "created", shop_id: shopResult.insertId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally { conn.release(); }
});

app.delete("/superadmin/shops/:id", auth(["superadmin"]), async (req, res) => {
  try {
    await db.query("DELETE FROM shops WHERE id = ?", [req.params.id]);
    res.json({ status: "deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get("/superadmin/shops/:id", auth(["superadmin"]), async (req, res) => {
  try {
    const [shop] = await db.query("SELECT * FROM shops WHERE id = ?", [req.params.id]);
    const [users] = await db.query("SELECT id, username, role FROM users WHERE shop_id = ?", [req.params.id]);
    const [ingredients] = await db.query("SELECT * FROM ingredients WHERE shop_id = ?", [req.params.id]);
    res.json({ shop: shop[0], users, ingredients });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── SHOP SETUP (first login customization) ───────────────
app.post("/setup", auth(["admin"]), async (req, res) => {
  const { ingredients } = req.body;
  const shop_id = req.user.shop_id;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("DELETE FROM ingredients WHERE shop_id = ?", [shop_id]);
    for (const ing of ingredients) {
      await conn.query(
        "INSERT INTO ingredients (shop_id, name, stock, unit, reorder_level, category) VALUES (?, ?, ?, ?, ?, ?)",
        [shop_id, ing.name, ing.stock || 0, ing.unit || "pc", ing.reorder_level || 10, ing.category || "Other"]
      );
    }
    await conn.query("UPDATE shops SET is_setup = 1 WHERE id = ?", [shop_id]);
    await conn.commit();
    res.json({ status: "setup_complete" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally { conn.release(); }
});

// ── SHOP INFO & THEME ─────────────────────────────────────
app.get("/shop", auth(["admin", "staff"]), async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM shops WHERE id=?", [req.user.shop_id]);
    res.json(data[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put("/shop/theme", auth(["admin"]), async (req, res) => {
  try {
    const { theme_color, logo_text } = req.body;
    await db.query("UPDATE shops SET theme_color=?, logo_text=? WHERE id=?",
      [theme_color, logo_text, req.user.shop_id]);
    res.json({ status: "updated" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── USER MANAGEMENT (shop admin) ─────────────────────────
app.get("/users", auth(["admin"]), async (req, res) => {
  try {
    const [data] = await db.query(
      "SELECT id, username, role, created_at FROM users WHERE shop_id = ?",
      [req.user.shop_id]
    );
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post("/users", auth(["admin"]), async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (username, password, role, shop_id) VALUES (?, ?, ?, ?)",
      [username, hashed, role || "staff", req.user.shop_id]
    );
    res.json({ status: "created" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "Username already exists in this shop." });
    res.status(500).json({ message: err.message });
  }
});

app.delete("/users/:id", auth(["admin"]), async (req, res) => {
  try {
    await db.query("DELETE FROM users WHERE id=? AND shop_id=?", [req.params.id, req.user.shop_id]);
    res.json({ status: "deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── INGREDIENTS ───────────────────────────────────────────
app.get("/ingredients", auth(["admin", "staff"]), async (req, res) => {
  try {
    const [data] = await db.query(
      "SELECT * FROM ingredients WHERE shop_id=? ORDER BY category, name",
      [req.user.shop_id]
    );
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post("/ingredients", auth(["admin"]), async (req, res) => {
  try {
    const { name, stock, unit, reorder_level, category } = req.body;
    await db.query(
      "INSERT INTO ingredients (shop_id, name, stock, unit, reorder_level, category) VALUES (?, ?, ?, ?, ?, ?)",
      [req.user.shop_id, name, stock || 0, unit || "pc", reorder_level || 10, category || "Other"]
    );
    res.json({ status: "added" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put("/ingredients/:id", auth(["admin"]), async (req, res) => {
  try {
    const { name, stock, unit, reorder_level, category } = req.body;
    await db.query(
      "UPDATE ingredients SET name=?, stock=?, unit=?, reorder_level=?, category=? WHERE id=? AND shop_id=?",
      [name, stock, unit, reorder_level, category, req.params.id, req.user.shop_id]
    );
    await db.query(
      "INSERT INTO activity_logs (shop_id, user_id, action, description) VALUES (?, ?, 'EDIT_STOCK', ?)",
      [req.user.shop_id, req.user.id, `Updated: ${name}`]
    );
    res.json({ status: "updated" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete("/ingredients/:id", auth(["admin"]), async (req, res) => {
  try {
    await db.query("DELETE FROM ingredients WHERE id=? AND shop_id=?", [req.params.id, req.user.shop_id]);
    res.json({ status: "deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Stock In
app.post("/ingredients/:id/stock-in", auth(["admin", "staff"]), async (req, res) => {
  try {
    const qty = parseFloat(req.body.quantity) || 1;
    const [rows] = await db.query("SELECT * FROM ingredients WHERE id=? AND shop_id=?",
      [req.params.id, req.user.shop_id]);
    if (!rows.length) return res.status(404).json({ message: "Ingredient not found." });
    await db.query("UPDATE ingredients SET stock = stock + ? WHERE id=? AND shop_id=?",
      [qty, req.params.id, req.user.shop_id]);
    await db.query(
      "INSERT INTO activity_logs (shop_id, user_id, action, description, quantity) VALUES (?, ?, 'STOCK_IN', ?, ?)",
      [req.user.shop_id, req.user.id, `Stock in: ${rows[0].name}`, qty]
    );
    res.json({ status: "updated" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Stock Out
app.post("/ingredients/:id/stock-out", auth(["admin", "staff"]), async (req, res) => {
  try {
    const qty = parseFloat(req.body.quantity) || 1;
    const [rows] = await db.query("SELECT * FROM ingredients WHERE id=? AND shop_id=?",
      [req.params.id, req.user.shop_id]);
    if (!rows.length) return res.status(404).json({ message: "Ingredient not found." });
    if (rows[0].stock < qty) return res.status(400).json({ message: `Insufficient stock. Only ${rows[0].stock} ${rows[0].unit} left.` });
    await db.query("UPDATE ingredients SET stock = stock - ? WHERE id=? AND shop_id=?",
      [qty, req.params.id, req.user.shop_id]);
    await db.query(
      "INSERT INTO activity_logs (shop_id, user_id, action, description, quantity) VALUES (?, ?, 'STOCK_OUT', ?, ?)",
      [req.user.shop_id, req.user.id, `Stock out: ${rows[0].name}`, qty]
    );
    res.json({ status: "updated" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PRODUCTS ──────────────────────────────────────────────
app.get("/products", auth(["admin", "staff"]), async (req, res) => {
  try {
    const [data] = await db.query(
      "SELECT * FROM products WHERE shop_id=? ORDER BY category, name",
      [req.user.shop_id]
    );
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post("/products", auth(["admin"]), async (req, res) => {
  const { name, price, category, recipe } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      "INSERT INTO products (shop_id, name, price, category) VALUES (?, ?, ?, ?)",
      [req.user.shop_id, name, price, category || "Drinks"]
    );
    for (const r of recipe || []) {
      await conn.query(
        "INSERT INTO product_ingredients (product_id, ingredient_id, quantity) VALUES (?, ?, ?)",
        [result.insertId, r.ingredient_id, r.quantity]
      );
    }
    await conn.commit();
    res.json({ status: "created", product_id: result.insertId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally { conn.release(); }
});

app.put("/products/:id", auth(["admin"]), async (req, res) => {
  const { name, price, category, recipe } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      "UPDATE products SET name=?, price=?, category=? WHERE id=? AND shop_id=?",
      [name, price, category, req.params.id, req.user.shop_id]
    );
    await conn.query("DELETE FROM product_ingredients WHERE product_id=?", [req.params.id]);
    for (const r of recipe || []) {
      await conn.query(
        "INSERT INTO product_ingredients (product_id, ingredient_id, quantity) VALUES (?, ?, ?)",
        [req.params.id, r.ingredient_id, r.quantity]
      );
    }
    await conn.commit();
    res.json({ status: "updated" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally { conn.release(); }
});

app.delete("/products/:id", auth(["admin"]), async (req, res) => {
  try {
    await db.query("DELETE FROM products WHERE id=? AND shop_id=?", [req.params.id, req.user.shop_id]);
    res.json({ status: "deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get("/products/:id/recipe", auth(["admin", "staff"]), async (req, res) => {
  try {
    const [data] = await db.query(
      `SELECT pi.*, i.name as ingredient_name, i.unit
       FROM product_ingredients pi
       JOIN ingredients i ON pi.ingredient_id = i.id
       WHERE pi.product_id = ?`,
      [req.params.id]
    );
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POS / SELL ────────────────────────────────────────────
app.post("/sell", auth(["admin", "staff"]), async (req, res) => {
  const { items, payment_method = "cash", discount = 0 } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    let total = 0;
    for (const item of items) {
      const { product_id, quantity, price } = item;
      const [recipe] = await conn.query(
        "SELECT * FROM product_ingredients WHERE product_id = ?", [product_id]
      );
      for (const r of recipe) {
        const [stock] = await conn.query(
          "SELECT stock, name FROM ingredients WHERE id=? AND shop_id=?",
          [r.ingredient_id, req.user.shop_id]
        );
        if (!stock.length || stock[0].stock < r.quantity * quantity) {
          await conn.rollback();
          return res.status(400).json({ message: `Not enough stock: ${stock[0]?.name || "ingredient"}` });
        }
        await conn.query(
          "UPDATE ingredients SET stock = stock - ? WHERE id=? AND shop_id=?",
          [r.quantity * quantity, r.ingredient_id, req.user.shop_id]
        );
      }
      total += price * quantity;
    }
    const finalTotal = total - parseFloat(discount);
    const [txResult] = await conn.query(
      "INSERT INTO transactions (shop_id, user_id, total, discount, payment_method) VALUES (?, ?, ?, ?, ?)",
      [req.user.shop_id, req.user.id, finalTotal, discount, payment_method]
    );
    for (const item of items) {
      await conn.query(
        "INSERT INTO transaction_items (transaction_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [txResult.insertId, item.product_id, item.quantity, item.price]
      );
    }
    await conn.commit();
    res.json({ status: "success", transaction_id: txResult.insertId, total: finalTotal });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally { conn.release(); }
});

// ── SALES & REPORTS ───────────────────────────────────────
app.get("/sales", auth(["admin", "staff"]), async (req, res) => {
  try {
    const { from, to } = req.query;
    let query = `
      SELECT t.*, u.username as cashier,
        GROUP_CONCAT(p.name SEPARATOR ', ') as products
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN transaction_items ti ON ti.transaction_id = t.id
      JOIN products p ON ti.product_id = p.id
      WHERE t.shop_id = ?
    `;
    const params = [req.user.shop_id];
    if (from) { query += " AND DATE(t.created_at) >= ?"; params.push(from); }
    if (to)   { query += " AND DATE(t.created_at) <= ?"; params.push(to); }
    query += " GROUP BY t.id ORDER BY t.created_at DESC";
    const [data] = await db.query(query, params);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get("/reports/daily", auth(["admin"]), async (req, res) => {
  try {
    const [data] = await db.query(`
      SELECT DATE(created_at) as date,
        COUNT(*) as transactions,
        SUM(total) as revenue,
        SUM(discount) as total_discount
      FROM transactions WHERE shop_id=?
      GROUP BY DATE(created_at)
      ORDER BY date DESC LIMIT 30
    `, [req.user.shop_id]);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get("/reports/top-products", auth(["admin"]), async (req, res) => {
  try {
    const [data] = await db.query(`
      SELECT p.name, SUM(ti.quantity) as total_sold, SUM(ti.quantity * ti.price) as revenue
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE t.shop_id=?
      GROUP BY p.id ORDER BY total_sold DESC LIMIT 10
    `, [req.user.shop_id]);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get("/reports/summary", auth(["admin", "staff"]), async (req, res) => {
  try {
    const sid = req.user.shop_id;
    const [[today]] = await db.query(
      "SELECT SUM(total) as revenue, COUNT(*) as transactions FROM transactions WHERE shop_id=? AND DATE(created_at)=CURDATE()", [sid]);
    const [[month]] = await db.query(
      "SELECT SUM(total) as revenue FROM transactions WHERE shop_id=? AND MONTH(created_at)=MONTH(CURDATE()) AND YEAR(created_at)=YEAR(CURDATE())", [sid]);
    const [[low]] = await db.query(
      "SELECT COUNT(*) as count FROM ingredients WHERE shop_id=? AND stock <= reorder_level", [sid]);
    const [[prods]] = await db.query(
      "SELECT COUNT(*) as count FROM products WHERE shop_id=?", [sid]);
    res.json({
      today_revenue: today.revenue || 0,
      today_transactions: today.transactions || 0,
      month_revenue: month.revenue || 0,
      low_stock_count: low.count,
      total_products: prods.count
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── ACTIVITY LOG ──────────────────────────────────────────
app.get("/activity", auth(["admin"]), async (req, res) => {
  try {
    const [data] = await db.query(`
      SELECT al.*, u.username
      FROM activity_logs al JOIN users u ON al.user_id = u.id
      WHERE al.shop_id=? ORDER BY al.created_at DESC LIMIT 50
    `, [req.user.shop_id]);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── START SERVER ──────────────────────────────────────────
app.listen(5000, () => {
  console.log("🧋 MilkTea Inventory System running on http://localhost:5000");
  console.log("   Frontend should be on http://localhost:3000");
});