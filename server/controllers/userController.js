const User = require('../models/User');
const { findOrCreateUser, resetUserCredits } = require('../utils/userUtils');

// Get user credits
exports.getUserCredits = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(400).json({ error: 'Missing user ID' });
    }
    
    console.log('Finding user with clerk ID:', req.userId);
    const user = await findOrCreateUser(req.userId);
    
    // Check if it's a new month and we should refresh credits
    await checkAndRefreshMonthlyCredits(user);
    
    res.json({ credits: user.credits });
  } catch (error) {
    console.error('Error getting user credits:', error);
    // More detailed error response
    res.status(500).json({ 
      error: 'Failed to get user credits', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Force refresh credits (this would be replaced with Razorpay integration later)
exports.refreshUserCredits = async (req, res) => {
  try {
    // This is a placeholder for when you integrate Razorpay
    const user = await findOrCreateUser(req.userId);
    
    // Add credits (this would be based on the payment amount in the real implementation)
    const purchasedCredits = req.body.credits || 10;
    user.credits += purchasedCredits;
    await user.save();
    
    res.json({ 
      success: true, 
      message: `${purchasedCredits} credits added to your account`,
      credits: user.credits 
    });
  } catch (error) {
    console.error('Error refreshing credits:', error);
    res.status(500).json({ error: 'Failed to refresh credits' });
  }
};

// Add a reset credits endpoint for testing
exports.resetCredits = async (req, res) => {
  try {
    const user = await resetUserCredits(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Credits reset to 10',
      credits: user.credits 
    });
  } catch (error) {
    console.error('Error resetting credits:', error);
    res.status(500).json({ error: 'Failed to reset credits' });
  }
};

// Helper function to check if monthly credits should be refreshed
async function checkAndRefreshMonthlyCredits(user) {
  const now = new Date();
  const lastRefresh = new Date(user.lastCreditRefresh);
  
  // Check if it's a new month since the last refresh
  if (now.getMonth() !== lastRefresh.getMonth() || 
      now.getFullYear() !== lastRefresh.getFullYear()) {
    // It's a new month, give free credits
    user.credits = Math.max(user.credits, 10); // Either keep existing credits if higher, or set to 10
    user.lastCreditRefresh = now;
    await user.save();
  }
}