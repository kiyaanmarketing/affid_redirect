
const {  connectDB, getDB } = require('./mongo-config');

const TABLE_NAME = 'Tracker';


const getAllHostName = async (collectionName) => {
  const db = getDB();
  
  try {
    return await db.collection(collectionName).find({}).toArray();
  } catch (err) {
    console.error('MongoDB Error:', err);
    return [];
  }
};


const getAffiliateUrlByHostNameFind = async (hostname, collectionName) => {
  const db = getDB();
  
  try {
    const result = await db.collection(collectionName)
                          .findOne({ hostname: hostname });
    return result ? result.affiliateUrl : '';
  } catch (error) {
    console.error('MongoDB Error:', error);
    return '';
  }
};



  
  // Controller for handling tracker redirects
  // const handleTrackerRedirect = async (req, res) => {
  //   const trackerId = req.params.trackerId;
  //   try {
  //       const redirectUrl = await getAffiliateUrlByHostNameFind(trackerId,'Tracker');
  //     //const redirectUrl = await getAffiliateUrlByHostNameFind(trackerId, 'Tracker');
  //     if (!redirectUrl) {
  //       return res.status(404).send('URL not found for the specified tracker');
  //     }
  //     res.set('Referrer-Policy', 'no-referrer');
  //     res.redirect(302, redirectUrl);
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //     res.status(500).send('Internal Server Error');
  //   }
  // };
  

// Controller for handling tracker redirects
const handleTrackerRedirect = async (req, res) => {
  const trackerId = req.params.trackerId;

  try {
    // 🔍 Check if request has a referrer
    const referrer = req.get('referer');

    if (!referrer || referrer.trim() === "") {
      console.log(`Blocked redirect — referrer missing for trackerId: ${trackerId}`);
      return res.status(403).send('Access denied: missing referrer');
    }

    const redirectUrl = await getAffiliateUrlByHostNameFind(trackerId, 'Tracker');

    if (!redirectUrl) {
      return res.status(404).send('URL not found for the specified tracker');
    }

    res.set('Referrer-Policy', 'no-referrer');
    res.redirect(302, redirectUrl);

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
};





const addOrUpdateTracker = async (req, res) => {
  const { hostname, affiliateUrl } = req.body;
  if (!hostname || !affiliateUrl) return res.status(400).json({ message: "hostname and affiliateUrl are required" });

  try {
    const db = getDB();
    await db.collection('Tracker').updateOne(
      { hostname },
      { $set: { hostname, affiliateUrl } },
      { upsert: true }
    );
    res.status(200).json({ message: "Saved successfully" });
  } catch (err) {
    console.error("Error saving tracker:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Delete Record
const deleteTracker = async (req, res) => {
  const { hostname } = req.params;
  try {
    const db = getDB();
    await db.collection('Tracker').deleteOne({ hostname });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Error deleting tracker:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Get All
const getAllTrackers = async (req, res) => {
  try {
    const items = await getAllHostName('Tracker');
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching data" });
  }
};

const updateTracker = async (req, res) => {
  const oldHostname = req.params.hostname;
  const { hostname, affiliateUrl } = req.body;

  if (!hostname || !affiliateUrl) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    const db = getDB();

    if (oldHostname !== hostname) {
      // Delete old document
      await db.collection('Tracker').deleteOne({ hostname: oldHostname });
    }

    // Insert or update new document
    await db.collection('Tracker').updateOne(
      { hostname },
      { $set: { hostname, affiliateUrl } },
      { upsert: true }
    );

    res.status(200).json({ message: "Updated successfully" });
  } catch (err) {
    console.error("Error updating tracker:", err);
    res.status(500).json({ message: "Update failed" });
  }
};




module.exports = {
  addOrUpdateTracker,
   deleteTracker,
  getAllTrackers,
  handleTrackerRedirect,
  updateTracker
};



  
