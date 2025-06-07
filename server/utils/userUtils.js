const User = require('../models/User');

// Helper function to find or create user
exports.findOrCreateUser = async (userId, userEmail = 'user@example.com', userName = 'User') => {
  try {
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      console.log('Creating new user with ID:', userId);
      user = new User({
        clerkId: userId,
        email: userEmail,
        name: userName,
        credits: 10, // Start with 10 free credits
        lastCreditRefresh: new Date()
      });
      await user.save();
      console.log('New user created:', user);
    } else if (user.credits === undefined) {
      // If user exists but doesn't have credits field (migration case)
      console.log('Updating user with missing credits field:', userId);
      user.credits = 10;
      user.lastCreditRefresh = new Date();
      await user.save();
      console.log('User updated with credits:', user);
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
      console.log('Reset credits for user:', userId);
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error resetting user credits:', error);
    throw error;
  }
};