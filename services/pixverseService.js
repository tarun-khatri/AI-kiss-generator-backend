const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const PIXVERSE_API_KEY = process.env.PIXVERSE_API_KEY;
const PIXVERSE_BASE_URL = "https://app-api.pixverse.ai/openapi/v2";

/**
 * Uploads an image to PixVerse and returns the image ID.
 * @param {string} filePath - Local file path of the image.
 * @returns {Promise<number>} - The img_id returned by PixVerse.
 */
async function uploadImage(filePath) {
  const url = `${PIXVERSE_BASE_URL}/image/upload`;
  const form = new FormData();
  form.append('image', fs.createReadStream(filePath));

  const headers = {
    ...form.getHeaders(),
    'API-KEY': PIXVERSE_API_KEY,
    'Ai-trace-id': uuidv4(),
  };

  try {
    const response = await axios.post(url, form, { headers });
    console.log("Image Upload Response:", JSON.stringify(response.data, null, 2));
    // Use "Resp" with capital "R"
    if (response.data && response.data.Resp && response.data.Resp.img_id !== undefined) {
      return response.data.Resp.img_id;
    } else {
      throw new Error("Invalid response from PixVerse image upload: " + JSON.stringify(response.data));
    }
  } catch (error) {
    console.error("Error uploading image:", error.response ? error.response.data : error.message);
    throw error;
  }
}

/**
 * Creates a video from an image using PixVerse.
 * @param {number} img_id - The image ID obtained from uploadImage.
 * @param {string} prompt - The prompt for video generation.
 * @param {number} duration - Video duration in seconds (5 or 8).
 * @returns {Promise<number>} - The video_id from PixVerse.
 */
async function createVideo(img_id, prompt, duration = 5) {
  const url = `${PIXVERSE_BASE_URL}/video/img/generate`;
  const payload = {
    duration: duration,
    img_id: img_id,
    model: "v3.5",
    motion_mode: "normal",
    prompt: prompt,
    quality: "540p",
    // Additional parameters can be added here if needed.
  };

  const headers = {
    'API-KEY': PIXVERSE_API_KEY,
    'Ai-trace-id': uuidv4(),
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.post(url, payload, { headers });
    console.log("Create Video Response:", JSON.stringify(response.data, null, 2));
    // Check for video_id in "Resp"
    if (response.data && response.data.Resp && response.data.Resp.video_id !== undefined) {
      return response.data.Resp.video_id;
    } else {
      throw new Error("Invalid response from PixVerse video generation: " + JSON.stringify(response.data));
    }
  } catch (error) {
    console.error("Error generating video:", error.response ? error.response.data : error.message);
    throw error;
  }
}

/**
 * Retrieves the result of a video generation job.
 * @param {number} video_id - The video ID from createVideo.
 * @returns {Promise<Object>} - The response object from PixVerse.
 */
async function getVideoResult(video_id) {
  const url = `${PIXVERSE_BASE_URL}/video/result/${video_id}`;
  const headers = {
    'API-KEY': PIXVERSE_API_KEY,
    'Ai-trace-id': uuidv4(),
  };

  try {
    const response = await axios.get(url, { headers });
    console.log("Get Video Result Response:", JSON.stringify(response.data, null, 2));
    if (response.data && response.data.Resp) {
      return response.data.Resp;
    } else {
      throw new Error("Invalid response from PixVerse video status: " + JSON.stringify(response.data));
    }
  } catch (error) {
    console.error("Error getting video status:", error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = { uploadImage, createVideo, getVideoResult };
