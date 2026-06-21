const { spawn } = require('child_process');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simple assertion helper
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

async function runTests() {
  console.log('🚀 Starting Integration Tests for Phase 01 ~ Phase 05...');

  // ==========================================================
  // PHASE 01: Create Product
  // ==========================================================
  console.log('\n--- [Phase 01] Create Product ---');
  const prodRes = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: '草莓',
      price: 390,
      stock: 10
    })
  });
  assert(prodRes.status === 201, `Failed to create product: Status ${prodRes.status}`);
  const product = await prodRes.json();
  console.log('Product created:', product);
  assert(product.name === '草莓' && product.price === 390 && product.stock === 10, 'Product details mismatch');

  // ==========================================================
  // PHASE 02: AI Comment Order Parser
  // ==========================================================
  console.log('\n--- [Phase 02] AI Comment Order Parser (王小明：+2) ---');
  const commentRes = await fetch(`${BASE_URL}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: product.id,
      comment: '王小明：+2'
    })
  });
  assert(commentRes.status === 201, `Failed to parse comment and create order: Status ${commentRes.status}`);
  const order1 = await commentRes.json();
  console.log('Order 1 created via comment:', order1);
  assert(order1.customer_name === '王小明', 'Customer name mismatch');
  assert(order1.qty === 2, 'Quantity mismatch');
  assert(order1.total_amount === 780, 'Total amount mismatch');
  assert(order1.status === 'PENDING', 'Order status should be PENDING');

  // Verify stock reduced to 8
  const getProdRes1 = await fetch(`${BASE_URL}/products/${product.id}`);
  const product1 = await getProdRes1.json();
  console.log('Product stock after order:', product1.stock);
  assert(product1.stock === 8, `Expected stock to be 8, got ${product1.stock}`);

  // Test more formats (e.g. 我要兩盒, 收)
  console.log('\n--- [Phase 02] Testing different comment formats ---');
  const testComments = [
    { comment: '張三：我要1份', qty: 1 },
    { comment: '李四：我要兩盒', qty: 2 },
    { comment: '王五：收', qty: 1 }
  ];
  for (const tc of testComments) {
    const res = await fetch(`${BASE_URL}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: product.id, comment: tc.comment })
    });
    assert(res.status === 201, `Failed for comment "${tc.comment}": Status ${res.status}`);
    const o = await res.json();
    console.log(`Parsed "${tc.comment}" -> customer: ${o.customer_name}, qty: ${o.qty}`);
    assert(o.qty === tc.qty, `Expected qty ${tc.qty}, got ${o.qty}`);
  }

  // ==========================================================
  // PHASE 03: Automatic Notification & Dunning Scheduler
  // ==========================================================
  console.log('\n--- [Phase 03] Auto Notification Verification ---');
  // Check if NOTIFICATION message exists for order1
  const msgsRes = await fetch(`${BASE_URL}/messages`);
  const messages = await msgsRes.json();
  const order1Notification = messages.find(m => m.order_id === order1.id && m.type === 'NOTIFICATION');
  assert(order1Notification !== undefined, 'Order 1 notification not generated');
  console.log('Found billing notification:', order1Notification.content);

  // Test scheduler dunning: Create an order that is 3 days ago.
  console.log('\n--- [Phase 03] Dunning reminder (Day 3 check) ---');
  // We can insert directly into database by using a mock order created 3 days ago,
  // or we can test the POST /messages/reminder with a mock current_time in the future!
  // Yes! If we pass a future current_time to POST /messages/reminder,
  // the scheduler will calculate that the order created just now is actually 3 days old!
  // This is a super clean and non-destructive way to test without messing with the DB!
  const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 10000); // 3 days + 10s
  console.log(`Mocking current time to 3 days later: ${threeDaysLater.toISOString()}`);
  
  const dunningRes = await fetch(`${BASE_URL}/messages/reminder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_time: threeDaysLater.toISOString() })
  });
  const dunningResult = await dunningRes.json();
  console.log('Reminder scheduler result:', dunningResult);
  
  // Verify that REMINDER_D3 was generated for order 1
  const msgsResAfterDunning = await fetch(`${BASE_URL}/messages`);
  const messages2 = await msgsResAfterDunning.json();
  const order1ReminderD3 = messages2.find(m => m.order_id === order1.id && m.type === 'REMINDER_D3');
  assert(order1ReminderD3 !== undefined, 'Order 1 REMINDER_D3 message was not created');
  console.log('Found dunning notification (Day 3):', order1ReminderD3.content);

  // Test automatic cancellation on Day 4
  console.log('\n--- [Phase 03] Auto cancellation on Day 4 ---');
  const fourDaysLater = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 10000); // 4 days + 10s
  console.log(`Mocking current time to 4 days later: ${fourDaysLater.toISOString()}`);

  const cancelRes = await fetch(`${BASE_URL}/messages/reminder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_time: fourDaysLater.toISOString() })
  });
  const cancelResult = await cancelRes.json();
  console.log('Reminder scheduler Day 4 result:', cancelResult);

  // Verify order1 is now CANCELLED
  const getOrder1Res = await fetch(`${BASE_URL}/orders`);
  const allOrders = await getOrder1Res.json();
  const updatedOrder1 = allOrders.find(o => o.id === order1.id);
  console.log('Order 1 status after 4 days:', updatedOrder1.status);
  assert(updatedOrder1.status === 'CANCELLED', `Expected status CANCELLED, got ${updatedOrder1.status}`);

  // ==========================================================
  // PHASE 04: AI Auto Reconciliation
  // ==========================================================
  console.log('\n--- [Phase 04] Payment Report & CSV Import & Auto Reconciliation ---');
  // First, let's create a new order (李小華：+3) to reconcile, because order1 is cancelled
  const order2Res = await fetch(`${BASE_URL}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id: product.id, comment: '李小華：+3' })
  });
  const order2 = await order2Res.json();
  console.log('New Order 2 created:', order2); // 3 * 390 = 1170

  // 1. Submit payment report
  console.log('Submitting customer payment report...');
  const reportRes = await fetch(`${BASE_URL}/payment-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: order2.id,
      amount: 1170,
      account_tail: '51234'
    })
  });
  assert(reportRes.status === 201, `Failed to submit payment report: Status ${reportRes.status}`);
  const report = await reportRes.json();
  console.log('Payment report submitted:', report);

  // 2. Import CSV bank transaction
  console.log('Importing CSV bank transactions...');
  const csvContent = `amount,account_tail,transaction_date\n1170,51234,2026-06-21\n500,99999,2026-06-21`;
  const importRes = await fetch(`${BASE_URL}/bank/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/csv' },
    body: csvContent
  });
  assert(importRes.status === 201, `Failed to import CSV: Status ${importRes.status}`);
  const importResult = await importRes.json();
  console.log('Import result:', importResult);
  assert(importResult.count === 2, `Expected 2 imported transactions, got ${importResult.count}`);

  // 3. Run auto reconciliation
  console.log('Running reconciliation engine...');
  const reconRes = await fetch(`${BASE_URL}/reconciliation/run`, { method: 'POST' });
  const reconResult = await reconRes.json();
  console.log('Reconciliation result:', reconResult);
  assert(reconResult.reconciled_order_ids.includes(order2.id), 'Order 2 was not reconciled');

  // Verify order2 status is PAID
  const getOrder2Res = await fetch(`${BASE_URL}/orders`);
  const ordersList = await getOrder2Res.json();
  const updatedOrder2 = ordersList.find(o => o.id === order2.id);
  console.log('Order 2 status after reconciliation:', updatedOrder2.status);
  assert(updatedOrder2.status === 'PAID', `Expected status PAID, got ${updatedOrder2.status}`);

  // Verify paid notification message was generated
  const msgsResAfterRecon = await fetch(`${BASE_URL}/messages`);
  const messages3 = await msgsResAfterRecon.json();
  const order2PaidMsg = messages3.find(m => m.order_id === order2.id && m.content.includes('付款確認'));
  assert(order2PaidMsg !== undefined, 'Payment confirmation message not generated');
  console.log('Found payment confirmation notification:', order2PaidMsg.content);

  // ==========================================================
  // PHASE 05: Logistics Integration & Full Workflow Closed Loop
  // ==========================================================
  console.log('\n--- [Phase 05] Logistics Integration (Create Shipping Order) ---');
  // 1. Create shipping order for PAID order2
  const shipRes = await fetch(`${BASE_URL}/shipping/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: order2.id,
      carrier: '7-11'
    })
  });
  assert(shipRes.status === 201, `Failed to create shipping: Status ${shipRes.status}`);
  const shipment = await shipRes.json();
  console.log('Shipment created:', shipment);
  assert(shipment.carrier === '7-11', 'Carrier mismatch');
  assert(shipment.tracking_no.startsWith('TW-711-'), 'Tracking number should have 7-11 format');
  assert(shipment.shipping_status === 'SHIPPED', 'Shipping status mismatch');

  // Verify order2 status updated to SHIPPED
  const getOrder2ResAfterShip = await fetch(`${BASE_URL}/orders`);
  const ordersList2 = await getOrder2ResAfterShip.json();
  const finalOrder2 = ordersList2.find(o => o.id === order2.id);
  console.log('Final Order 2 status:', finalOrder2.status);
  assert(finalOrder2.status === 'SHIPPED', `Expected status SHIPPED, got ${finalOrder2.status}`);

  // Verify shipment notification message exists
  const msgsResAfterShip = await fetch(`${BASE_URL}/messages`);
  const messages4 = await msgsResAfterShip.json();
  const order2ShipMsg = messages4.find(m => m.order_id === order2.id && m.content.includes('出貨通知'));
  assert(order2ShipMsg !== undefined, 'Shipment notification message not generated');
  console.log('Found shipment notification:', order2ShipMsg.content);

  // 2. Query shipping status by tracking_no
  console.log('Querying shipping details...');
  const queryShipRes = await fetch(`${BASE_URL}/shipping/${shipment.tracking_no}`);
  assert(queryShipRes.status === 200, `Failed to query shipping details: Status ${queryShipRes.status}`);
  const queryShipResult = await queryShipRes.json();
  console.log('Query shipment result:', queryShipResult);
  assert(queryShipResult.tracking_no === shipment.tracking_no, 'Tracking number mismatch');
  assert(queryShipResult.customer_name === '李小華', 'Customer name mismatch');
  assert(queryShipResult.product_name === '草莓', 'Product name mismatch');

  console.log('\n==========================================================');
  console.log('🎉🎉🎉 ALL PHASE 01 ~ PHASE 05 TESTS PASSED SUCCESSFULLY! 🎉🎉🎉');
  console.log('==========================================================');
}

// Spawn the server process
const serverPath = path.join(__dirname, 'server.js');
console.log(`Spawning server process: ${serverPath}`);
const server = spawn('node', [serverPath], { stdio: 'pipe' });

let testsStarted = false;

server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(`[SERVER STDOUT] ${output.trim()}`);

  if (output.includes('Server is running') && !testsStarted) {
    testsStarted = true;
    runTests()
      .catch((err) => {
        console.error('\n❌ INTEGRATION TEST FAILED:', err.message);
        process.exitCode = 1;
      })
      .finally(() => {
        console.log('Stopping server process...');
        server.kill();
      });
  }
});

server.stderr.on('data', (data) => {
  console.error(`[SERVER STDERR] ${data.toString().trim()}`);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(process.exitCode || 0);
});

// Force exit after timeout if hung
setTimeout(() => {
  console.error('Test timed out after 30 seconds.');
  server.kill();
  process.exit(1);
}, 30000);
