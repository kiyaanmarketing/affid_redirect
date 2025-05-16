const { PutCommand, ScanCommand, DeleteCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const dynamoDb = require("./aws-config");

const TABLE_NAME = 'Tracker';

// Get Tracked All Data
const getAllHostName = async (TableName) => {
    try {
      const params = {
        TableName: TableName
      };
      const result = await dynamoDb.send(new ScanCommand(params));
      return result.Items;
    } catch (err) {
      console.error('Error retrieving tracking All data:', err);
      //res.status(500).json({ error: 'Error retrieving tracking All data' });
    }
  };
  
// Fetch All Records
// const getAllHostName = async () => {
//   const result = await dynamoDb.send(new ScanCommand({ TableName: TABLE_NAME }));
//   return result.Items;
// };

  console.log("getAllHostName",getAllHostName('Tracker').then((result) => console.log("prom result=> ",result)))
  

const getAffiliateUrlByHostNameFind = async (hostname,TableName) => {
    try {
      // Fetch all hostnames and affiliate URLs from DynamoDB
      const allHostNames = await getAllHostName(TableName);
      
      // Find the entry where the hostname matches
      const matchedEntry = allHostNames.find((item) => item.hostname === hostname);
      console.log("matchedEntry => ",matchedEntry)
      if (matchedEntry) {
        // If a match is found, return the corresponding affiliateUrl
        return matchedEntry.affiliateUrl;
      } else {
        // If no match is found, return a default affiliate URL
        return ' ';
      }
    } catch (error) { 
      console.error('Error finding affiliate URL:', error);
      return ' '; // Return default on error
    }
  };
  
  // Controller for handling tracker redirects
  const handleTrackerRedirect = async (req, res) => {
    const trackerId = req.params.trackerId;
    try {
        const redirectUrl = await getAffiliateUrlByHostNameFind(trackerId,'Tracker');
      //const redirectUrl = await getAffiliateUrlByHostNameFind(trackerId, 'Tracker');
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
  


// Add or Update Record
const addOrUpdateTracker = async (req, res) => {
  const { hostname, affiliateUrl } = req.body;
  if (!hostname || !affiliateUrl) return res.status(400).json({ message: "hostname and affiliateUrl are required" });

  try {
    await dynamoDb.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: { hostname, affiliateUrl }
    }));
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
    await dynamoDb.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { hostname }
    }));
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
    // Delete old record if hostname changed
    if (oldHostname !== hostname) {
      await dynamoDb.send(new DeleteCommand({
        TableName: 'Tracker',
        Key: { hostname: oldHostname }
      }));
    }

    // Add updated/new record
    await dynamoDb.send(new PutCommand({
      TableName: 'Tracker',
      Item: { hostname, affiliateUrl }
    }));

    res.status(200).json({ message: "Updated successfully" });
  } catch (err) {
    console.error("Error updating item:", err);
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



  
