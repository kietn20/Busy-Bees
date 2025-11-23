const express = require('express');
const { extractTextFromImage } = require('../controllers/ocr.controller');
const { allowJwtOrGoogle } = require('../middleware/auth.middleware');

const router = express.Router();

// only logged-in users can use the OCR service
router.use(allowJwtOrGoogle);

router.post('/extract-text', extractTextFromImage);

module.exports = router;