const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Product = require('../models/product.model');
const upload = require('../middleware/upload.middleware');
const { authenticateUser, authorizeAdmin } = require('../middleware/auth.middleware');

// Helper to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// @route   GET /api/v1.0/Product
// @desc    Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/v1.0/Product/add
// @desc    Create new product with optional image upload
router.post('/add', authenticateUser, authorizeAdmin, upload.single('imageFile'), async (req, res) => {
  try {
    const { title, description, price, categoryId, features } = req.body;

    if (!title || !description || !price || !categoryId) {
      return res.status(400).json({ message: 'Title, description, price, and category are required.' });
    }

    // Parse features if it's sent as a JSON string
    let parsedFeatures = [];
    if (features) {
      try {
        parsedFeatures = JSON.parse(features);
      } catch (e) {
        parsedFeatures = features.split('\n').map(f => f.trim()).filter(Boolean);
      }
    }

    let imageKey = '';
    if (req.file) {
      imageKey = `/uploads/images/${req.file.filename}`;
    }

    const product = new Product({
      title,
      description,
      price: parseFloat(price),
      categoryId: parseInt(categoryId),
      features: parsedFeatures,
      imageKey
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/v1.0/Product/:id
// @desc    Update product details and optional image
router.put('/:id', authenticateUser, authorizeAdmin, upload.single('imageFile'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, categoryId, features, detailedFeatures, imageKey: existingImageKey, filesMetadata } = req.body;

    const product = await Product.findOne({ id: parseInt(id) });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (categoryId) product.categoryId = parseInt(categoryId);

    // Update features if present
    if (features) {
      try {
        product.features = JSON.parse(features);
      } catch (e) {
        product.features = features.split('\n').map(f => f.trim()).filter(Boolean);
      }
    }

    // Update detailed features if present
    if (detailedFeatures) {
      try {
        product.detailedFeatures = JSON.parse(detailedFeatures);
      } catch (e) {
        console.error("Error parsing detailed features:", e.message);
      }
    }

    // Update files metadata if present
    if (filesMetadata) {
      try {
        product.filesMetadata = JSON.parse(filesMetadata);
      } catch (e) {
        console.error("Error parsing files metadata:", e.message);
      }
    }

    // Handle new image upload or cleanup
    if (req.file) {
      // Remove old image if exists
      if (product.imageKey && product.imageKey.startsWith('/uploads/')) {
        const oldImagePath = path.join(__dirname, '..', product.imageKey);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      product.imageKey = `/uploads/images/${req.file.filename}`;
    } else if (existingImageKey === '') {
      // Clear image
      product.imageKey = '';
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/v1.0/Product/:id
// @desc    Delete a product and its images/files
router.delete('/:id', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ id: parseInt(id) });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Clean up product image file
    if (product.imageKey && product.imageKey.startsWith('/uploads/')) {
      const imgPath = path.join(__dirname, '..', product.imageKey);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    // Clean up product attached files
    if (product.filesMetadata && product.filesMetadata.length > 0) {
      product.filesMetadata.forEach(file => {
        if (file.filePath && file.filePath.startsWith('/uploads/')) {
          const docPath = path.join(__dirname, '..', file.filePath);
          if (fs.existsSync(docPath)) {
            fs.unlinkSync(docPath);
          }
        }
      });
    }

    await Product.deleteOne({ id: parseInt(id) });
    res.json({ message: 'Product and all associated files deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/v1.0/Product/:productId/upload-file
// @desc    Upload product document resource (PDF, ZIP)
router.post('/:productId/upload-file', authenticateUser, authorizeAdmin, upload.single('file'), async (req, res) => {
  try {
    const { productId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF or ZIP file.' });
    }

    const product = await Product.findOne({ id: parseInt(productId) });
    if (!product) {
      // Remove uploaded file if product not found
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Product not found.' });
    }

    const newFileMetadata = {
      fileName: req.file.originalname,
      fileSize: formatFileSize(req.file.size),
      filePath: `/uploads/documents/${req.file.filename}`,
      lastUpdated: new Date().toLocaleDateString()
    };

    product.filesMetadata.push(newFileMetadata);
    await product.save();

    res.status(200).json({ message: 'File uploaded successfully!', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/v1.0/Product/:productId/delete-file
// @desc    Delete product document resource
router.delete('/:productId/delete-file', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const { filePath } = req.query;

    if (!filePath) {
      return res.status(400).json({ message: 'File path query parameter is required.' });
    }

    const product = await Product.findOne({ id: parseInt(productId) });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Check if file metadata exists in list
    const fileIndex = product.filesMetadata.findIndex(f => f.filePath === filePath);
    if (fileIndex === -1) {
      return res.status(404).json({ message: 'File not associated with this product.' });
    }

    // Delete actual physical file
    const absolutePath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    // Remove from array
    product.filesMetadata.splice(fileIndex, 1);
    await product.save();

    res.json({ message: 'File deleted successfully!', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/v1.0/Product/:productId/download-file
// @desc    Stream product resource file download
router.get('/:productId/download-file', async (req, res) => {
  try {
    const { filePath } = req.query;

    if (!filePath) {
      return res.status(400).json({ message: 'File path query parameter is required.' });
    }

    const absolutePath = path.join(__dirname, '..', filePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'File does not exist or has been removed.' });
    }

    // Verify it is inside our uploads/documents directory to prevent directory traversal
    const normalizedBase = path.normalize(path.join(__dirname, '../uploads/documents'));
    const normalizedFile = path.normalize(absolutePath);

    if (!normalizedFile.startsWith(normalizedBase)) {
      return res.status(403).json({ message: 'Access denied. Security violation.' });
    }

    res.download(absolutePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
