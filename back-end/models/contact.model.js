const mongoose = require('mongoose');
const { getNextSequenceValue } = require('./counter.model');

const ContactMessageSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  inquiryType: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Resolved'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

ContactMessageSchema.pre('save', async function (next) {
  if (this.isNew) {
    this.id = await getNextSequenceValue('contactMessageId');
  }
  next();
});

const ContactMessage = mongoose.model('ContactMessage', ContactMessageSchema);
module.exports = ContactMessage;
