const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'group_buying.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON;', (err) => {
  if (err) {
    console.error('Failed to enable foreign keys:', err.message);
  }
});

// Promise-based helper functions
db.runAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

db.getAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

db.allAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Initialize tables
async function initDb() {
  try {
    // 1. Create products table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price INTEGER NOT NULL CHECK(price >= 0),
        stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Products table verified/created.');

    // 2. Create orders table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        qty INTEGER NOT NULL CHECK(qty > 0),
        total_amount INTEGER NOT NULL CHECK(total_amount >= 0),
        status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'PAID', 'SHIPPED', 'CANCELLED')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    `);
    console.log('Orders table verified/created.');

    // 3. Create messages table (Phase 03)
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('NOTIFICATION', 'REMINDER_D1', 'REMINDER_D2', 'REMINDER_D3', 'CANCELLED')),
        status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'SENT')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
      )
    `);
    console.log('Messages table verified/created.');

    // 4. Create payment_reports table (Phase 04)
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS payment_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        amount INTEGER NOT NULL CHECK(amount > 0),
        account_tail TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
      )
    `);
    console.log('PaymentReports table verified/created.');

    // 5. Create bank_transactions table (Phase 04)
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS bank_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount INTEGER NOT NULL CHECK(amount > 0),
        account_tail TEXT NOT NULL,
        transaction_date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('BankTransactions table verified/created.');

    // 6. Create shipments table (Phase 05)
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS shipments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        carrier TEXT NOT NULL CHECK(carrier IN ('7-11', 'FAMILYMART', 'HOME_DELIVERY')),
        tracking_no TEXT NOT NULL UNIQUE,
        shipping_status TEXT NOT NULL DEFAULT 'PENDING' CHECK(shipping_status IN ('PENDING', 'SHIPPED', 'DELIVERED')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
      )
    `);
    console.log('Shipments table verified/created.');

  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  }
}

module.exports = {
  db,
  initDb
};
