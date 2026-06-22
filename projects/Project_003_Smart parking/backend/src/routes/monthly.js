const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const cars = await prisma.monthlyCar.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { plateNumber, ownerName, phone, startDate, endDate } = req.body;

    if (!plateNumber || !ownerName || !startDate || !endDate) {
      return res.status(400).json({ error: '請填寫所有必填欄位' });
    }

    const existing = await prisma.monthlyCar.findUnique({
      where: { plateNumber: plateNumber.toUpperCase() },
    });

    if (existing) {
      return res.status(400).json({ error: '此車牌已存在月租紀錄' });
    }

    const car = await prisma.monthlyCar.create({
      data: {
        plateNumber: plateNumber.toUpperCase(),
        ownerName,
        phone: phone || '',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'active',
      },
    });

    res.json(car);
  } catch (error) {
    console.error('Monthly create error:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerName, phone, startDate, endDate, status } = req.body;

    const car = await prisma.monthlyCar.update({
      where: { id: parseInt(id) },
      data: {
        ...(ownerName !== undefined && { ownerName }),
        ...(phone !== undefined && { phone }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(status && { status }),
      },
    });

    res.json(car);
  } catch (error) {
    console.error('Monthly update error:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.monthlyCar.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;
