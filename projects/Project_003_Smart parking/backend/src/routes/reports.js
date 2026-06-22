const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      todayRevenue,
      monthRevenue,
      todayEntries,
      monthEntries,
      avgParkingTime,
      topPlate,
      paymentStats,
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: { paidAt: { gte: today, lt: tomorrow }, status: 'completed' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { paidAt: { gte: monthStart }, status: 'completed' },
        _sum: { amount: true },
      }),
      prisma.parkingRecord.count({
        where: { entryTime: { gte: today, lt: tomorrow } },
      }),
      prisma.parkingRecord.count({
        where: { entryTime: { gte: monthStart } },
      }),
      prisma.parkingRecord.aggregate({
        where: { status: 'exited' },
        _avg: { parkingMinutes: true },
      }),
      prisma.parkingRecord.groupBy({
        by: ['plateNumber'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 1,
      }),
      prisma.payment.groupBy({
        by: ['paymentMethod'],
        _count: true,
        _sum: { amount: true },
      }),
    ]);

    res.json({
      todayRevenue: todayRevenue._sum.amount || 0,
      monthRevenue: monthRevenue._sum.amount || 0,
      todayEntries,
      monthEntries,
      avgParkingMinutes: Math.round(avgParkingTime._avg.parkingMinutes || 0),
      mostFrequentPlate: topPlate[0]?.plateNumber || '-',
      paymentStats: paymentStats.map((s) => ({
        method: s.paymentMethod,
        count: s._count,
        total: s._sum.amount,
      })),
    });
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

router.get('/events', authenticateToken, async (req, res) => {
  try {
    const events = await prisma.eventLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;
