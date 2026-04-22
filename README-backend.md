# Skyclerk Backend API

Backend service for the Skyclerk Drone Delivery System. Handles ESP communication, email notifications, and Firebase integration.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

### 3. Get Firebase Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`skyclerk-df8eb`)
3. Go to Project Settings → Service Accounts
4. Generate new private key
5. Download JSON file
6. Copy values to `.env` file

### 4. Get SendGrid API Key
1. Go to [SendGrid](https://sendgrid.com)
2. Sign up for free account (100 emails/day)
3. Create API Key in Settings → API Keys
4. Copy to `SENDGRID_API_KEY` in `.env`

### 5. Run Development Server
```bash
npm run dev
```

### 6. Test Health Check
```bash
curl http://localhost:3001/api/health
```

## 📡 API Endpoints

### ESP Mission Control
- `POST /api/esp/mission/loaded` - Drone loaded with package
- `POST /api/esp/mission/enroute` - Drone en route to destination
- `POST /api/esp/mission/landed` - Drone landed at destination
- `POST /api/esp/mission/offloaded` - Package offloaded
- `POST /api/esp/mission/returning` - Drone returning to base

### ESP Telemetry
- `POST /api/esp/telemetry/push` - Live telemetry data
- `POST /api/esp/telemetry/alert` - Telemetry alerts/anomalies

### Email Notifications
- `POST /api/notifications/email` - Send email notifications

### Health Check
- `GET /api/health` - Server status

## 🔧 ESP32 Integration Example

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* serverUrl = "http://your-backend-url.com/api/esp";

void sendMissionUpdate(String endpoint, String pkgId) {
  HTTPClient http;
  http.begin(serverUrl + endpoint);
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"pkgId\":\"" + pkgId + "\"}";
  int response = http.POST(payload);
  http.end();
}

// When drone loads package
sendMissionUpdate("/mission/loaded", "PKG-041");

// When drone takes off
sendMissionUpdate("/mission/enroute", "PKG-041");

// When drone lands
sendMissionUpdate("/mission/landed", "PKG-041");
```

## 🚀 Deployment

### Option 1: Railway (Recommended)
1. Connect GitHub repo
2. Add environment variables
3. Deploy automatically

### Option 2: Heroku
```bash
heroku create your-app-name
heroku config:set SENDGRID_API_KEY=your_key
heroku config:set FIREBASE_PRIVATE_KEY="your_key"
git push heroku main
```

### Option 3: Render
1. Connect GitHub repo
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

### Option 4: DigitalOcean/VPS
```bash
# Install PM2 for process management
npm install -g pm2
pm2 start server.js --name skyclerk-backend
pm2 startup
pm2 save
```

## 🔐 Security

- Use HTTPS in production
- Set up proper CORS policies
- Consider API authentication for ESP endpoints
- Regularly rotate API keys

## 📊 Monitoring

- Check `/api/health` endpoint
- Monitor Firebase usage
- Track SendGrid email limits
- Log ESP communication

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify service account key is correct
- Check Firebase project permissions
- Ensure Firestore is enabled

### Email Not Sending
- Verify SendGrid API key
- Check sender email is verified
- Monitor SendGrid dashboard

### ESP Connection Issues
- Check backend URL is accessible
- Verify JSON payload format
- Check ESP WiFi connection

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (defaults to 3001) |
| `SENDGRID_API_KEY` | SendGrid API key | Yes |
| `SENDGRID_FROM_EMAIL` | Verified sender email | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_PRIVATE_KEY` | Service account private key | Yes |
| `FIREBASE_CLIENT_EMAIL` | Service account email | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | No |

## 🤝 Contributing

1. Test all endpoints with ESP simulator
2. Verify email delivery
3. Check Firebase data consistency
4. Monitor error logs