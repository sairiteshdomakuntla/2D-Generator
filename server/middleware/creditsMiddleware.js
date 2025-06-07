const User = require('../models/User');
const { findOrCreateUser } = require('../utils/userUtils');

// Middleware to check if the user has enough credits
const checkCredits = async (req, res, next) => {
  try {
    // Find the user
    const user = await findOrCreateUser(req.userId);
    
    // Check if the user has credits
    if (user.credits <= 0) {
      return res.status(403).json({ 
        error: 'Insufficient credits', 
        message: 'You have run out of credits. Please purchase more to continue.'
      });
    }
    
    // Attach the user to the request for later use
    req.user = user;
    next();
  } catch (error) {
    console.error('Error checking credits:', error);
    res.status(500).json({ error: 'Failed to check credits' });
  }
};

// Middleware to deduct a credit after successful operation
const deductCredit = async (req, res, next) => {
  try {
    if (!req.user) {
      // Find the user if not already attached to request
      req.user = await findOrCreateUser(req.userId);
    }
    
    // Deduct a credit
    req.user.credits -= 1;
    await req.user.save();
    
    // Continue with the request
    next();
  } catch (error) {
    console.error('Error deducting credit:', error);
    // Continue with the request even if there was an error deducting
    next();
  }
};

module.exports = { checkCredits, deductCredit };