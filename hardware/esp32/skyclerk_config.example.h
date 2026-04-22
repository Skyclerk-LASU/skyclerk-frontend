#pragma once

// Wi-Fi
static const char* WIFI_SSID = "YOUR_WIFI_SSID";
static const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Skyclerk backend bridge
static const char* API_BASE_URL = "http://192.168.1.20:3001";
static const char* API_KEY = "replace-with-strong-shared-secret";

// Mission identity
static const char* DRONE_ID = "SKYCLERK-01";
static const char* DEFAULT_PACKAGE_ID = "PKG-041";
static const char* DEFAULT_DESTINATION = "ASE";

// Optional static home / destination coordinates used if your flight controller
// is not already holding a mission plan.
static constexpr double HOME_LAT = 6.5530;
static constexpr double HOME_LON = 3.9806;
static constexpr double HOME_ALT_METERS = 8.0;

static constexpr double DEST_LAT = 6.5600;
static constexpr double DEST_LON = 3.9900;
static constexpr double DEST_ALT_METERS = 8.0;

// Serial link to the flight controller.
static constexpr int FC_RX_PIN = 16;
static constexpr int FC_TX_PIN = 17;
static constexpr uint32_t FC_BAUD_RATE = 57600;

// Ultrasonic sensor (in payload box for load detection & offload confirmation)
static constexpr int ULTRASONIC_TRIG_PIN = 5;
static constexpr int ULTRASONIC_ECHO_PIN = 18;

// Servo for payload lock / release
static constexpr int SERVO_PIN = 23;
static constexpr int SERVO_LOCK_DEGREES = 90;      // 90° turn to lock
static constexpr int SERVO_RELEASE_DEGREES = 0;    // Return to unlock

// Optional buzzer / status LED
static constexpr int STATUS_LED_PIN = 2;

