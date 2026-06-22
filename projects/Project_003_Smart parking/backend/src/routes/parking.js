const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { calculateFee } = require('../utils/billing');

const router = express.Router();
const prisma = new PrismaClient();

async function getRateSettings() {
  let settings = await prisma.rateSetting.findFirst();
  if (!settings) {
    settings = await prisma.rateSetting.create({
      data: {
        freeMinutes: 30,
        hourlyRate: 40,
        dailyMaxFee: 300,
        exitGraceMinutes: 15,
      },
    });
  }
  return settings;
}

async function getParkingLot() {
  let lot = await prisma.parkingLotSetting.findFirst();
  if (!lot) {
    lot = await prisma.parkingLotSetting.create({
      data: { lotName: '1號停車場', totalSpaces: 100, usedSpaces: 0 },
    });
  }
  return lot;
}

async function logEvent(plateNumber, eventType, description, operator, req) {
  try {
    await prisma.eventLog.create({
      data: {
        plateNumber,
        eventType,
        description,
        operator,
        ipAddress: req.ip,
      },
    });
  } catch (err) {
    console.error('Event log error:', err);
  }
}

router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const lot = await prisma.parkingLotSetting.findFirst();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayEntries, todayExits, todayRevenue, parkedVehicles] = await Promise.all([
      prisma.parkingRecord.count({
        where: { entryTime: { gte: today, lt: tomorrow } },
      }),
      prisma.parkingRecord.count({
        where: {
          exitTime: { gte: today, lt: tomorrow },
          status: 'exited',
        },
      }),
      prisma.payment.aggregate({
        where: {
          paidAt: { gte: today, lt: tomorrow },
          status: 'completed',
        },
        _sum: { amount: true },
      }),
      prisma.parkingRecord.findMany({
        where: { status: 'parked' },
        orderBy: { entryTime: 'desc' },
        select: {
          id: true,
          plateNumber: true,
          vehicleType: true,
          entryTime: true,
          feeAmount: true,
          paymentStatus: true,
        },
      }),
    ]);

    res.json({
      totalSpaces: lot.totalSpaces,
      usedSpaces: lot.usedSpaces,
      availableSpaces: lot.totalSpaces - lot.usedSpaces,
      todayEntries,
      todayExits,
      todayRevenue: todayRevenue._sum.amount || 0,
      parkedVehicles,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

router.post('/entry', authenticateToken, async (req, res) => {
  try {
    const { plateNumber, vehicleType = 'temporary' } = req.body;

    if (!plateNumber) {
      return res.status(400).json({ error: '請輸入車牌號碼' });
    }

    if (!['temporary', 'monthly', 'vip'].includes(vehicleType)) {
      return res.status(400).json({ error: '無效的車輛類型' });
    }

    const normalizedPlate = plateNumber.toUpperCase().replace(/\s/g, '');

    const blacklisted = await prisma.blacklist.findFirst({
      where: { plateNumber: normalizedPlate, status: 'active' },
    });

    if (blacklisted) {
      await logEvent(normalizedPlate, 'blacklist_entry', `黑名單車輛 ${normalizedPlate} 嘗試進場`, req.user.username, req);
      return res.status(403).json({ error: `黑名單車輛：${blacklisted.reason}` });
    }

    const parked = await prisma.parkingRecord.findFirst({
      where: { plateNumber: normalizedPlate, status: 'parked' },
    });

    if (parked) {
      await logEvent(normalizedPlate, 'duplicate_entry', `車輛 ${normalizedPlate} 重複進場`, req.user.username, req);
      return res.status(400).json({ error: '此車輛目前已在停車場內，無法重複進場。' });
    }

    const lot = await prisma.parkingLotSetting.findFirst();
    if (lot.usedSpaces >= lot.totalSpaces) {
      return res.status(400).json({ error: '停車場已滿，暫停進場。' });
    }

    let monthlyCar = null;
    if (vehicleType === 'monthly') {
      monthlyCar = await prisma.monthlyCar.findFirst({
        where: { plateNumber: normalizedPlate, status: 'active' },
      });
      if (!monthlyCar) {
        return res.status(400).json({ error: '此車輛無月租紀錄或月租已過期' });
      }
      if (new Date() > new Date(monthlyCar.endDate)) {
        return res.status(400).json({ error: '月租已過期，請續約後進場' });
      }
    }

    const paymentStatus = (vehicleType === 'vip' || (vehicleType === 'monthly' && monthlyCar)) ? 'free' : 'unpaid';

    const [record] = await Promise.all([
      prisma.parkingRecord.create({
        data: {
          plateNumber: normalizedPlate,
          vehicleType,
          entryTime: new Date(),
          status: 'parked',
          paymentStatus,
        },
      }),
      prisma.parkingLotSetting.update({
        where: { id: lot.id },
        data: { usedSpaces: { increment: 1 } },
      }),
    ]);

    const updatedLot = await prisma.parkingLotSetting.findFirst();

    res.json({
      success: true,
      message: `車輛 ${normalizedPlate} 進場成功`,
      record,
      availableSpaces: updatedLot.totalSpaces - updatedLot.usedSpaces,
    });
  } catch (error) {
    console.error('Entry error:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

router.post('/exit/calculate', authenticateToken, async (req, res) => {
  try {
    const { plateNumber } = req.body;

    if (!plateNumber) {
      return res.status(400).json({ error: '請輸入車牌號碼' });
    }

    const normalizedPlate = plateNumber.toUpperCase().replace(/\s/g, '');

    const record = await prisma.parkingRecord.findFirst({
      where: { plateNumber: normalizedPlate, status: 'parked' },
    });

    if (!record) {
      return res.status(400).json({ error: '查無有效進場紀錄。' });
    }

    const rateSettings = await getRateSettings();

    let monthlyCar = null;
    if (record.vehicleType === 'monthly') {
      monthlyCar = await prisma.monthlyCar.findFirst({
        where: { plateNumber: normalizedPlate, status: 'active' },
      });
    }

    const now = new Date();
    const fee = calculateFee(
      new Date(record.entryTime),
      now,
      record.vehicleType,
      rateSettings,
      monthlyCar
    );

    const diffMs = now - new Date(record.entryTime);
    const totalMinutes = Math.ceil(diffMs / (1000 * 60));

    res.json({
      record,
      calculatedFee: fee,
      totalMinutes,
      monthlyCar,
      isMonthlyActive: monthlyCar ? new Date() <= new Date(monthlyCar.endDate) : false,
    });
  } catch (error) {
    console.error('Exit calculate error:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

router.post('/exit/confirm', authenticateToken, async (req, res) => {
  try {
    const { plateNumber, paymentMethod = 'cash' } = req.body;

    if (!plateNumber) {
      return res.status(400).json({ error: '請輸入車牌號碼' });
    }

    const normalizedPlate = plateNumber.toUpperCase().replace(/\s/g, '');

    const record = await prisma.parkingRecord.findFirst({
      where: { plateNumber: normalizedPlate, status: 'parked' },
    });

    if (!record) {
      return res.status(400).json({ error: '查無有效進場紀錄。' });
    }

    if (record.paymentStatus === 'paid') {
      await logEvent(normalizedPlate, 'duplicate_payment', `車輛 ${normalizedPlate} 重複結帳`, req.user.username, req);
      return res.status(400).json({ error: '此停車紀錄已完成結帳。' });
    }

    const blacklisted = await prisma.blacklist.findFirst({
      where: { plateNumber: normalizedPlate, status: 'active' },
    });

    if (blacklisted) {
      await logEvent(normalizedPlate, 'blacklist_exit', `黑名單車輛 ${normalizedPlate} 出場`, req.user.username, req);
    }

    const rateSettings = await getRateSettings();

    let monthlyCar = null;
    if (record.vehicleType === 'monthly') {
      monthlyCar = await prisma.monthlyCar.findFirst({
        where: { plateNumber: normalizedPlate, status: 'active' },
      });
    }

    const now = new Date();
    const fee = calculateFee(
      new Date(record.entryTime),
      now,
      record.vehicleType,
      rateSettings,
      monthlyCar
    );

    const diffMs = now - new Date(record.entryTime);
    const totalMinutes = Math.ceil(diffMs / (1000 * 60));

    const lot = await prisma.parkingLotSetting.findFirst();

    const updateData = {
      exitTime: now,
      parkingMinutes: totalMinutes,
      feeAmount: fee,
      paymentStatus: fee === 0 ? 'free' : 'paid',
      paymentMethod,
      status: 'exited',
    };

    await prisma.parkingRecord.update({
      where: { id: record.id },
      data: updateData,
    });

    if (fee > 0) {
      await prisma.payment.create({
        data: {
          parkingRecordId: record.id,
          plateNumber: normalizedPlate,
          amount: fee,
          paymentMethod,
          paidAt: now,
          status: 'completed',
        },
      });
    }

    await prisma.parkingLotSetting.update({
      where: { id: lot.id },
      data: { usedSpaces: { decrement: 1 } },
    });

    const updatedLot = await prisma.parkingLotSetting.findFirst();

    res.json({
      success: true,
      message: `車輛 ${normalizedPlate} 出場成功`,
      fee,
      paymentMethod,
      warning: blacklisted ? '此車輛為黑名單車輛，請留意。' : null,
      availableSpaces: updatedLot.totalSpaces - updatedLot.usedSpaces,
    });
  } catch (error) {
    console.error('Exit confirm error:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;
