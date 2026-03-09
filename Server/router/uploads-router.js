const express = require('express');
const { uploadReviewImages, cloudinary } = require('../middleware/cloudinary-upload');
const authMiddleware = require('../middleware/auth-middleware');

const router = express.Router();

// Upload review images to Cloudinary (requires authentication)
router.post('/images', authMiddleware, uploadReviewImages.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const urls = req.files.map(file => file.path);
    const images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
    }));

    res.json({ 
      urls,
      images,
      message: 'Images uploaded successfully' 
    });
  } catch (error) {
    console.error('Review image upload error:', error);
    res.status(500).json({ message: 'Failed to upload images' });
  }
});

// Delete a review image by public ID
router.delete('/images/:publicId(*)', authMiddleware, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.status(200).json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

module.exports = router;
