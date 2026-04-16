const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "milktea_secret_2024";

// DB POOL
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "milktea_db",
  waitForConnections: true,
  connectionLimit: 10
});

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

const auth = (roles = []) => async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    if (roles.length && !roles.includes(decoded.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────

// SUPER ADMIN LOGIN (manages all shops)
app.post("/superadmin/login", async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await db.query(
    "SELECT * FROM super_admins WHERE username = ?",
    [username]
  );
  if (!rows.length) return res.json({ status: "invalid" });

  const match = await bcrypt.compare(password, rows[0].password);
  if (!match) return res.json({ status: "invalid" });

  const token = jwt.sign(
    { id: rows[0].id, role: "superadmin", username: rows[0].username },
    SECRET,
    { expiresIn: "8h" }
  );
  res.json({ status: "success", token, role: "superadmin" });
});

// SHOP USER LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await db.query(
    `SELECT u.*, s.name as shop_name, s.theme_color, s.logo_text, s.is_setup
     FROM users u
     JOIN shops s ON u.shop_id = s.id
     WHERE u.username = ?`,
    [username]
  );
  if (!rows.length) return res.json({ status: "invalid" });

  const match = await bcrypt.compare(password, rows[0].password);
  if (!match) return res.json({ status: "invalid" });

  const token = jwt.sign(
    {
      id: rows[0].id,
      role: rows[0].role,
      shop_id: rows[0].shop_id,
      username: rows[0].username,
      shop_name: rows[0].shop_name,
      is_setup: rows[0].is_setup
    },
    SECRET,
    { expiresIn: "8h" }
  );

  res.json({
    status: "success",
    token,
    role: rows[0].role,
    shop_id: rows[0].shop_id,
    shop_name: rows[0].shop_name,
    theme_color: rows[0].theme_color,
    logo_text: rows[0].logo_text,
    is_setup: rows[0].is_setup
  });
});

// ─── SUPER ADMIN ROUTES ───────────────────────────────────────────────────────

// Get all shops
app.get("/superadmin/shops", auth(["superadmin"]), async (req, res) => {
  const [shops] = await db.query(`
    SELECT s.*, 
      COUNT(DISTINCT u.id) as user_count,
      COUNT(DISTINCT i.id) as ingredient_count
    FROM shops s
    LEFT JOIN users u ON u.shop_id = s.id
    LEFT JOIN ingredients i ON i.shop_id = s.id
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `);
  res.json(shops);
});

// Create shop + admin account
app.post("/superadmin/shops", auth(["superadmin"]), async (req, res) => {
  const { shop_name, admin_username, admin_password, theme_color = "#D50036", logo_text } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [shopResult] = await conn.query(
      "INSERT INTO shops (name, theme_color, logo_text) VALUES (?, ?, ?)",
      [shop_name, theme_color, logo_text || shop_name]
    );
    const shop_id = shopResult.insertId;

    const hashed = await bcrypt.hash(admin_password, 10);
    await conn.query(
      "INSERT INTO users (username, password, role, shop_id) VALUES (?, ?, 'admin', ?)",
      [admin_username, hashed, shop_id]
    );

    await conn.commit();
    res.json({ status: "created", shop_id });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
});

// Delete shop
app.delete("/superadmin/shops/:id", auth(["superadmin"]), async (req, res) => {
  await db.query("DELETE FROM shops WHERE id = ?", [req.params.id]);
  res.json({ status: "deleted" });
});

// Get shop details + users
app.get("/superadmin/shops/:id", auth(["superadmin"]), async (req, res) => {
  const [shop] = await db.query("SELECT * FROM shops WHERE id = ?", [req.params.id]);
  const [users] = await db.query("SELECT id, username, role FROM users WHERE shop_id = ?", [req.params.id]);
  const [ingredients] = await db.query("SELECT * FROM ingredients WHERE shop_id = ?", [req.params.id]);
  res.json({ shop: shop[0], users, ingredients });
});

// ─── REGISTER (Self-register — creates new shop) ─────────────────────────────
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
      return res.status(400).json({ message: "Username already taken." });
    }
    const [shopResult] = await conn.query(
      "INSERT INTO shops (name, theme_color, logo_text) VALUES (?, ?, ?)",
      [shop_name, theme_color, shop_name]
    );
    const hashed = await require("bcryptjs").hash(password, 10);
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

// ─── SHOP SETUP (First Login Customization) ──────────────────────────────────

// ingredient-templates kept for compatibility (ingredients now embedded in frontend)
app.get("/ingredient-templates", async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM ingredient_templates ORDER BY category, name");
    res.json(data);
  } catch { res.json([]); }
});

// Save shop customization (ingredients selection)
app.post("/setup", auth(["admin"]), async (req, res) => {
  const { ingredients } = req.body; // array of { template_id, name, stock, unit, reorder_level }
  const shop_id = req.user.shop_id;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Clear existing ingredients
    await conn.query("DELETE FROM ingredients WHERE shop_id = ?", [shop_id]);

    // Insert selected ingredients
    for (const ing of ingredients) {
      await conn.query(
        "INSERT INTO ingredients (shop_id, name, stock, unit, reorder_level, category) VALUES (?, ?, ?, ?, ?, ?)",
        [shop_id, ing.name, ing.stock || 0, ing.unit || "pc", ing.reorder_level || 10, ing.category || "Other"]
      );
    }

    // Mark shop as setup
    await conn.query("UPDATE shops SET is_setup = 1 WHERE id = ?", [shop_id]);

    await conn.commit();
    res.json({ status: "setup_complete" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
});

// Update shop theme
app.put("/shop/theme", auth(["admin"]), async (req, res) => {
  const { theme_color, logo_text } = req.body;
  await db.query("UPDATE shops SET theme_color = ?, logo_text = ? WHERE id = ?",
    [theme_color, logo_text, req.user.shop_id]);
  res.json({ status: "updated" });
});

// ─── USER MANAGEMENT (Shop Admin) ────────────────────────────────────────────

app.get("/users", auth(["admin"]), async (req, res) => {
  const [data] = await db.query(
    "SELECT id, username, role, created_at FROM users WHERE shop_id = ?",
    [req.user.shop_id]
  );
  res.json(data);
});

app.post("/users", auth(["admin"]), async (req, res) => {
  const { username, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await db.query(
    "INSERT INTO users (username, password, role, shop_id) VALUES (?, ?, ?, ?)",
    [username, hashed, role || "staff", req.user.shop_id]
  );
  res.json({ status: "created" });
});

app.delete("/users/:id", auth(["admin"]), async (req, res) => {
  await db.query(
    "DELETE FROM users WHERE id = ? AND shop_id = ?",
    [req.params.id, req.user.shop_id]
  );
  res.json({ status: "deleted" });
});

// ─── INGREDIENTS ─────────────────────────────────────────────────────────────

app.get("/ingredients", auth(["admin", "staff"]), async (req, res) => {
  const [data] = await db.query(
    "SELECT * FROM ingredients WHERE shop_id = ? ORDER BY category, name",
    [req.user.shop_id]
  );
  res.json(data);
});

app.post("/ingredients", auth(["admin"]), async (req, res) => {
  const { name, stock, unit, reorder_level, category } = req.body;
  await db.query(
    "INSERT INTO ingredients (shop_id, name, stock, unit, reorder_level, category) VALUES (?, ?, ?, ?, ?, ?)",
    [req.user.shop_id, name, stock || 0, unit || "pc", reorder_level || 10, category || "Other"]
  );
  res.json({ status: "added" });
});

app.put("/ingredients/:id", auth(["admin"]), async (req, res) => {
  const { name, stock, unit, reorder_level, category } = req.body;
  await db.query(
    "UPDATE ingredients SET name=?, stock=?, unit=?, reorder_level=?, category=? WHERE id=? AND shop_id=?",
    [name, stock, unit, reorder_level, category, req.params.id, req.user.shop_id]
  );

  // Log activity
  await db.query(
    "INSERT INTO activity_logs (shop_id, user_id, action, description) VALUES (?, ?, 'EDIT_STOCK', ?)",
    [req.user.shop_id, req.user.id, `Updated ingredient: ${name}`]
  );

  res.json({ status: "updated" });
});

app.delete("/ingredients/:id", auth(["admin"]), async (req, res) => {
  await db.query("DELETE FROM ingredients WHERE id=? AND shop_id=?",
    [req.params.id, req.user.shop_id]);
  res.json({ status: "deleted" });
});

// Stock in
app.post("/ingredients/:id/stock-in", auth(["admin", "staff"]), async (req, res) => {
  const { quantity } = req.body;
  const qty = parseFloat(quantity) || 1;

  const [rows] = await db.query("SELECT * FROM ingredients WHERE id=? AND shop_id=?",
    [req.params.id, req.user.shop_id]);
  if (!rows.length) return res.status(404).json({ message: "Not found" });

  await db.query("UPDATE ingredients SET stock = stock + ? WHERE id=? AND shop_id=?",
    [qty, req.params.id, req.user.shop_id]);

  await db.query(
    "INSERT INTO activity_logs (shop_id, user_id, action, description, quantity) VALUES (?, ?, 'STOCK_IN', ?, ?)",
    [req.user.shop_id, req.user.id, `Stock in: ${rows[0].name}`, qty]
  );

  res.json({ status: "updated" });
});

// Stock out
app.post("/ingredients/:id/stock-out", auth(["admin", "staff"]), async (req, res) => {
  const { quantity } = req.body;
  const qty = parseFloat(quantity) || 1;

  const [rows] = await db.query("SELECT * FROM ingredients WHERE id=? AND shop_id=?",
    [req.params.id, req.user.shop_id]);
  if (!rows.length) return res.status(404).json({ message: "Not found" });
  if (rows[0].stock < qty) return res.status(400).json({ message: "Insufficient stock" });

  await db.query("UPDATE ingredients SET stock = stock - ? WHERE id=? AND shop_id=?",
    [qty, req.params.id, req.user.shop_id]);

  await db.query(
    "INSERT INTO activity_logs (shop_id, user_id, action, description, quantity) VALUES (?, ?, 'STOCK_OUT', ?, ?)",
    [req.user.shop_id, req.user.id, `Stock out: ${rows[0].name}`, qty]
  );

  res.json({ status: "updated" });
});

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

app.get("/products", auth(["admin", "staff"]), async (req, res) => {
  const [data] = await db.query(
    "SELECT * FROM products WHERE shop_id = ? ORDER BY category, name",
    [req.user.shop_id]
  );
  res.json(data);
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
    const product_id = result.insertId;

    for (const r of recipe || []) {
      await conn.query(
        "INSERT INTO product_ingredients (product_id, ingredient_id, quantity) VALUES (?, ?, ?)",
        [product_id, r.ingredient_id, r.quantity]
      );
    }

    await conn.commit();
    res.json({ status: "created", product_id });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
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
  } finally {
    conn.release();
  }
});

app.delete("/products/:id", auth(["admin"]), async (req, res) => {
  await db.query("DELETE FROM products WHERE id=? AND shop_id=?",
    [req.params.id, req.user.shop_id]);
  res.json({ status: "deleted" });
});

// Get product recipe
app.get("/products/:id/recipe", auth(["admin", "staff"]), async (req, res) => {
  const [data] = await db.query(
    `SELECT pi.*, i.name as ingredient_name, i.unit
     FROM product_ingredients pi
     JOIN ingredients i ON pi.ingredient_id = i.id
     WHERE pi.product_id = ?`,
    [req.params.id]
  );
  res.json(data);
});

// ─── POS / SELL ───────────────────────────────────────────────────────────────

app.post("/sell", auth(["admin", "staff"]), async (req, res) => {
  const { items, payment_method = "cash", discount = 0 } = req.body;
  // items: [{ product_id, quantity, price }]

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let total = 0;

    for (const item of items) {
      const { product_id, quantity, price } = item;

      // Get recipe
      const [recipe] = await conn.query(
        "SELECT * FROM product_ingredients WHERE product_id = ?",
        [product_id]
      );

      // Check & deduct stock
      for (const r of recipe) {
        const [stock] = await conn.query(
          "SELECT stock, name FROM ingredients WHERE id = ? AND shop_id = ?",
          [r.ingredient_id, req.user.shop_id]
        );
        if (!stock.length || stock[0].stock < r.quantity * quantity) {
          await conn.rollback();
          return res.status(400).json({
            message: `Insufficient stock for: ${stock[0]?.name || "ingredient"}`
          });
        }
        await conn.query(
          "UPDATE ingredients SET stock = stock - ? WHERE id = ? AND shop_id = ?",
          [r.quantity * quantity, r.ingredient_id, req.user.shop_id]
        );
      }

      total += price * quantity;
    }

    const finalTotal = total - discount;

    // Save transaction
    const [txResult] = await conn.query(
      "INSERT INTO transactions (shop_id, user_id, total, discount, payment_method) VALUES (?, ?, ?, ?, ?)",
      [req.user.shop_id, req.user.id, finalTotal, discount, payment_method]
    );
    const tx_id = txResult.insertId;

    // Save transaction items
    for (const item of items) {
      await conn.query(
        "INSERT INTO transaction_items (transaction_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [tx_id, item.product_id, item.quantity, item.price]
      );
    }

    await conn.commit();
    res.json({ status: "success", transaction_id: tx_id, total: finalTotal });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
});

// ─── SALES & REPORTS ──────────────────────────────────────────────────────────

app.get("/sales", auth(["admin", "staff"]), async (req, res) => {
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
  if (to) { query += " AND DATE(t.created_at) <= ?"; params.push(to); }

  query += " GROUP BY t.id ORDER BY t.created_at DESC";

  const [data] = await db.query(query, params);
  res.json(data);
});

app.get("/reports/daily", auth(["admin"]), async (req, res) => {
  const [data] = await db.query(`
    SELECT DATE(created_at) as date,
      COUNT(*) as transactions,
      SUM(total) as revenue,
      SUM(discount) as total_discount
    FROM transactions
    WHERE shop_id = ?
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 30
  `, [req.user.shop_id]);
  res.json(data);
});

app.get("/reports/top-products", auth(["admin"]), async (req, res) => {
  const [data] = await db.query(`
    SELECT p.name, SUM(ti.quantity) as total_sold, SUM(ti.quantity * ti.price) as revenue
    FROM transaction_items ti
    JOIN products p ON ti.product_id = p.id
    JOIN transactions t ON ti.transaction_id = t.id
    WHERE t.shop_id = ?
    GROUP BY p.id
    ORDER BY total_sold DESC
    LIMIT 10
  `, [req.user.shop_id]);
  res.json(data);
});

app.get("/reports/summary", auth(["admin"]), async (req, res) => {
  const shop_id = req.user.shop_id;

  const [[today]] = await db.query(
    "SELECT SUM(total) as revenue, COUNT(*) as transactions FROM transactions WHERE shop_id=? AND DATE(created_at)=CURDATE()",
    [shop_id]
  );
  const [[month]] = await db.query(
    "SELECT SUM(total) as revenue FROM transactions WHERE shop_id=? AND MONTH(created_at)=MONTH(CURDATE()) AND YEAR(created_at)=YEAR(CURDATE())",
    [shop_id]
  );
  const [[low_stock]] = await db.query(
    "SELECT COUNT(*) as count FROM ingredients WHERE shop_id=? AND stock <= reorder_level",
    [shop_id]
  );
  const [[total_products]] = await db.query(
    "SELECT COUNT(*) as count FROM products WHERE shop_id=?",
    [shop_id]
  );

  res.json({
    today_revenue: today.revenue || 0,
    today_transactions: today.transactions || 0,
    month_revenue: month.revenue || 0,
    low_stock_count: low_stock.count,
    total_products: total_products.count
  });
});

// ─── ACTIVITY LOGS ────────────────────────────────────────────────────────────

app.get("/activity", auth(["admin"]), async (req, res) => {
  const [data] = await db.query(`
    SELECT al.*, u.username
    FROM activity_logs al
    JOIN users u ON al.user_id = u.id
    WHERE al.shop_id = ?
    ORDER BY al.created_at DESC
    LIMIT 50
  `, [req.user.shop_id]);
  res.json(data);
});

// ─── SHOP INFO ────────────────────────────────────────────────────────────────

app.get("/shop", auth(["admin", "staff"]), async (req, res) => {
  const [data] = await db.query("SELECT * FROM shops WHERE id=?", [req.user.shop_id]);
  res.json(data[0]);
});

app.listen(5000, () => console.log("🧋 MilkTea System running on port 5000"));