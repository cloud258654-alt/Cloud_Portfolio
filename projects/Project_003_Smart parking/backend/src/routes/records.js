const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      plateNumber,
      dateFrom,
      dateTo,
      paymentStatus,
      status,
      page = 1,
      limit = 20,
    } = req.query;

    const where = {};

    if (plateNumber) {
      where.plateNumber = { contains: plateNumber.toUpperCase() };
    }

    if (dateFrom || dateTo) {
      where.entryTime = {};
      if (dateFrom) where.entryTime.gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setDate(toDate.getDate() + 1);
        where.entryTime.lt = toDate;
      }
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [records, total] = await Promise.all([
      prisma.parkingRecord.findMany({
        where,
        orderBy: { entryTime: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.parkingRecord.count({ where }),
    ]);

    res.json({
      records,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Records error:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const record = await prisma.parkingRecord.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { payments: true },
    });

    if (!record) {
      return res.status(404).json({ error: '找不到此紀錄' });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;
