const { Schema, model } = require('mongoose');
module.exports = model('Result', new Schema({
  quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tutor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  score: Number,
  total: Number,
  answers: [Number],
}, { timestamps: true }));
