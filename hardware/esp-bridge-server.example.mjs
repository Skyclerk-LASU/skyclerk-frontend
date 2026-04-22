import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';

const app = express();

app.use(cors());
app.use(express.json());

const apiKey = process.env.SKYCLERK_API_KEY;
const port = process.env.PORT || 3001;

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  console.warn('Firebase Admin credentials not configured yet.');
}

if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
    : undefined;

  admin.initializeApp({
    credential: serviceAccount
      ? admin.credential.cert(serviceAccount)
      : admin.credential.applicationDefault(),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.firestore();
const rtdb = admin.database();

const telemetryPathDashboard = 'drone/telemetry';
const telemetryPathMirror = 'telemetry/live';
const notificationWebhook = process.env.SKYCLERK_NOTIFICATION_WEBHOOK;

function requireApiKey(req, res, next) {
  if (!apiKey) return next();
  if (req.header('x-api-key') !== apiKey) {
    return res.status(401).json({ success: false, error: 'Invalid API key' });
  }
  next();
}

function normalizeMissionState(endpoint) {
  const map = {
    loaded: { state: 'LOADED', progress: 5 },
    enroute: { state: 'EN_ROUTE', progress: 25 },
    landed: { state: 'LANDED', progress: 60 },
    offloaded: { state: 'OFFLOADED', progress: 80 },
    returning: { state: 'RETURNING', progress: 90 },
  };
  return map[endpoint];
}

async function writeMission(pkgId, payload, endpoint) {
  const state = normalizeMissionState(endpoint);
  const missionRef = db.collection('missions').doc(pkgId);

  await missionRef.set({
    id: pkgId,
    dest: payload.dest || 'ASE',
    droneId: payload.droneId || 'SKYCLERK-01',
    eta: payload.eta || '00:00:00',
    ...state,
    lastHardwareEvent: endpoint.toUpperCase(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  await db.collection('missionEvents').add({
    pkgId,
    endpoint,
    payload,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await forwardMissionEvent(pkgId, endpoint, payload);
}

async function writeTelemetry(payload) {
  const telemetry = {
    battery: payload.battery ?? 0,
    altitude: payload.altitude ?? 0,
    speed: payload.speed ?? 0,
    signal: payload.signal ?? Math.abs(payload.rssi ?? 0),
    rssi: payload.rssi ?? 0,
    temp: payload.temp ?? 0,
    lat: payload.lat ?? 6.5530,
    lon: payload.lon ?? payload.lng ?? 3.9806,
    heading: payload.heading ?? 0,
    payload: payload.payload ?? 0,
    payloadPresent: payload.payloadPresent ?? false,
    payloadLocked: payload.payloadLocked ?? false,
    status: payload.status ?? 'IDLE',
    armed: payload.armed ?? false,
    uptime: payload.uptime ?? 0,
    pkgId: payload.pkgId ?? 'PKG-041',
    dest: payload.dest ?? 'ASE',
    droneId: payload.droneId ?? 'SKYCLERK-01',
    source: payload.source ?? 'esp32',
    timestamp: Date.now(),
  };

  await Promise.all([
    rtdb.ref(telemetryPathDashboard).set({
      ...telemetry,
      serverTimestamp: admin.database.ServerValue.TIMESTAMP,
    }),
    rtdb.ref(telemetryPathMirror).set({
      ...telemetry,
      serverTimestamp: admin.database.ServerValue.TIMESTAMP,
    }),
    db.collection('drones').doc(telemetry.droneId).set({
      lastTelemetryAt: admin.firestore.FieldValue.serverTimestamp(),
      lastKnownStatus: telemetry.status,
      battery: telemetry.battery,
      signal: telemetry.signal,
      lat: telemetry.lat,
      lon: telemetry.lon,
    }, { merge: true }),
  ]);
}

async function forwardMissionEvent(pkgId, endpoint, payload) {
  if (!notificationWebhook) return;

  try {
    const response = await fetch(notificationWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pkgId,
        endpoint,
        payload,
        date: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.warn(`Notification forward failed for ${endpoint}: ${response.status}`);
    }
  } catch (error) {
    console.warn(`Notification forward error for ${endpoint}:`, error.message);
  }
}

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'Skyclerk ESP bridge online',
    date: new Date().toISOString(),
  });
});

app.use('/api/esp', requireApiKey);

app.post('/api/esp/telemetry/push', async (req, res) => {
  try {
    await writeTelemetry(req.body);
    res.json({ success: true, message: 'Telemetry stored' });
  } catch (error) {
    console.error('Telemetry write failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/esp/telemetry/alert', async (req, res) => {
  try {
    await db.collection('telemetryAlerts').add({
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ success: true, message: 'Alert stored' });
  } catch (error) {
    console.error('Alert write failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

for (const endpoint of ['loaded', 'enroute', 'landed', 'offloaded', 'returning']) {
  app.post(`/api/esp/mission/${endpoint}`, async (req, res) => {
    try {
      const pkgId = req.body.pkgId;
      if (!pkgId) {
        return res.status(400).json({ success: false, error: 'pkgId is required' });
      }

      await writeMission(pkgId, req.body, endpoint);

      res.json({
        success: true,
        message: `Mission ${endpoint} accepted`,
        pkgId,
        date: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Mission ${endpoint} failed:`, error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
}

app.listen(port, () => {
  console.log(`Skyclerk ESP bridge listening on http://localhost:${port}`);
});
