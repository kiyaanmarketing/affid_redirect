const { PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const dynamoDb = require("./aws-config");

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
  
  console.log("getAllHostName",getAllHostName('HostName').then((result) => console.log("prom result=> ",result)))
  

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
  
  module.exports = { handleTrackerRedirect };
  
