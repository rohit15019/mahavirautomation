const mongoose = require('mongoose');
const { getNextSequenceValue } = require('./counter.model');

const CategorySchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  parentId: { type: Number, default: null },
  categoryType: { type: String, enum: ['Product', 'Service'], default: 'Product' }
});

CategorySchema.pre('save', async function (next) {
  if (this.isNew) {
    this.id = await getNextSequenceValue('categoryId');
  }
  next();
});

const Category = mongoose.model('Category', CategorySchema);
module.exports = Category;
