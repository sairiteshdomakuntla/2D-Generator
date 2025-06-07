const Animation = require('../models/Animation');
const User = require('../models/User');
const { getP5CodeFromPrompt } = require('../services/geminiService');
const { getModifiedCode } = require('../services/geminiService');

// Helper function to find or create user
const findOrCreateUser = async (userId, userEmail = 'user@example.com', userName = 'User') => {
  try {
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      user = new User({
        clerkId: userId,
        email: userEmail,
        name: userName
      });
      await user.save();
    }
    
    return user;
  } catch (error) {
    console.error('Error in findOrCreateUser:', error);
    throw error;
  }
};

// Get all animations for a user
exports.getAnimations = async (req, res) => {
  try {
    // Get the current user by Clerk ID
    const user = await findOrCreateUser(req.userId);
    
    // Find animations belonging only to this user
    const animations = await Animation.find({ user: user._id })
      .sort({ updatedAt: -1 })
      .select('title initialPrompt thumbnail updatedAt');
    
    res.json({ animations });
  } catch (error) {
    console.error('Error fetching animations:', error);
    res.status(500).json({ error: 'Failed to fetch animations' });
  }
};

// Get a single animation by ID
exports.getAnimationById = async (req, res) => {
  try {
    const { id } = req.params;
    const animation = await Animation.findById(id);
    
    if (!animation) {
      return res.status(404).json({ error: 'Animation not found' });
    }
    
    res.json({ animation });
  } catch (error) {
    console.error('Error fetching animation:', error);
    res.status(500).json({ error: 'Failed to fetch animation' });
  }
};

// Create a new animation
exports.createAnimation = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ error: 'Valid prompt is required' });
    }
    
    const user = await findOrCreateUser(req.userId);
    
    // Generate code from prompt
    const code = await getP5CodeFromPrompt(prompt);
    
    // Create a new animation
    const animation = new Animation({
      user: user._id,
      title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
      initialPrompt: prompt,
      currentCode: code,
      messages: [
        { role: 'user', content: prompt },
        { role: 'system', content: 'Generated initial animation' }
      ]
    });
    
    await animation.save();
    
    res.status(201).json({ 
      animation: {
        id: animation._id,
        title: animation.title,
        code: animation.currentCode,
        messages: animation.messages
      } 
    });
  } catch (error) {
    console.error('Error creating animation:', error);
    
    // Handle specific error types
    if (error.status === 404) {
      res.status(500).json({ 
        error: 'Model configuration error', 
        message: 'The AI model is not available or incorrectly configured.' 
      });
    } else if (error.status === 429) {
      res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.'
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to generate code',
        message: 'An error occurred while generating the animation.'
      });
    }
  }
};

// Modify an existing animation
exports.modifyAnimation = async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ error: 'Valid modification prompt is required' });
    }
    
    // Find the animation
    const animation = await Animation.findById(id);
    if (!animation) {
      return res.status(404).json({ error: 'Animation not found' });
    }
    
    // Modify the code using the current code and the new prompt
    const modifiedCode = await getModifiedCode(animation.currentCode, prompt);
    
    // Update animation with new code and add message to history
    animation.currentCode = modifiedCode;
    animation.messages.push({ role: 'user', content: prompt });
    animation.messages.push({ role: 'system', content: 'Modified animation based on request' });
    animation.updatedAt = Date.now();
    
    await animation.save();
    
    res.json({ 
      animation: {
        id: animation._id,
        code: animation.currentCode,
        messages: animation.messages
      }
    });
  } catch (error) {
    console.error('Error modifying animation:', error);
    res.status(500).json({ error: 'Failed to modify animation' });
  }
};

// Save video URL for an animation
exports.saveVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { videoUrl, thumbnail } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }
    
    const animation = await Animation.findById(id);
    if (!animation) {
      return res.status(404).json({ error: 'Animation not found' });
    }
    
    animation.videoUrl = videoUrl;
    if (thumbnail) {
      animation.thumbnail = thumbnail;
    }
    
    await animation.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving video:', error);
    res.status(500).json({ error: 'Failed to save video' });
  }
};

// Delete an animation
exports.deleteAnimation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await Animation.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Animation not found' });
    }
    
    res.json({ success: true, message: 'Animation deleted successfully' });
  } catch (error) {
    console.error('Error deleting animation:', error);
    res.status(500).json({ error: 'Failed to delete animation' });
  }
};