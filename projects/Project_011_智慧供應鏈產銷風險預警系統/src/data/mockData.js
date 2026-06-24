// Comprehensive Mock Database and AI Agent Scenarios for the Supply Chain Control Tower
// Upgraded to Ver 2.0 with Risk War Room, Knowledge Graph, and Agent Hub Metrics

export const inventoryCurrent = [
  {
    id: "part-01",
    partNumber: "STM32F103C8T6",
    description: "MCU 32-bit ARM Cortex-M3 64KB Flash",
    category: "IC",
    quantity: 200,
    safetyStock: 1000,
    dynamicSafetyStock: 1200,
    demandDaily: 50,
    leadTime: 45,
    unitPrice: 2.60,
    inventoryDays: 4,
    riskLevel: "High",
    supplier: "STMicroelectronics",
    healthScore: 35
  },
  {
    id: "part-02",
    partNumber: "ESP32-WROOM-32D",
    description: "Wi-Fi + BT + BLE MCU Module",
    category: "IC",
    quantity: 600,
    safetyStock: 750,
    dynamicSafetyStock: 900,
    demandDaily: 50,
    leadTime: 30,
    unitPrice: 3.80,
    inventoryDays: 12,
    riskLevel: "Medium",
    supplier: "Espressif Systems",
    healthScore: 58
  },
  {
    id: "part-03",
    partNumber: "TPS5430DDAR",
    description: "IC REG BUCK ADJ 3A 8SOPWRPAD",
    category: "IC",
    quantity: 1500,
    safetyStock: 800,
    dynamicSafetyStock: 850,
    demandDaily: 40,
    leadTime: 21,
    unitPrice: 1.45,
    inventoryDays: 37,
    riskLevel: "Low",
    supplier: "Texas Instruments",
    healthScore: 92
  },
  {
    id: "part-04",
    partNumber: "CAP-10UF-0805",
    description: "Capacitor Ceramic 10uF 16V X7R 0805",
    category: "Passive",
    quantity: 250000,
    safetyStock: 20000,
    dynamicSafetyStock: 28000,
    demandDaily: 600,
    leadTime: 14,
    unitPrice: 0.05,
    inventoryDays: 416,
    riskLevel: "Low",
    supplier: "Murata Electronics",
    healthScore: 45
  },
  {
    id: "part-05",
    partNumber: "PCB-CONTROL-V2.1",
    description: "4-Layer Impedance Control FR4 Mainboard PCB",
    category: "PCB",
    quantity: 800,
    safetyStock: 500,
    dynamicSafetyStock: 480,
    demandDaily: 30,
    leadTime: 18,
    unitPrice: 4.20,
    inventoryDays: 26,
    riskLevel: "Low",
    supplier: "Unimicron Technology",
    healthScore: 68
  }
];

export const supplierPerformance = [
  {
    id: "sup-01",
    name: "STMicroelectronics",
    otd: 78.5,
    leadTime: 45,
    costIndex: 105,
    esgScore: 82,
    riskScore: 74,
    riskLevel: "B",
    activeContracts: 2
  },
  {
    id: "sup-02",
    name: "Espressif Systems",
    otd: 88.0,
    leadTime: 30,
    costIndex: 100,
    esgScore: 85,
    riskScore: 62,
    riskLevel: "B",
    activeContracts: 1
  },
  {
    id: "sup-03",
    name: "Texas Instruments",
    otd: 96.2,
    leadTime: 21,
    costIndex: 98,
    esgScore: 90,
    riskScore: 28,
    riskLevel: "A",
    activeContracts: 3
  },
  {
    id: "sup-04",
    name: "Murata Electronics",
    otd: 98.0,
    leadTime: 14,
    costIndex: 102,
    esgScore: 88,
    riskScore: 18,
    riskLevel: "A",
    activeContracts: 1
  },
  {
    id: "sup-05",
    name: "Unimicron Technology",
    otd: 94.5,
    leadTime: 18,
    costIndex: 95,
    esgScore: 78,
    riskScore: 35,
    riskLevel: "A",
    activeContracts: 1
  }
];

export const alternateParts = {
  "STM32F103C8T6": [
    {
      partNumber: "GD32F103C8T6",
      manufacturer: "GigaDevice",
      pinToPin: "Yes",
      specMatch: "99%",
      costDiff: "-15%",
      leadTimeDays: 7,
      sourceDistributor: "WPG Holdings",
      score: 98,
      status: "Recommended"
    },
    {
      partNumber: "CH32F103C8T6",
      manufacturer: "Wch Co., Ltd.",
      pinToPin: "Yes",
      specMatch: "95%",
      costDiff: "-30%",
      leadTimeDays: 5,
      sourceDistributor: "LCSC Electronics",
      score: 88,
      status: "Qualified"
    }
  ],
  "ESP32-WROOM-32D": [
    {
      partNumber: "RTL8720DN",
      manufacturer: "Realtek",
      pinToPin: "No (Requires PCB redesign)",
      specMatch: "88%",
      costDiff: "+8%",
      leadTimeDays: 5,
      sourceDistributor: "Arrow Electronics",
      score: 65,
      status: "Not Recommended"
    }
  ]
};

export const ragDocuments = [
  {
    id: "doc-01",
    title: "SOP-PUR-001: 採購標準作業程序",
    category: "SOP",
    lastUpdated: "2025-10-15",
    content: `# SOP-PUR-001: 採購標準作業程序

## 1. 目的
規範本公司關鍵物料之採購作業程序，確保供應商交期與物料品質，並降低庫存積壓風險。

## 2. 缺料異常處理機制
當特定A類物料出現以下情形時，應啟動緊急因應程序：
1. 庫存天數（Inventory Days）低於安全庫存天數（Safety Stock Days）。
2. 預期交期（Lead Time）大於現有庫存可用天數，面臨停線風險。

### 2.3 緊急替代料導入規範
若原廠供貨發生不可抗力因素中斷，採購部需協同研發部（RD）依照《替代料知識庫》進行規格對比：
- 優先選用 Pin-to-Pin 相容（接腳完全相同）之替代料，免去PCB重新布線時間。
- 替代料樣品需通過研發部功能性測試，並在ERP系統中關聯為替代物料。
- 採購金額在50萬新台幣以內，可由採購協理直接簽核緊急採購；超過50萬需總經理核准。`
  },
  {
    id: "doc-02",
    title: "Contract-2026-TX: 意法半導體 (ST) 採購框架協議",
    category: "Contract",
    lastUpdated: "2026-01-10",
    content: `# Contract-2026-TX: 意法半導體採購框架協議

## 第四條：交期與延遲交貨罰則
4.1 賣方應嚴格按照雙方確認的採購訂單（PO）所規定的交期送達買方指定倉庫。
4.2 若賣方因自身原因導致交期延遲，買方應給予5個工作天之寬限期。
4.3 超過寬限期後，賣方應每日向買方支付相當於延遲貨物總金額 1.5% 的違約金（Penalty）。
4.4 此延遲交貨違約金總額上限為該批貨物總金額的 15%。買方有權直接從未結清之應付帳款中扣除此筆罰款。

## 第五條：最小起訂量 (MOQ) 與付款條件
5.1 關鍵微控制器（MCU）系列之最小起訂量（MOQ）為 1,000 PCS。
5.2 付款條件為出貨後 60 天電匯（T/T 60 days after invoice date）。`
  },
  {
    id: "doc-03",
    title: "Contract-2026-GD: 兆易創新 (GigaDevice) 戰略採購合約",
    category: "Contract",
    lastUpdated: "2026-02-15",
    content: `# Contract-2026-GD: 兆易創新戰略採購合約

## 第三條：產品供應與替代保障
3.1 賣方保證其生產之 GD32 系列微控制器在電氣特性與接腳定義上，與市場主流之 STM32 系列高度相容，並提供 Pin-to-Pin 替換技術支援。
3.2 賣方承諾為買方保留每月不低於 5,000 PCS 的緊急備用產能，在買方發出訂單後 7 個工作日內安排出貨（適用於急單處理）。

## 付款與價格協議
- GD32F103C8T6 特約協議單價為 USD 2.20 （未稅）。
- 付款條件為 T/T 30 days。`
  },
  {
    id: "doc-04",
    title: "SOP-LOG-003: 呆滯物料管理與處置條例",
    category: "SOP",
    lastUpdated: "2025-12-01",
    content: `# SOP-LOG-003: 呆滯物料管理與處置條例

## 1. 呆滯料定義
庫存物料符合下列條件之一者，定義為呆滯物料（Dead Stock）：
- 庫齡（Inventory Aging）在 90 天至 180 天之內，且最近90天內無任何領用或出庫記錄。
- 庫齡在 180 天以上，且最近180天內無 any 異動。

## 2. 處置流程與層級
倉庫與物管部門每月應產出呆滯料報表，並由 AI 呆滯料 Agent 提供處置建議：
1. **內部轉用（Transfer）：** 優先比對研發部新專案，將閒置晶片或被動元件轉移至其他機種使用。
2. **原廠/代理商退回（Return）：** 購貨在90天內且包裝完好，可與代理商協商折退。
3. **折讓轉售（Sale）：** 超過180天之物料，可折讓 20%-50% 給同業或二級經銷商回收資金。
4. **報廢處置（Scrap）：** 庫齡超過365天、無任何使用機會且已受潮或氧化的物料，經鑑定後作報廢提列。`
  }
];

export const agentScenarios = [
  {
    id: "scenario-1",
    name: "STM32F103C8T6 缺料危機處理",
    triggerPart: "STM32F103C8T6",
    description: "核心微控制器庫存僅剩4天，主供應商交期長達45天，面臨緊急停線風險。",
    steps: [
      {
        agent: "Inventory Agent",
        avatar: "📊",
        message: "【庫存預警】系統檢測到核心晶片 `STM32F103C8T6`（屬於A類高價值物料）庫存水位出現異常！目前庫存僅剩 **200 PCS**，而系統計算之動態安全庫存量（Dynamic Safety Stock）已調高至 **1,200 PCS**。現有庫存天數僅剩 **4天**。"
      },
      {
        agent: "Shortage Agent",
        avatar: "🚨",
        message: "【缺料與停線風險評估】我已調取採購系統數據。主供應商意法半導體（STMicroelectronics）的正常採購交期（Lead Time）為 **45天**。目前前置交期（45天）遠大於現有庫存天數（4天），**停線風險等級為：High Risk**！產線預計將在 **4天後（6月28日）** 因缺料完全停擺！"
      },
      {
        agent: "Supplier Agent",
        avatar: "⚖️",
        message: "【供應商表現與風險分析】意法半導體最近一個季度的準時交貨率（OTD）已下滑至 **78.5%**。其綜合風險評分為 **74分**，風險等級為 **B級**。基於此現況，無法寄望其常規訂單能提前於4天內抵達。"
      },
      {
        agent: "Contract Agent",
        avatar: "📜",
        message: "【合約合規與罰則調索】我已啟動 RAG 引擎檢索意法半導體採購合約（[Contract-2026-TX](doc-02)）。檢索到第 4.3 條違約處罰條款：『*超過寬限期後，賣方應每日向買方支付相當於延遲貨物總金額 1.5% 的違約金，上限為 15%。*』\n\n**分析結論：** 我們在合約上有權對意法半導體申索延遲賠償，但這仍無法阻擋產線停工造成的鉅額損失，必須立即尋找物理替代方案！"
      },
      {
        agent: "Alternate Part Agent",
        avatar: "🔄",
        message: "【數位分身與替代物料評估】我已在控制塔內執行 **數位分身模擬（Digital Twin Simulation）**，對解決 STM32F103C8T6 缺料的三種調度路徑進行分析：\n\n- **方案A (緊急催料)：** 成本增加 +5% (運費)，交期仍需 15 天，無法阻擋停線，風險值：High。\n- **方案B (兆易創新 GD32 替代)：** 導入 `GD32F103C8T6`。Pin-to-Pin 100% 相容，採購單價降低 **15%** (USD 2.20)，大聯大經銷商緊急調撥 7 天到貨。研發評估直接替換，**綜合評估得分最高，為最優方案**。\n- **方案C (轉購新供應商)：** 向現貨商購買 STM32。單價暴增 **300%** (USD 7.80)，交期 3 天，但現貨無原廠 CoC 認證，風險值：Medium-High。\n\n🔍 **[歷史記憶檢索]** 系統查詢到我司 2025 年 11 月曾因缺料成功引進過 `GD32F103C8T6` 作為替代料，當時量產測試成功率高達 **95%**。歷史實踐極力推薦此方案。"
      },
      {
        agent: "Contract Agent",
        avatar: "📜",
        message: "【新合約條款確認】補充檢索兆易創新框架合約（[Contract-2026-GD](doc-03)）。第 3.2 條指出：『*賣方承諾為買方保留每月不低於 5,000 PCS 的緊急備用產能，在買方發出訂單後 7 個工作日內安排出貨。*』這證實了 7 天交期的可行性！"
      },
      {
        agent: "Procurement Agent",
        avatar: "💼",
        message: "【AI Employee 自主採購與追蹤決策】基於數位分身模擬的分析，我已做出最優自主決策：\n\n1. **自主下單 (Autonomous PO)：** 系統已自動產生採購訂單 **PO-20260624-045**，採購 `GD32F103C8T6` 共 **2,000 PCS**，單價 USD 2.20，總金額 USD 4,400。\n2. **自動郵件發送：** 系統已自動撰寫並向大聯大銷售總監寄出急單採購信件。\n3. **啟動主動追蹤 (Active Tracking)：** 系統已在控制塔建立 **AI Employee 主動追蹤卡片**。我將會每日穿透物流快遞 API 追蹤此急單進度，並於桃園倉收貨完成後自動關閉追蹤。\n4. **產線排程協調：** 自動通知桃園廠生管主管，微調主產線排程往後順延 **3天**，避免發生實質停線工損。"
      }
    ],
    actionReport: {
      title: "自主採購與數位分身模擬報告",
      savings: "數位分身模擬最優解 (方案 B) 節省採購成本 15% (約合新台幣 $26,400 元)，避免每日預估達 $150,000 元的停線工時損失，總收益率評估為 94/100。",
      recommendations: [
        "採購部：已自主產生 PO-20260624-045 (兆易創新 GD32F103C8T6 2,000 PCS，金額 USD 4,400)。",
        "生管部：已自動通知桃園廠，微調產線排程 3 天改生產備用機種，以達成零停線。 ",
        "AI 追蹤系統：已啟動主動追蹤機制，每日自動追查快遞狀態 (目前狀態: PO已確認，等待出貨)。"
      ],
      emailSubject: "【緊急訂單】GigaDevice GD32F103C8T6 微控制器急單採購需求 - 聯發科技採購部",
      emailBody: `收件人：sales@wpg-holdings.com
副本：procurement-director@company.com; rd-mcu@company.com

大聯大銷售團隊 您好：

我是採購工程師。基於我司與兆易創新（GigaDevice）簽署的戰略框架協議（Contract-2026-GD），目前我司面臨極度緊急的MCU產線缺料風險。

我們需要緊急採購以下物料，請以最速件急單處理：

1. 物料型號：GD32F103C8T6
2. 採購數量：2,000 PCS
3. 特約單價：USD 2.20 (依照戰略協議價)
4. 要求交期：7個工作天內送達我司桃園一號倉 (2026-07-01前)

請收到信件後，於今日下班前確認此筆訂單的庫存配給與出貨時程，並回傳PI憑證以利我司財務部進行緊急請款流程。

感謝您的鼎力協助！

祝 順商祺

採購部 敬上
聯發科技股份有限公司
電話：+886-3-5788888 Ext. 5432`
    }
  },
  {
    id: "scenario-2",
    name: "ESP32 供應中斷與跨庫調度",
    triggerPart: "ESP32-WROOM-32D",
    description: "原廠發生意外導致出貨延遲20天。因替代料不相容，AI Agent 協同進行跨國倉庫調度。",
    steps: [
      {
        agent: "Inventory Agent",
        avatar: "📊",
        message: "【庫存分析】物料 `ESP32-WROOM-32D` 庫存可用天數為 **12天** (庫存 600 PCS)，已低於安全水位。原本預計於今日批次到貨之 1,000 PCS 補貨訂單未能按時入庫."
      },
      {
        agent: "Shortage Agent",
        avatar: "🚨",
        message: "【出貨異常警告】接獲供應商樂鑫（Espressif）緊急通報，其包裝工廠發生短路火警導致局部停工，我司訂單出貨將延遲 **20天**，新交期變更為 **30天**。前置交期大於剩餘天數，**停線風險等級：Medium Risk**，將在 12 天後缺料。"
      },
      {
        agent: "Contract Agent",
        avatar: "📜",
        message: "【合約不可抗力條款審查】我已檢索樂鑫供應合約。第 8.1 條明確定義『*工廠火災、天災等屬於不可抗力事件（Force Majeure），賣方免除交期延誤之違約責任*』。因此，我們無法對其申報違約罰金。必須靠自身調度解決。"
      },
      {
        agent: "Alternate Part Agent",
        avatar: "🔄",
        message: "【替代料評估與數位分身】替代料庫中僅有 Realtek `RTL8720DN`。然而，此晶片封裝不同，**非 Pin-to-Pin** 相容，若要導入必須重新修改 PCB 佈線，研發與測試認證至少需要 60 天。在本次 12 天的緊急缺料窗口中，**此替代方案完全不可行**。"
      },
      {
        agent: "Inventory Agent",
        avatar: "📊",
        message: "【跨庫存調度檢索】既然無法採購新料與替代料，我立刻啟動了對我司全球其他廠區倉庫的庫存穿透查詢...... 發現我司 **蘇州二號廠倉庫** 存有 `ESP32-WROOM-32D` 共 **1,500 PCS**！此批物料原屬專案 Project Neo，但該專案已確認延期至Q4，此庫存目前處於「閒置（Idle）」狀態！"
      },
      {
        agent: "Procurement Agent",
        avatar: "💼",
        message: "【自主調配與執行方案】太棒了！這是最具時效且零成本的方案。我已啟動自主調度決策：\n\n1. **跨庫調撥 (Autonomous STO)：** 系統已在 ERP 中建立了跨庫調撥單 **STO-20260624-009**，將蘇州廠的 **1,000 PCS** ESP32 空運桃園廠。航空特快物流已聯絡，預計 3 天內抵達，物流成本約 $4,500 元。\n2. **原訂單配額補償：** 樂鑫遲到的 1,000 PCS 訂單在 30 天後抵達後，直接補回蘇州廠 Project Neo，維持庫存水平。\n3. **主動進度追蹤：** 系統已將此調撥任務列入追蹤，預計在 3 天後到貨桃園倉庫時自動結案。"
      }
    ],
    actionReport: {
      title: "跨國倉庫協同調撥報告",
      savings: "以新台幣 $4,500 元的超低物流成本，成功調撥 1,000 PCS 閒置庫存，免除桃園廠停線損失，且無需承擔替代料研發改板的巨大風險與時間成本。",
      recommendations: [
        "物管部：簽核 ERP 系統編號 STO-20260624-009 跨庫調撥申請。",
        "物流部：聯絡順豐特惠航空件，安排蘇州廠於明日上午出貨，確保 3 天內抵達桃園倉庫。",
        "採購部：通知樂鑫維持原訂單（變更交期為30天），到貨後直接入庫蘇州廠還原水位。"
      ],
      emailSubject: "【緊急跨庫調撥】蘇州廠至桃園廠 ESP32-WROOM-32D 庫存調撥協調申請 - 桃園廠物管部",
      emailBody: `收件人：suzhou-wh-manager@company.com
副本：global-logistics@company.com; pc-taiwan@company.com

蘇州廠倉庫主管 鍾經理 您好：

因桃園廠目前面臨樂鑫原廠因火災導致的供應鏈中斷，桃園廠的 ESP32-WROOM-32D 庫存僅剩 12 天可用，正面臨極高的停線危機。

經 AI 庫存控制塔查詢，貴廠目前存放有 1,500 PCS 之閒置 ESP32 庫存（原 Project Neo 備料，該專案已確認延期至Q4）。為維護集團整體生產利益，急需調撥此批庫存：

1. 物料名稱：ESP32-WROOM-32D
2. 調撥數量：1,000 PCS
3. ERP調撥單號：STO-20260624-009
4. 運輸方式：順豐國際醫藥/電子航空特快 (預計3天抵達)

我司已在 ERP 系統中提交 STO 調拨單，請鍾經理協助於今日下班前予以簽准，並安排蘇州倉庫同仁於明日一早進行出庫與快遞派送。

非常感謝蘇州廠的緊急支援！

桃園廠物管部 敬上
聯發科技股份有限公司`
    }
  },
  {
    id: "scenario-3",
    name: "被動元件呆滯料處置方案",
    triggerPart: "CAP-10UF-0805",
    description: "陶瓷電容庫存週轉天數高達416天。AI Agent 自動啟動庫齡分析並提供最優資金回收處置建議。",
    steps: [
      {
        agent: "Inventory Agent",
        avatar: "📊",
        message: "【呆滯料預警】系統檢測到被動元件 `CAP-10UF-0805`（0805 10uF 陶瓷電容）庫存水位過高。目前在庫數量高達 **250,000 PCS**，而日均產線消耗僅為 **600 PCS**，庫存可用天數高達 **416天**！嚴重超標！"
      },
      {
        agent: "Dead Stock Agent",
        avatar: "📉",
        message: "【庫齡與財務評估】我對該批電容進行了深度庫齡分析（Aging Analysis）：\n- **180~365天庫齡：** 150,000 PCS (佔比 60%)\n- **180天以上庫齡，且最近180天無 any 異動。** \n- **財務影響：** 總呆滯資金為 **新台幣 $12,500 元** (單價 $0.05)。雖然單價低，但佔用了倉庫 2 個標準料架，每月機會Holding Cost達 $80 元，且存放超過一年的電容存在端子氧化的報廢風險。"
      },
      {
        agent: "Supplier Agent",
        avatar: "⚖️",
        message: "【供應商退貨政策確認】原廠村田（Murata）合約條款指出，非品質問題的常規物料，出貨超過 90 天後一律不接受退貨。目前此批電容庫齡皆已超過 180 天，因此**無法申請退回原廠**。"
      },
      {
        agent: "Dead Stock Agent",
        avatar: "📉",
        message: "【處置策略生成】依據《[SOP-LOG-003: 呆滯物料處置條例](doc-04)》，我評估了以下三種並行處置路徑：\n\n1. **內部轉用 (優先)：** 比對正在設計導入的 Project Artemis。RD確認此電容可完全相容於新專案。預估可於下個月底前內部轉移消耗 **50,000 PCS**，此部分資金回收率 **100%**。\n2. **特價轉售：** 聯絡特約二級分銷商 Arrow Electronics，其願意以 **6折 ($0.03/PCS)** 的價格整批回收庫齡在一年內的 **150,000 PCS**。這可立即回收資金 **USD 150 (約新台幣 $4,500 元)**，回收率 **60%**。\n3. **報廢與提列損失：** 殘餘的 **50,000 PCS** 電容在庫時間已達 450 天，倉庫反饋包裝防潮袋已破損，有嚴重氧化風險。RD評估不可用於生產，建議直接申請**報廢處置**，提列損失新台幣 $2,500 元，釋放料架空間。"
      },
      {
        agent: "Procurement Agent",
        avatar: "💼",
        message: "【決策方案彙整與自主執行】我已為公司盤活資金，並自動建立以下呆滯處置流程：\n\n1. **內部轉料單自動填寫：** 建立內部調撥單 STO-ARTEMIS-001，調撥 50,000 PCS。\n2. **自動向 Arrow 發送特價收購單：** 系統已發送回收報價單。 \n3. **自主發起報廢程序：** 建立財務資產報廢申報單 SCRAP-2026-042，申報 50,000 PCS。\n4. **狀態追蹤：** 此三項處置已納入進度追蹤卡片，進度即時反饋於 BI 控制塔中。"
      }
    ],
    actionReport: {
      title: "被動元件呆滯料處置決策報告",
      savings: "成功內部轉移消耗 20% 物料 (節省採購預算 $2,500 元)；折讓轉售回收現金 $4,500 元；清除高風險變質料並釋放料架空間，挽回總損失率達 56%。",
      recommendations: [
        "物管部：填寫料號 CAP-10UF-0805 內部調撥單 50,000 PCS 至 Project Artemis 研發團隊。",
        "採購部：與 Arrow Electronics 簽署特價庫存收購協議，安排 150,000 PCS 電容出庫。",
        "倉庫與財務：完成 50,000 PCS 氧化電容之報廢核銷程序，移出貨架。"
      ],
      emailSubject: "【特價庫存轉售】Murata 0805 10uF 陶瓷電容優質呆滯料轉售詢價 - 採購部",
      emailBody: `收件人：buying-team@arrow.com
副本：asset-recovery@company.com; warehouse-taoyuan@company.com

Arrow Electronics 採購團隊 您好：

我司目前有一批全新未使用、包裝完整的 Murata 陶瓷電容優質庫存，因專案設計變更釋出。得知貴司近期有此類物料的市場回收需求，特此向您詢價：

- 物料料號：CAP-10UF-0805 (Murata GRM21BR71C106KE15L)
- 規格描述：Capacitor Ceramic 10uF 16V X7R 0805
- 可供轉售數量：150,000 PCS
- 包裝狀態：原廠防靜電捲帶包裝完好 (庫齡約180-240天)
- 我司意向轉售單價：USD 0.001 / PCS (約合原採購合約價之6折，整批總價 USD 150)
- 交易條件：EXW 我司桃園倉庫，運費由貴司承擔

隨信附上該批物料的原廠標籤照片與出廠檢驗報告。如貴司有意收購，請於本週五前回覆此郵件，以便我司倉庫安排裝箱與物流對接。

期待與您的合作！

祝 順商祺

採購部 敬上
聯發科技股份有限公司`
    }
  }
];

export const categoryHealth = [
  { category: "IC (主控晶片)", score: 92, status: "良好", color: "var(--risk-low)" },
  { category: "PCB (電路板)", score: 68, status: "中度風險", color: "var(--risk-medium)" },
  { category: "Passive (被動元件)", score: 45, status: "高度積壓", color: "var(--risk-high)" },
  { category: "Mechanical (機構件)", score: 95, status: "優秀", color: "var(--risk-low)" }
];

export const demandForecast = [
  { partNumber: "STM32F103C8T6", currentStock: 200, m1: 1500, m3: 4500, m6: 9000, shortageEst: "17 天後 (HIGH RISK)", dynamicSafety: 1200 },
  { partNumber: "ESP32-WROOM-32D", currentStock: 600, m1: 1500, m3: 4500, m6: 8000, shortageEst: "12 天後 (MEDIUM RISK)", dynamicSafety: 900 },
  { partNumber: "TPS5430DDAR", currentStock: 1500, m1: 1200, m3: 3600, m6: 7200, shortageEst: "暫無缺料風險", dynamicSafety: 850 },
  { partNumber: "CAP-10UF-0805", currentStock: 250000, m1: 18000, m3: 54000, m6: 108000, shortageEst: "無風險 (過度積壓)", dynamicSafety: 28000 }
];

export const weeklyAiReport = {
  date: "2026-06-22 (本週一)",
  summary: "本週集團整體庫存總額優化降低，DOH 穩定達 75 天。被動元件與 PCB 積壓已獲有效控制。當前最大隱憂為 STMicroelectronics 微控制器延期交付事件，AI 風險戰情室已自主制定應變與替代採購指令。",
  anomalies: [
    { type: "spikes", title: "庫存自主去化", desc: "電容與板材採購策略調減 15% 已見效，積壓資金盤活約 180 萬台幣。DOH 庫存天數成功從 85 天降至 75 天的 Ver 2.0 卓越目標。" },
    { type: "shortages", title: "供應商交期震盪", desc: "STMicroelectronics 供應的 STM32F103C8T6 微控制器前置期延長至 45 天，在庫僅剩 4 天，產線面臨緊急停線威脅。" }
  ],
  recommendations: [
    "執行 MCU 急單：簽准採購大聯大所代理的 GigaDevice 替代晶片 GD32F103C8T6 共 2,000 PCS，避開 ST 遲交與 12% 關稅風險。",
    "執行 ESP32 跨國倉庫 STO 調撥：已鎖定蘇州廠閒置 1,000 PCS，順豐空運 3 天內抵達桃園，免除斷料損失。"
  ]
};

export const globalRisks = [
  {
    id: "risk-g01",
    type: "Tariff",
    event: "美國加徵關鍵微控制器進口關稅 12%",
    impact: "STM32 單片採購成本增加 USD 0.31",
    status: "Critical",
    color: "var(--risk-high)",
    advice: "建議全面將北美出口產品之 MCU 轉單兆易創新 (GD32)，節省關稅與本體成本達 27%。"
  },
  {
    id: "risk-g02",
    type: "Port Congestion",
    event: "美西長灘港港口擁堵率上升 25%",
    impact: "海運物流前置時間平均延遲 +7 天",
    status: "Warning",
    color: "var(--risk-medium)",
    advice: "對於在途被動元件，自主調整動態安全水位，並將緊急補貨訂單改為空運派送。"
  },
  {
    id: "risk-g03",
    type: "Raw Material Price",
    event: "全球電解銅商品價格大漲 8.2%",
    impact: "連接器與金屬機構件合約價面臨 +5% 上浮壓力",
    status: "Warning",
    color: "var(--risk-medium)",
    advice: "啟動鎖價期貨保護合約，通知採購 Agent 鎖定本季度合作供應商特約價。"
  },
  {
    id: "risk-g04",
    type: "Earthquake",
    event: "台灣新竹地區發生芮氏 4.5 級地震",
    impact: "晶圓代工與封測廠（TSMC, ASE）無實質災損，產線正常",
    status: "Normal",
    color: "var(--risk-low)",
    advice: "數位分身已穿透供應商網絡完成震央方圓50公里設施掃描，確認無供貨斷料隱憂。"
  }
];

export const supplierNetwork = {
  title: "全球多層級供應鏈網絡拓撲 (MediaTek Multi-tier Map)",
  nodes: [
    { id: "factory", label: "聯發科技 桃園一號廠 (我司廠房)", level: 0, status: "Active", x: 100, y: 200, details: "核心組裝與PCBA貼片基地，當前生產稼動率：92%" },
    { id: "t1-st", label: "STMicroelectronics (Tier 1 晶片供應商)", level: 1, status: "Warning", x: 300, y: 100, details: "供應核心 STM32F103。目前準時交貨率下滑至 78%，受到二級晶圓交期影響。" },
    { id: "t1-espressif", label: "Espressif Systems (Tier 1 無線模組商)", level: 1, status: "Critical", x: 300, y: 300, details: "供應 ESP32-WROOM 模組。受制於二級封測廠日月光（ASE）包裝廠火災事故，供貨缺口達 78%。" },
    { id: "t2-tsmc", label: "TSMC 晶圓十二廠 (Tier 2 晶圓代工)", level: 2, status: "Active", x: 550, y: 50, details: "為 STMicroelectronics 代工微控制器核心晶圓。產能稼動率 98%，受地震影響度：0%。" },
    { id: "t2-ase", label: "ASE Group 日月光半導體 (Tier 2 封裝測試)", level: 2, status: "Critical", x: 550, y: 250, details: "負責樂鑫（Espressif）無線晶片的封裝與測試。火警導致產線局部受損，預計復工時間 20 天。" },
    { id: "t3-wacker", label: "Wacker Chemie 德國瓦克化學 (Tier 3 多晶矽原材料)", level: 3, status: "Active", x: 800, y: 150, details: "為台積電提供高純度半導體級多晶矽原料，供應鏈健康度 100%，合約儲備充足。" }
  ],
  links: [
    { source: "t1-st", target: "factory" },
    { source: "t1-espressif", target: "factory" },
    { source: "t2-tsmc", target: "t1-st" },
    { source: "t2-ase", target: "t1-espressif" },
    { source: "t3-wacker", target: "t2-tsmc" }
  ]
};

// --- Upgraded Ver 2.0 Risk War Room \u0026 Agent Hub Datasets ---

export const warRoomScenarios = [
  {
    id: "war-01",
    title: "中國蘇州測試工廠因故局部停工 (China Factory Shutdown)",
    severity: "Critical",
    affectedProducts: "ESP32 無線主控板、Car ECU 控制板",
    affectedCustomers: "Toyota, BYD, Tesla",
    revenueAtRisk: "$450,000 USD (約新台幣 1,450 萬元)",
    stockImpact: "桃園貼片廠 ESP32 庫存將於 12 天後用罄，中斷生產。",
    optimalPlan: "方案 B (跨國 STO 庫存調撥)：直接從蘇州二廠倉庫調撥 1,000 PCS 閒置 ESP32 庫存，順豐空運 3 天送達桃園倉庫。物流成本僅 $4,500 元，完全規避停線損失與產能風險。",
    evidence: [
      "財務性：物流支出 USD 150 vs 停線營收損失 USD 450,000 (投資回報比達 3000x)。",
      "時效性：空運 3 天抵達桃園廠，遠短於 ESP32 原廠延期後的 30 天到貨交期。",
      "合規性：蘇州二廠 Project Neo 已暫停，該 1,500 PCS 庫存確屬閒置，調撥無商業阻礙。"
    ],
    graphNodes: [
      { id: "g-sup", label: "樂鑫 Espressif (Supplier)", type: "Supplier", status: "Critical" },
      { id: "g-part", label: "ESP32-WROOM-32D (Part)", type: "Part", status: "Critical" },
      { id: "g-wh", label: "桃園一號倉 (Warehouse)", type: "Warehouse", status: "Warning" },
      { id: "g-po", label: "STO-20260624-009 (PO/調撥)", type: "PO", status: "Active" },
      { id: "g-prod", label: "Car ECU PCBA (Product)", type: "Product", status: "Active" },
      { id: "g-cust", label: "Toyota Motors (Customer)", type: "Customer", status: "Active" }
    ]
  },
  {
    id: "war-02",
    title: "美元匯率大幅升值 +8.2% (USD Appreciation Shock)",
    severity: "Warning",
    affectedProducts: "所有進口微控制器與被動元件",
    affectedCustomers: "全體出口車用與消費電子客戶",
    revenueAtRisk: "$180,000 USD (淨外匯變動盈餘) / -$90,000 USD (進口成本上升)",
    stockImpact: "進口元器件（STM32, ESP32）採購成本將上升 8%，毛利率將被壓縮 2.4%。",
    optimalPlan: "方案 C (期貨合約鎖價與轉向本幣採購)：(1) 立即啟動期貨外匯 Hedging 保護合約，鎖定 USD/TWD 匯率。(2) 對於被動元件，全面轉向台廠國巨（Yageo）進行台幣交易，鎖定採購溢價。",
    evidence: [
      "外匯衝擊：TWD 貶值將拉高進口料成本，但出口產品以美元計價將獲得 +8.2% 的匯差收益，集團應加速出口報關結匯。",
      "本幣轉單：被動元件 Yageo 報價以台幣交易，轉單 40% 份額可規避美元計價溢價，鎖定 100% 採購成本。"
    ],
    graphNodes: [
      { id: "g-sup", label: "美元外匯市場 (Forex)", type: "Supplier", status: "Warning" },
      { id: "g-part", label: "進口 MCU/Capacitors (Part)", type: "Part", status: "Warning" },
      { id: "g-wh", label: "進口物料保稅倉 (Warehouse)", type: "Warehouse", status: "Active" },
      { id: "g-po", label: "期貨避險/本幣轉單 (PO/合約)", type: "PO", status: "Active" },
      { id: "g-prod", label: "集團全系列 PCBA (Product)", type: "Product", status: "Active" },
      { id: "g-cust", label: "歐美車廠、經銷商 (Customer)", type: "Customer", status: "Active" }
    ]
  }
];

export const agentMetrics = [
  { id: "a-inv", name: "Inventory Agent", avatar: "📊", role: "庫存監控分析", status: "Idle", accuracy: 99.2, tasks: 245, tokens: 45.2, log: "完成了對桃園倉 CAP-10UF-0805 呆滯天數的例行庫齡掃描，未發現新異常。" },
  { id: "a-sho", name: "Shortage Agent", avatar: "🚨", role: "缺料風險預警", status: "Active", accuracy: 98.5, tasks: 189, tokens: 98.4, log: "偵測到 STM32F103 庫存僅剩 4 天，已自主向決策樹發送緊急缺料信號。" },
  { id: "a-sup", name: "Supplier Agent", avatar: "⚖️", role: "供應商網絡評估", status: "Idle", accuracy: 96.8, tasks: 120, tokens: 35.8, log: "完成了對 Unimicron (欣興電子) OTD 準時交貨率的重新評估，得分為 94.5 分。" },
  { id: "a-con", name: "Contract Agent", avatar: "📜", role: "合約 RAG 檢索", status: "Active", accuracy: 99.1, tasks: 310, tokens: 145.2, log: "pgvectorCos 匹配完成：檢索到 Contract-2026-TX 第 4.3 條 ST 遲交 1.5%/天 扣款條款。" },
  { id: "a-alt", name: "Alternate Agent", avatar: "🔄", role: "替代料技術比對", status: "Idle", accuracy: 97.5, tasks: 142, tokens: 68.9, log: "檢索歷史記憶庫：確認 2025 年 GD32 替代 STM32 量產成功率達 95%，寫入推薦信號。" },
  { id: "a-pro", name: "Procurement Agent", avatar: "💼", role: "自主下單與催料", status: "Active", accuracy: 98.2, tasks: 298, tokens: 210.5, log: "自動建立了緊急採購 PO-20260624-045，並起草急單信件，等待 Human Approval 簽核。" },
  { id: "a-rsk", name: "Risk Agent", avatar: "🛡️", role: "地緣政治與 War Room", status: "Idle", accuracy: 96.2, tasks: 88, tokens: 52.1, log: "監聽 Global Risk Radar：美國對 MCU 加徵 12% 關稅案已正式寫入全球風險數據庫。" }
];

export const copilotQAs = [
  {
    id: "q-01",
    question: "為什麼本週庫存突然暴增？",
    answerType: "root_cause",
    answer: `### 🔍 AI 庫存增加根因分析 (Root Cause Analysis)

經過分析，本週我司庫存總金額增加達 **$1,200 萬新台幣**，DOH 週轉天數由 **82 天增加至 115 天**。主要根源並非市場全面衰退，而是集中於 **電路板 (PCB) 類別** 的物料積壓。

#### 核心根因拆解：
1. **供應商提前交貨 (Supplier Pre-Delivery) - 權重 45%**
   - 供應商欣興電子（Unimicron）提前 14 天將原定於 7 月中旬交貨的 **PCB-CONTROL-V2.1** 送達，進庫數量達 1,200 套，直接增加在庫金額 $500 萬台幣。
2. **終端產品 demand 下降 (Demand Slippage) - 權重 35%**
   - B系列主力產品本月出貨量下滑 15%，導致生產線拉料速度減緩，在庫物料消耗速度低於預期。
3. **採購人員超買 (Overbuying) - 權重 20%**
   - 由於 4 月份曾發生板材缺貨，採購同仁進行了預防性溢額下單，安全庫存溢出率達 28%。

#### 建議採取的自主行動：
- 系統已自動將 Unimicron 下批訂單的排程交期**往後順延 14 天**。
- **下調未來 60 天的 PCB 新訂單量 15%**，預估在 30 天內可將 DOH 重新拉回 85 天的安全目標線。`
  },
  {
    id: "q-02",
    question: "未來半年內哪些料件面臨缺料風險？",
    answerType: "forecast",
    answer: `### 🔮 6個月產銷缺料與需求預測 (Demand & Shortage Forecast)

結合研發排產排程與市場銷售預測，AI 需求預測 Agent 對未來 1/3/6 個月的關鍵物料缺料風險預測如下：

| 物料料號 | 在庫數量 | 1個月預測需求 | 3個月預測需求 | 6個月預測需求 | 預估缺料時間與風險級別 | Dynamic Safety Stock |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **STM32F103C8T6** | 200 | 1,500 | 4,500 | 9,000 | **17 天後 (HIGH RISK)** | **1,200 PCS** |
| **ESP32-WROOM-32D** | 600 | 1,500 | 4,500 | 8,000 | **12 天後 (MEDIUM RISK)** | **900 PCS** |
| **TPS5430DDAR** | 1,500 | 1,200 | 3,600 | 7,200 | **暫無風險** | **850 PCS** |
| **CAP-10UF-0805** | 250k | 18,000 | 54,000 | 108,000 | **安全 (嚴重溢出)** | **28,000 PCS** |

#### ⚠️ 關鍵警告與因應建議：
- **STM32F103C8T6** 面臨極高風險，因 STMicroelectronics 交期仍處於 45 天的高位。**建議立即授權 AI 採購替代晶片 GD32F103C8T6**。
- **ESP32** 庫存將於 12 天後用罄。已探測到蘇州倉庫有閒置庫存，**已自主建立 STO 跨國調撥流程**，預估 3 天內到貨。
- **電容 (CAP-10UF-0805)** 庫存天數高達 416 天。**建議執行呆滯轉售方案**。`
  },
  {
    id: "q-03",
    question: "評估供應商意法半導體 (ST) 的風險狀況",
    answerType: "supplier",
    answer: `### ⚖️ 意法半導體 (STMicroelectronics) 供應風險評估報告

#### 🔴 綜合評估分數: 74 / 100 | 風險等級: B級 (中高度風險)

#### 1. 關鍵指標表現 (KPI Breakdown)：
- **準時交貨率 (OTD):** **78.5%** (環比下滑 4.2%，低於我司 OTD 90% 的合格標準)。
- **平均前置期 (Lead Time):** **45 天** (波動幅度高達 ±10天，交期極度不穩定)。
- **價格成本指數:** **105** (高於合約基準價 5%，議價空間低)。
- **ESG 評級與財務風險:** ESG 得分 82 (優良)，但由於歐洲港口勞工問題，其物流分銷管道財務風險指數上升 12%。

#### 2. 合約關鍵约束條款 (RAG 知識庫檢索結果)：
- 依據 **[Contract-2026-TX](doc-02)** 協議： ST 遲交超過 5 天後，應每日賠償 **1.5%** 違約金，上限為 **15%**。

#### 3. AI 專家控制建議 (Control Strategy)：
- **物料層面：** 意法半導體供應的 STM32F103 晶片正面臨斷貨。鑒於其 OTD 的低迷，**應將其採購份額的 60% 轉向兆易創新 (GigaDevice)**。
- **商業談判：** 對其延期交付的 1,000 PCS 訂單啟動合約索賠流程，要求預扣 15% 的貨款。`
  },
  {
    id: "q-04",
    question: "評估外部地緣政治與全球關稅風險對我司的影響",
    answerType: "geopolitics",
    answer: `### 🌍 全球地緣政治與關稅風險評估報告

基於 **全球風險雷達 (Global Risk Radar)** 的即時監測，當前對我司供貨及利潤影響最大的地緣政治事件為：**美國政府計畫加徵關鍵半導體與微控制器 12% 的進口關稅**。

#### 1. 實質財務衝擊分析：
- **受波及料件：** 意法半導體生產之 **STM32F103C8T6** 系列晶片。
- **單位成本變動：** 單顆採購單價將由原合約協定之 **USD 2.60 上升至 USD 2.91 (+12%)**。若以我司月均 5,000 PCS 的拉料量估算，月利潤將直接損失 **USD 1,550**。
- **港口擁堵加成：** 由於美西港口擁堵，海運交期延長 7 天，使得整體供應鏈脆弱度顯著上升。

#### 2. AI 專家控制決策：
- **關稅規避路徑：** 系統已發起數位分身模擬。選用 **兆易創新 (GigaDevice) 的 GD32F103C8T6** 為最優解。
- **關稅規避效益：** GD32 晶片生產基地設於亞洲，不受此輪關稅法案波及，且協議基礎價格僅為 **USD 2.20**。轉單後，單片整體成本降低達 **27%**，年化可規避/節省稅費與材料開支達 **新台幣 $422,400 元**。`
  },
  {
    id: "q-05",
    question: "分析我司關鍵微控制器 (MCU) 的多層級供應商網絡拓撲",
    answerType: "network",
    answer: `### 🕸️ 關鍵 MCU 多層級供應商網絡拓撲分析

為了避免被動斷料，AI 引擎已穿透至 **二級 (Tier 2) 晶圓代工與封測廠** 以及 **三級 (Tier 3) 原材料商**。以下為我司核心控制板晶片的安全依賴樹：

#### 1. 多層級網絡結構與瓶頸分析 (Supply Chain Bottlenecks)：
1. **主控晶片 STM32F103C8T6 (STMicroelectronics - Tier 1)：**
   - **二級製造代工 (Tier 2)：** **台積電十二廠 (TSMC)** 負責晶圓代工。
   - **三級矽料商 (Tier 3)：** 德國瓦克化學 (Wacker Chemie) 提供高純度多晶矽。
   - **風險狀態：** 台積電與瓦克化學健康度評級皆為 95+（特優）。ST 交期延遲的瓶頸在於 ST 自家歐洲後段測試包裝廠的產能調度，非前段晶圓短缺。
2. **無線模組 ESP32-WROOM-32D (Espressif - Tier 1)：**
   - **二級封測代工 (Tier 2)：** **日月光半導體 (ASE Group)** 負責封裝測試。
   - **風險狀態：** 🔴 **CRITICAL ALERT (風險值 78%)**。日月光封裝廠日前發生局部火警，產線中斷，直接導致樂鑫 (Espressif) Tier 1 模組出貨延遲 20 天。

#### 2. AI 減災應變機制：
- 針對 ESP32 的 Tier 2 斷鏈：控制塔已鎖定蘇州倉庫的 **1,500 PCS** 閒置 ESP32 庫存，並自動啟動 **跨國 STO 調撥單 (STO-20260624-009)**，空運特快 3 天內送抵桃園廠，保障生產無虞。`
  },
  {
    id: "q-06",
    question: "如果 STM32 晶片斷貨，會波及哪些產品、客戶，預估營收損失多少？",
    answerType: "graph_query",
    answer: `### 🕸️ 企業多維知識圖譜 (Enterprise Knowledge Graph) 深度查詢

#### 🔍 檢索實體：Part_Number = 'STM32F103C8T6'
當前在庫: **200 PCS** | 消耗速度: **50 PCS/天** | 預計斷料時間：**4 天後**。

#### 1. 知識圖譜關聯依賴鏈 (Dependency Propagation Path)：
\`\`\`text
[STMicroelectronics] (Supplier)
        │ 供應
        ▼
[STM32F103C8T6] (Part)
        │ 在庫桃園一號倉
        ▼
[Car ECU Control Board V2.2] (Affected Product) ──► 影響生產比率: 100%
        │ 出貨組裝
        ▼
[Toyota Motors - Corolla Hybrid] (Customer)
[BYD Auto - Song Pro EV] (Customer)
\`\`\`

#### 2. 營收衝擊與阻斷損失評估 (Financial Impact)：
- **波及產品：** 車載 ECU 核心控制板。目前每日排產 50 套，貼片廠產線稼動率 100%。
- **影響客戶：** 豐田汽車（Toyota）與比亞迪（BYD）的七月份排產合約。
- **預估營收損失 (Revenue at Risk)：** 
  - 若未及時調度，停線 10 天將導致車載 ECU 主板交期延誤。
  - 根據合約延期條款，每日面臨 **USD 15,000 的交期違約罰金**。
  - 若 Toyota 因停線向我司索賠，車載項目淨營收將面臨最高 **$250,000 USD (約新台幣 800 萬元)** 的阻斷損失。

#### 3. AI 閉環處置（Explainable Action）：
- 系統已發起數位分身模擬最優解。**已向 WPG 大聯大發出急單 PO-20260624-045，緊急調撥 2,000 PCS 的 GD32F103C8T6 替代晶片**。
- GD32 接腳相容，技術阻礙為 0，預計 7 天抵達，配合生管 3 天排程微調，可將此 **$250,000 USD 的風險損失徹底降低為 0**。`
  },
  {
    id: "q-07",
    question: "檢視我司 AI Agent 團隊的運作效能與 Token 消耗狀況",
    answerType: "agent_hub_query",
    answer: `### 🤖 AI Agent 團隊效能與資源監控報告 (AI Agent Hub Report)

目前我司 **AI 員工管理中心 (AI Employee Management Center)** 共有 **7 位專業 AI Agent** 協同運作。本月（截止至今）的運行指標與 Token 消耗如下：

#### 1. Agent 核心指標矩陣 (Agent Performance Matrix)：

| Agent 名稱 | 職責與專長 | 當前狀態 | 決策準確率 | 已處置任務 | 本月 Token 消耗 | 預估運營費用 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Inventory Agent** | 庫齡與呆滯料分析 | Idle | 99.2% | 245 次 | 45.2k | $0.23 USD |
| **Shortage Agent** | 缺料停線風險評估 | **Active** | 98.5% | 189 次 | 98.4k | $0.49 USD |
| **Supplier Agent** | 供應商 OTD 與風險 | Idle | 96.8% | 120 次 | 35.8k | $0.18 USD |
| **Contract Agent** | 採購合約 RAG 向量 | **Active** | 99.1% | 310 次 | 145.2k | $0.73 USD |
| **Alternate Agent** | 替代料 Pin-to-Pin | Idle | 97.5% | 142 次 | 68.9k | $0.34 USD |
| **Procurement Agent**| 自主下單與催料信 | **Active** | 98.2% | 298 次 | 210.5k | $1.05 USD |
| **Risk Agent** | 地緣政治與 War Room| Idle | 96.2% | 88 次 | 52.1k | $0.26 USD |
| **總計 (Total)** | **全球控制塔大腦** | **閉環運作** | **97.9%** | **1,392 次** | **656.1k** | **$3.28 USD** |

#### 2. 效能優化建議：
- **Token 效率：** **Procurement Agent** 與 **Contract Agent** 消耗了 54% 的 Token，主要由於處理長篇合約 PDF 向量檢索與自動生成大篇幅商業信件所致。建議在下一階段導入 Prompt 快取（Prompt Caching），預計可降低 35% 運營 Token 成本。
- **準確率優化：** Risk Agent 準確率為 96.2%，主要受到地緣政治新聞非結構化資料噪音干擾。已為其對接了新的供應鏈專業 RAG 知識庫，下月評估指標預期回升至 98% 以上。`
  }
];

export const databaseTables = {
  inventory_current: {
    columns: ["part_id", "part_number", "description", "category", "qty_in_stock", "safety_stock", "dynamic_safety_stock", "unit_price_usd", "risk_level"],
    rows: [
      ["part-01", "STM32F103C8T6", "MCU 32-bit ARM M3", "IC", 200, 1000, 1200, 2.60, "High"],
      ["part-02", "ESP32-WROOM-32D", "Wi-Fi + BT MCU Module", "IC", 600, 750, 900, 3.80, "Medium"],
      ["part-03", "TPS5430DDAR", "IC REG BUCK ADJ 3A", "IC", 1500, 800, 850, 1.45, "Low"],
      ["part-04", "CAP-10UF-0805", "Capacitor Ceramic 10uF", "Passive", 250000, 20000, 28000, 0.05, "Low"],
      ["part-05", "PCB-CONTROL-V2.1", "4-Layer Control PCB", "PCB", 800, 500, 480, 4.20, "Low"]
    ]
  },
  demand_forecast: {
    columns: ["part_number", "qty_in_stock", "forecast_1m", "forecast_3m", "forecast_6m", "shortage_est", "safety_target_doh"],
    rows: [
      ["STM32F103C8T6", 200, 1500, 4500, 9000, "17 天後 (HIGH RISK)", 30],
      ["ESP32-WROOM-32D", 600, 1500, 4500, 8000, "12 天後 (MEDIUM RISK)", 25],
      ["TPS5430DDAR", 1500, 1200, 3600, 7200, "暫無缺料風險", 20],
      ["CAP-10UF-0805", 250000, 18000, 54000, 108000, "無風險 (過度積壓)", 45]
    ]
  },
  inventory_health_scores: {
    columns: ["category_name", "health_score_0_100", "status_level", "doh_deviation", "excess_value_usd", "mitigation_agent_status"],
    rows: [
      ["IC (主控晶片)", 92, "良好", "+2天", 0, "Idle"],
      ["PCB (電路板)", 68, "中度風險", "+33天", 165000, "Procurement Agent Active"],
      ["Passive (被動元件)", 45, "高度積壓", "+296天", 12500, "Dead Stock Agent Active"],
      ["Mechanical (機構件)", 95, "優秀", "0天", 0, "Idle"]
    ]
  },
  global_risk_radar: {
    columns: ["risk_id", "risk_type", "event_title", "financial_impact_usd", "risk_status_level", "recommended_mitigation"],
    rows: [
      ["risk-g01", "Tariff", "美國加徵微控制器關稅12%", "+$0.31/PCS", "Critical", "轉單至中國製造 GigaDevice 晶片"],
      ["risk-g02", "Port Congestion", "美西長灘港口擁堵率上升25%", "交期延遲 +7天", "Warning", "下單航空快遞補貨，防範在途延期"],
      ["risk-g03", "Raw Material", "全球電解銅價格大漲8.2%", "連接器合約價預估 +5%", "Warning", "鎖定特約期貨儲備合同防範溢價"],
      ["risk-g04", "Earthquake", "台灣新竹地區發生4.5級地震", "產線無實質損壞", "Normal", "已穿透供應鏈網絡，無停線隱憂"]
    ]
  },
  supplier_network_graph: {
    columns: ["node_id", "label_name", "tier_level", "operation_status", "esg_score", "mitigation_plan"],
    rows: [
      ["factory", "聯發科技 桃園一號廠", "Tier 0 (我司)", "Active", 92, "無 (核心總裝基地)"],
      ["t1-st", "STMicroelectronics", "Tier 1 (ST)", "Warning", 82, "利用 GD32 替代料分流 60% 訂單"],
      ["t1-espressif", "Espressif Systems", "Tier 1 (樂鑫)", "Critical", 85, "啟用蘇州閒置庫存進行跨國調撥 (STO)"],
      ["t2-tsmc", "TSMC 台積電十二廠", "Tier 2 (代工)", "Active", 98, "無 (晶圓產線運作正常)"],
      ["t2-ase", "ASE Group 日月光封測", "Tier 2 (封測)", "Critical", 88, "密切跟進20天復工進度，暫停新拉料"],
      ["t3-wacker", "Wacker Chemie 瓦克矽料", "Tier 3 (原料)", "Active", 96, "無 (德國原材料供應充沛)"]
    ]
  },
  war_room_scenarios: {
    columns: ["scenario_id", "scenario_title", "severity_level", "revenue_at_risk_usd", "products_affected", "key_impacted_customer"],
    rows: [
      ["war-01", "中國蘇州工廠因故局部停工", "Critical", 450000, "ESP32主控板、車載ECU", "Toyota Motor, BYD Auto"],
      ["war-02", "美元匯率大幅升值 +8.2%", "Warning", 90000, "進口關鍵晶片與被動元件", "歐美汽車原廠、全系列車用客戶"]
    ]
  },
  agent_hub_metrics: {
    columns: ["agent_id", "agent_name", "accuracy_score_pct", "tasks_completed_count", "token_usage_k", "estimated_cost_usd", "current_status"],
    rows: [
      ["a-inv", "Inventory Agent", 99.2, 245, 45.2, 0.23, "Idle"],
      ["a-sho", "Shortage Agent", 98.5, 189, 98.4, 0.49, "Active"],
      ["a-sup", "Supplier Agent", 96.8, 120, 35.8, 0.18, "Idle"],
      ["a-con", "Contract Agent", 99.1, 310, 145.2, 0.73, "Active"],
      ["a-alt", "Alternate Agent", 97.5, 142, 68.9, 0.34, "Idle"],
      ["a-pro", "Procurement Agent", 98.2, 298, 210.5, 1.05, "Active"],
      ["a-rsk", "Risk Agent", 96.2, 88, 52.1, 0.26, "Idle"]
    ]
  },
  supplier_performance: {
    columns: ["supplier_id", "supplier_name", "otd_rate_pct", "avg_lead_time_days", "cost_index", "esg_score", "risk_score", "risk_level"],
    rows: [
      ["sup-01", "STMicroelectronics", 78.5, 45, 105, 82, 74, "B"],
      ["sup-02", "Espressif Systems", 88.0, 30, 100, 85, 62, "B"],
      ["sup-03", "Texas Instruments", 96.2, 21, 98, 90, 28, "A"],
      ["sup-04", "Murata Electronics", 98.0, 14, 102, 88, 18, "A"],
      ["sup-05", "Unimicron Technology", 94.5, 18, 95, 78, 35, "A"]
    ]
  },
  alternate_parts: {
    columns: ["original_part", "alternate_part", "manufacturer", "pin_compatible", "spec_match_pct", "cost_diff_pct", "lead_time_days"],
    rows: [
      ["STM32F103C8T6", "GD32F103C8T6", "GigaDevice", "Y", 99, -15, 7],
      ["STM32F103C8T6", "CH32F103C8T6", "Wch Co.", "Y", 95, -30, 5],
      ["ESP32-WROOM-32D", "RTL8720DN", "Realtek", "N", 88, 8, 5]
    ]
  },
  contracts_rag_embeddings: {
    columns: ["doc_id", "section_id", "document_title", "chunk_text_summary", "vector_dimension_1536"],
    rows: [
      ["doc-01", "sec-2.3", "SOP-PUR-001 採購標準程序", "緊急替代料導入與RD規格對比、Pin-to-Pin相容優先原則", "[0.015, -0.043, 0.089, ...]"],
      ["doc-02", "sec-4.3", "Contract-2026-TX ST採購協議", "ST延遲交貨違約金罰款條款：寬限期5天後每日罰款1.5%", "[-0.072, 0.051, 0.104, ...]"],
      ["doc-03", "sec-3.2", "Contract-2026-GD GD採購合約", "GD微控制器與ST相容性，緊急產能保留與7日內出貨協定", "[0.031, -0.012, 0.095, ...]"],
      ["doc-04", "sec-2.0", "SOP-LOG-003 呆滯料處置條例", "呆滯料180天以上處置路徑：轉用、特價轉售、報廢流程", "[-0.019, 0.063, -0.041, ...]"]
    ]
  }
};
