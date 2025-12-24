const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image uploads are allowed'));
  }
  cb(null, true);
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 10 } });

router.post('/images', upload.array('images', 10), (req, res) => {
  const host = req.get('host');
  const protocol = req.protocol;
  const urls = (req.files || []).map(f => `${protocol}://${host}/uploads/${f.filename}`);
  res.json({ urls });
});

module.exports = router;
