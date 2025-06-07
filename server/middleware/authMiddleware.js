const { Webhook } = require('svix');
const { buffer } = require('micro');

async function verifyClerkWebhook(req, res, next) {
  try {
    // Get the Clerk webhook signature from the headers
    const svixHeaders = {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    };
    
    // Ensure all required headers exist
    const missingHeaders = Object.entries(svixHeaders)
      .filter(([_, value]) => !value)
      .map(([key]) => key);
      
    if (missingHeaders.length) {
      return res.status(401).json({ 
        error: `Missing required Svix headers: ${missingHeaders.join(', ')}` 
      });
    }
    
    // Get raw body as buffer
    const payload = await buffer(req);
    
    // Create a new Webhook instance with your webhook secret
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    
    // Verify the webhook
    const evt = wh.verify(payload, svixHeaders);
    
    // Add the verified payload to the request
    req.clerkEvent = evt;
    
    // Continue to the next middleware or route handler
    next();
  } catch (err) {
    console.error('Clerk webhook verification failed:', err);
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }
}

module.exports = verifyClerkWebhook;