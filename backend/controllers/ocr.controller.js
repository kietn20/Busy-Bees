const Tesseract = require('tesseract.js');

// @desc    Extract text from an image
// @route   POST /api/ocr/extract-text
// @access  Private (Logged in users)
const extractTextFromImage = async (req, res) => {
  try {
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({ message: "No image data provided." });
    }

    // basic validation to ensure it looks like a base64 string
    if (!imageData.startsWith('data:image')) {
      return res.status(400).json({ message: "Invalid image format. Expected base64 data URL." });
    }

    // perform OCR with Tesseract.recognize takes the image data (URL, buffer, or base64)
    const { data: { text } } = await Tesseract.recognize(
      imageData,
      'eng',
      { 
        logger: m => console.log(m)
      }
    );

    if (!text || text.trim().length === 0) {
        return res.status(200).json({ text: "", message: "No text could be detected in the image." });
    }

    res.status(200).json({ text });

  } catch (error) {
    console.error("OCR Error:", error);
    res.status(500).json({ message: "Failed to process image.", error: error.message });
  }
};

module.exports = {
  extractTextFromImage
};