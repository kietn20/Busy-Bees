const express = require('express');
const dotenv = require('dotenv');
const exampleRoutes = require('./routes/exampleRoutes');

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api', exampleRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
