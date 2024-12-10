const express = require('express');
const { handleTrackerRedirect } = require('../controllers/trackerController');

const router = express.Router();

// Route for handling tracker redirects
router.get('/:trackerId', handleTrackerRedirect);

module.exports = router;
