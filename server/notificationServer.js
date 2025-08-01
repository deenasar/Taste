const admin = require('firebase-admin');
const express = require('express');
const app = express();

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(express.json());

app.post('/send-notification', async (req, res) => {
  const { token, title, body, type } = req.body;

  const message = {
    token,
    notification: {
      title,
      body,
    },
    data: {
      type: type || 'general',
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
    },
    android: {
      priority: 'high',
      notification: {
        channelId: 'taste-app',
        sound: 'default',
        priority: 'high',
      }
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    res.json({ success: true, messageId: response });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Notification server running on port ${PORT}`);
});