const express = require('express');
const client = require('prom-client');
const moment = require('moment-timezone');
const path = require('path');

const app = express();
const port = 80;

// Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const gandalfCounter = new client.Counter({
  name: 'adcash_gandalf_requests_total',
  help: 'Total number of requests to /gandalf'
});

const colomboCounter = new client.Counter({
  name: 'adcash_colombo_requests_total',
  help: 'Total number of requests to /colombo'
});

register.registerMetric(gandalfCounter);
register.registerMetric(colomboCounter);

// Serve static image
app.get('/gandalf', (req, res) => {
  gandalfCounter.inc();
  res.sendFile(path.join(__dirname, 'public', 'gandalf.png'));
});

// Show Colombo time
app.get('/colombo', (req, res) => {
  colomboCounter.inc();
  const colomboTime = moment().tz('Asia/Colombo').format('YYYY-MM-DD HH:mm:ss z');
  res.send(`Current time in Colombo, Sri Lanka: ${colomboTime}`);
});

// Prometheus metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Start server
app.listen(port, () => {
  console.log(`Adcash app listening on port ${port}`);
});

