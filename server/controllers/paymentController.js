const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const { findOrCreateUser } = require('../utils/userUtils');

// Initialize Razorpay with your keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Credit plans
const PLANS = {
  BASIC: { 
    id: 'basic',
    name: 'Basic Pack', 
    credits: 20, 
    amount: 499, // ₹4.99 (in paise)
    description: 'Perfect for beginners'
  },
  STANDARD: { 
    id: 'standard',
    name: 'Standard Pack', 
    credits: 50, 
    amount: 999, // ₹9.99 (in paise)
    description: 'Most popular option'
  },
  PREMIUM: { 
    id: 'premium',
    name: 'Premium Pack', 
    credits: 120, 
    amount: 1999, // ₹19.99 (in paise)
    description: 'Best value for money'
  }
};

// Create Razorpay order
exports.createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    
    // Validate plan
    const plan = Object.values(PLANS).find(p => p.id === planId);
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    
    const options = {
      amount: plan.amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.userId,
        planId: plan.id,
        credits: plan.credits
      }
    };
    
    const order = await razorpay.orders.create(options);
    
    res.json({ 
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: plan 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Verify payment and add credits
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return res.status(400).json({ error: 'Missing payment verification parameters' });
    }
    
    // Verify payment signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');
    
    const isAuthentic = expectedSignature === razorpay_signature;
    
    if (!isAuthentic) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }
    
    // Get plan details
    const plan = Object.values(PLANS).find(p => p.id === planId);
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    
    // Find user and add credits
    const user = await findOrCreateUser(req.userId);
    
    // Make sure credits property exists
    if (typeof user.credits !== 'number') {
      user.credits = 0;
    }
    
    // Add credits based on plan
    user.credits += plan.credits;
    await user.save();
    
    // Respond with success
    res.json({ 
      success: true, 
      message: `Added ${plan.credits} credits to your account`,
      credits: user.credits
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

// Get available plans
exports.getPlans = async (req, res) => {
  try {
    res.json({ plans: Object.values(PLANS) });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
};

module.exports.PLANS = PLANS;