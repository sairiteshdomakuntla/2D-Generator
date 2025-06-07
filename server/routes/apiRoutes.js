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
const { getUserCredits, refreshUserCredits, resetCredits } = require('../controllers/userController');
const verifyToken = require('../middleware/requireAuth');
const debugMiddleware = require('../middleware/debugMiddleware');
const { checkCredits, deductCredit } = require('../middleware/creditsMiddleware');

// Legacy endpoint for backward compatibility
router.post('/generate-code', debugMiddleware, verifyToken, checkCredits, generateCode, deductCredit);

// New animation endpoints
router.get('/animations', verifyToken, getAnimations);
router.get('/animations/:id', verifyToken, getAnimationById);
// For POST/PUT operations that consume credits:
router.post('/animations', verifyToken, checkCredits, createAnimation, deductCredit);
router.put('/animations/:id/modify', verifyToken, checkCredits, modifyAnimation, deductCredit);
router.put('/animations/:id/save-video', verifyToken, saveVideo);
router.delete('/animations/:id', verifyToken, deleteAnimation);

// User credit endpoints
router.get('/user/credits', verifyToken, getUserCredits);
router.post('/user/refresh-credits', verifyToken, refreshUserCredits);
// Comment out the reset credits endpoint or protect it behind an admin check
// router.post('/user/reset-credits', verifyToken, resetCredits);

module.exports = router;