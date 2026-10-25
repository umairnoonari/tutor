const { Schema, model } = require('mongoose');
module.exports = model('User', new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['tutor', 'student'], required: true },
  tutor: { type: Schema.Types.ObjectId, ref: 'User' }, // set for students
}, { timestamps: true }));
