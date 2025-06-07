const jwt = require('jsonwebtoken');
require('dotenv').config();

// Helper function to properly format the public key
function formatPublicKey(keyString) {
  if (keyString.includes("-----BEGIN PUBLIC KEY-----") && !keyString.includes("\\n")) {
    // The key is already properly formatted with real newlines
    return keyString;
  }
  
  // Replace \\n with actual newlines if needed
  return keyString.replace(/\\n/g, '\n');
}

module.exports = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Format the public key correctly
    const publicKey = formatPublicKey(process.env.CLERK_JWT_KEY);
    
    // Verify token using the public key
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256']
    });
    
    // Set the userId on the request object for use in route handlers
    req.userId = decoded.sub; // 'sub' is the Clerk User ID
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};