const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { auth, only } = require('../middleware/auth');
router.use(auth, only('tutor'));

router.get('/', async (req, res) => {
  res.json(await User.find({ tutor: req.user.id, role: 'student' }).select('name email createdAt').sort('name'));
});

router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ message: 'Name, email and a password of 6+ characters are required' });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email already in use' });
  const s = await User.create({ name, email, password: await bcrypt.hash(password, 10), role: 'student', tutor: req.user.id });
  res.json({ _id: s._id, name: s.name, email: s.email });
});

router.delete('/:id', async (req, res) => {
  await User.deleteOne({ _id: req.params.id, tutor: req.user.id });
  res.json({ ok: true });
});

module.exports = router;
