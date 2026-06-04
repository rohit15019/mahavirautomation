const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadBaseDir = path.join(__dirname, '../uploads');
const imagesDir = path.join(uploadBaseDir, 'images');
const documentsDir = path.join(uploadBaseDir, 'documents');

if (!fs.existsSync(uploadBaseDir)) fs.mkdirSync(uploadBaseDir, { recursive: true });
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
if (!fs.existsSync(documentsDir)) fs.mkdirSync(documentsDir, { recursive: true });

// Disk storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Separate images and docs
    if (file.mimetype.startsWith('image/')) {
      cb(null, imagesDir);
    } else {
      cb(null, documentsDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|pdf|zip/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only JPEG, JPG, PNG, GIF, PDF, and ZIP files are allowed!'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter
});

module.exports = upload;
