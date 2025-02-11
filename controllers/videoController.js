// controllers/videoController.js
const { uploadImage, createVideo, getVideoResult } = require('../services/pixverseService');
const fs = require('fs');
const path = require('path');

async function generateVideo(req, res) {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }

    // Get the local path from multer
    const imagePath = path.resolve(req.file.path);

    // Upload the image to PixVerse to get an image ID
    const img_id = await uploadImage(imagePath);

    // Optionally, delete the local file after upload
    fs.unlink(imagePath, (err) => {
      if (err) console.error("Error deleting local file:", err);
    });

    // Get the prompt from the request body or use a default prompt
    const prompt = "2 people are there in the image make them smooch";

    // Create the video using the uploaded image's ID
    const video_id = await createVideo(img_id, prompt);

    // Poll for the video result until ready
    let result;
    let retries = 0;
    const maxRetries = 20; // ~100 seconds max wait
    do {
      await new Promise(r => setTimeout(r, 5000)); // wait 5 seconds
      result = await getVideoResult(video_id);
      retries++;
    } while (result.status === 5 && retries < maxRetries); // status 5 indicates "Generating"

    if (result.status === 1 && result.url) {  // status 1 means Generation successful
      return res.status(200).json({ videoUrl: result.url });
    } else {
      return res.status(500).json({ error: "Video generation failed or timed out." });
    }
  } catch (error) {
    console.error("Error in generateVideo controller:", error);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { generateVideo };


