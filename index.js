
const express = require('express');
const fetch = require('node-fetch');
const zipcodes = require('zipcodes');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.get('/api/weather-alerts', async (req, res) => {
  const zip = req.query.zip || '37027';
  const location = zipcodes.lookup(zip);

  if (!location) {
    return res.status(400).json({ error: 'Invalid ZIP code' });
  }

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

    res.json(alerts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch NOAA data' });
  }
});

app.listen(PORT, () => {
  console.log(`Weather backend running at http://localhost:${PORT}`);
});
