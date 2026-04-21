/**
 * Run: node testlogin.js
 * This will test the login directly without the frontend
 */

const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function test() {
  console.log("\n🧋 Login Debug Test\n" + "─".repeat(40));

  const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "milktea_db",
    port: 3306
  });

  // 1. Check what's in users table
  const [users] = await db.query("SELECT id, username, password, role, shop_id FROM users");
  console.log("\n📋 Users in database:");
  users.forEach(u => {
    console.log(`  ID: ${u.id} | Username: ${u.username} | Role: ${u.role} | Shop: ${u.shop_id}`);
    console.log(`  Password: ${u.password}`);
    const isHashed = u.password.startsWith("$2a$") || u.password.startsWith("$2b$");
    console.log(`  Is bcrypt hashed: ${isHashed ? "✅ YES" : "❌ NO - plain text!"}`);
  });

  // 2. Check shops
  const [shops] = await db.query("SELECT * FROM shops");
  console.log("\n🏪 Shops in database:");
  shops.forEach(s => console.log(`  ID: ${s.id} | Name: ${s.name}`));

  // 3. Test bcrypt compare
  if (users.length > 0) {
    console.log("\n🔐 Testing password 'admin123':");
    for (const u of users) {
      try {
        const match = await bcrypt.compare("admin123", u.password);
        console.log(`  User '${u.username}': ${match ? "✅ PASSWORD MATCHES" : "❌ NO MATCH"}`);
      } catch(e) {
        console.log(`  User '${u.username}': ❌ ERROR - ${e.message} (password not hashed)`);
      }
    }
  }

  // 4. Fix it automatically
  console.log("\n🔧 Auto-fixing: Setting bcrypt password for admin...");
  const hashed = await bcrypt.hash("admin123", 10);
  await db.query("UPDATE users SET password=? WHERE username='admin'", [hashed]);
  console.log("✅ Password updated!");
  console.log(`   New hash: ${hashed}`);

  // 5. Verify fix
  const [updated] = await db.query("SELECT password FROM users WHERE username='admin'");
  const verify = await bcrypt.compare("admin123", updated[0].password);
  console.log(`\n✅ Verification: ${verify ? "LOGIN WILL WORK NOW!" : "Still broken"}`);

  await db.end();
  console.log("\n─".repeat(40));
  console.log("Now restart server: node server.js");
  console.log("Then login with: admin / admin123\n");
}

test().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});