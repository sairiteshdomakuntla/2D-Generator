const express = require('express');
const router = express.Router();
const { generateCode } = require('../controllers/codeController');
const verifyToken = require('../middleware/requireAuth');
const debugMiddleware = require('../middleware/debugMiddleware');

// Add debug middleware first and use the simplified auth middleware
router.post('/generate-code', debugMiddleware, verifyToken, generateCode);

module.exports = router;