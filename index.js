const express = require('express');
const fetch = require('node-fetch');
const zipcodes = require('zipcodes');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.get('/api/weather-alerts', async (req, res) => {
  const zipParam = req.query.zip || '';
  const zipList = zipParam.split(',').map(z => z.trim()).filter(z => z.length > 0);

  const results = [];

  for (const zip of zipList) {
    const location = zipcodes.lookup(zip);
    if (!location) continue;

    const { latitude, longitude } = location;
    const pointUrl = `https://api.weather.gov/points/${latitude},${longitude}`;

    try {
      const pointRes = await fetch(pointUrl, {
        headers: {
          'User-Agent': 'WoodpeckerWeatherApp (hello@yourdomain.com)'
        }
      });

      const pointData = await pointRes.json();

      const alertsUrl = pointData.properties.forecastOffice.replace('office', 'alerts/active');

      const alertRes = await fetch(alertsUrl, {
        headers: {
          'User-Agent': 'WoodpeckerWeatherApp (hello@yourdomain.com)'
        }
      });

      const alertData = await alertRes.json();

      const alerts = alertData.features.map((alert) => ({
        zipCode: zip,
        latitude,
        longitude,
        severity: alert.properties.severity,
        type: alert.properties.event,
        description: alert.properties.description
      }));

      results.push(...alerts);
    } catch (err) {
      console.error(`Failed to fetch for ZIP ${zip}:`, err);
    }
  }

  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  const fs = require('fs');
const path = require('path')
const fs = require('fs');
const path = require('path');
;
app.post('/api/subscribe', express.json(), (req, res) => {
  const { email, phone, zipCodes } = req.body;

  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone is required' });
  }

  const entry = {
    email,
    phone,
    zipCodes,
    timestamp: new Date().toISOString()
  };

  const dataPath = path.join(__dirname, 'subscribers.json');
  let currentData = [];

  if (fs.existsSync(dataPath)) {
    const raw = fs.readFileSync(dataPath);
    currentData = JSON.parse(raw);
  }

  currentData.push(entry);
  fs.writeFileSync(dataPath, JSON.stringify(currentData, null, 2));

  console.log('✅ New subscriber saved:', entry);
  res.json({ success: true, message: 'Subscription saved!' });
});


});

