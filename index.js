const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const app = express();
const port = process.env.PORT || 3000; // Use Render's port or 3000

// Replace with your Google Sheet ID (from Render environment variable)
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// Get credentials from Render environment variable
const CREDENTIALS_JSON = JSON.parse(process.env.CREDENTIALS_JSON);

async function updateGoogleSheet(articleUrl) {
  try {
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    await doc.useServiceAccountAuth(CREDENTIALS_JSON);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0]; // Assuming data is in the first sheet
    const rows = await sheet.getRows();

    // Find the row with the matching article URL
    const rowToUpdate = rows.find(row => row.URL === articleUrl);

    if (rowToUpdate) {
      rowToUpdate['Log to Map'] = 'YES';
      await rowToUpdate.save();
      console.log(`Successfully updated row for ${articleUrl}`);
    } else {
      console.log(`Row not found for ${articleUrl}`);
    }
  } catch (error) {
    console.error('Error updating Google Sheet:', error);
  }
}

app.get('/', (req, res) => {
  const articleUrl = req.query.url;

  if (articleUrl) {
    updateGoogleSheet(articleUrl);
    res.send('Logging article... Please wait.');
  } else {
    res.send('No article URL provided.');
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
