const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const list = await prisma.blacklist.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { plateNumber, reason } = req.body;

    if (!plateNumber || !reason) {
      return res.status(400).json({ error: '請填寫車牌號碼和原因' });
    }

    const existing = await prisma.blacklist.findUnique({
      where: { plateNumber: plateNumber.toUpperCase() },
    });

    if (existing) {
      return res.status(400).json({ error: '此車牌已存在黑名單' });
    }

    const entry = await prisma.blacklist.create({
      data: {
        plateNumber: plateNumber.toUpperCase(),
        reason,
        status: 'active',
      },
    });

    res.json(entry);
  } catch (error) {
    console.error('Blacklist create error:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, status } = req.body;

    const entry = await prisma.blacklist.update({
      where: { id: parseInt(id) },
      data: {
        ...(reason && { reason }),
        ...(status && { status }),
      },
    });

    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.blacklist.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;
