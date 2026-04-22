// ─────────────────────────────────────────────────────────────────────
// ESP Integration API
// Direct API endpoints for ESP hardware to trigger notifications
// ESP can call these endpoints when it detects mission events
// ─────────────────────────────────────────────────────────────────────

import express from 'express';
import cors from 'cors';
import { markDroneLoaded, markEnRoute, markLanded, markPackageOffloaded, markReturningToBase } from './missionService.js';
import { triggerTelemetryAlert } from './automatedNotificationService.js';

const app = express();
app.use(cors());
app.use(express.json());

// Health check for ESP
app.get('/api/esp/health', (req, res) => {
  res.json({
    status: 'ESP API ready',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/esp/mission/loaded',
      'POST /api/esp/mission/enroute',
      'POST /api/esp/mission/landed',
      'POST /api/esp/mission/offloaded',
      'POST /api/esp/mission/returning',
      'POST /api/esp/telemetry/alert'
    ]
  });
});

// ─────────────────────────────────────────────────────────────────────
// MISSION STATE ENDPOINTS
// ESP calls these when it detects mission events
// ─────────────────────────────────────────────────────────────────────

// Drone loaded with package
app.post('/api/esp/mission/loaded', async (req, res) => {
  try {
    const { pkgId } = req.body;
    if (!pkgId) return res.status(400).json({ error: 'pkgId required' });

    await markDroneLoaded(pkgId);

    res.json({
      success: true,
      message: `Drone loaded notification triggered for ${pkgId}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('ESP loaded endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Drone en route to destination
app.post('/api/esp/mission/enroute', async (req, res) => {
  try {
    const { pkgId, eta } = req.body;
    if (!pkgId) return res.status(400).json({ error: 'pkgId required' });

    await markEnRoute(pkgId, eta || '00:15:00');

    res.json({
      success: true,
      message: `En route notification triggered for ${pkgId}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('ESP enroute endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Drone has landed at destination
app.post('/api/esp/mission/landed', async (req, res) => {
  try {
    const { pkgId } = req.body;
    if (!pkgId) return res.status(400).json({ error: 'pkgId required' });

    await markLanded(pkgId);

    res.json({
      success: true,
      message: `Landed notification triggered for ${pkgId}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('ESP landed endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Package has been offloaded
app.post('/api/esp/mission/offloaded', async (req, res) => {
  try {
    const { pkgId } = req.body;
    if (!pkgId) return res.status(400).json({ error: 'pkgId required' });

    await markPackageOffloaded(pkgId);

    res.json({
      success: true,
      message: `Offloaded notification triggered for ${pkgId}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('ESP offloaded endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Drone returning to base
app.post('/api/esp/mission/returning', async (req, res) => {
  try {
    const { pkgId } = req.body;
    if (!pkgId) return res.status(400).json({ error: 'pkgId required' });

    await markReturningToBase(pkgId);

    res.json({
      success: true,
      message: `Returning notification triggered for ${pkgId}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('ESP returning endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────
// TELEMETRY ALERT ENDPOINT
// ESP calls this when it detects anomalies
// ─────────────────────────────────────────────────────────────────────

app.post('/api/esp/telemetry/alert', async (req, res) => {
  try {
    const { alertType, details } = req.body;
    if (!alertType) return res.status(400).json({ error: 'alertType required' });

    await triggerTelemetryAlert(alertType, details || { message: 'Telemetry anomaly detected' });

    res.json({
      success: true,
      message: `Telemetry alert triggered: ${alertType}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('ESP telemetry alert error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────
// ESP TELEMETRY PUSH ENDPOINT
// ESP can push live telemetry data here
// ─────────────────────────────────────────────────────────────────────

app.post('/api/esp/telemetry/push', async (req, res) => {
  try {
    const telemetryData = req.body;

    // Push to Firebase Realtime Database
    const { pushTelemetry } = await import('./telemetryService.js');
    await pushTelemetry({
      ...telemetryData,
      espTimestamp: new Date().toISOString(),
      source: 'esp'
    });

    res.json({
      success: true,
      message: 'Telemetry data received',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('ESP telemetry push error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default app;