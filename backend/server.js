const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

app.use(express.json());


// --- Routes ---

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is healthy'
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});