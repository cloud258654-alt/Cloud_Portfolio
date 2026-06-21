// ==========================================
// STATE MANAGEMENT & TAB SWITCHING
// ==========================================
const tabs = document.querySelectorAll('.nav-item');
const panes = document.querySelectorAll('.tab-pane');
const tabTitle = document.getElementById('tab-title');
const tabDescription = document.getElementById('tab-description');

const tabInfo = {
  overview: { title: '營運總覽', desc: '查看當前團購專案的總體經營指標與快捷工具。' },
  products: { title: '📦 商品管理', desc: '上架新品、調整庫存以及檢視當前商品清單。' },
  orders: { title: '📝 訂單明細', desc: '管理所有訂單資訊，並可在此一鍵出貨（僅限已付款訂單）。' },
  comments: { title: '💬 AI 留言抓單', desc: '輸入社群留言，系統將自動解析姓名與數量，扣減庫存建立訂單。' },
  reconciliation: { title: '💳 付款與對帳', desc: '核對付款回報與銀行對帳明細，執行一鍵自動對帳更新。' },
  messages: { title: '✉️ 訊息通知紀錄', desc: '檢視系統自動產生的付款通知、逾期催告與出貨簡訊。' }
};

// Switch Tabs
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.getAttribute('data-tab');
    
    // Set active tab
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Set active pane
    panes.forEach(p => p.classList.remove('active'));
    document.getElementById(`tab-content-${tabName}`).classList.add('active');

    // Update Headers
    tabTitle.textContent = tabInfo[tabName].title;
    tabDescription.textContent = tabInfo[tabName].desc;

    // Load data specific to tab
    loadData(tabName);
  });
});

// Toast Notifications
function showToast(message, isError = false) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : ''}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(amount);
}

// Load data routing
function loadData(tabName) {
  switch (tabName) {
    case 'overview':
      loadOverviewStats();
      break;
    case 'products':
      loadProductsList();
      break;
    case 'orders':
      loadOrdersList();
      break;
    case 'comments':
      loadCommentsDropdown();
      break;
    case 'reconciliation':
      loadReconciliationDropdown();
      break;
    case 'messages':
      loadMessagesList();
      break;
  }
}

// ==========================================
// 1. OVERVIEW TAB
// ==========================================
async function loadOverviewStats() {
  try {
    const productsRes = await fetch('/products');
    const products = await productsRes.json();
    const ordersRes = await fetch('/orders');
    const orders = await ordersRes.json();
    const messagesRes = await fetch('/messages');
    const messages = await messagesRes.json();

    document.getElementById('stat-products-count').textContent = products.length;
    document.getElementById('stat-orders-count').textContent = orders.length;
    document.getElementById('stat-messages-count').textContent = messages.length;

    // Calculate revenue (sum of total_amount of PAID and SHIPPED orders)
    const revenue = orders
      .filter(o => o.status === 'PAID' || o.status === 'SHIPPED')
      .reduce((sum, o) => sum + o.total_amount, 0);
    document.getElementById('stat-revenue').textContent = formatCurrency(revenue);
  } catch (error) {
    showToast('加載儀表板指標失敗: ' + error.message, true);
  }
}

// Trigger Dunning Scheduler
async function triggerDunning() {
  try {
    const res = await fetch('/messages/reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await res.json();
    if (res.ok) {
      showToast('催款排程執行完畢！處理筆數：' + result.actions.length);
      loadOverviewStats();
    } else {
      showToast(result.error || '排程執行失敗', true);
    }
  } catch (error) {
    showToast('網路連線失敗: ' + error.message, true);
  }
}

// ==========================================
// 2. PRODUCTS TAB
// ==========================================
async function loadProductsList() {
  const tbody = document.getElementById('products-table-body');
  tbody.innerHTML = '<tr><td colspan="6">載入中...</td></tr>';
  
  try {
    const res = await fetch('/products');
    const products = await res.json();
    
    tbody.innerHTML = '';
    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">尚未上架商品</td></tr>';
      return;
    }

    products.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.id}</td>
        <td><strong>${p.name}</strong></td>
        <td>${p.price}</td>
        <td>${p.stock}</td>
        <td>${new Date(p.created_at).toLocaleString()}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="adjustStockPrompt(${p.id}, ${p.stock})">✏️ 調整庫存</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    showToast('商品列表加載失敗', true);
  }
}

// Adjust Stock Dialog
async function adjustStockPrompt(id, currentStock) {
  const input = prompt(`請輸入新的庫存數量 (目前：${currentStock})`, currentStock);
  if (input === null) return;
  const newStock = parseInt(input, 10);
  if (isNaN(newStock) || newStock < 0) {
    showToast('請輸入大於或等於 0 的整數', true);
    return;
  }

  try {
    const res = await fetch(`/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: newStock })
    });
    if (res.ok) {
      showToast('商品庫存調整成功！');
      loadProductsList();
    } else {
      const result = await res.json();
      showToast(result.error || '調整庫存失敗', true);
    }
  } catch (error) {
    showToast('更新失敗: ' + error.message, true);
  }
}

// Create Product Form Submit
document.getElementById('create-product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('product-name').value;
  const price = parseInt(document.getElementById('product-price').value, 10);
  const stock = parseInt(document.getElementById('product-stock').value, 10);

  try {
    const res = await fetch('/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, stock })
    });
    const result = await res.json();
    if (res.ok) {
      showToast(`商品「${name}」上架成功！`);
      document.getElementById('create-product-form').reset();
      loadProductsList();
    } else {
      showToast(result.error || '上架商品失敗', true);
    }
  } catch (error) {
    showToast('網路連線失敗: ' + error.message, true);
  }
});

// ==========================================
// 3. ORDERS TAB
// ==========================================
async function loadOrdersList() {
  const tbody = document.getElementById('orders-table-body');
  tbody.innerHTML = '<tr><td colspan="8">載入中...</td></tr>';
  
  try {
    const res = await fetch('/orders');
    const orders = await res.json();
    
    tbody.innerHTML = '';
    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8">目前無訂單紀錄</td></tr>';
      return;
    }

    orders.forEach(o => {
      let badgeClass = 'badge-pending';
      let actionsHtml = '';
      if (o.status === 'PAID') {
        badgeClass = 'badge-paid';
        actionsHtml = `<button class="btn btn-primary btn-sm" onclick="shipOrderPrompt(${o.id})">🚢 出貨</button>`;
      } else if (o.status === 'SHIPPED') {
        badgeClass = 'badge-shipped';
        actionsHtml = `<span class="help-text">已出貨</span>`;
      } else if (o.status === 'CANCELLED') {
        badgeClass = 'badge-cancelled';
        actionsHtml = `<span class="help-text">-</span>`;
      } else {
        actionsHtml = `
          <button class="btn btn-secondary btn-sm" onclick="cancelOrderPrompt(${o.id})">❌ 取消</button>
        `;
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${o.id}</td>
        <td><strong>${o.customer_name}</strong></td>
        <td>${o.product_name}</td>
        <td>${o.qty}</td>
        <td>${o.total_amount}</td>
        <td><span class="badge ${badgeClass}">${o.status}</span></td>
        <td>${new Date(o.created_at).toLocaleString()}</td>
        <td>${actionsHtml}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    showToast('加載訂單明細失敗', true);
  }
}

// Ship Order Action
async function shipOrderPrompt(id) {
  const carrier = prompt('請輸入物流商 (7-11 / FAMILYMART / HOME_DELIVERY)', '7-11');
  if (!carrier) return;

  const valid = ['7-11', 'FAMILYMART', 'HOME_DELIVERY'];
  if (!valid.includes(carrier)) {
    showToast('物流商填寫錯誤，請輸入 7-11, FAMILYMART 或 HOME_DELIVERY', true);
    return;
  }

  try {
    const res = await fetch('/shipping/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: id, carrier })
    });
    const result = await res.json();
    if (res.ok) {
      showToast(`訂單已發貨！單號：${result.tracking_no}`);
      loadOrdersList();
    } else {
      showToast(result.error || '出貨失敗', true);
    }
  } catch (error) {
    showToast('出貨失敗: ' + error.message, true);
  }
}

// Cancel Order Action
async function cancelOrderPrompt(id) {
  if (!confirm('您確定要手動取消此訂單嗎？（取消後將會退回商品庫存）')) return;
  try {
    const res = await fetch(`/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED' })
    });
    if (res.ok) {
      showToast('訂單已手動取消，庫存已歸還！');
      loadOrdersList();
    } else {
      const result = await res.json();
      showToast(result.error || '取消失敗', true);
    }
  } catch (error) {
    showToast('取消錯誤: ' + error.message, true);
  }
}

// ==========================================
// 4. COMMENTS TAB (AI PARSER)
// ==========================================
async function loadCommentsDropdown() {
  const select = document.getElementById('comment-product-select');
  select.innerHTML = '<option>加載中...</option>';
  try {
    const res = await fetch('/products');
    const products = await res.json();
    select.innerHTML = '';
    products.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} (單價:${p.price} | 庫存:${p.stock})`;
      select.appendChild(opt);
    });
  } catch (error) {
    showToast('加載商品列表失敗', true);
  }
}

// Submit Comment Form
document.getElementById('parse-comment-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const product_id = parseInt(document.getElementById('comment-product-select').value, 10);
  const comment = document.getElementById('comment-text').value;

  const resultBox = document.getElementById('comment-parse-result');
  const resultJson = document.getElementById('parse-result-json');

  try {
    const res = await fetch('/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id, comment })
    });
    const result = await res.json();
    
    resultBox.classList.remove('hidden');
    if (res.ok) {
      showToast('AI 留言解析成功，訂單已創立！');
      resultJson.textContent = JSON.stringify(result, null, 2);
      document.getElementById('comment-text').value = '';
      loadCommentsDropdown(); // reload stock info
    } else {
      showToast(result.error || '解析建單失敗', true);
      resultJson.textContent = JSON.stringify(result, null, 2);
    }
  } catch (error) {
    showToast('網路錯誤: ' + error.message, true);
  }
});

// ==========================================
// 5. RECONCILIATION TAB
// ==========================================
async function loadReconciliationDropdown() {
  const select = document.getElementById('report-order-select');
  select.innerHTML = '<option>加載中...</option>';
  try {
    const res = await fetch('/orders');
    const orders = await res.json();
    select.innerHTML = '';
    
    // Filter to only PENDING orders
    const pendingOrders = orders.filter(o => o.status === 'PENDING');
    if (pendingOrders.length === 0) {
      select.innerHTML = '<option value="">(目前無待付款訂單)</option>';
      return;
    }

    pendingOrders.forEach(o => {
      const opt = document.createElement('option');
      opt.value = o.id;
      opt.textContent = `訂單ID:${o.id} | 顧客:${o.customer_name} | 商品:${o.product_name} x ${o.qty} (應付 NT$${o.total_amount})`;
      select.appendChild(opt);
    });
  } catch (error) {
    showToast('加載待對帳訂單失敗', true);
  }
}

// Payment Report Submit
document.getElementById('payment-report-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const order_id = parseInt(document.getElementById('report-order-select').value, 10);
  const amount = parseInt(document.getElementById('report-amount').value, 10);
  const account_tail = document.getElementById('report-tail').value;

  if (!order_id) {
    showToast('請先選擇訂單', true);
    return;
  }

  try {
    const res = await fetch('/payment-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id, amount, account_tail })
    });
    if (res.ok) {
      showToast('付款回報成功！請等待系統執行自動對帳。');
      document.getElementById('payment-report-form').reset();
      loadReconciliationDropdown();
    } else {
      const result = await res.json();
      showToast(result.error || '回報失敗', true);
    }
  } catch (error) {
    showToast('送出失敗: ' + error.message, true);
  }
});

// Import Bank CSV
document.getElementById('bank-import-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const csvText = document.getElementById('csv-text').value;

  try {
    const res = await fetch('/bank/import', {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: csvText
    });
    const result = await res.json();
    if (res.ok) {
      showToast(`銀行交易紀錄明細匯入成功！共導入 ${result.count} 筆。`);
      document.getElementById('csv-text').value = '';
    } else {
      showToast(result.error || '匯入明細失敗', true);
    }
  } catch (error) {
    showToast('匯入失敗: ' + error.message, true);
  }
});

// Run Reconciliation 比對
async function runReconciliation() {
  const resultBox = document.getElementById('reconciliation-result');
  const resultMsg = document.getElementById('recon-result-msg');
  
  try {
    const res = await fetch('/reconciliation/run', { method: 'POST' });
    const result = await res.json();
    
    resultBox.classList.remove('hidden');
    if (res.ok) {
      const count = result.reconciled_order_ids.length;
      showToast(`自動對帳執行完畢！`);
      if (count > 0) {
        resultMsg.innerHTML = `<span style="color: #34d399; font-weight:600;">🎉 對帳成功！</span> 成功自動核對並銷帳 <strong>${count}</strong> 筆訂單，訂單ID為：${result.reconciled_order_ids.join(', ')}。`;
      } else {
        resultMsg.innerHTML = `<span style="color: #f59e0b; font-weight:600;">ℹ️ 未找到匹配明細</span> 已完成掃描，但尚未發現「金額與帳號後五碼完全相同」的匹配對帳明細。`;
      }
      loadReconciliationDropdown(); // reload list
    } else {
      showToast(result.error || '對帳引擎執行出錯', true);
      resultMsg.innerHTML = `<span style="color:#ef4444;">錯誤：</span> ${result.error}`;
    }
  } catch (error) {
    showToast('對帳錯誤: ' + error.message, true);
  }
}

// ==========================================
// 6. MESSAGES TAB
// ==========================================
async function loadMessagesList() {
  const tbody = document.getElementById('messages-table-body');
  tbody.innerHTML = '<tr><td colspan="7">載入中...</td></tr>';

  try {
    const res = await fetch('/messages');
    const messages = await res.json();

    tbody.innerHTML = '';
    if (messages.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">目前無訊息通知紀錄</td></tr>';
      return;
    }

    messages.forEach(m => {
      const tr = document.createElement('tr');
      const actionHtml = m.status === 'PENDING' 
        ? `<button class="btn btn-secondary btn-sm" onclick="sendMsgAction(${m.id})">📨 發送</button>`
        : '<span class="help-text">已完成</span>';
      
      const badgeStatusClass = m.status === 'SENT' ? 'badge-status-sent' : 'badge-pending';

      tr.innerHTML = `
        <td>${m.id}</td>
        <td>訂單 ID: ${m.order_id}</td>
        <td>${m.content}</td>
        <td><span class="badge badge-type">${m.type}</span></td>
        <td><span class="badge ${badgeStatusClass}">${m.status}</span></td>
        <td>${new Date(m.created_at).toLocaleString()}</td>
        <td>${actionHtml}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    showToast('加載訊息紀錄失敗', true);
  }
}

// Mark Message as Sent Action
async function sendMsgAction(id) {
  try {
    const res = await fetch('/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message_id: id })
    });
    if (res.ok) {
      showToast('簡訊發送成功！');
      loadMessagesList();
    } else {
      const result = await res.json();
      showToast(result.error || '發送失敗', true);
    }
  } catch (error) {
    showToast('發送失敗: ' + error.message, true);
  }
}

// ==========================================
// APP INITIALIZATION
// ==========================================
// Load default overview tab data on startup
loadData('overview');
