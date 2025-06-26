require('dotenv').config();
const express = require('express');
const trackerRoutes = require('./routes/trackerRoutes');
const { connectDB } = require('./controllers/mongo-config');

const cors = require('cors');
const app = express();
app.use(cors());
const path = require("path");

const PORT = process.env.PORT || 4500;

// Middleware to parse JSON
app.use(express.json());

// Serve static HTML files
app.use(express.static(path.join(__dirname, 'public')));

// Tracker routes
app.use('/affid', trackerRoutes);
app.use('/tracker', trackerRoutes);

// Default route (UI)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});



