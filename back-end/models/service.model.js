const mongoose = require('mongoose');
const { getNextSequenceValue } = require('./counter.model');

const DetailedFeatureSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' }
}, { _id: false });

const FileMetadataSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileSize: { type: String, required: true },
  filePath: { type: String, required: true },
  lastUpdated: { type: String, default: () => new Date().toLocaleDateString() }
}, { _id: false });

const ServiceSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  iconName: { type: String, default: 'Settings' },
  features: { type: [String], default: [] },
  detailedFeatures: { type: [DetailedFeatureSchema], default: [] },
  categoryId: { type: Number, required: true },
  filesMetadata: { type: [FileMetadataSchema], default: [] }
});

ServiceSchema.pre('save', async function (next) {
  if (this.isNew) {
    this.id = await getNextSequenceValue('serviceId');
  }
  next();
});

const Service = mongoose.model('Service', ServiceSchema);
module.exports = Service;
