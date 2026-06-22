// ==========================================
// Ghibli POS Application Logic (Ver 1.3)
// ==========================================

// --- Default Ghibli Catalog ---
const DEFAULT_INVENTORY = [
    { prod_id: "P001", barcode: "471000000001", name: "可樂 600ml", price: 40.00, stock: 25, avatar: "🥤" },
    { prod_id: "P002", barcode: "471000000002", name: "洋芋片", price: 50.00, stock: 15, avatar: "🥔" },
    { prod_id: "P003", barcode: "471000000003", name: "鮮奶 946ml", price: 60.00, stock: 8, avatar: "🥛" },
    { prod_id: "P004", barcode: "471000000004", name: "手工薰衣草餅乾", price: 35.00, stock: 20, avatar: "🍪" },
    { prod_id: "P005", barcode: "471000000005", name: "艾莉緹紅茶 500ml", price: 30.00, stock: 4, avatar: "🍵" },
    { prod_id: "P006", barcode: "471000000006", name: "魔女特製吐司", price: 80.00, stock: 0, avatar: "🍞" }
];

// --- State Variables ---
let inventory = [];
let transactions = [];
let cart = [];
let activeReceiptTranNo = null;

// --- DOM Cache ---
const liveClock = document.getElementById('live-clock');
const currentTranNoEl = document.getElementById('current-tran-no');
const transactionStatusBadge = document.getElementById('transaction-status-badge');
const payMethodSelect = document.getElementById('pay-method-select');
const cartItemCountEl = document.getElementById('cart-item-count');
const cartTableBody = document.getElementById('cart-table-body');
const barcodeInput = document.getElementById('barcode-input');
const quickSelectDropdown = document.getElementById('quick-select-dropdown');

// Totals Inputs & Values
const summarySubtotal = document.getElementById('summary-subtotal');
const discountInput = document.getElementById('discount-input');
const summaryTax = document.getElementById('summary-tax');
const summaryTotal = document.getElementById('summary-total');
const checkoutBtn = document.getElementById('checkout-btn');
const transactionNotes = document.getElementById('transaction-notes');

// Bottom panels / Actions
const clearCartBtn = document.getElementById('clear-cart-btn');
const holdTxBtn = document.getElementById('hold-tx-btn');
const loadTxBtn = document.getElementById('load-tx-btn');
const printReceiptBtn = document.getElementById('print-receipt-btn');
const printCountSelect = document.getElementById('receipt-print-count-select');
const viewHistoryBtn = document.getElementById('view-history-btn');
const voidTransactionBtn = document.getElementById('void-transaction-btn');
const sysTipsList = document.getElementById('sys-tips-list');

// Modals
const historyModal = document.getElementById('history-modal');
const closeHistoryModalBtn = document.getElementById('close-history-modal-btn');
const historyTableBody = document.getElementById('history-table-body');

const receiptModal = document.getElementById('receipt-modal');
const closeReceiptModalBtn = document.getElementById('close-receipt-modal-btn');
const receiptPaperContent = document.getElementById('receipt-paper-content');

const toastContainer = document.getElementById('toast-container');

// ==========================================
// 1. App Bootstrap
// ==========================================

function initApp() {
    loadInventory();
    loadTransactions();
    
    // Live Clock
    updateClock();
    setInterval(updateClock, 1000);
    
    generateNextTransactionNumber();
    
    // Render catalog options and cart table
    renderQuickSelect();
    renderCart();
    
    // Bind Actions
    setupEventListeners();
    
    // Initial welcome feeds
    updateTipsFeed(["歡迎光臨吉卜力雜貨店！🌿", "商品庫存充足，工作愉快！", "祝您有美好的一天！✨"]);
}

function loadInventory() {
    const stored = localStorage.getItem('pos_inventory');
    if (stored) {
        try {
            inventory = JSON.parse(stored);
        } catch (e) {
            inventory = [...DEFAULT_INVENTORY.map(x => ({...x}))];
        }
    } else {
        inventory = [...DEFAULT_INVENTORY.map(x => ({...x}))];
        saveInventory();
    }
}

function saveInventory() {
    localStorage.setItem('pos_inventory', JSON.stringify(inventory));
}

function loadTransactions() {
    const stored = localStorage.getItem('pos_transactions');
    if (stored) {
        try {
            transactions = JSON.parse(stored);
        } catch (e) {
            transactions = [];
        }
    } else {
        transactions = [];
    }
}

function saveTransactions() {
    localStorage.setItem('pos_transactions', JSON.stringify(transactions));
}

function updateClock() {
    const now = new Date();
    const pad = (num) => String(num).padStart(2, '0');
    const yyyy = now.getFullYear();
    const mm = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    const hh = pad(now.getHours());
    const min = pad(now.getMinutes());
    const ss = pad(now.getSeconds());
    liveClock.textContent = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

function generateNextTransactionNumber() {
    const now = new Date();
    const pad = (num) => String(num).padStart(2, '0');
    const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    
    let todayCount = 0;
    const prefix = `T${dateStr}`;
    
    transactions.forEach(t => {
        if (t.tran_no && t.tran_no.startsWith(prefix)) {
            const index = parseInt(t.tran_no.substring(prefix.length), 10);
            if (index > todayCount) {
                todayCount = index;
            }
        }
    });
    
    const nextIndexStr = String(todayCount + 1).padStart(4, '0');
    currentTranNoEl.textContent = `${prefix}${nextIndexStr}`;
}

// ==========================================
// 2. Notifications & Tips System
// ==========================================

function showToast(message, type = "info") {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'danger') iconClass = 'fa-triangle-exclamation';
    if (type === 'warning') iconClass = 'fa-leaf';
    
    toast.innerHTML = `
        <i class="fa-solid ${iconClass} toast-icon"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3000);
}

function updateTipsFeed(logsArray) {
    sysTipsList.innerHTML = '';
    logsArray.forEach(log => {
        const li = document.createElement('li');
        li.textContent = log;
        sysTipsList.appendChild(li);
    });
}

function refreshSystemTips() {
    const tips = [];
    
    if (cart.length === 0) {
        tips.push("購物車目前是空的 🍃");
        // Add info about items running low
        const lowStockItems = inventory.filter(i => i.stock > 0 && i.stock < 5);
        if (lowStockItems.length > 0) {
            tips.push(`⚠️ 注意：${lowStockItems.map(i => i.name).join('、')} 庫存吃緊！`);
        } else {
            tips.push("雜貨店商品貨源充足。");
        }
    } else {
        tips.push(`🛒 已加入 ${cart.length} 項商品明細。`);
        // Check if any cart item matches or nears stock boundaries
        cart.forEach(c => {
            const product = inventory.find(p => p.prod_id === c.prod_id);
            if (product && product.stock === c.qty) {
                tips.push(`⚠️ ${c.name} 購物數量已達庫存上限 (${c.qty})！`);
            }
        });
    }
    
    tips.push("祝您有美好的一天！✨");
    updateTipsFeed(tips);
}

// ==========================================
// 3. POS Actions & Setup
// ==========================================

function setupEventListeners() {
    // Search simulation
    barcodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleScanOrSearch();
        }
    });
    
    // Quick select dropdown
    quickSelectDropdown.addEventListener('change', (e) => {
        if (e.target.value) {
            barcodeInput.value = e.target.value;
            handleScanOrSearch();
            e.target.value = ''; // reset
        }
    });
    
    // Cart inputs
    discountInput.addEventListener('input', () => {
        let val = parseInt(discountInput.value, 10);
        if (isNaN(val) || val < 0) {
            discountInput.value = 0;
        }
        calculateCartTotals();
    });
    
    // Clear Cart
    clearCartBtn.addEventListener('click', () => {
        if (cart.length === 0) return;
        if (confirm("確認清空目前的商品明細嗎？🧹")) {
            cart = [];
            transactionStatusBadge.textContent = "PENDING";
            transactionStatusBadge.className = "badge badge-pending";
            renderCart();
            showToast("購物車已清空 🧹", "info");
        }
    });
    
    // Draft Hold & Retrieve
    holdTxBtn.addEventListener('click', handleHoldTransaction);
    loadTxBtn.addEventListener('click', handleLoadTransaction);
    
    // Checkout
    checkoutBtn.addEventListener('click', handleCheckout);
    
    // Print receipts
    printReceiptBtn.addEventListener('click', () => {
        if (!activeReceiptTranNo && transactions.length > 0) {
            // Pick the latest transaction
            const latest = transactions[transactions.length - 1];
            openReceiptModal(latest.tran_no);
        } else if (activeReceiptTranNo) {
            executePrint();
        } else {
            showToast("尚無交易明細可進行列印！", "danger");
        }
    });
    
    // Void Transaction
    voidTransactionBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            if (confirm("確認取消並清空目前這筆正在編輯的交易嗎？")) {
                cart = [];
                discountInput.value = 0;
                transactionNotes.value = '';
                transactionStatusBadge.textContent = "CANCELLED";
                transactionStatusBadge.className = "badge badge-cancelled";
                renderCart();
                showToast("交易已取消！💨", "danger");
            }
        } else {
            showToast("目前無編輯中的交易，您可以點擊「交易記錄」作廢過往單據。", "info");
        }
    });
    
    // Modals
    viewHistoryBtn.addEventListener('click', openHistoryModal);
    closeHistoryModalBtn.addEventListener('click', closeHistoryModal);
    closeReceiptModalBtn.addEventListener('click', closeReceiptModal);
}

function renderQuickSelect() {
    quickSelectDropdown.innerHTML = '<option value="">-- 點選以模擬掃描商品 --</option>';
    inventory.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.barcode;
        opt.textContent = `${item.barcode} | ${item.name} ($${item.price}) [庫存:${item.stock}]`;
        quickSelectDropdown.appendChild(opt);
    });
}

function handleScanOrSearch() {
    const query = barcodeInput.value.trim();
    barcodeInput.value = '';
    barcodeInput.focus();
    
    if (!query) return;
    
    // Find matching item by Barcode, ID or Name
    const product = inventory.find(p => 
        p.barcode === query || 
        p.prod_id.toLowerCase() === query.toLowerCase() ||
        p.name.includes(query)
    );
    
    if (!product) {
        showToast(`找不到與「${query}」相符的商品！🍂`, "danger");
        return;
    }
    
    if (product.stock <= 0) {
        showToast(`❌ 庫存不足！${product.name} 目前已無庫存。`, "danger");
        return;
    }
    
    const cartItem = cart.find(c => c.prod_id === product.prod_id);
    const cartQty = cartItem ? cartItem.qty : 0;
    
    if (cartQty + 1 > product.stock) {
        showToast(`⚠ 庫存不足！目前庫存：${product.stock}，已加入：${cartQty}`, "danger");
        return;
    }
    
    if (cartItem) {
        cartItem.qty += 1;
        cartItem.amt = cartItem.price * cartItem.qty;
        showToast(`已增加 ${product.name} 數量為 ${cartItem.qty} 🛒`, "success");
    } else {
        cart.push({
            prod_id: product.prod_id,
            barcode: product.barcode,
            name: product.name,
            price: product.price,
            qty: 1,
            amt: product.price
        });
        showToast(`已將 ${product.name} 加入明細 🛒`, "success");
    }
    
    transactionStatusBadge.textContent = "PENDING";
    transactionStatusBadge.className = "badge badge-pending";
    
    renderCart();
}

function renderCart() {
    if (cart.length === 0) {
        cartTableBody.innerHTML = `
            <tr class="empty-cart-row">
                <td colspan="5" class="text-center" style="padding: 80px 20px; color: var(--ghibli-text-dimmed);">
                    <i class="fa-solid fa-store-slash" style="font-size: 40px; margin-bottom: 12px; opacity:0.4;"></i>
                    <p style="font-weight:700;">購物車空空如也 🍃</p>
                    <small>請掃描條碼或從上方選單快速加入商品</small>
                </td>
            </tr>
        `;
        cartItemCountEl.textContent = "0 件商品";
        checkoutBtn.disabled = true;
    } else {
        cartTableBody.innerHTML = '';
        let totalCount = 0;
        
        cart.forEach(item => {
            totalCount += item.qty;
            const tr = document.createElement('tr');
            
            // Get avatar from catalog inventory
            const catalogItem = inventory.find(p => p.prod_id === item.prod_id);
            const avatar = catalogItem ? catalogItem.avatar : "📦";
            
            tr.innerHTML = `
                <td>
                    <div class="product-row-info">
                        <span class="product-row-img">${avatar}</span>
                        <div class="product-row-details">
                            <span class="product-row-name">${item.name}</span>
                            <span class="product-row-code">${item.prod_id}</span>
                        </div>
                    </div>
                </td>
                <td class="text-right font-mono">$${item.price.toFixed(0)}</td>
                <td class="text-center">
                    <div class="wood-qty-control">
                        <span class="wood-qty-btn dec-btn" data-prod-id="${item.prod_id}">-</span>
                        <span class="wood-qty-val">${item.qty}</span>
                        <span class="wood-qty-btn inc-btn" data-prod-id="${item.prod_id}">+</span>
                    </div>
                </td>
                <td class="text-right font-mono">$${item.amt.toFixed(0)}</td>
                <td class="text-center">
                    <button class="trash-btn" data-prod-id="${item.prod_id}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;
            
            // Wire listeners
            tr.querySelector('.dec-btn').addEventListener('click', () => adjustQty(item.prod_id, -1));
            tr.querySelector('.inc-btn').addEventListener('click', () => adjustQty(item.prod_id, 1));
            tr.querySelector('.trash-btn').addEventListener('click', () => deleteItem(item.prod_id));
            
            cartTableBody.appendChild(tr);
        });
        
        cartItemCountEl.textContent = `${totalCount} 件商品`;
        checkoutBtn.disabled = false;
    }
    
    calculateCartTotals();
    refreshSystemTips();
}

function adjustQty(prod_id, change) {
    const item = cart.find(c => c.prod_id === prod_id);
    if (!item) return;
    
    const product = inventory.find(p => p.prod_id === prod_id);
    const targetQty = item.qty + change;
    
    if (targetQty <= 0) {
        deleteItem(prod_id);
        return;
    }
    
    if (targetQty > product.stock) {
        showToast(`⚠ 庫存不足！該商品最多僅有 ${product.stock} 件。`, "danger");
        return;
    }
    
    item.qty = targetQty;
    item.amt = item.price * item.qty;
    renderCart();
}

function deleteItem(prod_id) {
    const idx = cart.findIndex(c => c.prod_id === prod_id);
    if (idx > -1) {
        const item = cart[idx];
        cart.splice(idx, 1);
        showToast(`已移除 ${item.name} 🍂`, "info");
        renderCart();
    }
}

// ==========================================
// 4. Calculations
// ==========================================

function calculateCartTotals() {
    // Subtotal
    const subtotal = cart.reduce((sum, item) => sum + item.amt, 0);
    summarySubtotal.textContent = `$${subtotal.toFixed(0)}`;
    
    // Discount
    let discount = parseInt(discountInput.value, 10);
    if (isNaN(discount)) discount = 0;
    if (discount > subtotal) {
        discount = subtotal;
        discountInput.value = subtotal;
    }
    
    const discountedAmount = subtotal - discount;
    
    // Tax 5%
    const tax = Math.round(discountedAmount * 0.05);
    summaryTax.textContent = `$${tax.toFixed(0)}`;
    
    // Grand Total
    const total = discountedAmount + tax;
    summaryTotal.textContent = `$${total.toFixed(0)}`;
}

// ==========================================
// 5. Hold / Load Draft Transactions
// ==========================================

function handleHoldTransaction() {
    if (cart.length === 0) {
        showToast("商品明細為空，無法暫存！", "danger");
        return;
    }
    
    let discount = parseInt(discountInput.value, 10);
    if (isNaN(discount)) discount = 0;
    
    const draft = {
        cart: [...cart],
        discount: discount,
        pay_method: payMethodSelect.value,
        notes: transactionNotes.value
    };
    
    localStorage.setItem('pos_held_transaction', JSON.stringify(draft));
    
    // Reset active cart
    cart = [];
    discountInput.value = 0;
    transactionNotes.value = '';
    transactionStatusBadge.textContent = "PENDING";
    transactionStatusBadge.className = "badge badge-pending";
    
    renderCart();
    showToast("交易已成功暫存！🍂", "warning");
}

function handleLoadTransaction() {
    const stored = localStorage.getItem('pos_held_transaction');
    if (!stored) {
        showToast("目前沒有暫存的交易紀錄！", "danger");
        return;
    }
    
    if (cart.length > 0 && !confirm("載入暫存交易將會覆蓋當前編輯的購物車，是否繼續？")) {
        return;
    }
    
    try {
        const draft = JSON.parse(stored);
        cart = draft.cart || [];
        discountInput.value = draft.discount || 0;
        payMethodSelect.value = draft.pay_method || "LINE_PAY";
        transactionNotes.value = draft.notes || '';
        
        // Remove draft once loaded
        localStorage.removeItem('pos_held_transaction');
        
        transactionStatusBadge.textContent = "PENDING";
        transactionStatusBadge.className = "badge badge-pending";
        
        renderCart();
        showToast("已成功載入暫存交易！🍃", "success");
    } catch (e) {
        showToast("載入暫存交易出錯！", "danger");
    }
}

// ==========================================
// 6. Checkout Process
// ==========================================

function handleCheckout() {
    if (cart.length === 0) return;
    
    // Double check inventory
    let stockValid = true;
    let failedItem = null;
    
    for (let c of cart) {
        const p = inventory.find(i => i.prod_id === c.prod_id);
        if (!p || p.stock < c.qty) {
            stockValid = false;
            failedItem = c;
            break;
        }
    }
    
    if (!stockValid) {
        showToast(`❌ 庫存不足！請重新確認「${failedItem.name}」的剩餘庫存。`, "danger");
        return;
    }
    
    // Deduct stock formally
    cart.forEach(c => {
        const p = inventory.find(i => i.prod_id === c.prod_id);
        p.stock -= c.qty;
    });
    saveInventory();
    
    // Create transaction object following ver1.3.md schema
    const subtotalText = summarySubtotal.textContent.replace('$', '');
    const subtotal = parseFloat(subtotalText);
    
    let discount = parseInt(discountInput.value, 10);
    if (isNaN(discount)) discount = 0;
    
    const taxText = summaryTax.textContent.replace('$', '');
    const tax = parseFloat(taxText);
    
    const totalText = summaryTotal.textContent.replace('$', '');
    const total = parseFloat(totalText);
    
    const nextTranNo = currentTranNoEl.textContent;
    const now = new Date();
    const pad = (num) => String(num).padStart(2, '0');
    const fullDateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    const transaction = {
        tran_no: nextTranNo,
        tran_date: fullDateStr.split(' ')[0], // YYYY-MM-DD format
        status: "SUCCESS",
        pay_method: payMethodSelect.value,
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        total: total,
        print_count: 0,
        operator_id: "OP042",
        created_at: fullDateStr,
        notes: transactionNotes.value.trim(),
        details: [...cart]
    };
    
    transactions.push(transaction);
    saveTransactions();
    
    showToast(`付款結帳成功！單號: ${nextTranNo} 🪙`, "success");
    transactionStatusBadge.textContent = "SUCCESS";
    transactionStatusBadge.className = "badge badge-success";
    
    // Render and open receipt
    openReceiptModal(nextTranNo);
    
    // Reset active cart
    cart = [];
    discountInput.value = 0;
    transactionNotes.value = '';
    
    renderCart();
    renderQuickSelect(); // updates stock levels in dropdown
    generateNextTransactionNumber();
}

// ==========================================
// 7. Receipts Modal
// ==========================================

function openReceiptModal(tranNo) {
    activeReceiptTranNo = tranNo;
    const tx = transactions.find(t => t.tran_no === tranNo);
    if (!tx) {
        showToast("找不到交易明細單！", "danger");
        return;
    }
    
    renderReceiptContent(tx);
    receiptModal.classList.add('active');
}

function closeReceiptModal() {
    receiptModal.classList.remove('active');
    activeReceiptTranNo = null;
}

function renderReceiptContent(tx) {
    let itemsHTML = '';
    tx.details.forEach(item => {
        itemsHTML += `
            <div class="receipt-item-row">
                <span>${item.name}</span>
                <span>x${item.qty}</span>
                <span>$${item.amt.toFixed(0)}</span>
            </div>
        `;
    });
    
    let statusText = "成功 (SUCCESS)";
    if (tx.status === "CANCELLED") statusText = "已作廢 (CANCELLED)";
    
    receiptPaperContent.innerHTML = `
        <div class="thermal-receipt-header">
            <h4>吉卜力雜貨店</h4>
            <p>統一發票 / 交易明細聯</p>
            <small>森林區橡子路 4 號</small>
        </div>
        <hr>
        <div>
            <div class="receipt-item-row"><span>單號:</span><span>${tx.tran_no}</span></div>
            <div class="receipt-item-row"><span>日期:</span><span>${tx.created_at}</span></div>
            <div class="receipt-item-row"><span>收銀:</span><span>OP042 / 小梅</span></div>
            <div class="receipt-item-row"><span>付款:</span><span>${tx.pay_method}</span></div>
            <div class="receipt-item-row"><span>狀態:</span><span>${statusText}</span></div>
            ${tx.notes ? `<div class="receipt-item-row"><span>備註:</span><span>${tx.notes}</span></div>` : ''}
        </div>
        <hr>
        <div class="receipt-item-grid">
            <div class="receipt-item-row" style="font-weight: bold;">
                <span>品名</span>
                <span>數量</span>
                <span>金額</span>
            </div>
            ${itemsHTML}
        </div>
        <hr>
        <div>
            <div class="receipt-item-row">
                <span>小計 Subtotal:</span>
                <span>$${tx.subtotal.toFixed(0)}</span>
            </div>
            <div class="receipt-item-row">
                <span>折扣 Discount:</span>
                <span>-$${tx.discount.toFixed(0)}</span>
            </div>
            <div class="receipt-item-row">
                <span>營業稅 Tax (5%):</span>
                <span>$${tx.tax.toFixed(0)}</span>
            </div>
            <div class="receipt-item-row" style="font-weight: bold; font-size:14px; margin-top:4px;">
                <span>總計 Total:</span>
                <span>$${tx.total.toFixed(0)}</span>
            </div>
        </div>
        <hr>
        <div class="thermal-receipt-footer">
            <p>※ 感謝您的光臨，祝您擁有奇幻的一天 ※</p>
            <p>列印份數: <span id="receipt-print-count-badge">${tx.print_count}</span></p>
        </div>
    `;
}

function executePrint() {
    if (!activeReceiptTranNo) return;
    
    const count = parseInt(printCountSelect.value, 10);
    if (isNaN(count) || count < 1) return;
    
    const tx = transactions.find(t => t.tran_no === activeReceiptTranNo);
    if (!tx) return;
    
    tx.print_count += count;
    saveTransactions();
    
    const badge = document.getElementById('receipt-print-count-badge');
    if (badge) badge.textContent = tx.print_count;
    
    showToast(`明細發票發送列印成功！印製 ${count} 份。`, "success");
    window.print();
}

// ==========================================
// 8. History Ledger Modal & Cancel logic
// ==========================================

function openHistoryModal() {
    renderHistoryLedger();
    historyModal.classList.add('active');
}

function closeHistoryModal() {
    historyModal.classList.remove('active');
}

function renderHistoryLedger() {
    if (transactions.length === 0) {
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center" style="padding: 40px; color: var(--ghibli-text-dimmed);">
                    登記簿目前是空的 🍃
                </td>
            </tr>
        `;
        return;
    }
    
    historyTableBody.innerHTML = '';
    
    // reverse order to display latest transaction on top
    const sorted = [...transactions].reverse();
    
    sorted.forEach(tx => {
        const tr = document.createElement('tr');
        
        let statusBadgeClass = 'badge-pending';
        let statusText = 'PENDING';
        if (tx.status === 'SUCCESS') {
            statusBadgeClass = 'badge-success';
            statusText = 'SUCCESS';
        } else if (tx.status === 'CANCELLED') {
            statusBadgeClass = 'badge-cancelled';
            statusText = 'CANCELLED';
        }
        
        tr.innerHTML = `
            <td>${tx.tran_no}</td>
            <td>${tx.created_at}</td>
            <td>${tx.pay_method}</td>
            <td class="text-right font-mono">$${tx.total.toFixed(0)}</td>
            <td class="text-center"><span class="badge ${statusBadgeClass}">${statusText}</span></td>
            <td class="text-center">${tx.print_count}</td>
            <td class="text-center">
                <div class="history-action-group">
                    <button class="ledger-btn-small ledger-btn-print" data-tran-no="${tx.tran_no}">檢視</button>
                    ${tx.status === 'SUCCESS' ? `<button class="ledger-btn-small ledger-btn-void" data-tran-no="${tx.tran_no}">作廢</button>` : ''}
                </div>
            </td>
        `;
        
        tr.querySelector('.ledger-btn-print').addEventListener('click', () => {
            openReceiptModal(tx.tran_no);
        });
        
        const voidBtn = tr.querySelector('.ledger-btn-void');
        if (voidBtn) {
            voidBtn.addEventListener('click', () => {
                voidCompletedTransaction(tx.tran_no);
            });
        }
        
        historyTableBody.appendChild(tr);
    });
}

function voidCompletedTransaction(tranNo) {
    if (!confirm(`確定要作廢交易單號「${tranNo}」嗎？這將會退回庫存並作廢單據。`)) {
        return;
    }
    
    const tx = transactions.find(t => t.tran_no === tranNo);
    if (!tx) return;
    
    // RESTORE STOCK
    tx.details.forEach(item => {
        const p = inventory.find(i => i.prod_id === item.prod_id);
        if (p) {
            p.stock += item.qty;
        }
    });
    saveInventory();
    
    // Set status to cancelled
    tx.status = 'CANCELLED';
    saveTransactions();
    
    showToast(`交易單 ${tranNo} 已成功作廢！庫存已退回。`, "warning");
    
    // Refresh GUI
    renderHistoryLedger();
    renderQuickSelect();
    renderCart();
}

// ==========================================
// Boot App
// ==========================================
window.addEventListener('DOMContentLoaded', initApp);
