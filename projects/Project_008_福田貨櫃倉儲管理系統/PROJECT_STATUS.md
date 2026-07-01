# Project Status: 福田貨櫃倉儲管理系統

## Version

v0.5.1

## Tech Stack

- React 19 + Vite 7
- Pure frontend SPA (no backend, no database)
- zh-Hant (Traditional Chinese)
- Dark theme glassmorphism UI

---

## Completed Features

### Core Data Models

- [x] **Container Model** — id, type, zone, status, customerId, monthlyRent, contractEnd, inspection, vacantDays
- [x] **Customer Model** — unified 6 statuses: prospect / reserved / active / overdue / checkout / closed
- [x] **Reservation Model** — customerId binding, 6 statuses, preferredZone, reservedContainerId, deposit fields
- [x] **Contract Model** — contractType (firstYear/renewal), 8 policy fields, paymentStatus, terminationNoticeDays
- [x] **Payment Model** — 6 bill types, partialPayments array, receipt/invoice tracking, bank digits
- [x] **Electricity Model** — meter readings, base fee 1000/yr, 9 TWD/unit
- [x] **Maintenance Model** — work tickets, priority, assignee, photo count
- [x] **Notification Model** — LINE/phone/email channels, status tracking

### Rate Rules

- [x] 10ft firstYear 48,000 / renewal 72,000
- [x] 20ft firstYear 72,000 / renewal 84,000
- [x] Deposit = 1 month rent
- [x] Electricity: base 1,000/yr + 9 TWD/unit for high usage

### UI Pages (15 tabs)

- [x] **Dashboard** — KPI grid, task cards, container map, due/payment lists
- [x] **貨櫃管理** — filter/sort, detail card, add container
- [x] **QR掃描** — simulated QR scan, container detail, inspection alerts
- [x] **維修檢查** — Kanban board, ticket management, complete flow
- [x] **客戶中心** — customer selector, profile, containers/reservations/contracts/bills summary
- [x] **客戶入口** — simulated customer self-service portal
- [x] **預約管理** — Kanban + table, container assignment, deposit tracking
- [x] **電子合約** — Kanban, detailed table, template checklist with all policies
- [x] **收費管理** — annual bill generation, mark-paid flow, partial payments display
- [x] **電費管理** — meter readings, base + usage fee breakdown
- [x] **續約提醒** — Kanban, renewal pricing with rate rules
- [x] **退租管理** — checkout calculator, closed-loop (container→vacant, contract→closed, customer→closed/active)
- [x] **通知中心** — LINE templates, send history
- [x] **報表** — revenue analysis, utilization by type, collection structure
- [x] **AI 助理** — rule-based Q&A, floating assistant widget

### Business Flows

- [x] Reservation → container assignment → notification
- [x] Contract signing with payment receipt tracking
- [x] Annual bill generation using rate rules
- [x] Payment collection with method/date/collector tracking
- [x] Early termination calculator (remaining rent refund, cleaning fee, penalty)
- [x] Checkout closed-loop (container freed, contract closed, customer status updated)

---

## Todo

- [ ] Customer self-service portal with real auth
- [ ] PDF contract generation
- [ ] Real QR code scanning (camera)
- [ ] Data persistence (localStorage / IndexedDB)
- [ ] Export reports to Excel/PDF
- [ ] LINE Messaging API integration
- [ ] Multi-user / role-based access

---

## Known Issues

- [ ] Node 18 + Vite 7 compatibility warning (cosmetic, build succeeds)
- [ ] All data is ephemeral (state only, no persistence)
- [ ] PWA service worker serves static dist files only
- [ ] `paidAmount` and `partialPayments` sum may drift if not kept in sync manually

---

## Last Build

```
✓ built in ~1s
dist/index.js:  ~260 kB (gzip: ~79 kB)
dist/index.css: ~18 kB (gzip: ~4 kB)
```

---

*Last updated: 2026-07-01*
