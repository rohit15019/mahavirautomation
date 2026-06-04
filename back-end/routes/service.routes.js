const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Service = require('../models/service.model');
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

// @route   GET /api/v1.0/Services
// @desc    Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/v1.0/Services/add
// @desc    Create new service
router.post('/add', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { title, description, iconName, features, categoryId } = req.body;

    if (!title || !description || !categoryId) {
      return res.status(400).json({ message: 'Title, description, and category are required.' });
    }

    const service = new Service({
      title,
      description,
      iconName: iconName || 'Settings',
      categoryId: parseInt(categoryId),
      features: Array.isArray(features) ? features : []
    });

    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/v1.0/Services/:id
// @desc    Update service details
router.put('/:id', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, iconName, features, categoryId, detailedFeatures, filesMetadata } = req.body;

    const service = await Service.findOne({ id: parseInt(id) });
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    if (title) service.title = title;
    if (description) service.description = description;
    if (iconName) service.iconName = iconName;
    if (categoryId) service.categoryId = parseInt(categoryId);
    if (features) service.features = Array.isArray(features) ? features : [];
    
    // Update detailed features if present
    if (detailedFeatures) {
      service.detailedFeatures = Array.isArray(detailedFeatures) ? detailedFeatures : JSON.parse(detailedFeatures);
    }

    // Update files metadata if present
    if (filesMetadata) {
      service.filesMetadata = Array.isArray(filesMetadata) ? filesMetadata : JSON.parse(filesMetadata);
    }

    await service.save();
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/v1.0/Services/:id
// @desc    Delete a service and its files
router.delete('/:id', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findOne({ id: parseInt(id) });

    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    // Clean up attached documentation files
    if (service.filesMetadata && service.filesMetadata.length > 0) {
      service.filesMetadata.forEach(file => {
        if (file.filePath && file.filePath.startsWith('/uploads/')) {
          const docPath = path.join(__dirname, '..', file.filePath);
          if (fs.existsSync(docPath)) {
            fs.unlinkSync(docPath);
          }
        }
      });
    }

    await Service.deleteOne({ id: parseInt(id) });
    res.json({ message: 'Service and all associated files deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/v1.0/Services/:serviceId/upload-file
// @desc    Upload service documentation (PDF, ZIP)
router.post('/:serviceId/upload-file', authenticateUser, authorizeAdmin, upload.single('file'), async (req, res) => {
  try {
    const { serviceId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF or ZIP file.' });
    }

    const service = await Service.findOne({ id: parseInt(serviceId) });
    if (!service) {
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Service not found.' });
    }

    const newFileMetadata = {
      fileName: req.file.originalname,
      fileSize: formatFileSize(req.file.size),
      filePath: `/uploads/documents/${req.file.filename}`,
      lastUpdated: new Date().toLocaleDateString()
    };

    service.filesMetadata.push(newFileMetadata);
    await service.save();

    res.status(200).json({ message: 'File uploaded successfully!', service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/v1.0/Services/:serviceId/delete-file
// @desc    Delete service document attachment
router.delete('/:serviceId/delete-file', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { filePath } = req.query;

    if (!filePath) {
      return res.status(400).json({ message: 'File path query parameter is required.' });
    }

    const service = await Service.findOne({ id: parseInt(serviceId) });
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    const fileIndex = service.filesMetadata.findIndex(f => f.filePath === filePath);
    if (fileIndex === -1) {
      return res.status(404).json({ message: 'File not associated with this service.' });
    }

    // Delete physical file
    const absolutePath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    // Remove metadata
    service.filesMetadata.splice(fileIndex, 1);
    await service.save();

    res.json({ message: 'File deleted successfully!', service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/v1.0/Services/:serviceId/download-file
// @desc    Stream service resource file download
router.get('/:serviceId/download-file', async (req, res) => {
  try {
    const { filePath } = req.query;

    if (!filePath) {
      return res.status(400).json({ message: 'File path query parameter is required.' });
    }

    const absolutePath = path.join(__dirname, '..', filePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'File does not exist or has been removed.' });
    }

    // Verify inside uploads/documents to prevent directory traversal
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
