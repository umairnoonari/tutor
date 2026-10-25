const jwt = require('jsonwebtoken');
exports.auth = (req, res, next) => {
  const h = req.headers.authorization || '';
  try {
    req.user = jwt.verify(h.replace('Bearer ', ''), process.env.JWT_SECRET_KEY);
    next();
  } catch { res.status(401).json({ message: 'Not authenticated' }); }
};
exports.only = (role) => (req, res, next) =>
  req.user.role === role ? next() : res.status(403).json({ message: 'Forbidden' });
