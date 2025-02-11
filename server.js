require('dotenv').config();


const express = require('express');
const cors = require('cors');
const videoRoutes = require('./routes/videoRoutes');
const path = require('path');

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

// Serve static files if needed (for local uploads, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/videos', videoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
