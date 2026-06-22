const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  try {
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
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

router.put('/', authenticateToken, async (req, res) => {
  try {
    const { freeMinutes, hourlyRate, dailyMaxFee, exitGraceMinutes } = req.body;

    let settings = await prisma.rateSetting.findFirst();

    if (settings) {
      settings = await prisma.rateSetting.update({
        where: { id: settings.id },
        data: {
          ...(freeMinutes !== undefined && { freeMinutes: parseInt(freeMinutes) }),
          ...(hourlyRate !== undefined && { hourlyRate: parseInt(hourlyRate) }),
          ...(dailyMaxFee !== undefined && { dailyMaxFee: parseInt(dailyMaxFee) }),
          ...(exitGraceMinutes !== undefined && { exitGraceMinutes: parseInt(exitGraceMinutes) }),
        },
      });
    } else {
      const num = (val, def) => val !== undefined ? parseInt(val) : def;
      settings = await prisma.rateSetting.create({
        data: {
          freeMinutes: num(freeMinutes, 30),
          hourlyRate: num(hourlyRate, 40),
          dailyMaxFee: num(dailyMaxFee, 300),
          exitGraceMinutes: num(exitGraceMinutes, 15),
        },
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Rate update error:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;
