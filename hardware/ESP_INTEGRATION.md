# Skyclerk ESP32 Integration

This folder gives you the missing hardware side for the workflow you described:

1. Secretary drops a package into the payload box.
2. ESP32 waits until the ultrasonic sensor inside the box detects a stable payload for 3 minutes.
3. ESP32 turns the servo 90° to lock the payload, sends `loaded`, arms the flight controller, and starts the mission.
4. ESP32 pushes live telemetry to Skyclerk during the trip.
5. When the drone lands, ESP32 sends `landed`, opens the servo latch, and waits for the package to be removed.
6. If the ultrasonic sensor inside the box detects the payload is gone for 3 minutes, ESP32 sends `offloaded`, commands RTL, and sends `returning`.

## Files

- `hardware/esp32/skyclerk_autonomous_mission.ino`
  Companion-controller sketch for ESP32.
- `hardware/esp32/skyclerk_config.example.h`
  Copy to `skyclerk_config.h` and fill with your local values.
- `hardware/esp-bridge-server.example.mjs`
  Node bridge that accepts ESP requests and writes mission + telemetry data to Firebase for the dashboard.

## Recommended wiring

- ESP32 to flight controller over UART:
  `FC_TX -> ESP32 RX2`, `FC_RX -> ESP32 TX2`, common ground.
- Ultrasonic sensor:
  placed inside the payload box to detect load presence and removal.
- Servo:
  use an external 5V supply with common ground to the ESP32.
  The servo should turn 90° to lock the payload and return to release position when appropriate.

## Arduino libraries

Install these in Arduino IDE / PlatformIO:

- `ArduinoJson`
- `ESP32Servo`
- `MAVLink`

## Backend bridge dependencies

Install these in the bridge folder you want to run:

```bash
npm install express cors firebase-admin
```

Then set:

```env
PORT=3001
SKYCLERK_API_KEY=replace-with-strong-shared-secret
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
```

Run:

```bash
node hardware/esp-bridge-server.example.mjs
```

## Important mapping to your current frontend

Your current dashboard reads live telemetry from Firebase path `drone/telemetry`.
One service file in the repo also mentions `telemetry/live`.

The sample bridge writes telemetry to both paths so you do not have to fix that mismatch first.

Telemetry fields pushed by the ESP sketch match what the dashboard currently consumes:

```json
{
  "battery": 84,
  "altitude": 9.4,
  "speed": 4.8,
  "signal": 63,
  "temp": 37.1,
  "lat": 6.5562,
  "lon": 3.9841,
  "heading": 103,
  "payload": 1.0,
  "payloadPresent": true,
  "payloadLocked": true,
  "status": "EN_ROUTE",
  "armed": true,
  "uptime": 245
}
```

## Mission endpoints used by the sketch

- `POST /api/esp/mission/loaded`
- `POST /api/esp/mission/enroute`
- `POST /api/esp/mission/landed`
- `POST /api/esp/mission/offloaded`
- `POST /api/esp/mission/returning`
- `POST /api/esp/telemetry/push`
- `POST /api/esp/telemetry/alert`

## Flight-controller notes

The sketch is written as a companion computer that sends high-level MAVLink commands.
That is the safer architecture for this project.
Do not bypass the flight controller and try to drive ESCs directly from the ESP32 for autonomous delivery missions.

Before first flight:

1. Verify the flight controller already flies safely in manual / stabilized mode.
2. Confirm GUIDED or OFFBOARD mission commands are supported by your FC firmware.
3. Bench-test UART, sensor detection, and servo release without propellers.
4. Reduce the 3-minute windows during bench test, then restore them for real operation.
5. Add geofence, RTL altitude, low-battery failsafe, and RC override on the flight controller itself.

## One repo limitation to keep in mind

The frontend currently has a mix of local mission simulation and Firebase-backed services.
Telemetry will show correctly with the bridge as provided.
For mission cards and notification automation to be fully hardware-driven, you will likely want a small cleanup pass so the UI listens to Firebase mission documents consistently instead of relying on local simulated mission state in some places.
