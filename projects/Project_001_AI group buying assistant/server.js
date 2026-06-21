const express = require('express');
const path = require('path');
const { db, initDb } = require('./database');

const app = express();
app.use(express.json());
// Support raw text body parsing for CSV import
app.use(express.text({ type: ['text/csv', 'text/plain'] }));
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;

// --- Helper for transaction execution ---
async function runInTransaction(fn) {
  await db.runAsync('BEGIN TRANSACTION');
  try {
    const result = await fn();
    await db.runAsync('COMMIT');
    return result;
  } catch (error) {
    await db.runAsync('ROLLBACK');
    throw error;
  }
}

// ==========================================
// AI COMMENT PARSER HELPERS (Phase 02)
// ==========================================
function parseComment(commentStr) {
  if (!commentStr || typeof commentStr !== 'string') return null;
  
  // Format matches "customerName: commentText" or "customerName：commentText"
  const colonMatch = commentStr.match(/^([^：:]+)[：:](.+)$/);
  if (!colonMatch) return null;

  const customer = colonMatch[1].trim();
  const text = colonMatch[2].trim().toLowerCase();

  let qty = null;

  // Case 1: +Number or Number (e.g. +3, 2, +10)
  const plusNumMatch = text.match(/^\+?(\d+)$/);
  if (plusNumMatch) {
    qty = parseInt(plusNumMatch[1], 10);
  }

  // Case 2: +ChineseNum or ChineseNum (e.g. +二, 兩, +三)
  const chineseNums = {
    '一': 1, '二': 2, '兩': 2, '三': 3, '四': 4, '五': 5,
    '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
  };
  const plusChineseMatch = text.match(/^\+?([一二兩三四五六七八九十])$/);
  if (plusChineseMatch) {
    qty = chineseNums[plusChineseMatch[1]];
  }

  // Case 3: "我要X份" / "我要X盒" / "我要X個" etc.
  if (qty === null) {
    const wantMatch = text.match(/(?:我要)?(\d+|[一二兩三四五六七八九十]+)(?:份|盒|個|張|件|支|組|包)/);
    if (wantMatch) {
      const numPart = wantMatch[1];
      if (/^\d+$/.test(numPart)) {
        qty = parseInt(numPart, 10);
      } else {
        qty = chineseNums[numPart];
      }
    }
  }

  // Case 4: "收" / "收+X"
  if (qty === null) {
    if (text === '收' || text === '收+1') {
      qty = 1;
    } else {
      const receiveMatch = text.match(/^收\+(\d+)$/);
      if (receiveMatch) {
        qty = parseInt(receiveMatch[1], 10);
      } else {
        const receiveChineseMatch = text.match(/^收\+([一二兩三四五六七八九十])$/);
        if (receiveChineseMatch) {
          qty = chineseNums[receiveChineseMatch[1]];
        }
      }
    }
  }

  if (qty === null || isNaN(qty) || qty <= 0) {
    return null;
  }

  return { customer, qty };
}

// Helper to auto-create notification message
async function createNotification(orderId, customerName, productName, qty, totalAmount) {
  const content = `親愛的顧客 ${customerName}，您的訂單已成立！品項：${productName} x ${qty}，總金額：${totalAmount}元。請於4天內完成付款。`;
  await db.runAsync(
    `INSERT INTO messages (order_id, content, type, status) VALUES (?, ?, 'NOTIFICATION', 'PENDING')`,
    [orderId, content]
  );
}

// ==========================================
// PRODUCTS API (Phase 01)
// ==========================================

app.get('/products', async (req, res) => {
  try {
    const products = await db.allAsync('SELECT * FROM products ORDER BY id DESC');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const product = await db.getAsync('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/products', async (req, res) => {
  const { name, price, stock } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Invalid product name' });
  }
  if (typeof price !== 'number' || price < 0 || !Number.isInteger(price)) {
    return res.status(400).json({ error: 'Price must be a non-negative integer' });
  }
  if (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock)) {
    return res.status(400).json({ error: 'Stock must be a non-negative integer' });
  }

  try {
    const result = await db.runAsync(
      'INSERT INTO products (name, price, stock) VALUES (?, ?, ?)',
      [name.trim(), price, stock]
    );
    const newProduct = await db.getAsync('SELECT * FROM products WHERE id = ?', [result.lastID]);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/products/:id', async (req, res) => {
  const { price, stock, name } = req.body;
  const productId = req.params.id;

  try {
    const product = await db.getAsync('SELECT * FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updates = [];
    const params = [];

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Invalid product name' });
      }
      updates.push('name = ?');
      params.push(name.trim());
    }
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0 || !Number.isInteger(price)) {
        return res.status(400).json({ error: 'Price must be a non-negative integer' });
      }
      updates.push('price = ?');
      params.push(price);
    }
    if (stock !== undefined) {
      if (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock)) {
        return res.status(400).json({ error: 'Stock must be a non-negative integer' });
      }
      updates.push('stock = ?');
      params.push(stock);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No update parameters provided' });
    }

    params.push(productId);
    await db.runAsync(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, params);

    const updatedProduct = await db.getAsync('SELECT * FROM products WHERE id = ?', [productId]);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ORDERS API (Phase 01 & 03)
// ==========================================

app.get('/orders', async (req, res) => {
  try {
    const orders = await db.allAsync(`
      SELECT o.*, p.name AS product_name, p.price AS product_price
      FROM orders o
      JOIN products p ON o.product_id = p.id
      ORDER BY o.id DESC
    `);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/orders', async (req, res) => {
  const { customer_name, product_id, qty } = req.body;
  if (!customer_name || typeof customer_name !== 'string' || customer_name.trim() === '') {
    return res.status(400).json({ error: 'Invalid customer name' });
  }
  if (!product_id || typeof product_id !== 'number' || !Number.isInteger(product_id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }
  if (!qty || typeof qty !== 'number' || qty <= 0 || !Number.isInteger(qty)) {
    return res.status(400).json({ error: 'Quantity must be a positive integer' });
  }

  try {
    const order = await runInTransaction(async () => {
      const product = await db.getAsync('SELECT * FROM products WHERE id = ?', [product_id]);
      if (!product) throw new Error('PRODUCT_NOT_FOUND');
      if (product.stock < qty) throw new Error('INSUFFICIENT_STOCK');

      // Deduct stock
      await db.runAsync('UPDATE products SET stock = stock - ? WHERE id = ?', [qty, product_id]);

      const totalAmount = product.price * qty;

      // Insert Order
      const result = await db.runAsync(
        `INSERT INTO orders (customer_name, product_id, qty, total_amount, status) 
         VALUES (?, ?, ?, ?, 'PENDING')`,
        [customer_name.trim(), product_id, qty, totalAmount]
      );

      // Auto-create Phase 03 Notification Message
      await createNotification(result.lastID, customer_name.trim(), product.name, qty, totalAmount);

      return {
        id: result.lastID,
        customer_name: customer_name.trim(),
        product_id,
        qty,
        total_amount: totalAmount,
        status: 'PENDING'
      };
    });

    res.status(201).json(order);
  } catch (error) {
    if (error.message === 'PRODUCT_NOT_FOUND') {
      res.status(404).json({ error: 'Product not found' });
    } else if (error.message === 'INSUFFICIENT_STOCK') {
      res.status(400).json({ error: 'Insufficient product stock' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.patch('/orders/:id', async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const updatedOrder = await runInTransaction(async () => {
      const order = await db.getAsync('SELECT * FROM orders WHERE id = ?', [orderId]);
      if (!order) throw new Error('ORDER_NOT_FOUND');

      const oldStatus = order.status;
      const newStatus = status;

      if (oldStatus !== newStatus) {
        if (newStatus === 'CANCELLED' && oldStatus !== 'CANCELLED') {
          await db.runAsync('UPDATE products SET stock = stock + ? WHERE id = ?', [order.qty, order.product_id]);
        } else if (oldStatus === 'CANCELLED' && newStatus !== 'CANCELLED') {
          const product = await db.getAsync('SELECT stock FROM products WHERE id = ?', [order.product_id]);
          if (!product || product.stock < order.qty) {
            throw new Error('INSUFFICIENT_STOCK_FOR_RESTORATION');
          }
          await db.runAsync('UPDATE products SET stock = stock - ? WHERE id = ?', [order.qty, order.product_id]);
        }
        await db.runAsync('UPDATE orders SET status = ? WHERE id = ?', [newStatus, orderId]);
      }
      return await db.getAsync('SELECT * FROM orders WHERE id = ?', [orderId]);
    });

    res.json(updatedOrder);
  } catch (error) {
    if (error.message === 'ORDER_NOT_FOUND') {
      res.status(404).json({ error: 'Order not found' });
    } else if (error.message === 'INSUFFICIENT_STOCK_FOR_RESTORATION') {
      res.status(400).json({ error: 'Cannot restore order status: Insufficient product stock' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.delete('/orders/:id', async (req, res) => {
  const orderId = req.params.id;
  try {
    await runInTransaction(async () => {
      const order = await db.getAsync('SELECT * FROM orders WHERE id = ?', [orderId]);
      if (!order) throw new Error('ORDER_NOT_FOUND');

      if (order.status !== 'CANCELLED') {
        await db.runAsync('UPDATE products SET stock = stock + ? WHERE id = ?', [order.qty, order.product_id]);
      }
      await db.runAsync('DELETE FROM orders WHERE id = ?', [orderId]);
    });
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    if (error.message === 'ORDER_NOT_FOUND') {
      res.status(404).json({ error: 'Order not found' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// ==========================================
// COMMENTS / AI PARSER API (Phase 02)
// ==========================================

app.post('/comments', async (req, res) => {
  const { product_id, comment } = req.body;

  if (!product_id || typeof product_id !== 'number') {
    return res.status(400).json({ error: 'Invalid product ID' });
  }
  if (!comment || typeof comment !== 'string') {
    return res.status(400).json({ error: 'Invalid comment string' });
  }

  const parsed = parseComment(comment);
  if (!parsed) {
    return res.status(400).json({ error: 'Failed to parse comment' });
  }

  const { customer, qty } = parsed;

  try {
    const order = await runInTransaction(async () => {
      const product = await db.getAsync('SELECT * FROM products WHERE id = ?', [product_id]);
      if (!product) throw new Error('PRODUCT_NOT_FOUND');
      if (product.stock < qty) throw new Error('INSUFFICIENT_STOCK');

      await db.runAsync('UPDATE products SET stock = stock - ? WHERE id = ?', [qty, product_id]);

      const totalAmount = product.price * qty;
      const result = await db.runAsync(
        `INSERT INTO orders (customer_name, product_id, qty, total_amount, status) 
         VALUES (?, ?, ?, ?, 'PENDING')`,
        [customer, product_id, qty, totalAmount]
      );

      // Auto-create Phase 03 Notification Message
      await createNotification(result.lastID, customer, product.name, qty, totalAmount);

      return {
        id: result.lastID,
        customer_name: customer,
        product_id,
        qty,
        total_amount: totalAmount,
        status: 'PENDING'
      };
    });

    res.status(201).json(order);
  } catch (error) {
    if (error.message === 'PRODUCT_NOT_FOUND') {
      res.status(404).json({ error: 'Product not found' });
    } else if (error.message === 'INSUFFICIENT_STOCK') {
      res.status(400).json({ error: 'Insufficient product stock' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// ==========================================
// MESSAGES & AUTOMATIC DUNNING API (Phase 03)
// ==========================================

// GET /messages - List all messages (Helper)
app.get('/messages', async (req, res) => {
  try {
    const messages = await db.allAsync('SELECT * FROM messages ORDER BY id DESC');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /messages/send - Mark message as SENT
app.post('/messages/send', async (req, res) => {
  const { message_id } = req.body;
  if (!message_id) {
    return res.status(400).json({ error: 'Invalid message ID' });
  }

  try {
    const result = await db.runAsync('UPDATE messages SET status = "SENT" WHERE id = ?', [message_id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    const message = await db.getAsync('SELECT * FROM messages WHERE id = ?', [message_id]);
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /messages/reminder - Execute reminder scheduler
app.post('/messages/reminder', async (req, res) => {
  // Allow mocking current time to test the scheduling intervals
  const currentTime = req.body.current_time ? new Date(req.body.current_time) : new Date();

  try {
    const pendingOrders = await db.allAsync(`
      SELECT o.*, p.name AS product_name 
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.status = 'PENDING'
    `);

    const results = [];

    for (const order of pendingOrders) {
      const orderTime = new Date(order.created_at);
      const diffMs = currentTime.getTime() - orderTime.getTime();
      const daysPassed = diffMs / (1000 * 60 * 60 * 24);

      await runInTransaction(async () => {
        // Day 4 or more: Cancel order
        if (daysPassed >= 4) {
          // Cancel order, restore stock
          await db.runAsync('UPDATE products SET stock = stock + ? WHERE id = ?', [order.qty, order.product_id]);
          await db.runAsync('UPDATE orders SET status = "CANCELLED" WHERE id = ?', [order.id]);
          
          const content = `「訂單已取消」親愛的 ${order.customer_name}，因您逾期未付款，您的訂單已自動取消，且預留的商品庫存已釋出。`;
          await db.runAsync(
            `INSERT INTO messages (order_id, content, type, status) VALUES (?, ?, 'CANCELLED', 'PENDING')`,
            [order.id, content]
          );
          results.push({ order_id: order.id, action: 'CANCELLED' });
        } 
        // Day 3: Final reminder
        else if (daysPassed >= 3) {
          const exists = await db.getAsync(
            'SELECT id FROM messages WHERE order_id = ? AND type = "REMINDER_D3"', 
            [order.id]
          );
          if (!exists) {
            const content = `「最後付款通知」親愛的 ${order.customer_name}，這是您訂單的最後付款通知。若於明天前仍未付款，系統將會自動取消您的訂單。`;
            await db.runAsync(
              `INSERT INTO messages (order_id, content, type, status) VALUES (?, ?, 'REMINDER_D3', 'PENDING')`,
              [order.id, content]
            );
            results.push({ order_id: order.id, action: 'REMINDER_D3' });
          }
        } 
        // Day 2: Second reminder
        else if (daysPassed >= 2) {
          const exists = await db.getAsync(
            'SELECT id FROM messages WHERE order_id = ? AND type = "REMINDER_D2"', 
            [order.id]
          );
          if (!exists) {
            const content = `「第二次付款提醒」親愛的 ${order.customer_name}，您的訂單金額為 ${order.total_amount} 元，請於明天前完成付款，謝謝！`;
            await db.runAsync(
              `INSERT INTO messages (order_id, content, type, status) VALUES (?, ?, 'REMINDER_D2', 'PENDING')`,
              [order.id, content]
            );
            results.push({ order_id: order.id, action: 'REMINDER_D2' });
          }
        } 
        // Day 1: First reminder
        else if (daysPassed >= 1) {
          const exists = await db.getAsync(
            'SELECT id FROM messages WHERE order_id = ? AND type = "REMINDER_D1"', 
            [order.id]
          );
          if (!exists) {
            const content = `「付款提醒」親愛的 ${order.customer_name}，您購買的 ${order.product_name} x ${order.qty} 尚未付款，請儘快完成付款。`;
            await db.runAsync(
              `INSERT INTO messages (order_id, content, type, status) VALUES (?, ?, 'REMINDER_D1', 'PENDING')`,
              [order.id, content]
            );
            results.push({ order_id: order.id, action: 'REMINDER_D1' });
          }
        }
      });
    }

    res.json({ message: 'Reminder processing finished', actions: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// PAYMENT REPORT & AUTOMATIC RECONCILIATION API (Phase 04)
// ==========================================

// POST /payment-report - User reports payment
app.post('/payment-report', async (req, res) => {
  const { order_id, amount, account_tail } = req.body;

  if (!order_id || typeof order_id !== 'number') {
    return res.status(400).json({ error: 'Invalid order ID' });
  }
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }
  if (!account_tail || typeof account_tail !== 'string' || account_tail.trim().length !== 5) {
    return res.status(400).json({ error: 'Account tail must be a 5-digit string' });
  }

  try {
    const order = await db.getAsync('SELECT id FROM orders WHERE id = ?', [order_id]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const result = await db.runAsync(
      `INSERT INTO payment_reports (order_id, amount, account_tail) VALUES (?, ?, ?)`,
      [order_id, amount, account_tail.trim()]
    );
    const report = await db.getAsync('SELECT * FROM payment_reports WHERE id = ?', [result.lastID]);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /bank/import - Import bank transactions (JSON list or raw CSV text)
app.post('/bank/import', async (req, res) => {
  let transactions = [];

  try {
    // Check if the body is a string (CSV content)
    if (typeof req.body === 'string') {
      const lines = req.body.split(/\r?\n/);
      if (lines.length > 0) {
        // Read header
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const amtIdx = headers.indexOf('amount');
        const tailIdx = headers.indexOf('account_tail');
        const dateIdx = headers.indexOf('transaction_date');

        if (amtIdx === -1 || tailIdx === -1 || dateIdx === -1) {
          return res.status(400).json({ error: 'Invalid CSV headers. Must contain: amount, account_tail, transaction_date' });
        }

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const cols = line.split(',').map(c => c.trim());
          if (cols.length >= headers.length) {
            transactions.push({
              amount: parseInt(cols[amtIdx], 10),
              account_tail: cols[tailIdx],
              transaction_date: cols[dateIdx]
            });
          }
        }
      }
    } else if (Array.isArray(req.body)) {
      transactions = req.body;
    } else {
      return res.status(400).json({ error: 'Invalid body format. Send a JSON array or CSV text' });
    }

    if (transactions.length === 0) {
      return res.status(400).json({ error: 'No transaction data provided' });
    }

    // Insert all into bank_transactions
    await runInTransaction(async () => {
      for (const tx of transactions) {
        if (!tx.amount || !tx.account_tail || !tx.transaction_date) {
          throw new Error('INVALID_TRANSACTION_RECORD');
        }
        await db.runAsync(
          `INSERT INTO bank_transactions (amount, account_tail, transaction_date) VALUES (?, ?, ?)`,
          [tx.amount, tx.account_tail.trim(), tx.transaction_date.trim()]
        );
      }
    });

    res.status(201).json({ message: 'Bank transactions imported successfully', count: transactions.length });
  } catch (error) {
    if (error.message === 'INVALID_TRANSACTION_RECORD') {
      res.status(400).json({ error: 'Transaction record is missing required fields (amount, account_tail, transaction_date)' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// POST /reconciliation/run - Run auto reconciliation
app.post('/reconciliation/run', async (req, res) => {
  try {
    // Get all payment reports linked to pending orders
    const pendingReports = await db.allAsync(`
      SELECT pr.*, o.customer_name 
      FROM payment_reports pr
      JOIN orders o ON pr.order_id = o.id
      WHERE o.status = 'PENDING'
    `);

    const matched = [];

    for (const report of pendingReports) {
      // Find matching bank transactions
      const match = await db.getAsync(`
        SELECT id FROM bank_transactions 
        WHERE amount = ? AND account_tail = ?
        LIMIT 1
      `, [report.amount, report.account_tail]);

      if (match) {
        await runInTransaction(async () => {
          // 1. Update order status to PAID
          await db.runAsync('UPDATE orders SET status = "PAID" WHERE id = ?', [report.order_id]);
          
          // 2. Automatically create paid notification message
          const content = `「付款確認」親愛的 ${report.customer_name}，已收到您的匯款 ${report.amount}元！您的訂單狀態已更新為已付款。`;
          await db.runAsync(
            `INSERT INTO messages (order_id, content, type, status) VALUES (?, ?, 'NOTIFICATION', 'PENDING')`,
            [report.order_id, content]
          );

          matched.push(report.order_id);
        });
      }
    }

    res.json({ message: 'Reconciliation finished', reconciled_order_ids: matched });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// LOGISTICS INTEGRATION API (Phase 05)
// ==========================================

// POST /shipping/create - Create mock shipping order for a PAID order
app.post('/shipping/create', async (req, res) => {
  const { order_id, carrier } = req.body;

  const validCarriers = ['7-11', 'FAMILYMART', 'HOME_DELIVERY'];
  if (!order_id || typeof order_id !== 'number') {
    return res.status(400).json({ error: 'Invalid order ID' });
  }
  if (!carrier || !validCarriers.includes(carrier)) {
    return res.status(400).json({ error: `Invalid carrier. Must be one of: ${validCarriers.join(', ')}` });
  }

  try {
    const shipment = await runInTransaction(async () => {
      // 1. Check order status
      const order = await db.getAsync(`
        SELECT o.*, p.name AS product_name 
        FROM orders o
        JOIN products p ON o.product_id = p.id
        WHERE o.id = ?
      `, [order_id]);

      if (!order) throw new Error('ORDER_NOT_FOUND');
      if (order.status !== 'PAID') throw new Error('ORDER_NOT_PAID');

      // 2. Generate tracking no
      const prefix = carrier === '7-11' ? '711' : (carrier === 'FAMILYMART' ? 'FM' : 'HD');
      const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
      const trackingNo = `TW-${prefix}-${randomDigits}`;

      // 3. Insert shipment record
      await db.runAsync(
        `INSERT INTO shipments (order_id, carrier, tracking_no, shipping_status) 
         VALUES (?, ?, ?, 'SHIPPED')`,
        [order_id, carrier, trackingNo]
      );

      // 4. Update order status to SHIPPED
      await db.runAsync('UPDATE orders SET status = "SHIPPED" WHERE id = ?', [order_id]);

      // 5. Create shipment notification message
      const content = `「出貨通知」親愛的 ${order.customer_name}，您的商品已出貨！物流業者：${carrier}，物流單號：${trackingNo}，請留意收件。`;
      await db.runAsync(
        `INSERT INTO messages (order_id, content, type, status) VALUES (?, ?, 'NOTIFICATION', 'PENDING')`,
        [order_id, content]
      );

      return {
        order_id,
        carrier,
        tracking_no: trackingNo,
        shipping_status: 'SHIPPED'
      };
    });

    res.status(201).json(shipment);
  } catch (error) {
    if (error.message === 'ORDER_NOT_FOUND') {
      res.status(404).json({ error: 'Order not found' });
    } else if (error.message === 'ORDER_NOT_PAID') {
      res.status(400).json({ error: 'Only PAID orders can be shipped' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// GET /shipping/:tracking_no - Query shipping details
app.get('/shipping/:tracking_no', async (req, res) => {
  const trackingNo = req.params.tracking_no;
  try {
    const shipment = await db.getAsync(`
      SELECT s.*, o.customer_name, o.status AS order_status, p.name AS product_name
      FROM shipments s
      JOIN orders o ON s.order_id = o.id
      JOIN products p ON o.product_id = p.id
      WHERE s.tracking_no = ?
    `, [trackingNo]);

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// SWAGGER API DOCUMENTATION
// ==========================================
app.get('/swagger.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'swagger.json'));
});

app.get('/api-docs', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>API Docs - AI Group Buying Assistant</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: '/swagger.json',
            dom_id: '#swagger-ui',
          });
        };
      </script>
    </body>
    </html>
  `;
  res.send(html);
});

// ==========================================
// START SERVER
// ==========================================
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
