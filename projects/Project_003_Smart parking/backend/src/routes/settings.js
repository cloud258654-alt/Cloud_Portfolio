const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  try {
    let settings = await prisma.parkingLotSetting.findFirst();
    if (!settings) {
      settings = await prisma.parkingLotSetting.create({
        data: { lotName: '1號停車場', totalSpaces: 100, usedSpaces: 0 },
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

router.put('/', authenticateToken, async (req, res) => {
  try {
    const { lotName, totalSpaces } = req.body;

    let settings = await prisma.parkingLotSetting.findFirst();

    if (settings) {
      settings = await prisma.parkingLotSetting.update({
        where: { id: settings.id },
        data: {
          ...(lotName && { lotName }),
          ...(totalSpaces !== undefined && { totalSpaces: parseInt(totalSpaces) }),
        },
      });
    } else {
      settings = await prisma.parkingLotSetting.create({
        data: {
          lotName: lotName || '1號停車場',
          totalSpaces: totalSpaces !== undefined ? parseInt(totalSpaces) : 100,
          usedSpaces: 0,
        },
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;
