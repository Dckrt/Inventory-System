-- ============================================================
-- MILKTEA INVENTORY SYSTEM — DATABASE SETUP
-- HOW TO RUN:
--   Open Command Prompt in the backend folder, then:
--   mysql -u root < database.sql
--   (If you have a password: mysql -u root -p < database.sql)
-- ============================================================

DROP DATABASE IF EXISTS milktea_db;
CREATE DATABASE milktea_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE milktea_db;

-- ── SUPER ADMINS (manages all shops) ──────────────────────
CREATE TABLE super_admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── SHOPS ─────────────────────────────────────────────────
CREATE TABLE shops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  theme_color VARCHAR(20) DEFAULT '#D50036',
  logo_text VARCHAR(100),
  is_setup TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── USERS (admin/staff per shop) ──────────────────────────
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_id INT NOT NULL,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','staff') DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_shop (username, shop_id)
);

-- ── INGREDIENTS (per shop) ────────────────────────────────
CREATE TABLE ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  stock DECIMAL(10,2) DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'ml',
  reorder_level DECIMAL(10,2) DEFAULT 10,
  category VARCHAR(50) DEFAULT 'Other',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

-- ── PRODUCTS / MENU ITEMS (per shop) ──────────────────────
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  category VARCHAR(50) DEFAULT 'Drinks',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

-- ── PRODUCT RECIPES ───────────────────────────────────────
CREATE TABLE product_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);

-- ── SALES TRANSACTIONS ────────────────────────────────────
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_id INT NOT NULL,
  user_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  payment_method ENUM('cash','gcash','card') DEFAULT 'cash',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ── TRANSACTION LINE ITEMS ────────────────────────────────
CREATE TABLE transaction_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ── ACTIVITY LOG ──────────────────────────────────────────
CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_id INT NOT NULL,
  user_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  quantity DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ── SEED: DEFAULT SUPER ADMIN ─────────────────────────────
-- Username: superadmin
-- Password: admin123  (bcrypt hashed)
INSERT INTO super_admins (username, password) VALUES
('superadmin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

-- ============================================================
-- SETUP COMPLETE!
-- Login at: http://localhost:3000/superadmin
-- Username: superadmin  |  Password: admin123
-- ============================================================