const router = require('express').Router();
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const User = require('../models/User');
const { auth, only } = require('../middleware/auth');
router.use(auth);

// Tutor: own quizzes (with answers). Student: tutor's quizzes (no answers) + attempted flag.
router.get('/', async (req, res) => {
  if (req.user.role === 'tutor') return res.json(await Quiz.find({ tutor: req.user.id }).sort('-createdAt'));
  const me = await User.findById(req.user.id);
  const quizzes = await Quiz.find({ tutor: me.tutor }).sort('-createdAt').lean();
  const done = new Set((await Result.find({ student: me._id })).map((r) => r.quiz.toString()));
  res.json(quizzes.map((q) => ({
    _id: q._id, title: q.title, done: done.has(q._id.toString()),
    questions: q.questions.map(({ text, options }) => ({ text, options })),
  })));
});

router.post('/', only('tutor'), async (req, res) => {
  const { title, questions } = req.body;
  const ok = title && Array.isArray(questions) && questions.length &&
    questions.every((q) => q.text && q.options?.length >= 2 && q.options.every(Boolean) && q.correctIndex >= 0 && q.correctIndex < q.options.length);
  if (!ok) return res.status(400).json({ message: 'Quiz needs a title and complete questions' });
  res.json(await Quiz.create({ tutor: req.user.id, title, questions }));
});

router.delete('/:id', only('tutor'), async (req, res) => {
  await Quiz.deleteOne({ _id: req.params.id, tutor: req.user.id });
  await Result.deleteMany({ quiz: req.params.id, tutor: req.user.id });
  res.json({ ok: true });
});

module.exports = router;
