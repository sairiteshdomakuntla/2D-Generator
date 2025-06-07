// Add this middleware before the auth middleware in your routes

const debugMiddleware = (req, res, next) => {
//   console.log('===== DEBUG REQUEST =====');
//   console.log('Headers:', req.headers);
//   console.log('Authorization:', req.headers.authorization);
//   console.log('========================');
  next();
};

module.exports = debugMiddleware;