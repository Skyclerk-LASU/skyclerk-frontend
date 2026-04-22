# **BACKEND INTEGRATION GUIDE**
## **Setting Up Email Notifications for Skyclerk Drone Delivery System**

---

## **🎯 Overview**

Your **frontend is now 90% ready**. The remaining piece is the **backend API** that:
1. Receives email requests from the frontend
2. Sends them via an email provider (SendGrid, AWS SES, Gmail, Mailgun, etc.)
3. Logs delivery status

---

## **📋 Required Backend Endpoints**

### **1. Email Notification Endpoint**
**POST** `/api/notifications/email`

**Request Body:**
```json
{
  "to": "user@example.com",
  "subject": "DRONE LOADED - PKG-041",
  "body": "Package PKG-041 loaded. Ready to depart to MECH",
  "recipientName": "Department of Mechanical Engineering",
  "timestamp": "2026-04-17T10:30:45Z"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "msg_12345",
  "status": "sent",
  "provider": "SendGrid",
  "timestamp": "2026-04-17T10:30:45Z"
}
```

---

## **🛠️ Backend Setup Options**

### **Option A: Node.js/Express + SendGrid** (Recommended)

#### **1. Install dependencies**
```bash
npm install express sendgrid dotenv cors axios
```

#### **2. Create `.env` file**
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@skyclerk.edu.ng
BACKEND_PORT=3001
```

#### **3. Create `server.js`**
```javascript
const express = require('express');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
require('dotenv').config();

const app = express();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running ✓' });
});

// Email notification endpoint
app.post('/api/notifications/email', async (req, res) => {
  try {
    const { to, subject, body, recipientName, timestamp } = req.body;

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto;">
              <h2>${subject}</h2>
              <p>${body.replace(/\n/g, '<br>')}</p>
              <hr>
              <small style="color: #999;">
                Sent by Skyclerk Drone Delivery System<br>
                ${new Date(timestamp).toLocaleString()}
              </small>
            </div>
          </body>
        </html>
      `,
    };

    await sgMail.send(msg);

    res.json({
      success: true,
      messageId: `msg_${Date.now()}`,
      status: 'sent',
      provider: 'SendGrid',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('SendGrid error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

const PORT = process.env.BACKEND_PORT || 3001;
app.listen(PORT, () => {
  console.log(`✓ Skyclerk Backend running on http://localhost:${PORT}`);
});
```

#### **4. Get SendGrid API Key**
- Go to [SendGrid](https://sendgrid.com/)
- Sign up for free tier (100 emails/day)
- Create API key from Settings → API Keys
- Add to `.env` file

#### **5. Run backend**
```bash
node server.js
```

---

### **Option B: Firebase Cloud Functions** (Serverless)

#### **1. Install Firebase CLI**
```bash
npm install -g firebase-tools
firebase login
```

#### **2. Create Cloud Function**
```bash
firebase init functions
```

#### **3. Edit `functions/index.js`**
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD, // Use app-specific password
  },
});

exports.sendEmailNotification = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { to, subject, body } = req.body;

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to,
      subject,
      html: body.replace(/\n/g, '<br>'),
    });

    res.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

#### **4. Deploy**
```bash
firebase deploy --only functions
```

---

### **Option C: Python/Flask + AWS SES**

#### **1. Install dependencies**
```bash
pip install flask boto3 python-dotenv
```

#### **2. Create `app.py`**
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

ses = boto3.client(
    'ses',
    region_name='us-east-1',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY'),
    aws_secret_access_key=os.getenv('AWS_SECRET_KEY')
)

@app.route('/api/notifications/email', methods=['POST'])
def send_email():
    try:
        data = request.json
        ses.send_email(
            Source=os.getenv('SES_FROM_EMAIL'),
            Destination={'ToAddresses': [data['to']]},
            Message={
                'Subject': {'Data': data['subject']},
                'Body': {'Html': {'Data': data['body']}}
            }
        )
        return jsonify({'success': True, 'timestamp': str(datetime.now())})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3001)
```

---

## **🔗 Frontend Configuration**

### **Add to your `.env` file:**
```env
VITE_BACKEND_API_URL=http://localhost:3001/api
VITE_API_KEY=your_secret_api_key_here
```

### **Update `vite.config.js` if needed:**
```javascript
export default {
  define: {
    __VITE_BACKEND_URL__: JSON.stringify(process.env.VITE_BACKEND_API_URL),
  },
}
```

---

## **📊 Architecture Flow**

```
┌─────────────────┐
│  Frontend App   │
│ (React + Vite)  │
└────────┬────────┘
         │ POST /api/notifications/email
         │ (with bearer token)
         ▼
┌─────────────────────────────┐
│  Your Backend API           │
│  (Node/Python/CF)           │
│  - Validates request         │
│  - Logs to database         │
└────────┬────────────────────┘
         │
         ├─► Error logging
         │
         ▼
┌──────────────────┐
│ Email Provider   │
│ (SendGrid/SES)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  User Email      │
│  (admin/receiver)│
└──────────────────┘
```

---

## **✅ Testing the Stack**

### **1. Test locally**

```bash
# Terminal 1: Start backend
node server.js

# Terminal 2: Start frontend
npm run dev
```

### **2. Trigger a notification**
In `src/pages/DashboardPage.jsx`, add a test button:
```javascript
import { notify } from '../services/inAppNotificationService'

<button onClick={() => {
  notify.success('Test', 'Backend notification system working!')
}}>
  Test Toast
</button>
```

### **3. Check Firebase logs**
Firestore collection `notifications` should show sent emails:
```json
{
  "type": "DEPARTURE",
  "pkg": "PKG-041",
  "channel": "EMAIL",
  "status": "sent",
  "timestamp": "2026-04-17T10:30:45Z"
}
```

---

## **🚀 Deployment Checklist**

- [ ] Backend API deployed (Heroku, Railway, Render, AWS, GCP, etc.)
- [ ] Environment variables set on backend
- [ ] CORS properly configured for frontend domain
- [ ] Email provider credentials secured (use env vars, not hardcoded)
- [ ] Update `VITE_BACKEND_API_URL` in frontend `.env`
- [ ] Test email delivery end-to-end
- [ ] Set up email logging/analytics
- [ ] Configure error alerts (Sentry, Datadog, etc.)
- [ ] Monitor email quota (avoid rate limits)

---

## **🐛 Troubleshooting**

### **Emails not arriving?**
1. Check backend logs for errors
2. Verify email provider credentials
3. Check spam folder
4. Ensure recipient email is valid

### **CORS errors?**
Backend needs:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

### **Rate limiting?**
Most free tiers have limits:
- **SendGrid**: 100/day free
- **AWS SES**: 50,000/month free
- **Gmail**: ⚠️ Not recommended for production

## **📡 ESP Hardware Integration Endpoints**

### **Mission State Endpoints**
Your ESP can call these endpoints when it detects mission events:

#### **POST** `/api/esp/mission/loaded`
**Trigger:** When ESP detects package is loaded on drone
```json
{
  "pkgId": "PKG-041"
}
```

#### **POST** `/api/esp/mission/enroute`
**Trigger:** When drone takes off and starts mission
```json
{
  "pkgId": "PKG-041",
  "eta": "00:15:30"
}
```

#### **POST** `/api/esp/mission/landed`
**Trigger:** When drone lands at destination
```json
{
  "pkgId": "PKG-041"
}
```

#### **POST** `/api/esp/mission/offloaded`
**Trigger:** When package is removed from drone
```json
{
  "pkgId": "PKG-041"
}
```

#### **POST** `/api/esp/mission/returning`
**Trigger:** When drone starts return journey
```json
{
  "pkgId": "PKG-041"
}
```

#### **POST** `/api/esp/telemetry/alert`
**Trigger:** When ESP detects telemetry anomalies
```json
{
  "alertType": "LOW_BATTERY",
  "details": {
    "message": "Battery level below 20%",
    "value": "18%"
  }
}
```

#### **POST** `/api/esp/telemetry/push`
**Trigger:** Continuous telemetry updates
```json
{
  "altitude": 45.2,
  "speed": 12.5,
  "battery": 85,
  "temperature": 38.5,
  "gps": {
    "lat": 6.5869,
    "lng": 3.9765,
    "accuracy": 2.1
  },
  "timestamp": "2026-04-17T10:30:45Z"
}
```

### **ESP Integration Code Example**

```javascript
// In your backend server.js, add these endpoints:

// Mission state endpoints
app.post('/api/esp/mission/loaded', async (req, res) => {
  const { pkgId } = req.body;
  // Call your frontend mission service logic here
  // This will trigger notifications automatically
  res.json({ success: true });
});

app.post('/api/esp/mission/enroute', async (req, res) => {
  const { pkgId, eta } = req.body;
  // Trigger en-route notifications
  res.json({ success: true });
});

// Add similar endpoints for landed, offloaded, returning

// Telemetry endpoint
app.post('/api/esp/telemetry/push', async (req, res) => {
  const telemetry = req.body;
  // Push to Firebase Realtime Database
  res.json({ success: true });
});
```

### **ESP32 Arduino Code Example**

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YourWiFi";
const char* password = "YourPassword";
const char* serverUrl = "http://your-backend-server.com/api/esp";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
  }
  Serial.println("Connected to WiFi");
}

void sendNotification(String endpoint, String jsonData) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl + endpoint);
    http.addHeader("Content-Type", "application/json");
    
    int httpResponseCode = http.POST(jsonData);
    
    if (httpResponseCode > 0) {
      Serial.println("Notification sent: " + String(httpResponseCode));
    } else {
      Serial.println("Error sending notification");
    }
    http.end();
  }
}

void loop() {
  // When package is loaded
  if (packageLoadedDetected()) {
    String jsonData = "{\"pkgId\":\"PKG-041\"}";
    sendNotification("/mission/loaded", jsonData);
  }
  
  // When drone takes off
  if (takeoffDetected()) {
    String jsonData = "{\"pkgId\":\"PKG-041\",\"eta\":\"00:15:30\"}";
    sendNotification("/mission/enroute", jsonData);
  }
  
  // When drone lands
  if (landingDetected()) {
    String jsonData = "{\"pkgId\":\"PKG-041\"}";
    sendNotification("/mission/landed", jsonData);
  }
  
  delay(1000);
}
```

1. ✅ **Choose backend option** (Node.js/Firebase/Python)
2. ✅ **Set up email provider** (SendGrid/SES/Gmail)
3. ✅ **Deploy backend API**
4. ✅ **Update frontend `.env`**
5. ✅ **Test end-to-end**
6. ✅ **Deploy frontend**

---

## **Questions?**

Your frontend is ready. Just need the backend!

**Frontend IS READY FOR:**
- ✅ In-app notifications (automatic on events)
- ✅ Email trigger service (calls backend)
- ✅ User/role management
- ✅ Mission state tracking
- ✅ Automated notifications (pending backend)

**You NEED TO BUILD:**
- ❌ Backend API server
- ❌ Email provider integration
- ❌ Firestore logging endpoints
- ❌ Error handling & monitoring
