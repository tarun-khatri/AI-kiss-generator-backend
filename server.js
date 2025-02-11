require('dotenv').config();
const express = require('express');
const cors = require('cors');
const videoRoutes = require('./routes/videoRoutes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable detailed error logging
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// CORS configuration
app.use(cors({
  origin: '*', // Be more restrictive in production
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Ensure uploads directory exists
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Serve static files if needed (for local uploads, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/videos', videoRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
