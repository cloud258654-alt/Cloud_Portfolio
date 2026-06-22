const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '請輸入帳號和密碼' });
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return res.status(401).json({ error: '帳號或密碼錯誤' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return res.status(401).json({ error: '帳號或密碼錯誤' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

router.get('/me', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, role: true },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;
