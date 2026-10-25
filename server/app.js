const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
require('express-async-errors');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Reuse one DB connection between serverless invocations
async function connect() {
  if (mongoose.connection.readyState === 1) return;
  if (!global._mongoP) global._mongoP = mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  await global._mongoP;
}

app.use('/api', async (req, res, next) => {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET_KEY)
    return res.status(500).json({ message: 'Server settings missing: set MONGODB_URI and JWT_SECRET_KEY' });
  try { await connect(); next(); }
  catch (e) { console.error('DB error:', e.message); global._mongoP = null; res.status(500).json({ message: 'Database connection failed' }); }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/results', require('./routes/results'));
app.use('/api/messages', require('./routes/messages'));

app.use('/api', (err, req, res, next) => { console.error(err); res.status(500).json({ message: 'Server error' }); });

module.exports = app;
