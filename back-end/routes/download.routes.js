const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Download = require('../models/download.model');
const upload = require('../middleware/upload.middleware');
const { authenticateUser, authorizeAdmin } = require('../middleware/auth.middleware');

// @route   GET /api/v1.0/Download
// @desc    Get all global downloads
router.get('/', async (req, res) => {
  try {
    const downloads = await Download.find({ fileType: { $exists: true, $ne: null } }).sort({ createdAt: -1 });
    res.json(downloads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/v1.0/Download
// @desc    Upload a new global download resource
router.post('/', authenticateUser, authorizeAdmin, upload.single('file'), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'Name and description are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a valid document file (.pdf or .zip).' });
    }

    const fileType = path.extname(req.file.originalname).substring(1).toLowerCase();

    const download = new Download({
      name,
      description,
      fileType,
      fileSize: req.file.size,
      filePath: `/uploads/documents/${req.file.filename}`
    });

    await download.save();
    res.status(201).json(download);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/v1.0/Download/:id
// @desc    Delete a global download resource
router.delete('/:id', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const download = await Download.findOne({ id: parseInt(id) });

    if (!download) {
      return res.status(404).json({ message: 'Download resource not found.' });
    }

    // Clean up physical file
    if (download.filePath && download.filePath.startsWith('/uploads/')) {
      const absolutePath = path.join(__dirname, '..', download.filePath);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    }

    await Download.deleteOne({ id: parseInt(id) });
    res.json({ message: 'Download resource deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/v1.0/Download/file/:id
// @desc    Stream global resource file download
router.get('/file/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const download = await Download.findOne({ id: parseInt(id) });

    if (!download) {
      return res.status(404).json({ message: 'Download resource not found.' });
    }

    const absolutePath = path.join(__dirname, '..', download.filePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'Resource file has been removed from server.' });
    }

    // Prevent directory traversal
    const normalizedBase = path.normalize(path.join(__dirname, '../uploads/documents'));
    const normalizedFile = path.normalize(absolutePath);

    if (!normalizedFile.startsWith(normalizedBase)) {
      return res.status(403).json({ message: 'Access denied. Security violation.' });
    }

    res.download(absolutePath, `${download.name}.${download.fileType}`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
