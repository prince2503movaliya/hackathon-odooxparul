const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');
const { AppError } = require('./errors');

// Ensure upload directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const profileDir = path.join(process.cwd(), config.upload.dir, 'profiles');
const coversDir  = path.join(process.cwd(), config.upload.dir, 'covers');
ensureDir(profileDir);
ensureDir(coversDir);

const storage = (destination) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destination),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, unique);
    },
  });

const fileFilter = (_req, file, cb) => {
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, and WebP images are allowed', 400), false);
  }
};

const limitsMB = config.upload.maxSizeMB * 1024 * 1024;

const uploadProfile = multer({
  storage: storage(profileDir),
  fileFilter,
  limits: { fileSize: limitsMB },
});

const uploadCover = multer({
  storage: storage(coversDir),
  fileFilter,
  limits: { fileSize: limitsMB },
});

module.exports = { uploadProfile, uploadCover };
