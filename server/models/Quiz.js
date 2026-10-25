const { Schema, model } = require('mongoose');
module.exports = model('Quiz', new Schema({
  tutor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  questions: [{ text: String, options: [String], correctIndex: Number }],
}, { timestamps: true }));
