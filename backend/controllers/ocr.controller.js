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

    if (typeof imageData !== 'string' || !imageData.startsWith('data:image')) {
      return res.status(400).json({ message: "Invalid image format. Expected base64 data URL." });
    }

    // perform OCR with Tesseract.recognize() can take a base64 string directly.
    const result = await Tesseract.recognize(
      imageData,
      'eng',
      { 
        // logger: m => console.log(m)
      }
    );
    const text = result.data.text;

    if (!text || text.trim().length === 0) {
        return res.status(200).json({ text: "", message: "No text could be detected in the image." });
    }

    res.status(200).json({ text });

  } catch (error) {
    console.error("OCR Controller Error:", error);
    res.status(500).json({ message: "Failed to process image.", error: error.message });
  }
};

module.exports = {
  extractTextFromImage
};