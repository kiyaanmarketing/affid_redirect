require('dotenv').config();
const express = require('express');
const trackerRoutes = require('./routes/trackerRoutes');

const app = express();
const PORT = process.env.PORT || 4500;

// Middleware to parse JSON
app.use(express.json());

// Tracker routes
app.use('/affid', trackerRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
