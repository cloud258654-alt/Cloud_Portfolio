const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const parkingRoutes = require('./routes/parking');
const recordsRoutes = require('./routes/records');
const monthlyRoutes = require('./routes/monthly');
const blacklistRoutes = require('./routes/blacklist');
const ratesRoutes = require('./routes/rates');
const reportsRoutes = require('./routes/reports');
const settingsRoutes = require('./routes/settings');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/records', authenticateToken, recordsRoutes);
app.use('/api/monthly', authenticateToken, monthlyRoutes);
app.use('/api/blacklist', authenticateToken, blacklistRoutes);
app.use('/api/rates', authenticateToken, ratesRoutes);
app.use('/api/reports', authenticateToken, reportsRoutes);
app.use('/api/settings', authenticateToken, settingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(express.static(path.join(__dirname, '../../frontend/dist')));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Smart Parking API server running on http://localhost:${PORT}`);
});
