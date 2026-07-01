# CHANGELOG

## v0.9.2 (2026-07-01)

### Changed
- Reservation `containerId` → `reservedContainerId` migration (3 locations)
- Reservation table now shows deposit paid date inline

## v0.9.1 (2026-07-01)

### Added
- Checkout closed-loop: completing checkout auto-updates Container→vacant, Contract→closed, Customer→closed/active
- Checkout calculator: cleaningFee, penaltyFee, remainingRentRefund, finalRefundAmount, finalPaymentDue
- `getPaidAmount()` helper for partialPayments-aware calculation

## v0.9.0 (2026-07-01)

### Added
- Unified customer statuses: prospect / reserved / active / overdue / checkout / closed
- Reservation model: preferredZone, reservedContainerId, depositRequired, depositPaid, reservationDepositAmount, reservationDepositPaidAt
- Contract model: contractVersion, paymentStatus, terminationNoticeDays, earlyTerminationRule, damagePolicy, refundPolicy, electricityPolicy
- Payment model: paidAt, collectedBy, paymentNote, bankLastFiveDigits, receiptStatus, invoiceStatus, partialPayments
- Contract template checklist with all policy fields
- Payment partialPayments display with hover tooltip
- Customer center detail view (containers + reservations + contracts + bills)

## v0.8.0 (prior)

### Added
- Rate rules: firstYear/renewal pricing, deposit = 1 month rent, electricity base + per-unit
- Contract type support (firstYear / renewal)
- Annual bill generation using rate rules
- 6 payment types: rent, deposit, electricity, terminationFee, damageFee, refund
- Checkout calculator: contract period, used/remaining months, deposit, unpaid bills
- Customer management with 11 fields (status, idNumber, invoiceTitle, etc.)
- Reservation customerId binding, 6 statuses, container assignment on reserve
- Contract template: early termination, deposit, electricity, notice period rules
