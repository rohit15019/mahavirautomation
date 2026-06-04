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

const ProductSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageKey: { type: String, default: '' },
  price: { type: Number, required: true },
  features: { type: [String], default: [] },
  detailedFeatures: { type: [DetailedFeatureSchema], default: [] },
  categoryId: { type: Number, required: true },
  filesMetadata: { type: [FileMetadataSchema], default: [] }
});

ProductSchema.pre('save', async function (next) {
  if (this.isNew) {
    this.id = await getNextSequenceValue('productId');
  }
  next();
});

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
