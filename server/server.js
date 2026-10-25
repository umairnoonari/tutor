// Local development only. On Vercel, api/index.js is used instead.
const app = require('./app');
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET_KEY)
  console.warn('Warning: set MONGODB_URI and JWT_SECRET_KEY in server/.env');
const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Server running on http://localhost:' + port));
