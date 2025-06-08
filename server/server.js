require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/apiRoutes');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Improved CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow any origin
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

// Special handling for Clerk webhooks which need raw body
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhooks/clerk' && 
      req.method === 'POST') {
    return next();
  }
  bodyParser.json()(req, res, next);
});

// API routes
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});