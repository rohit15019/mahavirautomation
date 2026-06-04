const mongoose = require('mongoose');
const { getNextSequenceValue } = require('./counter.model');

const DownloadSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true }, // in bytes
  filePath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

DownloadSchema.pre('save', async function (next) {
  if (this.isNew) {
    this.id = await getNextSequenceValue('downloadId');
  }
  next();
});

const Download = mongoose.model('Download', DownloadSchema);
module.exports = Download;
