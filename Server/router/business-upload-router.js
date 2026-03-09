const express = require('express');
const router = express.Router();
const { uploadLogo, uploadGallery, uploadDocument, cloudinary } = require('../middleware/cloudinary-upload');
const businessAuthMiddleware = require('../middleware/business-auth-middleware');

// Upload business logo (public - for onboarding)
router.post('/logo', uploadLogo.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.status(200).json({
      message: 'Logo uploaded successfully',
      url: req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ message: 'Failed to upload logo' });
  }
});

// Upload gallery images (public - for onboarding)
router.post('/gallery', uploadGallery.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
    }));

    res.status(200).json({
      message: 'Gallery images uploaded successfully',
      images,
    });
  } catch (error) {
    console.error('Gallery upload error:', error);
    res.status(500).json({ message: 'Failed to upload gallery images' });
  }
});

// Upload documents (public - for onboarding)
router.post('/documents', uploadDocument.single('document'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.status(200).json({
      message: 'Document uploaded successfully',
      url: req.file.path,
      publicId: req.file.filename,
      type: req.body.type || 'other',
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ message: 'Failed to upload document' });
  }
});

// Delete an image/document by public ID
router.delete('/:publicId', businessAuthMiddleware, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.status(200).json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
});

module.exports = router;
