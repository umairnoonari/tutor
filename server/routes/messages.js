const router = require('express').Router();
const User = require('../models/User');
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

async function canChat(aId, bId) {
  const [a, b] = await Promise.all([User.findById(aId), User.findById(bId)]);
  if (!a || !b) return false;
  return (a.role === 'tutor' && b.role === 'student' && String(b.tutor) === String(a._id)) ||
         (b.role === 'tutor' && a.role === 'student' && String(a.tutor) === String(b._id));
}

router.get('/contacts', auth, async (req, res) => {
  if (req.user.role === 'tutor')
    return res.json(await User.find({ tutor: req.user.id }).select('name email').sort('name'));
  const me = await User.findById(req.user.id);
  res.json(await User.find({ _id: me.tutor }).select('name email'));
});

router.get('/:userId', auth, async (req, res) => {
  if (!(await canChat(req.user.id, req.params.userId))) return res.status(403).json({ message: 'Forbidden' });
  res.json(await Message.find({
    $or: [{ from: req.user.id, to: req.params.userId }, { from: req.params.userId, to: req.user.id }],
  }).sort('createdAt').limit(500));
});

router.post('/:userId', auth, async (req, res) => {
  const text = (req.body.text || '').trim().slice(0, 2000);
  if (!text) return res.status(400).json({ message: 'Empty message' });
  if (!(await canChat(req.user.id, req.params.userId))) return res.status(403).json({ message: 'Forbidden' });
  res.json(await Message.create({ from: req.user.id, to: req.params.userId, text }));
});

module.exports = router;
module.exports.canChat = canChat;
