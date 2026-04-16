/**
 * BACKEND STARTUP CHECKER
 * Run this FIRST: node check.js
 * It will tell you exactly what's wrong before starting the server.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("\n🧋 MilkTea Inventory System — Startup Checker\n");
console.log("═".repeat(50));

let allGood = true;

// ── 1. Check Node version ──────────────────────────────
try {
  const version = process.version;
  const major = parseInt(version.slice(1).split(".")[0]);
  if (major < 16) {
    console.log(`❌ Node.js ${version} — Need v16 or higher. Download: https://nodejs.org`);
    allGood = false;
  } else {
    console.log(`✅ Node.js ${version}`);
  }
} catch (e) {
  console.log("❌ Cannot check Node version");
}

// ── 2. Check required packages ────────────────────────
const required = ["express", "cors", "mysql2", "bcryptjs", "jsonwebtoken"];
const missingPackages = [];

for (const pkg of required) {
  try {
    require.resolve(pkg);
    console.log(`✅ Package: ${pkg}`);
  } catch {
    console.log(`❌ Package MISSING: ${pkg}`);
    missingPackages.push(pkg);
    allGood = false;
  }
}

if (missingPackages.length > 0) {
  console.log(`\n⚡ Fix: Run this command in the backend folder:`);
  console.log(`   npm install ${missingPackages.join(" ")}\n`);
}

// ── 3. Check MySQL connection ─────────────────────────
async function checkMySQL() {
  try {
    const mysql = require("mysql2/promise");
    
    // First try to connect without specifying database
    let conn;
    try {
      conn = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        connectTimeout: 5000
      });
      console.log("✅ MySQL server is reachable (root, no password)");
      
      // Check if database exists
      const [rows] = await conn.query("SHOW DATABASES LIKE 'milktea_db'");
      if (rows.length === 0) {
        console.log("❌ Database 'milktea_db' does NOT exist yet");
        console.log("   Fix: Run the SQL file first:");
        console.log("   mysql -u root < database.sql");
        allGood = false;
      } else {
        console.log("✅ Database 'milktea_db' exists");
        
        // Check tables
        await conn.query("USE milktea_db");
        const [tables] = await conn.query("SHOW TABLES");
        const tableNames = tables.map(t => Object.values(t)[0]);
        const requiredTables = ["shops", "users", "ingredients", "products", "transactions"];
        
        for (const t of requiredTables) {
          if (tableNames.includes(t)) {
            console.log(`✅ Table: ${t}`);
          } else {
            console.log(`❌ Table MISSING: ${t} — Re-run database.sql`);
            allGood = false;
          }
        }
        
        // Check super admin
        const [admins] = await conn.query("SELECT COUNT(*) as c FROM super_admins");
        if (admins[0].c === 0) {
          console.log("⚠️  No super admin account — will be created on first run");
        } else {
          console.log(`✅ Super admin account exists`);
        }
      }
      
      await conn.end();
    } catch (connErr) {
      if (connErr.code === "ECONNREFUSED") {
        console.log("❌ MySQL is NOT running!");
        console.log("   Fix options:");
        console.log("   • Windows: Open 'Services', start 'MySQL80' or 'MySQL'");
        console.log("   • XAMPP: Open XAMPP Control Panel, start MySQL");
        console.log("   • WAMP: Open WAMP, start MySQL");
        console.log("   • Command: net start MySQL80");
      } else if (connErr.code === "ER_ACCESS_DENIED_ERROR") {
        console.log("❌ MySQL root password is wrong");
        console.log("   Fix: Edit server.js line 15, change password: '' to your MySQL password");
      } else {
        console.log(`❌ MySQL error: ${connErr.message}`);
      }
      allGood = false;
    }
  } catch (e) {
    console.log("⚠️  Cannot check MySQL (mysql2 not installed yet)");
  }
}

checkMySQL().then(() => {
  console.log("\n" + "═".repeat(50));
  if (allGood) {
    console.log("✅ ALL CHECKS PASSED — Run: npm run dev\n");
  } else {
    console.log("❌ ISSUES FOUND — Fix the errors above, then run: npm run dev\n");
    console.log("📖 Quick start:");
    console.log("   1. npm install");
    console.log("   2. mysql -u root < database.sql");
    console.log("   3. npm run dev\n");
  }
});