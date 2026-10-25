const router = require('express').Router();
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const User = require('../models/User');
const { auth, only } = require('../middleware/auth');
router.use(auth);

router.get('/', async (req, res) => {
  const filter = req.user.role === 'tutor' ? { tutor: req.user.id } : { student: req.user.id };
  res.json(await Result.find(filter).populate('quiz', 'title').populate('student', 'name email').sort('-createdAt'));
});

router.post('/', only('student'), async (req, res) => {
  const me = await User.findById(req.user.id);
  const quiz = await Quiz.findOne({ _id: req.body.quizId, tutor: me.tutor });
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  if (await Result.findOne({ quiz: quiz._id, student: me._id }))
    return res.status(409).json({ message: 'You already submitted this quiz' });
  const answers = quiz.questions.map((_, i) => Number(req.body.answers?.[i] ?? -1));
  const score = quiz.questions.filter((q, i) => q.correctIndex === answers[i]).length;
  const r = await Result.create({ quiz: quiz._id, student: me._id, tutor: me.tutor, score, total: quiz.questions.length, answers });
  res.json({ score: r.score, total: r.total });
});

module.exports = router;
