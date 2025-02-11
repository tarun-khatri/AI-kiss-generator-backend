// routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const { generateVideo} = require('../controllers/videoController');
const upload = require('../middlewares/uploadMiddleware');

router.post('/generate-video', upload.single('image'), generateVideo);

module.exports = router;
