// ==========================================
// SmartPOS System Logic (Ver 1.0)
// ==========================================

// --- Default Data for Initialization ---
const DEFAULT_INVENTORY = [
    { prod_id: "P001", barcode: "471000000001", name: "可口可樂罐裝 330ml", price: 40.00, stock: 25, avatar: "🥤" },
    { prod_id: "P002", barcode: "471000000002", name: "樂事原味洋芋片", price: 50.00, stock: 15, avatar: "🥔" },
    { prod_id: "P003", barcode: "471000000003", name: "瑞穗全脂鮮乳 930ml", price: 90.00, stock: 8, avatar: "🥛" },
    { prod_id: "P004", barcode: "471000000004", name: "統一肉燥風味麵 5入", price: 20.00, stock: 30, avatar: "🍜" },
    { prod_id: "P005", barcode: "471000000005", name: "茶裏王無糖綠茶 600ml", price: 25.00, stock: 4, avatar: "🍵" },
    { prod_id: "P006", barcode: "471000000006", name: "鮮奶超柔吐司 8片裝", price: 60.00, stock: 0, avatar: "🍞" }
];

// --- Application State ---
let inventory = [];
let transactions = [];
let cart = [];
let activeReceiptTranNo = null;

// --- DOM Elements Cache ---
const navButtons = document.querySelectorAll('.nav-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const tabTitle = document.getElementById('tab-title');
const tabSubtitle = document.getElementById('tab-subtitle');
const liveClock = document.getElementById('live-clock');
const currentTranNoEl = document.getElementById('current-tran-no');

// POS Tab elements
const barcodeInput = document.getElementById('barcode-input');
const scanSubmitBtn = document.getElementById('scan-submit-btn');
const quickSelectDropdown = document.getElementById('quick-select-dropdown');
const catalogItemsGrid = document.getElementById('catalog-items-grid');
const catalogCountEl = document.getElementById('catalog-count');
const cartTableBody = document.getElementById('cart-table-body');
const clearCartBtn = document.getElementById('clear-cart-btn');
const summarySubtotal = document.getElementById('summary-subtotal');
const discountInput = document.getElementById('discount-input');
const taxRateInput = document.getElementById('tax-rate-input');
const summaryTax = document.getElementById('summary-tax');
const summaryTotal = document.getElementById('summary-total');
const cashPaidInput = document.getElementById('cash-paid-input');
const summaryChange = document.getElementById('summary-change');
const checkoutBtn = document.getElementById('checkout-btn');

// Inventory Tab elements
const inventoryTableBody = document.getElementById('inventory-table-body');
const productForm = document.getElementById('product-form');
const formProdId = document.getElementById('form-prod-id');
const formBarcode = document.getElementById('form-barcode');
const formName = document.getElementById('form-name');
const formPrice = document.getElementById('form-price');
const formStock = document.getElementById('form-stock');
const formClearBtn = document.getElementById('form-clear-btn');
const resetInventoryBtn = document.getElementById('reset-inventory-btn');

// History Tab elements
const historyTableBody = document.getElementById('history-table-body');
const clearHistoryBtn = document.getElementById('clear-history-btn');

// Modal elements
const receiptModal = document.getElementById('receipt-modal');
const closeReceiptModalBtn = document.getElementById('close-receipt-modal-btn');
const receiptPrintCountInput = document.getElementById('receipt-print-count-input');
const triggerPrintBtn = document.getElementById('trigger-print-btn');
const receiptPaperContent = document.getElementById('receipt-paper-content');

// Toast container
const toastContainer = document.getElementById('toast-container');

// ==========================================
// 1. Initialization & State Management
// ==========================================

function initApp() {
    // Load data from localStorage or fallback to defaults
    loadInventory();
    loadTransactions();
    
    // Set up real-time clock
    updateClock();
    setInterval(updateClock, 1000);
    
    // Set up initial active transaction number
    generateNextTransactionNumber();
    
    // Initial Render
    renderCatalog();
    renderCart();
    renderInventoryTable();
    renderHistoryTable();
    
    // Setup Event Listeners
    setupEventListeners();
}

function loadInventory() {
    const stored = localStorage.getItem('pos_inventory');
    if (stored) {
        try {
            inventory = JSON.parse(stored);
        } catch (e) {
            console.error("Error parsing stored inventory, resetting to defaults", e);
            inventory = [...DEFAULT_INVENTORY];
        }
    } else {
        inventory = [...DEFAULT_INVENTORY];
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
            console.error("Error parsing stored transactions, resetting", e);
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
    const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`; // YYYYMMDD
    
    // Find highest index for today's transactions
    let todayCount = 0;
    const prefix = `T${dateStr}`;
    
    transactions.forEach(t => {
        if (t.tran_no.startsWith(prefix)) {
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
// 2. Tab Navigation
// ==========================================

function setupEventListeners() {
    // Tab switching
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Scanner simulation
    barcodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleBarcodeScan();
        }
    });
    
    scanSubmitBtn.addEventListener('click', handleBarcodeScan);
    
    quickSelectDropdown.addEventListener('change', (e) => {
        if (e.target.value) {
            barcodeInput.value = e.target.value;
            handleBarcodeScan();
            e.target.value = ""; // Reset dropdown
        }
    });
    
    // Cart management
    clearCartBtn.addEventListener('click', () => {
        if (cart.length === 0) return;
        if (confirm("確認清空目前的購買清單？")) {
            cart = [];
            renderCart();
            showToast("購買清單已清空", "warning");
        }
    });
    
    // Checkout Summary inputs
    discountInput.addEventListener('input', () => {
        // Validate discount
        let val = parseFloat(discountInput.value);
        if (isNaN(val) || val < 0) {
            discountInput.value = 0;
        }
        calculateCartTotals();
    });
    
    taxRateInput.addEventListener('input', () => {
        // Validate tax rate
        let val = parseFloat(taxRateInput.value);
        if (isNaN(val) || val < 0) {
            taxRateInput.value = 0;
        } else if (val > 100) {
            taxRateInput.value = 100;
        }
        calculateCartTotals();
    });
    
    cashPaidInput.addEventListener('input', calculateChange);
    
    checkoutBtn.addEventListener('click', handleCheckout);
    
    // Inventory form
    productForm.addEventListener('submit', handleProductFormSubmit);
    formClearBtn.addEventListener('click', clearProductForm);
    resetInventoryBtn.addEventListener('click', () => {
        if (confirm("確認將所有商品庫存重設為初始預設值？這將覆蓋現有庫存。")) {
            inventory = [...DEFAULT_INVENTORY.map(item => ({...item}))];
            saveInventory();
            renderCatalog();
            renderInventoryTable();
            showToast("庫存資料已重設為預設值", "success");
        }
    });
    
    // History Actions
    clearHistoryBtn.addEventListener('click', () => {
        if (transactions.length === 0) return;
        if (confirm("警告：確認清空所有歷史交易紀錄？這無法復原。")) {
            transactions = [];
            saveTransactions();
            renderHistoryTable();
            generateNextTransactionNumber();
            showToast("歷史交易紀錄已清空", "danger");
        }
    });
    
    // Receipt Modal Close
    closeReceiptModalBtn.addEventListener('click', closeReceiptModal);
    
    // Reprint / Print Trigger
    triggerPrintBtn.addEventListener('click', executePrint);
}

function switchTab(tabId) {
    // Nav buttons update
    navButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Tab panels update
    tabPanels.forEach(panel => {
        if (panel.id === tabId) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });
    
    // Update Subtitles/Titles
    if (tabId === 'pos-tab') {
        tabTitle.textContent = "收銀收單系統";
        tabSubtitle.textContent = "建立交易、管理商品明細與結帳流程";
        barcodeInput.focus();
    } else if (tabId === 'inventory-tab') {
        tabTitle.textContent = "商品與庫存管理";
        tabSubtitle.textContent = "編輯商品資料、調整庫存水位與新增商品項目";
        renderInventoryTable();
    } else if (tabId === 'history-tab') {
        tabTitle.textContent = "交易歷史紀錄";
        tabSubtitle.textContent = "查詢過往交易明細、重新列印收據明細";
        renderHistoryTable();
    }
}

// ==========================================
// 3. Toasts / Notification System
// ==========================================

function showToast(message, type = "info") {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'danger') iconClass = 'fa-circle-xmark';
    if (type === 'warning') iconClass = 'fa-triangle-exclamation';
    
    toast.innerHTML = `
        <i class="fa-solid ${iconClass} toast-icon"></i>
        <div class="toast-content">${message}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Slide out after 3 seconds
    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3000);
}

// ==========================================
// 4. Cashier POS Logic (Barcode & Catalog)
// ==========================================

function renderCatalog() {
    catalogItemsGrid.innerHTML = '';
    quickSelectDropdown.innerHTML = '<option value="">-- 選擇商品模擬掃描 --</option>';
    
    let count = 0;
    inventory.forEach(item => {
        count++;
        // Populate dropdown
        const opt = document.createElement('option');
        opt.value = item.barcode;
        opt.textContent = `${item.barcode} | ${item.name} ($${item.price})`;
        quickSelectDropdown.appendChild(opt);
        
        // Populate grid buttons
        const gridItem = document.createElement('div');
        gridItem.className = `catalog-item-btn ${item.stock <= 0 ? 'out-of-stock' : ''}`;
        gridItem.setAttribute('data-barcode', item.barcode);
        
        let stockTagClass = 'stock-tag-normal';
        let stockText = `庫存: ${item.stock}`;
        if (item.stock === 0) {
            stockTagClass = 'stock-tag-none';
            stockText = '缺貨中';
        } else if (item.stock < 5) {
            stockTagClass = 'stock-tag-low';
            stockText = `低庫存: ${item.stock}`;
        }
        
        gridItem.innerHTML = `
            <span class="item-avatar">${item.avatar || '📦'}</span>
            <span class="item-name">${item.name}</span>
            <span class="item-price">$${item.price.toFixed(2)}</span>
            <span class="item-stock-tag ${stockTagClass}">${stockText}</span>
        `;
        
        // Add click listener
        gridItem.addEventListener('click', () => {
            if (item.stock <= 0) {
                showToast("商品目前缺貨中，無法加入！", "danger");
                return;
            }
            barcodeInput.value = item.barcode;
            handleBarcodeScan();
        });
        
        catalogItemsGrid.appendChild(gridItem);
    });
    
    catalogCountEl.textContent = `${count} 項商品`;
}

function handleBarcodeScan() {
    const rawBarcode = barcodeInput.value.trim();
    barcodeInput.value = '';
    barcodeInput.focus();
    
    if (!rawBarcode) return;
    
    // Query item from inventory
    const product = inventory.find(p => p.barcode === rawBarcode);
    
    if (!product) {
        showToast(`找不到條碼「${rawBarcode}」的商品！`, "danger");
        return;
    }
    
    // Check constraints: quantity must not exceed available stock
    const cartItem = cart.find(c => c.prod_id === product.prod_id);
    const currentQtyInCart = cartItem ? cartItem.qty : 0;
    
    if (currentQtyInCart + 1 > product.stock) {
        showToast(`庫存不足！該商品剩餘庫存: ${product.stock}，購物車已有: ${currentQtyInCart}`, "warning");
        return;
    }
    
    if (cartItem) {
        // Increment Qty
        cartItem.qty += 1;
        cartItem.amt = cartItem.price * cartItem.qty;
        showToast(`增加 ${product.name} 數量為 ${cartItem.qty}`, "success");
    } else {
        // Add new Item
        cart.push({
            prod_id: product.prod_id,
            barcode: product.barcode,
            name: product.name,
            price: product.price,
            qty: 1,
            amt: product.price * 1
        });
        showToast(`已將 ${product.name} 加入購買清單`, "success");
    }
    
    renderCart();
}

function renderCart() {
    if (cart.length === 0) {
        cartTableBody.innerHTML = `
            <tr class="empty-cart-row">
                <td colspan="5" class="text-center empty-state-cell">
                    <i class="fa-solid fa-cart-flatbed-suitcase empty-icon"></i>
                    <p>購買清單目前是空的</p>
                    <span class="sub-text">請掃描條碼或點擊左側快速商品選單加入</span>
                </td>
            </tr>
        `;
        checkoutBtn.disabled = true;
    } else {
        cartTableBody.innerHTML = '';
        cart.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="cart-item-info">
                        <span class="cart-item-name">${item.name}</span>
                        <span class="cart-item-barcode">${item.barcode}</span>
                    </div>
                </td>
                <td class="text-right font-mono">$${item.price.toFixed(2)}</td>
                <td class="text-center">
                    <div class="qty-control">
                        <button class="qty-btn dec-btn" data-prod-id="${item.prod_id}"><i class="fa-solid fa-minus"></i></button>
                        <input type="number" class="qty-input" data-prod-id="${item.prod_id}" value="${item.qty}" min="1">
                        <button class="qty-btn inc-btn" data-prod-id="${item.prod_id}"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </td>
                <td class="text-right font-mono">$${item.amt.toFixed(2)}</td>
                <td class="text-center">
                    <button class="delete-item-btn" data-prod-id="${item.prod_id}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;
            
            // Wire up quantity adjustments
            tr.querySelector('.dec-btn').addEventListener('click', () => adjustCartQty(item.prod_id, -1));
            tr.querySelector('.inc-btn').addEventListener('click', () => adjustCartQty(item.prod_id, 1));
            
            const qtyInput = tr.querySelector('.qty-input');
            qtyInput.addEventListener('change', (e) => {
                let newQty = parseInt(e.target.value, 10);
                if (isNaN(newQty) || newQty <= 0) {
                    newQty = 1;
                }
                setCartQty(item.prod_id, newQty);
            });
            
            // Wire up delete
            tr.querySelector('.delete-item-btn').addEventListener('click', () => {
                deleteCartItem(item.prod_id);
            });
            
            cartTableBody.appendChild(tr);
        });
        
        checkoutBtn.disabled = false;
    }
    
    calculateCartTotals();
}

function adjustCartQty(prod_id, change) {
    const item = cart.find(c => c.prod_id === prod_id);
    if (!item) return;
    
    const product = inventory.find(p => p.prod_id === prod_id);
    const targetQty = item.qty + change;
    
    if (targetQty <= 0) {
        deleteCartItem(prod_id);
        return;
    }
    
    if (targetQty > product.stock) {
        showToast(`庫存不足！該商品最多僅能購買 ${product.stock} 件`, "warning");
        return;
    }
    
    item.qty = targetQty;
    item.amt = item.price * item.qty;
    renderCart();
}

function setCartQty(prod_id, targetQty) {
    const item = cart.find(c => c.prod_id === prod_id);
    if (!item) return;
    
    const product = inventory.find(p => p.prod_id === prod_id);
    
    if (targetQty > product.stock) {
        showToast(`庫存不足！該商品最多僅能購買 ${product.stock} 件。已設定為庫存上限。`, "warning");
        item.qty = product.stock;
    } else {
        item.qty = targetQty;
    }
    
    item.amt = item.price * item.qty;
    renderCart();
}

function deleteCartItem(prod_id) {
    const itemIndex = cart.findIndex(c => c.prod_id === prod_id);
    if (itemIndex > -1) {
        const item = cart[itemIndex];
        cart.splice(itemIndex, 1);
        showToast(`已自購買清單移除 ${item.name}`, "info");
        renderCart();
    }
}

// ==========================================
// 5. Grand Totals & Price Calculation
// ==========================================

function calculateCartTotals() {
    // 1. Subtotal
    const subtotal = cart.reduce((sum, item) => sum + item.amt, 0);
    summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
    
    // 2. Discount
    let discount = parseFloat(discountInput.value);
    if (isNaN(discount) || discount < 0) {
        discount = 0;
    }
    if (discount > subtotal) {
        discount = subtotal; // Cannot discount more than subtotal
    }
    
    // 3. Discounted Amount
    const discountedAmount = subtotal - discount;
    
    // 4. Tax
    let taxRate = parseFloat(taxRateInput.value);
    if (isNaN(taxRate) || taxRate < 0) {
        taxRate = 5;
    }
    
    const tax = discountedAmount * (taxRate / 100);
    summaryTax.textContent = `$${tax.toFixed(2)}`;
    
    // 5. Total
    const total = discountedAmount + tax;
    summaryTotal.textContent = `$${total.toFixed(2)}`;
    
    // Recalculate change with new total
    calculateChange();
}

function calculateChange() {
    const totalText = summaryTotal.textContent.replace('$', '');
    const total = parseFloat(totalText);
    
    const cashPaidVal = cashPaidInput.value.trim();
    if (!cashPaidVal) {
        summaryChange.textContent = '$0.00';
        summaryChange.className = "calc-value text-success";
        return;
    }
    
    const cashPaid = parseFloat(cashPaidVal);
    if (isNaN(cashPaid) || cashPaid < 0) {
        summaryChange.textContent = '$0.00';
        summaryChange.className = "calc-value text-success";
        return;
    }
    
    const change = cashPaid - total;
    
    if (change < 0) {
        summaryChange.textContent = `不足 $${Math.abs(change).toFixed(2)}`;
        summaryChange.className = "calc-value text-danger";
    } else {
        summaryChange.textContent = `$${change.toFixed(2)}`;
        summaryChange.className = "calc-value text-success";
    }
}

// ==========================================
// 6. Checkout Process
// ==========================================

function handleCheckout() {
    if (cart.length === 0) return;
    
    // Calculations parameters
    const subtotalText = summarySubtotal.textContent.replace('$', '');
    const subtotal = parseFloat(subtotalText);
    
    let discount = parseFloat(discountInput.value);
    if (isNaN(discount)) discount = 0;
    
    const taxText = summaryTax.textContent.replace('$', '');
    const tax = parseFloat(taxText);
    
    const totalText = summaryTotal.textContent.replace('$', '');
    const total = parseFloat(totalText);
    
    const cashPaidVal = cashPaidInput.value.trim();
    let cashPaid = total; // Default to exact cash
    if (cashPaidVal) {
        cashPaid = parseFloat(cashPaidVal);
        if (isNaN(cashPaid) || cashPaid < total) {
            showToast("實收金額不足，無法完成結帳！", "danger");
            return;
        }
    }
    
    // Double check all inventory before formal deduction
    let stockValid = true;
    let failedItem = null;
    
    for (let cartItem of cart) {
        const product = inventory.find(p => p.prod_id === cartItem.prod_id);
        if (!product || product.stock < cartItem.qty) {
            stockValid = false;
            failedItem = cartItem;
            break;
        }
    }
    
    if (!stockValid) {
        showToast(`庫存不足！請重新確認「${failedItem.name}」的剩餘量。`, "danger");
        return;
    }
    
    // DEDUCT INVENTORY
    cart.forEach(cartItem => {
        const product = inventory.find(p => p.prod_id === cartItem.prod_id);
        product.stock -= cartItem.qty;
    });
    saveInventory();
    
    // CREATE TRANSACTION RECORD
    const nextTranNo = currentTranNoEl.textContent;
    const now = new Date();
    const pad = (num) => String(num).padStart(2, '0');
    const fullDateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    const transaction = {
        tran_no: nextTranNo,
        tran_date: fullDateStr,
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        total: total,
        cash_paid: cashPaid,
        change: cashPaid - total,
        print_count: 0,
        details: [...cart]
    };
    
    transactions.push(transaction);
    saveTransactions();
    
    showToast(`交易成功！單號: ${nextTranNo}`, "success");
    
    // Open receipt modal for printing
    openReceiptModal(nextTranNo);
    
    // RESET ACTIVE CART
    cart = [];
    discountInput.value = 0;
    cashPaidInput.value = '';
    
    // Refresh GUI
    renderCart();
    renderCatalog();
    renderInventoryTable();
    renderHistoryTable();
    
    // Generate new tran no
    generateNextTransactionNumber();
}

// ==========================================
// 7. Receipt Preview & Printing Simulator
// ==========================================

function openReceiptModal(tranNo) {
    activeReceiptTranNo = tranNo;
    receiptPrintCountInput.value = 1; // Default print count
    
    const tx = transactions.find(t => t.tran_no === tranNo);
    if (!tx) {
        showToast("找不到交易資料", "danger");
        return;
    }
    
    renderReceiptHTML(tx);
    receiptModal.classList.add('active');
}

function closeReceiptModal() {
    receiptModal.classList.remove('active');
    activeReceiptTranNo = null;
}

function renderReceiptHTML(tx) {
    let itemsHTML = '';
    tx.details.forEach(item => {
        itemsHTML += `
<div class="receipt-item-row">
    <span>${item.name}</span>
    <span>x${item.qty}</span>
    <span>$${item.amt.toFixed(2)}</span>
</div>`;
    });
    
    receiptPaperContent.innerHTML = `
        <div class="receipt-header">
            <h4>SMARTPOS 超商</h4>
            <p>統一發票 / 購買交易明細</p>
            <small>台北市大安區信義路一段1號</small>
        </div>
        <hr class="receipt-divider">
        <div class="receipt-metadata">
            <div class="receipt-meta-row"><span>單號:</span><span>${tx.tran_no}</span></div>
            <div class="receipt-meta-row"><span>日期:</span><span>${tx.tran_date}</span></div>
            <div class="receipt-meta-row"><span>收銀:</span><span>Admin</span></div>
        </div>
        <hr class="receipt-divider">
        <div class="receipt-items">
            <div class="receipt-item-row" style="font-weight: bold;">
                <span>品名</span>
                <span style="text-align: right;">數量</span>
                <span style="text-align: right;">金額</span>
            </div>
            ${itemsHTML}
        </div>
        <hr class="receipt-divider">
        <div class="receipt-totals">
            <div class="receipt-totals-row">
                <span>小計 Subtotal:</span>
                <span>$${tx.subtotal.toFixed(2)}</span>
            </div>
            <div class="receipt-totals-row">
                <span>折扣 Discount:</span>
                <span>-$${tx.discount.toFixed(2)}</span>
            </div>
            <div class="receipt-totals-row">
                <span>營業稅 Tax:</span>
                <span>$${tx.tax.toFixed(2)}</span>
            </div>
            <div class="receipt-totals-row grand-total">
                <span>總計 Total:</span>
                <span>$${tx.total.toFixed(2)}</span>
            </div>
            <div class="receipt-totals-row" style="margin-top: 4px;">
                <span>實收 Cash Paid:</span>
                <span>$${tx.cash_paid.toFixed(2)}</span>
            </div>
            <div class="receipt-totals-row">
                <span>找零 Change:</span>
                <span>$${tx.change.toFixed(2)}</span>
            </div>
        </div>
        <hr class="receipt-divider">
        <div class="receipt-footer">
            <p>※ 謝謝您的光臨，請妥善保存明細 ※</p>
            <p>印製份數: <span id="receipt-printed-copies-badge">${tx.print_count}</span></p>
        </div>
    `;
}

function executePrint() {
    if (!activeReceiptTranNo) return;
    
    const count = parseInt(receiptPrintCountInput.value, 10);
    if (isNaN(count) || count < 1) {
        showToast("請輸入有效的列印份數", "warning");
        return;
    }
    
    const tx = transactions.find(t => t.tran_no === activeReceiptTranNo);
    if (!tx) return;
    
    // Increase printed copies
    tx.print_count += count;
    saveTransactions();
    
    // Update badge inside receipt view
    const badge = document.getElementById('receipt-printed-copies-badge');
    if (badge) badge.textContent = tx.print_count;
    
    // Update history table view
    renderHistoryTable();
    
    showToast(`正在發送列印要求... 列印 ${count} 份完成！`, "success");
    
    // Trigger standard browser print
    window.print();
}

// ==========================================
// 8. Inventory Management Tab Logic
// ==========================================

function renderInventoryTable() {
    inventoryTableBody.innerHTML = '';
    
    inventory.forEach(item => {
        const tr = document.createElement('tr');
        
        let stockClass = 'badge-success';
        let stockStateText = '正常庫存';
        if (item.stock === 0) {
            stockClass = 'badge-danger';
            stockStateText = '缺貨';
        } else if (item.stock < 5) {
            stockClass = 'badge-warning';
            stockStateText = '低庫存警示';
        }
        
        tr.innerHTML = `
            <td>${item.prod_id}</td>
            <td class="font-mono">${item.barcode}</td>
            <td><span style="font-size: 16px; margin-right: 6px;">${item.avatar || '📦'}</span>${item.name}</td>
            <td class="text-right font-mono">$${item.price.toFixed(2)}</td>
            <td class="text-center font-mono" style="font-weight: 600;">${item.stock}</td>
            <td class="text-center"><span class="status-badge ${stockClass}">${stockStateText}</span></td>
            <td class="text-center">
                <button class="btn btn-outline-primary btn-sm edit-inv-btn" data-prod-id="${item.prod_id}">
                    <i class="fa-solid fa-edit"></i> 編輯
                </button>
            </td>
        `;
        
        tr.querySelector('.edit-inv-btn').addEventListener('click', () => {
            populateProductForm(item);
        });
        
        inventoryTableBody.appendChild(tr);
    });
}

function populateProductForm(item) {
    formProdId.value = item.prod_id;
    formProdId.disabled = true; // Key cannot be edited in simple update
    formBarcode.value = item.barcode;
    formName.value = item.name;
    formPrice.value = item.price;
    formStock.value = item.stock;
    showToast(`已載入「${item.name}」商品資料至編輯欄`, "info");
}

function clearProductForm() {
    formProdId.value = '';
    formProdId.disabled = false;
    formBarcode.value = '';
    formName.value = '';
    formPrice.value = '';
    formStock.value = '';
}

function handleProductFormSubmit(e) {
    e.preventDefault();
    
    const prodIdVal = formProdId.value.trim();
    const barcodeVal = formBarcode.value.trim();
    const nameVal = formName.value.trim();
    const priceVal = parseFloat(formPrice.value);
    const stockVal = parseInt(formStock.value, 10);
    
    if (!prodIdVal || !barcodeVal || !nameVal || isNaN(priceVal) || isNaN(stockVal)) {
        showToast("所有欄位均為必填！", "danger");
        return;
    }
    
    if (priceVal < 0 || stockVal < 0) {
        showToast("價格與庫存不可低於 0！", "danger");
        return;
    }
    
    // Check if updating or adding
    const isEditMode = formProdId.disabled;
    
    if (isEditMode) {
        // Update product
        const product = inventory.find(p => p.prod_id === prodIdVal);
        if (product) {
            // Check if updated barcode is taken by another product
            const otherP = inventory.find(p => p.barcode === barcodeVal && p.prod_id !== prodIdVal);
            if (otherP) {
                showToast(`條碼「${barcodeVal}」已配給另一款商品「${otherP.name}」，無法重複使用！`, "danger");
                return;
            }
            
            product.barcode = barcodeVal;
            product.name = nameVal;
            product.price = priceVal;
            product.stock = stockVal;
            showToast(`商品「${nameVal}」資料已成功更新！`, "success");
        }
    } else {
        // Create new product
        // Check uniqueness of ID and Barcode
        const existId = inventory.find(p => p.prod_id === prodIdVal);
        if (existId) {
            showToast(`商品 ID 「${prodIdVal}」已被佔用！`, "danger");
            return;
        }
        
        const existBarcode = inventory.find(p => p.barcode === barcodeVal);
        if (existBarcode) {
            showToast(`商品條碼「${barcodeVal}」已存在於另一款商品中！`, "danger");
            return;
        }
        
        inventory.push({
            prod_id: prodIdVal,
            barcode: barcodeVal,
            name: nameVal,
            price: priceVal,
            stock: stockVal,
            avatar: "📦"
        });
        showToast(`成功新增商品項目「${nameVal}」！`, "success");
    }
    
    saveInventory();
    clearProductForm();
    renderCatalog();
    renderInventoryTable();
}

// ==========================================
// 9. Transaction History Log Logic
// ==========================================

function renderHistoryTable() {
    if (transactions.length === 0) {
        historyTableBody.innerHTML = `
            <tr class="empty-history-row">
                <td colspan="8" class="text-center empty-state-cell">
                    <i class="fa-solid fa-receipt empty-icon"></i>
                    <p>目前沒有完成的交易紀錄</p>
                </td>
            </tr>
        `;
        return;
    }
    
    historyTableBody.innerHTML = '';
    
    // Sort transaction history in reverse chronological order
    const sortedTx = [...transactions].reverse();
    
    sortedTx.forEach(tx => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${tx.tran_no}</td>
            <td>${tx.tran_date}</td>
            <td class="text-right font-mono">$${tx.subtotal.toFixed(2)}</td>
            <td class="text-right font-mono">-$${tx.discount.toFixed(2)}</td>
            <td class="text-right font-mono">$${tx.tax.toFixed(2)}</td>
            <td class="text-right font-mono" style="font-weight: 600; color: var(--color-accent);">$${tx.total.toFixed(2)}</td>
            <td class="text-center font-mono">${tx.print_count}</td>
            <td class="text-center">
                <button class="btn btn-outline-primary btn-sm view-receipt-btn" data-tran-no="${tx.tran_no}">
                    <i class="fa-solid fa-print"></i> 檢視發票 / 列印
                </button>
            </td>
        `;
        
        tr.querySelector('.view-receipt-btn').addEventListener('click', () => {
            openReceiptModal(tx.tran_no);
        });
        
        historyTableBody.appendChild(tr);
    });
}

// ==========================================
// 10. Boot App
// ==========================================
window.addEventListener('DOMContentLoaded', initApp);
