const express = require('express');
const router = express.Router();
const { generateCode } = require('../controllers/codeController');
const { 
  getAnimations, 
  getAnimationById, 
  createAnimation, 
  modifyAnimation, 
  saveVideo, 
  deleteAnimation 
} = require('../controllers/animationController');
const verifyToken = require('../middleware/requireAuth');
const debugMiddleware = require('../middleware/debugMiddleware');

// Legacy endpoint for backward compatibility
router.post('/generate-code', debugMiddleware, verifyToken, generateCode);

// New animation endpoints
router.get('/animations', verifyToken, getAnimations);
router.get('/animations/:id', verifyToken, getAnimationById);
router.post('/animations', verifyToken, createAnimation);
router.put('/animations/:id/modify', verifyToken, modifyAnimation);
router.put('/animations/:id/save-video', verifyToken, saveVideo);
router.delete('/animations/:id', verifyToken, deleteAnimation);

module.exports = router;