#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include <mavlink/common/mavlink.h>

#include "skyclerk_config.h"

enum MissionState {
  MISSION_IDLE,
  MISSION_LOAD_PENDING,
  MISSION_READY_TO_DEPART,
  MISSION_EN_ROUTE,
  MISSION_LANDED_AT_DESTINATION,
  MISSION_WAITING_FOR_OFFLOAD,
  MISSION_RETURNING_HOME,
  MISSION_COMPLETE,
  MISSION_FAULT
};

struct TelemetryData {
  double lat = HOME_LAT;
  double lon = HOME_LON;
  float altitude = 0.0f;
  float speed = 0.0f;
  float battery = 100.0f;
  int signal = 0;
  float temp = 0.0f;
  float heading = 0.0f;
  bool armed = false;
  bool landed = true;
  uint32_t lastHeartbeatMs = 0;
};

HardwareSerial FlightSerial(2);
Servo payloadServo;
TelemetryData telemetry;

MissionState missionState = MISSION_IDLE;

String activePackageId = DEFAULT_PACKAGE_ID;
String activeDestination = DEFAULT_DESTINATION;

bool payloadPresent = false;
bool payloadLocked = false;
bool loadedEventSent = false;
bool enRouteEventSent = false;
bool landedEventSent = false;
bool offloadedEventSent = false;
bool returningEventSent = false;

unsigned long payloadStableSinceMs = 0;
unsigned long payloadGoneSinceMs = 0;
unsigned long lastTelemetryPushMs = 0;
unsigned long lastWifiRetryMs = 0;
unsigned long bootMs = 0;

static constexpr unsigned long LOAD_CONFIRM_MS = 180000UL;
static constexpr unsigned long OFFLOAD_CONFIRM_MS = 180000UL;
static constexpr unsigned long TELEMETRY_PUSH_INTERVAL_MS = 1500UL;
static constexpr unsigned long WIFI_RETRY_INTERVAL_MS = 10000UL;
static constexpr float LOAD_DISTANCE_THRESHOLD_CM = 15.0f;
static constexpr float OFFLOAD_DISTANCE_THRESHOLD_CM = 18.0f;
static constexpr float LOW_BATTERY_THRESHOLD = 25.0f;
static constexpr float CRITICAL_BATTERY_THRESHOLD = 18.0f;
static constexpr float LANDING_ALT_THRESHOLD_M = 0.8f;

void setupWiFi();
void maintainWiFi();
void initFlightController();
void processFlightControllerMessages();
void handleMissionStateMachine();
void pushTelemetryIfDue();
void pushTelemetryNow();
void sendMissionEvent(const char* endpoint, JsonDocument& body);
void sendAlert(const char* type, const String& message, float value);
bool postJson(const String& path, JsonDocument& body);
float readDistanceCm(int trigPin, int echoPin);
bool detectPayload();
void lockPayload();
void releasePayload();
bool fcArm(bool arm);
bool fcTakeoff(float targetAltitudeMeters);
bool fcLand();
bool fcReturnToLaunch();
bool fcSetGuidedWaypoint(double lat, double lon, float altMeters);
bool fcSendCommandLong(
  uint16_t command,
  float param1 = 0,
  float param2 = 0,
  float param3 = 0,
  float param4 = 0,
  float param5 = 0,
  float param6 = 0,
  float param7 = 0
);
void fcSendHeartbeat();
String missionStateLabel(MissionState state);

void setup() {
  Serial.begin(115200);
  pinMode(STATUS_LED_PIN, OUTPUT);
  pinMode(ULTRASONIC_TRIG_PIN, OUTPUT);
  pinMode(ULTRASONIC_ECHO_PIN, INPUT);

  payloadServo.setPeriodHertz(50);
  payloadServo.attach(SERVO_PIN, 500, 2400);
  releasePayload();

  bootMs = millis();
  setupWiFi();
  initFlightController();
}

void loop() {
  maintainWiFi();
  processFlightControllerMessages();
  handleMissionStateMachine();
  pushTelemetryIfDue();

  digitalWrite(STATUS_LED_PIN, (millis() / 500) % 2 == 0 ? HIGH : LOW);
  delay(20);
}

void setupWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nWi-Fi connected");
}

void maintainWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  if (millis() - lastWifiRetryMs < WIFI_RETRY_INTERVAL_MS) return;

  lastWifiRetryMs = millis();
  Serial.println("Wi-Fi lost, reconnecting...");
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

void initFlightController() {
  FlightSerial.begin(FC_BAUD_RATE, SERIAL_8N1, FC_RX_PIN, FC_TX_PIN);
  fcSendHeartbeat();
}

void processFlightControllerMessages() {
  mavlink_message_t msg;
  mavlink_status_t status;

  while (FlightSerial.available()) {
    uint8_t c = FlightSerial.read();
    if (!mavlink_parse_char(MAVLINK_COMM_0, c, &msg, &status)) continue;

    if (msg.msgid == MAVLINK_MSG_ID_GLOBAL_POSITION_INT) {
      mavlink_global_position_int_t pos;
      mavlink_msg_global_position_int_decode(&msg, &pos);
      telemetry.lat = pos.lat / 1e7;
      telemetry.lon = pos.lon / 1e7;
      telemetry.altitude = pos.relative_alt / 1000.0f;
      telemetry.heading = pos.hdg == UINT16_MAX ? telemetry.heading : pos.hdg / 100.0f;
      telemetry.speed = sqrtf((pos.vx * pos.vx) + (pos.vy * pos.vy)) / 100.0f;
    } else if (msg.msgid == MAVLINK_MSG_ID_SYS_STATUS) {
      mavlink_sys_status_t sys;
      mavlink_msg_sys_status_decode(&msg, &sys);
      telemetry.battery = sys.battery_remaining;
    } else if (msg.msgid == MAVLINK_MSG_ID_HEARTBEAT) {
      mavlink_heartbeat_t hb;
      mavlink_msg_heartbeat_decode(&msg, &hb);
      telemetry.armed = (hb.base_mode & MAV_MODE_FLAG_SAFETY_ARMED) != 0;
      telemetry.landed = hb.system_status == MAV_STATE_STANDBY || hb.system_status == MAV_STATE_ACTIVE ? telemetry.landed : telemetry.landed;
      telemetry.lastHeartbeatMs = millis();
    } else if (msg.msgid == MAVLINK_MSG_ID_EXTENDED_SYS_STATE) {
      mavlink_extended_sys_state_t ext;
      mavlink_msg_extended_sys_state_decode(&msg, &ext);
      telemetry.landed = ext.landed_state == MAV_LANDED_STATE_ON_GROUND;
    } else if (msg.msgid == MAVLINK_MSG_ID_VFR_HUD) {
      mavlink_vfr_hud_t hud;
      mavlink_msg_vfr_hud_decode(&msg, &hud);
      telemetry.altitude = hud.alt;
      telemetry.speed = hud.groundspeed;
      telemetry.heading = hud.heading;
    }
  }

  telemetry.signal = WiFi.status() == WL_CONNECTED ? WiFi.RSSI() * -1 : 0;
  telemetry.temp = temperatureRead();
}

void handleMissionStateMachine() {
  const bool sensorDetectsPayload = detectPayload();
  const unsigned long now = millis();

  // Payload is present when: sensor detects it, or drone is in flight with payload
  payloadPresent = sensorDetectsPayload || missionState == MISSION_READY_TO_DEPART || missionState == MISSION_EN_ROUTE;

  // Track stable load detection at station (MISSION_IDLE state)
  if (sensorDetectsPayload && missionState == MISSION_IDLE) {
    if (payloadStableSinceMs == 0) payloadStableSinceMs = now;
  } else {
    payloadStableSinceMs = 0;
  }

  // Track payload removal from box after landing (MISSION_WAITING_FOR_OFFLOAD state)
  if (!sensorDetectsPayload && missionState == MISSION_WAITING_FOR_OFFLOAD) {
    if (payloadGoneSinceMs == 0) payloadGoneSinceMs = now;
  } else {
    payloadGoneSinceMs = 0;
  }

  if (telemetry.battery > 0 && telemetry.battery <= CRITICAL_BATTERY_THRESHOLD && missionState != MISSION_RETURNING_HOME) {
    sendAlert("CRITICAL_BATTERY", "Battery level critical, forcing return to launch", telemetry.battery);
    fcReturnToLaunch();
    missionState = MISSION_RETURNING_HOME;
  } else if (telemetry.battery > 0 && telemetry.battery <= LOW_BATTERY_THRESHOLD) {
    sendAlert("LOW_BATTERY", "Battery level below safe mission threshold", telemetry.battery);
  }

  switch (missionState) {
    case MISSION_IDLE:
      if (payloadStableSinceMs > 0 && (now - payloadStableSinceMs) >= LOAD_CONFIRM_MS) {
        activePackageId = DEFAULT_PACKAGE_ID;
        activeDestination = DEFAULT_DESTINATION;
        lockPayload();
        missionState = MISSION_READY_TO_DEPART;

        StaticJsonDocument<192> body;
        body["pkgId"] = activePackageId;
        body["dest"] = activeDestination;
        sendMissionEvent("/api/esp/mission/loaded", body);
        loadedEventSent = true;
      }
      break;

    case MISSION_READY_TO_DEPART:
      if (!telemetry.armed) {
        fcArm(true);
        delay(1000);
      }
      if (fcTakeoff(HOME_ALT_METERS) && fcSetGuidedWaypoint(DEST_LAT, DEST_LON, DEST_ALT_METERS)) {
        missionState = MISSION_EN_ROUTE;

        StaticJsonDocument<192> body;
        body["pkgId"] = activePackageId;
        body["dest"] = activeDestination;
        body["eta"] = "00:03:00";
        sendMissionEvent("/api/esp/mission/enroute", body);
        enRouteEventSent = true;
      }
      break;

    case MISSION_EN_ROUTE: {
      const bool nearDestination =
        fabs(telemetry.lat - DEST_LAT) < 0.00012 &&
        fabs(telemetry.lon - DEST_LON) < 0.00012;

      if (nearDestination && telemetry.altitude <= LANDING_ALT_THRESHOLD_M) {
        missionState = MISSION_LANDED_AT_DESTINATION;
      } else if (nearDestination) {
        fcLand();
      }
      break;
    }

    case MISSION_LANDED_AT_DESTINATION:
      if (!landedEventSent) {
        StaticJsonDocument<192> body;
        body["pkgId"] = activePackageId;
        body["dest"] = activeDestination;
        sendMissionEvent("/api/esp/mission/landed", body);
        landedEventSent = true;
      }
      releasePayload();
      missionState = MISSION_WAITING_FOR_OFFLOAD;
      break;

    case MISSION_WAITING_FOR_OFFLOAD:
      if (!sensorDetectsPayload && payloadGoneSinceMs > 0 && (now - payloadGoneSinceMs) >= OFFLOAD_CONFIRM_MS) {
        if (!offloadedEventSent) {
          StaticJsonDocument<192> body;
          body["pkgId"] = activePackageId;
          body["dest"] = activeDestination;
          sendMissionEvent("/api/esp/mission/offloaded", body);
          offloadedEventSent = true;
        }

        lockPayload();
        if (fcArm(true) && fcTakeoff(DEST_ALT_METERS) && fcReturnToLaunch()) {
          missionState = MISSION_RETURNING_HOME;

          StaticJsonDocument<192> body;
          body["pkgId"] = activePackageId;
          body["dest"] = activeDestination;
          sendMissionEvent("/api/esp/mission/returning", body);
          returningEventSent = true;
        }
      }
      break;

    case MISSION_RETURNING_HOME: {
      const bool nearHome =
        fabs(telemetry.lat - HOME_LAT) < 0.00010 &&
        fabs(telemetry.lon - HOME_LON) < 0.00010;

      if (nearHome && telemetry.altitude <= LANDING_ALT_THRESHOLD_M) {
        missionState = MISSION_COMPLETE;
      }
      break;
    }

    case MISSION_COMPLETE:
      missionState = MISSION_IDLE;
      payloadStableSinceMs = 0;
      payloadGoneSinceMs = 0;
      loadedEventSent = false;
      enRouteEventSent = false;
      landedEventSent = false;
      offloadedEventSent = false;
      returningEventSent = false;
      break;

    case MISSION_LOAD_PENDING:
    case MISSION_FAULT:
    default:
      break;
  }
}

void pushTelemetryIfDue() {
  if (millis() - lastTelemetryPushMs < TELEMETRY_PUSH_INTERVAL_MS) return;
  lastTelemetryPushMs = millis();
  pushTelemetryNow();
}

void pushTelemetryNow() {
  StaticJsonDocument<512> body;
  body["droneId"] = DRONE_ID;
  body["pkgId"] = activePackageId;
  body["dest"] = activeDestination;
  body["battery"] = telemetry.battery;
  body["altitude"] = telemetry.altitude;
  body["speed"] = telemetry.speed;
  body["signal"] = telemetry.signal;
  body["rssi"] = WiFi.status() == WL_CONNECTED ? WiFi.RSSI() : -100;
  body["temp"] = telemetry.temp;
  body["lat"] = telemetry.lat;
  body["lon"] = telemetry.lon;
  body["heading"] = telemetry.heading;
  body["payload"] = payloadPresent ? 1.0f : 0.0f;
  body["payloadPresent"] = payloadPresent;
  body["payloadLocked"] = payloadLocked;
  body["armed"] = telemetry.armed;
  body["uptime"] = (millis() - bootMs) / 1000;
  body["status"] = missionStateLabel(missionState);
  body["source"] = "esp32";

  postJson("/api/esp/telemetry/push", body);
}

void sendMissionEvent(const char* endpoint, JsonDocument& body) {
  body["droneId"] = DRONE_ID;
  body["timestampMs"] = millis();
  body["status"] = missionStateLabel(missionState);
  postJson(endpoint, body);
}

void sendAlert(const char* type, const String& message, float value) {
  StaticJsonDocument<256> body;
  body["alertType"] = type;
  JsonObject details = body["details"].to<JsonObject>();
  details["message"] = message;
  details["value"] = value;
  details["pkgId"] = activePackageId;
  details["droneId"] = DRONE_ID;
  postJson("/api/esp/telemetry/alert", body);
}

bool postJson(const String& path, JsonDocument& body) {
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  const String url = String(API_BASE_URL) + path;

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", API_KEY);

  String payload;
  serializeJson(body, payload);

  const int code = http.POST(payload);
  const String response = http.getString();
  http.end();

  Serial.printf("POST %s -> %d %s\n", url.c_str(), code, response.c_str());
  return code > 0 && code < 300;
}

float readDistanceCm(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  const long duration = pulseIn(echoPin, HIGH, 30000);
  if (duration <= 0) return 999.0f;

  return duration * 0.0343f / 2.0f;
}

bool detectPayload() {
  // Single ultrasonic sensor in payload box detects presence
  return readDistanceCm(ULTRASONIC_TRIG_PIN, ULTRASONIC_ECHO_PIN) <= LOAD_DISTANCE_THRESHOLD_CM;
}

void lockPayload() {
  payloadServo.write(SERVO_LOCK_DEGREES);
  payloadLocked = true;
  Serial.println("Payload locked (servo at 90°)");
}

void releasePayload() {
  payloadServo.write(SERVO_RELEASE_DEGREES);
  payloadLocked = false;
  Serial.println("Payload released (servo at 0°)");
}

bool fcArm(bool arm) {
  return fcSendCommandLong(MAV_CMD_COMPONENT_ARM_DISARM, arm ? 1.0f : 0.0f);
}

bool fcTakeoff(float targetAltitudeMeters) {
  return fcSendCommandLong(MAV_CMD_NAV_TAKEOFF, 0, 0, 0, 0, 0, 0, targetAltitudeMeters);
}

bool fcLand() {
  return fcSendCommandLong(MAV_CMD_NAV_LAND);
}

bool fcReturnToLaunch() {
  return fcSendCommandLong(MAV_CMD_NAV_RETURN_TO_LAUNCH);
}

bool fcSetGuidedWaypoint(double lat, double lon, float altMeters) {
  mavlink_message_t msg;
  uint8_t buf[MAVLINK_MAX_PACKET_LEN];

  mavlink_msg_set_position_target_global_int_pack(
    255, 190, &msg,
    millis(),
    1, 1,
    MAV_FRAME_GLOBAL_RELATIVE_ALT_INT,
    0b0000111111111000,
    static_cast<int32_t>(lat * 1e7),
    static_cast<int32_t>(lon * 1e7),
    altMeters,
    0, 0, 0,
    0, 0, 0,
    0, 0
  );

  const uint16_t len = mavlink_msg_to_send_buffer(buf, &msg);
  FlightSerial.write(buf, len);
  return true;
}

bool fcSendCommandLong(
  uint16_t command,
  float param1,
  float param2,
  float param3,
  float param4,
  float param5,
  float param6,
  float param7
) {
  mavlink_message_t msg;
  uint8_t buf[MAVLINK_MAX_PACKET_LEN];

  mavlink_msg_command_long_pack(
    255, 190, &msg,
    1, 1,
    command,
    0,
    param1,
    param2,
    param3,
    param4,
    param5,
    param6,
    param7
  );

  const uint16_t len = mavlink_msg_to_send_buffer(buf, &msg);
  FlightSerial.write(buf, len);
  delay(200);
  return true;
}

void fcSendHeartbeat() {
  mavlink_message_t msg;
  uint8_t buf[MAVLINK_MAX_PACKET_LEN];

  mavlink_msg_heartbeat_pack(
    255, 190, &msg,
    MAV_TYPE_ONBOARD_CONTROLLER,
    MAV_AUTOPILOT_INVALID,
    0,
    0,
    MAV_STATE_ACTIVE
  );

  const uint16_t len = mavlink_msg_to_send_buffer(buf, &msg);
  FlightSerial.write(buf, len);
}

String missionStateLabel(MissionState state) {
  switch (state) {
    case MISSION_IDLE: return "IDLE";
    case MISSION_LOAD_PENDING: return "LOAD_PENDING";
    case MISSION_READY_TO_DEPART: return "READY_TO_DEPART";
    case MISSION_EN_ROUTE: return "EN_ROUTE";
    case MISSION_LANDED_AT_DESTINATION: return "LANDED";
    case MISSION_WAITING_FOR_OFFLOAD: return "WAITING_FOR_OFFLOAD";
    case MISSION_RETURNING_HOME: return "RETURNING";
    case MISSION_COMPLETE: return "COMPLETE";
    case MISSION_FAULT: return "FAULT";
    default: return "UNKNOWN";
  }
}
