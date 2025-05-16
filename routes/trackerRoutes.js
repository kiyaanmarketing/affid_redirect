const express = require('express');
const { addOrUpdateTracker,
   deleteTracker,
  getAllTrackers,
  handleTrackerRedirect,
  updateTracker } = require('../controllers/trackerController');

const router = express.Router();

// Route for handling tracker redirects
router.get('/:trackerId', handleTrackerRedirect);
router.get('/', getAllTrackers);
router.post('/', addOrUpdateTracker);
router.put('/:hostname', updateTracker);
router.delete('/:hostname', deleteTracker);

module.exports = router;

