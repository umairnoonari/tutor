const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const pub = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role });
const sign = (u) => jwt.sign({ id: u._id.toString(), role: u.role }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

router.post('/register-tutor', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ message: 'Name, email and a password of 6+ characters are required' });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email already in use' });
  const u = await User.create({ name, email, password: await bcrypt.hash(password, 10), role: 'tutor' });
  res.json({ token: sign(u), user: pub(u) });
});

router.post('/login', async (req, res) => {
  const u = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!u || !(await bcrypt.compare(req.body.password || '', u.password)))
    return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ token: sign(u), user: pub(u) });
});

router.get('/me', auth, async (req, res) => {
  const u = await User.findById(req.user.id);
  if (!u) return res.status(401).json({ message: 'User not found' });
  res.json(pub(u));
});

module.exports = router;
