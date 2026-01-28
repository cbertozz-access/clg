# CLG Snippets

Standalone code snippets for integrating CLG functionality into non-Builder.io sites.

## Available Snippets

### firebase-uid-snippet.html

Universal visitor tracking snippet that can be added to any website.

**Features:**
- Generates unique visitor ID (UID) on first visit
- Persists UID in localStorage across sessions
- Creates device fingerprint for cross-browser tracking
- Pushes UID to dataLayer for GTM/analytics
- Optionally logs visitor records to Firestore

**Installation:**
1. Copy the entire contents of `firebase-uid-snippet.html`
2. Paste into your site's `<head>` section

**For WordPress:**
- Use "Insert Headers and Footers" plugin
- Or add directly to `header.php` in your theme
- Or use a code snippets plugin

**For Google Tag Manager:**
- Create a Custom HTML tag
- Paste the snippet content
- Set trigger to "All Pages"

**Configuration:**
Update the `FIREBASE_CONFIG` object with your Firebase project credentials:
```javascript
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**DataLayer Output:**
```javascript
{
  event: 'clg_uid_ready',
  clg_uid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  clg_device_id: 'DVXXXXXX',
  clg_is_new_visitor: true/false,
  clg_is_new_device: true/false
}
```

**Global Variables:**
After initialization, these are available globally:
- `window.CLG_UID` - The visitor's unique ID
- `window.CLG_DEVICE_ID` - The device fingerprint

---

## Live Demo

View the snippet at: https://clg-ten.vercel.app/snippets/firebase-uid-snippet.html
