const express = require('express');
const router = express.Router();
const Category = require('../models/category.model');
const { authenticateUser, authorizeAdmin } = require('../middleware/auth.middleware');

// @route   GET /api/v1.0/category or /api/category
// @desc    Get categories, optionally filtered by type (Product / Service)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const filter = {};
    if (type) {
      filter.categoryType = type;
    }
    
    const categories = await Category.find(filter);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/v1.0/category/add or /api/category/add
// @desc    Add a new category
router.post('/add', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { name, parentId, categoryType } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const category = new Category({
      name,
      parentId: parentId ? parseInt(parentId) : null,
      categoryType: categoryType || 'Product'
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/v1.0/category/:id or /api/category/:id
// @desc    Update an existing category
router.put('/:id', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId, categoryType } = req.body;

    const category = await Category.findOne({ id: parseInt(id) });
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    if (name) category.name = name;
    if (parentId !== undefined) category.parentId = parentId ? parseInt(parentId) : null;
    if (categoryType) category.categoryType = categoryType;

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/v1.0/category/:id or /api/category/:id
// @desc    Delete a category and its children recursively
router.delete('/:id', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const catId = parseInt(id);

    const category = await Category.findOne({ id: catId });
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    // Recursive helper to get all child category IDs
    const getChildIds = async (parentIds) => {
      const children = await Category.find({ parentId: { $in: parentIds } });
      if (children.length === 0) return [];
      const childIds = children.map(c => c.id);
      const subChildIds = await getChildIds(childIds);
      return [...childIds, ...subChildIds];
    };

    const allIdsToDelete = [catId, ...(await getChildIds([catId]))];

    // Delete all categories in the hierarchy
    await Category.deleteMany({ id: { $in: allIdsToDelete } });

    res.json({ message: 'Category and all its subcategories deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
