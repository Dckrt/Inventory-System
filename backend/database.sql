-- ============================================
-- MILKTEA INVENTORY SYSTEM - DATABASE SCHEMA
-- ============================================

CREATE DATABASE IF NOT EXISTS milktea_db;
USE milktea_db;

-- SUPER ADMINS (manages all shops)
CREATE TABLE super_admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SHOPS
CREATE TABLE shops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  theme_color VARCHAR(20) DEFAULT '#D50036',
  logo_text VARCHAR(100),
  is_setup TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USERS (shop admins and staff)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_id INT NOT NULL,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff') DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_shop (username, shop_id)
);

-- INGREDIENT TEMPLATES (global list for shop setup)
CREATE TABLE ingredient_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  unit VARCHAR(20) DEFAULT 'ml',
  category VARCHAR(50) DEFAULT 'Base',
  default_reorder INT DEFAULT 10
);

-- INGREDIENTS (per shop)
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

-- PRODUCTS (per shop)
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  category VARCHAR(50) DEFAULT 'Drinks',
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

-- PRODUCT RECIPES
CREATE TABLE product_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);

-- TRANSACTIONS (sales)
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_id INT NOT NULL,
  user_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  payment_method ENUM('cash', 'gcash', 'card') DEFAULT 'cash',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- TRANSACTION ITEMS
CREATE TABLE transaction_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ACTIVITY LOGS
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

-- ============================================
-- SEED DATA
-- ============================================

-- Default super admin (password: admin123)
INSERT INTO super_admins (username, password) VALUES
('superadmin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Ingredient templates
INSERT INTO ingredient_templates (name, unit, category, default_reorder) VALUES
-- Tea Bases
('Black Tea', 'ml', 'Tea Base', 500),
('Green Tea', 'ml', 'Tea Base', 500),
('Oolong Tea', 'ml', 'Tea Base', 500),
('Thai Tea', 'ml', 'Tea Base', 500),
('Jasmine Tea', 'ml', 'Tea Base', 500),
('Taro Powder', 'g', 'Tea Base', 200),
('Matcha Powder', 'g', 'Tea Base', 200),
('Brown Sugar', 'g', 'Sweetener', 300),
-- Milk
('Fresh Milk', 'ml', 'Milk', 1000),
('Evaporated Milk', 'ml', 'Milk', 500),
('Almond Milk', 'ml', 'Milk', 500),
('Oat Milk', 'ml', 'Milk', 500),
('Creamer', 'g', 'Milk', 300),
-- Sweeteners
('White Sugar', 'g', 'Sweetener', 500),
('Honey', 'ml', 'Sweetener', 200),
('Sugar Syrup', 'ml', 'Sweetener', 300),
('Fructose', 'ml', 'Sweetener', 300),
-- Toppings
('Tapioca Pearls', 'g', 'Topping', 500),
('Nata de Coco', 'g', 'Topping', 200),
('Coffee Jelly', 'g', 'Topping', 200),
('Pudding', 'g', 'Topping', 200),
('Grass Jelly', 'g', 'Topping', 200),
('Cheese Foam', 'ml', 'Topping', 200),
('Popping Boba', 'g', 'Topping', 200),
-- Others
('Ice', 'g', 'Other', 1000),
('Cup (M)', 'pc', 'Supplies', 100),
('Cup (L)', 'pc', 'Supplies', 100),
('Straw', 'pc', 'Supplies', 100),
('Sealing Film', 'pc', 'Supplies', 100);

-- NOTE: Change the superadmin password after first login!
-- Default password is: admin123