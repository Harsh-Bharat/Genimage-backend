// controllers/genImage.js
import axios from 'axios';
import FormData from 'form-data';
import Usermodel from '../models/Usermodel.js';

export const genimage = async (req, res) => {
  try {
    const { prompt } = req.body;

    // 🛡 Validate input
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    // 🔐 Get user from token (req.userId set by useAuth middleware)
    const user = await Usermodel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.creditLeft <= 0) {
      return res.status(403).json({ success: false, message: 'No credits left' });
    }

    console.log("💬 Prompt received:", prompt);
    console.log("👤 User:", user.name, "| Credits:", user.creditLeft);

    // 📦 Prepare form-data
    const form = new FormData();
    form.append('prompt', prompt);

    // 🌐 Send request to ClipDrop
    const response = await axios.post(
      'https://clipdrop-api.co/text-to-image/v1',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'x-api-key': process.env.CLIPDROP_API // Use uppercase for env variable
        },
        responseType: 'arraybuffer'
      }
    );

    // 📥 Convert buffer to base64 image
    const base64Image = Buffer.from(response.data).toString('base64');
    const dataUri = `data:image/png;base64,${base64Image}`;

    // 🧾 Deduct credit
    const updatedUser = await Usermodel.findByIdAndUpdate(
      req.userId,
      { creditLeft: user.creditLeft - 1 },
      { new: true }
    );

    // ✅ Send success response
    res.status(200).json({
      success: true,
      message: 'Image generated successfully',
      dataUri,
      creditLeft: updatedUser.creditLeft
    });

  } catch (error) {
    // Improved error logging for debugging
    if (error.response) {
      console.error("❌ ClipDrop API Error:", error.response.data);
      res.status(500).json({ message: error.response.data?.error || error.message });
    } else {
      console.error("❌ Error:", error.message);
      res.status(500).json({ message: error.message });
    }
  }
};
