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

// CORS configuration with specific origins and credentials support
app.use(cors({
  origin: ['https://animateai-nine.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

// Add explicit OPTIONS handler for preflight requests
app.options('*', (req, res) => {
  res.status(200).end();
});

// Special handling for Clerk webhooks which need raw body
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhooks/clerk' && 
      req.method === 'POST') {
    return next();
  }
  bodyParser.json()(req, res, next);
});

// Log CORS-related information for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// API routes
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});