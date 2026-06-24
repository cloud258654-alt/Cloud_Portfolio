import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import { calculateFee } from './billing.js';
import { createToken, requireAuth } from './auth.js';
import { prisma } from './prisma.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const corsOrigin = process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? false : true);

app.disable('x-powered-by');
app.use(securityHeaders);
app.use(cors({ origin: corsOrigin }));
app.use(express.json());
app.use('/api/login', loginRateLimit);

const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
  const original = app[method].bind(app);
  app[method] = (path, ...handlers) => original(path, ...handlers.map((handler) => (
    handler.constructor.name === 'AsyncFunction' ? asyncHandler(handler) : handler
  )));
}

const vehicleLabels = {
  TEMPORARY: '臨停',
  MONTHLY: '月租',
  VIP: 'VIP'
};

const exceptionLabels = {
  DUPLICATE_ENTRY: '重複進場',
  BLACKLIST_ENTRY: '黑名單進場',
  BLACKLIST_EXIT: '黑名單出場',
  ILLEGAL_EXIT: '非法出場',
  DUPLICATE_PAYMENT: '重複付款',
  DEVICE_ERROR: '設備異常',
  SPACE_COUNT_ERROR: '車位數異常'
};

const reservationLabels = {
  RESERVED: '已預約',
  USED: '已使用',
  CANCELLED: '已取消'
};

app.post('/api/login', async (req, res) => {
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '');

  if (!username || !password) {
    return res.status(400).json({ message: '請輸入帳號與密碼' });
  }

  const admin = await prisma.admin.findUnique({ where: { username } });

  if (!admin || !(await bcrypt.compare(password || '', admin.passwordHash))) {
    return res.status(401).json({ message: '帳號或密碼錯誤' });
  }

  return res.json({
    token: createToken(admin),
    admin: { id: admin.id, username: admin.username }
  });
});

app.get('/api/public/pay/:plateNumber/quote', async (req, res) => {
  const plateNumber = normalizePlate(req.params.plateNumber);
  const result = await quoteExit({
    plateNumber,
    operator: 'public',
    ipAddress: getIp(req),
    logMissing: false,
    discountCode: req.query.discountCode
  });
  return res.json(result);
});

app.post('/api/public/pay', async (req, res) => {
  const plateNumber = normalizePlate(req.body.plateNumber);
  const result = await completeExitPayment({
    plateNumber,
    operator: 'public',
    ipAddress: getIp(req),
    paymentMethod: 'QR_CODE',
    discountCode: req.body.discountCode
  });
  return res.json(result);
});

app.get('/api/dashboard', requireAuth, async (_req, res) => {
  const today = startOfToday();
  const weekLater = new Date();
  weekLater.setDate(weekLater.getDate() + 7);

  const [
    lot,
    activeRecords,
    completedToday,
    entriesToday,
    openExceptions,
    monthlyExpiring,
    exceptions,
    latestPayments,
    latestScans,
    activeReservations
  ] = await Promise.all([
    getLot(),
    prisma.parkingRecord.findMany({
      where: { status: 'IN_PARKING' },
      orderBy: { entryTime: 'desc' },
      take: 100
    }),
    prisma.parkingRecord.aggregate({
      where: { status: 'COMPLETED', exitTime: { gte: today } },
      _sum: { fee: true },
      _count: { _all: true }
    }),
    prisma.parkingRecord.count({
      where: { entryTime: { gte: today } }
    }),
    prisma.exceptionEvent.count({
      where: { status: 'OPEN' }
    }),
    prisma.monthlyCar.count({
      where: { status: 'ACTIVE', endDate: { gte: today, lte: weekLater } }
    }),
    prisma.exceptionEvent.findMany({
      orderBy: { occurredAt: 'desc' },
      take: 10
    }),
    prisma.payment.findMany({
      orderBy: { paidAt: 'desc' },
      take: 10
    }),
    prisma.lprScan.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    prisma.reservation.findMany({
      where: { status: 'RESERVED', endTime: { gte: new Date() } },
      orderBy: { startTime: 'asc' },
      take: 10
    })
  ]);

  const todayRevenue = completedToday._sum.fee || 0;
  const trendPayments = await prisma.payment.findMany({
    where: { paidAt: { gte: daysAgo(6) } },
    orderBy: { paidAt: 'asc' },
    select: { paidAt: true, amount: true }
  });

  return res.json({
    lot,
    stats: {
      capacity: lot.capacity,
      occupied: lot.usedSpaces,
      available: lot.availableSpaces,
      todayRevenue,
      todayEntries: entriesToday,
      todayExits: completedToday._count._all,
      openExceptions,
      monthlyExpiring
    },
    revenueTrend: buildSevenDayTrend(trendPayments),
    activeRecords: activeRecords.map(formatRecord),
    exceptions: exceptions.map(formatException),
    latestPayments: latestPayments.map(formatPayment),
    latestScans: latestScans.map(formatLprScan),
    activeReservations: activeReservations.map(formatReservation)
  });
});

app.get('/api/rate-settings', requireAuth, async (_req, res) => {
  res.json(await getRateSetting());
});

app.put('/api/rate-settings', requireAuth, async (req, res) => {
  const data = {
    freeMinutes: toPositiveInt(req.body.freeMinutes, 30),
    hourlyRate: toPositiveInt(req.body.hourlyRate, 40),
    dailyMaxFee: toPositiveInt(req.body.dailyMaxFee, 300),
    exitGraceMinutes: toPositiveInt(req.body.exitGraceMinutes, 10)
  };

  const current = await getRateSetting();
  const updated = await prisma.rateSetting.update({ where: { id: current.id }, data });
  res.json(updated);
});

app.get('/api/blacklist', requireAuth, async (_req, res) => {
  const items = await prisma.blacklist.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(items.map(formatBlacklist));
});

app.post('/api/blacklist', requireAuth, async (req, res) => {
  const plateNumber = normalizePlate(req.body.plateNumber);
  const reason = String(req.body.reason || '').trim();

  if (!plateNumber || !reason) {
    return res.status(400).json({ message: '請輸入車牌與黑名單原因' });
  }

  const item = await prisma.blacklist.upsert({
    where: { plateNumber },
    update: { reason, status: 'ACTIVE' },
    create: { plateNumber, reason, status: 'ACTIVE' }
  });

  res.status(201).json(formatBlacklist(item));
});

app.patch('/api/blacklist/:id', requireAuth, async (req, res) => {
  const status = req.body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const item = await prisma.blacklist.update({
    where: { id: Number(req.params.id) },
    data: { status }
  });
  res.json(formatBlacklist(item));
});

app.get('/api/monthly-cars', requireAuth, async (_req, res) => {
  const items = await prisma.monthlyCar.findMany({ orderBy: { endDate: 'asc' } });
  res.json(items.map(formatMonthlyCar));
});

app.post('/api/monthly-cars', requireAuth, async (req, res) => {
  const plateNumber = normalizePlate(req.body.plateNumber);
  const ownerName = String(req.body.ownerName || '').trim();
  const phone = String(req.body.phone || '').trim();
  const startDate = parseInputDate(req.body.startDate);
  const endDate = parseInputDate(req.body.endDate);

  if (!plateNumber || !ownerName || !phone || !startDate || !endDate) {
    return res.status(400).json({ message: '請完整輸入月租車資料' });
  }

  if (endDate < startDate) {
    return res.status(400).json({ message: '結束日期不可早於開始日期' });
  }

  const item = await prisma.monthlyCar.upsert({
    where: { plateNumber },
    update: { ownerName, phone, startDate, endDate, status: 'ACTIVE' },
    create: { plateNumber, ownerName, phone, startDate, endDate, status: 'ACTIVE' }
  });

  res.status(201).json(formatMonthlyCar(item));
});

app.patch('/api/monthly-cars/:id', requireAuth, async (req, res) => {
  const status = req.body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const item = await prisma.monthlyCar.update({
    where: { id: Number(req.params.id) },
    data: { status }
  });
  res.json(formatMonthlyCar(item));
});

app.post('/api/monthly-cars/:id/renew', requireAuth, async (req, res) => {
  const current = await prisma.monthlyCar.findUnique({ where: { id: Number(req.params.id) } });
  if (!current) return res.status(404).json({ message: '查無月租車資料' });

  const months = toPositiveInt(req.body.months, 1) || 1;
  const base = current.endDate > new Date() ? current.endDate : new Date();
  const endDate = new Date(base);
  endDate.setMonth(endDate.getMonth() + months);

  const item = await prisma.monthlyCar.update({
    where: { id: current.id },
    data: { endDate, status: 'ACTIVE' }
  });
  res.json(formatMonthlyCar(item));
});

app.post('/api/entry', requireAuth, async (req, res) => {
  const result = await createEntry({
    plateNumber: normalizePlate(req.body.plateNumber),
    requestedType: req.body.vehicleType,
    operator: req.admin?.username || 'admin',
    ipAddress: getIp(req)
  });
  res.status(201).json(result);
});

app.post('/api/exit/quote', requireAuth, async (req, res) => {
  const result = await quoteExit({
    plateNumber: normalizePlate(req.body.plateNumber),
    operator: req.admin?.username || 'admin',
    ipAddress: getIp(req),
    logMissing: true,
    discountCode: req.body.discountCode
  });
  res.json(result);
});

app.post('/api/exit/pay', requireAuth, async (req, res) => {
  const result = await completeExitPayment({
    plateNumber: normalizePlate(req.body.plateNumber),
    operator: req.admin?.username || 'admin',
    ipAddress: getIp(req),
    paymentMethod: req.body.paymentMethod || 'SIMULATED',
    discountCode: req.body.discountCode
  });
  res.json(result);
});

app.post('/api/lpr/scan', requireAuth, async (req, res) => {
  const plateNumber = normalizePlate(req.body.plateNumber);
  const direction = req.body.direction === 'EXIT' ? 'EXIT' : 'ENTRY';
  const operator = req.admin?.username || 'admin';
  const ipAddress = getIp(req);

  if (!plateNumber) {
    return res.status(400).json({ message: '請輸入模擬辨識車牌' });
  }

  const confidence = clampInt(req.body.confidence ?? randomConfidence(), 70, 99);

  if (direction === 'ENTRY') {
    try {
      const result = await createEntry({
        plateNumber,
        requestedType: req.body.vehicleType || 'TEMPORARY',
        operator,
        ipAddress
      });
      await logLprScan({ plateNumber, direction, confidence, resultStatus: 'SUCCESS', message: result.message });
      return res.status(201).json({ action: 'ENTRY', recognizedPlate: plateNumber, confidence, ...result });
    } catch (error) {
      await logLprScan({ plateNumber, direction, confidence, resultStatus: 'FAILED', message: error.message });
      throw error;
    }
  }

  try {
    const result = await quoteExit({ plateNumber, operator, ipAddress, logMissing: true });
    await logLprScan({ plateNumber, direction, confidence, resultStatus: 'SUCCESS', message: '出場試算完成' });
    return res.json({ action: 'EXIT', recognizedPlate: plateNumber, confidence, ...result });
  } catch (error) {
    await logLprScan({ plateNumber, direction, confidence, resultStatus: 'FAILED', message: error.message });
    throw error;
  }
});

app.get('/api/lpr/scans', requireAuth, async (_req, res) => {
  const scans = await prisma.lprScan.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  res.json(scans.map(formatLprScan));
});

app.get('/api/records', requireAuth, async (req, res) => {
  const where = buildRecordWhere(req.query);
  const records = await prisma.parkingRecord.findMany({
    where,
    orderBy: { entryTime: 'desc' },
    take: 200
  });

  return res.json(records.map(formatRecord));
});

app.get('/api/payments', requireAuth, async (req, res) => {
  const where = buildPaymentWhere(req.query);
  const payments = await prisma.payment.findMany({
    where,
    orderBy: { paidAt: 'desc' },
    take: 300
  });

  res.json(payments.map(formatPayment));
});

app.get('/api/payments.csv', requireAuth, async (req, res) => {
  const where = buildPaymentWhere(req.query);
  const payments = await prisma.payment.findMany({ where, orderBy: { paidAt: 'desc' }, take: 1000 });
  const rows = [
    ['paid_at', 'plate_number', 'original_amount', 'discount_amount', 'amount', 'discount_code', 'payment_method', 'status'],
    ...payments.map((payment) => [
      payment.paidAt.toISOString(),
      payment.plateNumber,
      payment.originalAmount,
      payment.discountAmount,
      payment.amount,
      payment.discountCode || '',
      payment.paymentMethod,
      payment.status
    ])
  ];
  res.header('Content-Type', 'text/csv; charset=utf-8');
  res.header('Content-Disposition', 'attachment; filename="payments.csv"');
  res.send(`\uFEFF${rows.map((row) => row.map(csvEscape).join(',')).join('\n')}`);
});

app.get('/api/reports/revenue', requireAuth, async (req, res) => {
  const where = buildPaymentWhere(req.query);
  const payments = await prisma.payment.findMany({ where, orderBy: { paidAt: 'asc' } });
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const byMethod = groupSum(payments, 'paymentMethod');
  const byDate = payments.reduce((acc, payment) => {
    const key = payment.paidAt.toISOString().slice(0, 10);
    acc[key] = (acc[key] || 0) + payment.amount;
    return acc;
  }, {});

  res.json({
    total,
    count: payments.length,
    average: payments.length ? Math.round(total / payments.length) : 0,
    byMethod,
    byDate
  });
});

app.get('/api/reservations', requireAuth, async (_req, res) => {
  const items = await prisma.reservation.findMany({ orderBy: { startTime: 'desc' }, take: 200 });
  res.json(items.map(formatReservation));
});

app.post('/api/reservations', requireAuth, async (req, res) => {
  const plateNumber = normalizePlate(req.body.plateNumber);
  const driverName = String(req.body.driverName || '').trim();
  const phone = String(req.body.phone || '').trim();
  const startTime = parseInputDate(req.body.startTime);
  const endTime = parseInputDate(req.body.endTime);

  if (!plateNumber || !driverName || !phone || !startTime || !endTime) {
    return res.status(400).json({ message: '請完整輸入預約資料' });
  }
  if (endTime <= startTime) {
    return res.status(400).json({ message: '預約結束時間需晚於開始時間' });
  }

  const item = await prisma.reservation.create({
    data: {
      plateNumber,
      driverName,
      phone,
      startTime,
      endTime,
      status: 'RESERVED',
      note: String(req.body.note || '').trim() || null
    }
  });
  res.status(201).json(formatReservation(item));
});

app.patch('/api/reservations/:id', requireAuth, async (req, res) => {
  const allowed = ['RESERVED', 'USED', 'CANCELLED'];
  const status = allowed.includes(req.body.status) ? req.body.status : 'RESERVED';
  const item = await prisma.reservation.update({
    where: { id: Number(req.params.id) },
    data: { status }
  });
  res.json(formatReservation(item));
});

app.get('/api/discount-codes', requireAuth, async (_req, res) => {
  const items = await prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(items.map(formatDiscountCode));
});

app.post('/api/discount-codes', requireAuth, async (req, res) => {
  const code = String(req.body.code || '').trim().toUpperCase();
  const name = String(req.body.name || '').trim();
  const discountType = req.body.discountType === 'PERCENT' ? 'PERCENT' : 'AMOUNT';
  const discountValue = toPositiveInt(req.body.discountValue, 0);
  const startDate = parseInputDate(req.body.startDate);
  const endDate = parseInputDate(req.body.endDate);

  if (!code || !name || !discountValue || !startDate || !endDate) {
    return res.status(400).json({ message: '請完整輸入優惠碼資料' });
  }

  const item = await prisma.discountCode.upsert({
    where: { code },
    update: { name, discountType, discountValue, startDate, endDate, status: 'ACTIVE' },
    create: { code, name, discountType, discountValue, startDate, endDate, status: 'ACTIVE' }
  });
  res.status(201).json(formatDiscountCode(item));
});

app.patch('/api/discount-codes/:id', requireAuth, async (req, res) => {
  const status = req.body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const item = await prisma.discountCode.update({
    where: { id: Number(req.params.id) },
    data: { status }
  });
  res.json(formatDiscountCode(item));
});

app.get('/api/exceptions', requireAuth, async (req, res) => {
  const where = {};
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.eventType) where.eventType = String(req.query.eventType);
  if (req.query.plateNumber) where.plateNumber = normalizePlate(req.query.plateNumber);

  const events = await prisma.exceptionEvent.findMany({
    where,
    orderBy: { occurredAt: 'desc' },
    take: 200
  });

  return res.json(events.map(formatException));
});

app.patch('/api/exceptions/:id', requireAuth, async (req, res) => {
  const status = req.body.status === 'RESOLVED' ? 'RESOLVED' : 'OPEN';
  const event = await prisma.exceptionEvent.update({
    where: { id: Number(req.params.id) },
    data: {
      status,
      note: String(req.body.note || '').trim() || null,
      handledBy: status === 'RESOLVED' ? req.admin?.username || 'admin' : null,
      handledAt: status === 'RESOLVED' ? new Date() : null
    }
  });
  res.json(formatException(event));
});

app.use(async (error, req, res, _next) => {
  if (error instanceof BusinessError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof SpaceCountError) {
    await logException({
      plateNumber: normalizePlate(req.body?.plateNumber),
      eventType: 'SPACE_COUNT_ERROR',
      description: '車位數量異常，請檢查停車場設定。',
      operator: req.admin?.username || 'admin',
      ipAddress: getIp(req)
    });
    return res.status(409).json({ message: '車位數異常，請通知管理員。' });
  }

  console.error(error);
  res.status(500).json({ message: '系統發生錯誤，請稍後再試' });
});

app.listen(port, () => {
  console.log(`API server running on http://127.0.0.1:${port}`);
});

async function createEntry({ plateNumber, requestedType, operator, ipAddress }) {
  if (!plateNumber) {
    throw new BusinessError('請輸入車牌號碼', 400);
  }

  if (!['TEMPORARY', 'MONTHLY', 'VIP'].includes(requestedType)) {
    throw new BusinessError('請選擇有效的車輛類型', 400);
  }

  const blacklist = await getActiveBlacklist(plateNumber);
  if (blacklist) {
    await logException({
      plateNumber,
      eventType: 'BLACKLIST_ENTRY',
      description: `黑名單車輛禁止進場：${blacklist.reason}`,
      operator,
      ipAddress
    });
    throw new BusinessError('黑名單車輛禁止進場。', 403);
  }

  const existing = await findActiveRecord(plateNumber);
  if (existing) {
    await logException({
      plateNumber,
      eventType: 'DUPLICATE_ENTRY',
      description: '同一車牌已有未出場紀錄，禁止重複進場。',
      operator,
      ipAddress
    });
    throw new BusinessError('此車輛目前已在停車場內，無法重複進場。', 409);
  }

  const lot = await getLot();
  if (lot.availableSpaces <= 0) {
    await logException({
      plateNumber,
      eventType: 'SPACE_COUNT_ERROR',
      description: '停車場已滿仍嘗試進場。',
      operator,
      ipAddress
    });
    throw new BusinessError('停車場已滿，暫停進場。', 409);
  }

  const vehicleType = await resolveEntryVehicleType(plateNumber, requestedType);

  const result = await prisma.$transaction(async (tx) => {
    const latestLot = await tx.parkingLot.findUnique({ where: { id: 1 } });
    if (!latestLot || latestLot.availableSpaces <= 0) {
      throw new BusinessError('停車場已滿，暫停進場。', 409);
    }

    const record = await tx.parkingRecord.create({ data: { plateNumber, vehicleType } });
    await tx.reservation.updateMany({
      where: {
        plateNumber,
        status: 'RESERVED',
        startTime: { lte: new Date() },
        endTime: { gte: new Date() }
      },
      data: { status: 'USED' }
    });

    const updatedLot = await tx.parkingLot.update({
      where: { id: 1 },
      data: {
        usedSpaces: { increment: 1 },
        availableSpaces: { decrement: 1 }
      }
    });

    if (updatedLot.usedSpaces > updatedLot.capacity || updatedLot.availableSpaces < 0) {
      throw new SpaceCountError();
    }

    return { record, lot: updatedLot };
  });

  return {
    message: '進場成功',
    record: formatRecord(result.record),
    available: result.lot.availableSpaces
  };
}

async function quoteExit({ plateNumber, operator, ipAddress, logMissing, discountCode }) {
  if (!plateNumber) {
    throw new BusinessError('請輸入車牌號碼', 400);
  }

  const record = await findActiveRecord(plateNumber);
  if (!record) {
    if (logMissing) {
      await logException({
        plateNumber,
        eventType: 'ILLEGAL_EXIT',
        description: '查無未出場紀錄，禁止出場。',
        operator,
        ipAddress
      });
    }
    throw new BusinessError('查無有效進場紀錄。', 404);
  }

  const blacklist = await getActiveBlacklist(plateNumber);
  if (blacklist) {
    await logException({
      plateNumber,
      eventType: 'BLACKLIST_EXIT',
      description: `黑名單車輛出場警告：${blacklist.reason}`,
      operator,
      ipAddress
    });
    throw new BusinessError('黑名單車輛出場警告，請通知管理員處理。', 403);
  }

  const rateSetting = await getRateSetting();
  const effectiveType = await resolveExitVehicleType(record);
  const quote = calculateFee(effectiveType, record.entryTime, new Date(), rateSetting);
  const discount = await calculateDiscount(discountCode, quote.fee);

  return {
    record: formatRecord({ ...record, vehicleType: effectiveType }),
    quote: {
      ...quote,
      originalFee: quote.fee,
      discountAmount: discount.amount,
      fee: Math.max(0, quote.fee - discount.amount),
      discountCode: discount.code,
      discountName: discount.name
    },
    rateSetting
  };
}

async function completeExitPayment({ plateNumber, operator, ipAddress, paymentMethod, discountCode }) {
  if (!plateNumber) {
    throw new BusinessError('請輸入車牌號碼', 400);
  }

  const record = await findActiveRecord(plateNumber);
  if (!record) {
    const completed = await prisma.parkingRecord.findFirst({
      where: { plateNumber, status: 'COMPLETED' },
      orderBy: { exitTime: 'desc' }
    });

    await logException({
      plateNumber,
      eventType: completed ? 'DUPLICATE_PAYMENT' : 'ILLEGAL_EXIT',
      description: completed ? '已完成結帳的紀錄再次嘗試付款。' : '查無未出場紀錄，禁止出場。',
      operator,
      ipAddress
    });

    throw new BusinessError(completed ? '此停車紀錄已完成結帳。' : '查無有效進場紀錄。', completed ? 409 : 404);
  }

  const blacklist = await getActiveBlacklist(plateNumber);
  if (blacklist) {
    await logException({
      plateNumber,
      eventType: 'BLACKLIST_EXIT',
      description: `黑名單車輛不得放行：${blacklist.reason}`,
      operator,
      ipAddress
    });
    throw new BusinessError('黑名單車輛出場警告，請通知管理員處理。', 403);
  }

  const exitTime = new Date();
  const rateSetting = await getRateSetting();
  const effectiveType = await resolveExitVehicleType(record);
  const quote = calculateFee(effectiveType, record.entryTime, exitTime, rateSetting);
  const discount = await calculateDiscount(discountCode, quote.fee);
  const finalFee = Math.max(0, quote.fee - discount.amount);

  const result = await prisma.$transaction(async (tx) => {
    const latest = await tx.parkingRecord.findUnique({
      where: { id: record.id },
      include: { payments: true }
    });

    if (!latest || latest.status !== 'IN_PARKING') {
      throw new BusinessError('此停車紀錄已完成結帳。', 409);
    }

    const payment = await tx.payment.create({
      data: {
        parkingRecordId: latest.id,
        plateNumber,
        amount: finalFee,
        originalAmount: quote.fee,
        discountAmount: discount.amount,
        discountCode: discount.code,
        status: 'PAID',
        paymentMethod
      }
    });

    const completed = await tx.parkingRecord.update({
      where: { id: latest.id },
      data: {
        vehicleType: effectiveType,
        exitTime,
        fee: finalFee,
        paid: true,
        status: 'COMPLETED'
      }
    });

    const updatedLot = await tx.parkingLot.update({
      where: { id: 1 },
      data: {
        usedSpaces: { decrement: 1 },
        availableSpaces: { increment: 1 }
      }
    });

    if (updatedLot.usedSpaces < 0 || updatedLot.availableSpaces > updatedLot.capacity) {
      throw new SpaceCountError();
    }

    return { completed, payment, lot: updatedLot };
  });

  return {
    message: finalFee > 0 ? '付款完成，出場成功' : '免費放行，出場成功',
    record: formatRecord(result.completed),
    payment: formatPayment(result.payment),
    quote: {
      ...quote,
      originalFee: quote.fee,
      discountAmount: discount.amount,
      fee: finalFee,
      discountCode: discount.code,
      discountName: discount.name
    },
    available: result.lot.availableSpaces
  };
}

async function getLot() {
  return prisma.parkingLot.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'MVP 停車場',
      capacity: 50,
      usedSpaces: 0,
      availableSpaces: 50
    }
  });
}

async function getRateSetting() {
  const setting = await prisma.rateSetting.findFirst({ orderBy: { id: 'desc' } });
  if (setting) return setting;

  return prisma.rateSetting.create({
    data: {
      freeMinutes: 30,
      hourlyRate: 40,
      dailyMaxFee: 300,
      exitGraceMinutes: 10
    }
  });
}

function findActiveRecord(plateNumber) {
  if (!plateNumber) return null;
  return prisma.parkingRecord.findFirst({ where: { plateNumber, status: 'IN_PARKING' } });
}

async function getActiveBlacklist(plateNumber) {
  if (!plateNumber) return null;
  return prisma.blacklist.findFirst({ where: { plateNumber, status: 'ACTIVE' } });
}

async function resolveEntryVehicleType(plateNumber, requestedType) {
  if (requestedType === 'VIP') return 'VIP';
  if (requestedType !== 'MONTHLY') return 'TEMPORARY';

  return (await findValidMonthlyCar(plateNumber, new Date())) ? 'MONTHLY' : 'TEMPORARY';
}

async function resolveExitVehicleType(record) {
  if (record.vehicleType === 'VIP') return 'VIP';
  if (record.vehicleType !== 'MONTHLY') return 'TEMPORARY';

  return (await findValidMonthlyCar(record.plateNumber, new Date())) ? 'MONTHLY' : 'TEMPORARY';
}

function findValidMonthlyCar(plateNumber, now) {
  return prisma.monthlyCar.findFirst({
    where: {
      plateNumber,
      status: 'ACTIVE',
      startDate: { lte: now },
      endDate: { gte: now }
    }
  });
}

function logException({ plateNumber, eventType, description, operator, ipAddress }) {
  return prisma.exceptionEvent.create({
    data: {
      plateNumber: plateNumber || null,
      eventType,
      description,
      operator: operator || 'system',
      ipAddress: ipAddress || 'unknown',
      status: 'OPEN'
    }
  });
}

function buildRecordWhere(query) {
  const where = {};
  if (query.plateNumber) where.plateNumber = { contains: normalizePlate(query.plateNumber) };
  if (query.status) where.status = String(query.status);
  if (query.vehicleType) where.vehicleType = String(query.vehicleType);
  if (query.from || query.to) {
    where.entryTime = {};
    if (query.from) where.entryTime.gte = parseInputDate(query.from);
    if (query.to) where.entryTime.lte = endOfDate(parseInputDate(query.to));
  }
  return where;
}

function buildPaymentWhere(query) {
  const where = {};
  if (query.plateNumber) where.plateNumber = { contains: normalizePlate(query.plateNumber) };
  if (query.from || query.to) {
    where.paidAt = {};
    if (query.from) where.paidAt.gte = parseInputDate(query.from);
    if (query.to) where.paidAt.lte = endOfDate(parseInputDate(query.to));
  }
  return where;
}

function groupSum(items, key) {
  return items.reduce((acc, item) => {
    const name = item[key] || 'UNKNOWN';
    acc[name] = (acc[name] || 0) + item.amount;
    return acc;
  }, {});
}

async function calculateDiscount(codeValue, amount) {
  const code = String(codeValue || '').trim().toUpperCase();
  if (!code || amount <= 0) return { amount: 0, code: null, name: null };

  const now = new Date();
  const discount = await prisma.discountCode.findFirst({
    where: {
      code,
      status: 'ACTIVE',
      startDate: { lte: now },
      endDate: { gte: now }
    }
  });

  if (!discount) {
    throw new BusinessError('優惠碼無效或已過期', 400);
  }

  const discountAmount = discount.discountType === 'PERCENT'
    ? Math.round(amount * Math.min(discount.discountValue, 100) / 100)
    : discount.discountValue;

  return {
    amount: Math.min(amount, discountAmount),
    code: discount.code,
    name: discount.name
  };
}

function buildSevenDayTrend(payments) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = daysAgo(6 - index);
    return date.toISOString().slice(0, 10);
  });
  const totals = Object.fromEntries(days.map((day) => [day, 0]));
  payments.forEach((payment) => {
    const key = payment.paidAt.toISOString().slice(0, 10);
    if (key in totals) totals[key] += payment.amount;
  });
  return days.map((day) => ({ date: day, amount: totals[day] }));
}

function logLprScan({ plateNumber, direction, confidence, resultStatus, message }) {
  return prisma.lprScan.create({
    data: { plateNumber, direction, confidence, resultStatus, message }
  });
}

function formatRecord(record) {
  return {
    ...record,
    vehicleTypeLabel: vehicleLabels[record.vehicleType] || record.vehicleType,
    entryTime: record.entryTime.toISOString(),
    exitTime: record.exitTime ? record.exitTime.toISOString() : null
  };
}

function formatPayment(payment) {
  return {
    ...payment,
    paidAt: payment.paidAt.toISOString(),
    createdAt: payment.createdAt.toISOString()
  };
}

function formatReservation(item) {
  return {
    ...item,
    statusLabel: reservationLabels[item.status] || item.status,
    startTime: item.startTime.toISOString(),
    endTime: item.endTime.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}

function formatDiscountCode(item) {
  return {
    ...item,
    startDate: item.startDate.toISOString().slice(0, 10),
    endDate: item.endDate.toISOString().slice(0, 10),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}

function formatLprScan(item) {
  return {
    ...item,
    createdAt: item.createdAt.toISOString()
  };
}

function formatBlacklist(item) {
  return {
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}

function formatMonthlyCar(item) {
  return {
    ...item,
    startDate: item.startDate.toISOString().slice(0, 10),
    endDate: item.endDate.toISOString().slice(0, 10),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}

function formatException(event) {
  return {
    ...event,
    eventTypeLabel: exceptionLabels[event.eventType] || event.eventType,
    occurredAt: event.occurredAt.toISOString(),
    handledAt: event.handledAt ? event.handledAt.toISOString() : null
  };
}

function normalizePlate(plateNumber = '') {
  return String(plateNumber).trim().toUpperCase();
}

function parseInputDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function endOfDate(date) {
  if (!date) return null;
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function daysAgo(count) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - count);
  return date;
}

function toPositiveInt(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : fallback;
}

function clampInt(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function randomConfidence() {
  return 88 + Math.floor(Math.random() * 11);
}

function csvEscape(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function getIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';
}

function securityHeaders(_req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
}

const loginAttempts = new Map();

function loginRateLimit(req, res, next) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const limit = 20;
  const key = getIp(req);
  const current = loginAttempts.get(key) || { count: 0, resetAt: now + windowMs };

  if (current.resetAt <= now) {
    current.count = 0;
    current.resetAt = now + windowMs;
  }

  current.count += 1;
  loginAttempts.set(key, current);

  if (current.count > limit) {
    return res.status(429).json({ message: '登入嘗試過於頻繁，請稍後再試' });
  }

  return next();
}

class BusinessError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

class SpaceCountError extends Error {}
