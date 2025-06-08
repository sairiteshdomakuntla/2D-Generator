const User = require('../models/User');

// Helper function to find or create user
exports.findOrCreateUser = async (userId, userEmail = 'user@example.com', userName = 'User') => {
  try {
    // First, try to find the existing user
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      try {
        // Use findOneAndUpdate with upsert to avoid race conditions
        user = await User.findOneAndUpdate(
          { clerkId: userId },
          {
            $setOnInsert: {
              clerkId: userId,
              email: userEmail,
              name: userName,
              credits: 20,
              lastCreditRefresh: new Date()
            }
          },
          { 
            new: true, 
            upsert: true,
            runValidators: true
          }
        );
      } catch (err) {
        // If there's an error during upsert (likely a duplicate key error),
        // try one more time to fetch the user that might have been created in parallel
        if (err.code === 11000) { // Duplicate key error
          user = await User.findOne({ clerkId: userId });
          if (!user) throw err; // Re-throw if user still not found
        } else {
          throw err;
        }
      }
    }
    
    // Ensure the user has credits set
    if (user.credits === undefined) {
      user.credits = 20;
      user.lastCreditRefresh = new Date();
      await user.save();
    }
    
    return user;
  } catch (error) {
    console.error('Error in findOrCreateUser:', error);
    throw error;
  }
};

// Function to reset user credits
exports.resetUserCredits = async (userId) => {
  try {
    const user = await User.findOne({ clerkId: userId });
    if (user) {
      user.credits = 10;
      await user.save();
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error resetting user credits:', error);
    throw error;
  }
};