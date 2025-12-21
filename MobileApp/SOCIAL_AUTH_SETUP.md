# Social Authentication Setup Guide

This guide will help you configure Google and Facebook OAuth for the WanderPlan mobile app.

## 📱 Google OAuth Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable "Google+ API" for your project

### 2. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure the consent screen if prompted
4. Create credentials for each platform:

#### For Android:
- Application type: Android
- Package name: Get from `app.json` (e.g., `com.wanderplan.app`)
- SHA-1 fingerprint: 
  - **For Development (Skip for now)**: You can skip this if using Expo Go
  - **Windows**: `keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android`
  - **Mac/Linux**: `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`
  - **Note**: If keystore doesn't exist, run your app once with `npx expo run:android` to generate it

#### For iOS:
- Application type: iOS
- Bundle ID: Get from `app.json` (e.g., `com.wanderplan.app`)

#### For Expo Go (Development):
- Application type: Web application
- Authorized redirect URIs: `https://auth.expo.io/@YOUR_EXPO_USERNAME/YOUR_APP_SLUG`

### 3. Update Configuration
Open `app/utils/socialAuth.js` and replace:
```javascript
// For Expo Go development, you only need expoClientId initially
expoClientId: 'YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com',

// Add these later when building standalone apps:
// iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
// androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
// webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
```

**Quick Start Steps:**
1. Create a Web application OAuth client in Google Console
2. Set redirect URI to: `https://auth.expo.io/@YOUR_EXPO_USERNAME/wanderplan`
3. Copy the Client ID
4. Paste it as `expoClientId` in `socialAuth.js`
5. That's it for Expo Go testing!

## 🔵 Facebook OAuth Setup

### 1. Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" > "Create App"
3. Choose "Consumer" as app type
4. Fill in app details and create

### 2. Configure Facebook Login
1. In your app dashboard, go to "Add Product"
2. Find "Facebook Login" and click "Set Up"
3. Choose platform (iOS, Android)
4. Follow the setup wizard

### 3. Get App ID
1. Go to "Settings" > "Basic"
2. Copy your "App ID"

### 4. Configure OAuth Redirect
1. Go to "Facebook Login" > "Settings"
2. Add OAuth Redirect URIs:
   - For Expo Go: `https://auth.expo.io/@YOUR_EXPO_USERNAME/YOUR_APP_SLUG`
   - For production: Your app's deep link

### 5. Update Configuration
Open `app/utils/socialAuth.js` and replace:
```javascript
clientId: 'YOUR_FACEBOOK_APP_ID',
```

## 📝 app.json Configuration

Add the following to your `app.json`:

```json
{
  "expo": {
    "scheme": "wanderplan",
    "plugins": [
      [
        "expo-auth-session",
        {
          "scheme": "wanderplan"
        }
      ]
    ]
  }
}
```

## 🔧 Testing

### In Expo Go (Development) - **START HERE**:
1. **You don't need Android/iOS keystore for Expo Go!**
2. Only set up the **Expo Go (Web application)** OAuth client in Google Console
3. Make sure you're logged into Expo CLI: `npx expo login`
4. Get your Expo username: `npx expo whoami`
5. In Google Console, add redirect URI: `https://auth.expo.io/@YOUR_EXPO_USERNAME/wanderplan`
6. Update `app/utils/socialAuth.js` with only the `expoClientId`
7. Start your app: `npx expo start`
8. The OAuth will redirect through Expo's auth proxy

### In Production Build:
1. Build your app: `eas build --platform android` or `eas build --platform ios`
2. The OAuth will use direct redirects to your app

## 🔐 Security Best Practices

1. **Never commit credentials**: Keep OAuth credentials in environment variables
2. **Use different apps for dev/prod**: Create separate Facebook/Google apps for development and production
3. **Enable App Check**: Use Firebase App Check or similar to prevent API abuse
4. **Keystore file does not exist" error
- **For Expo Go development**: You can skip this! You don't need a keystore yet.
- **For standalone builds**: Generate keystore by running `npx expo run:android` once
- **Windows users**: Use `%USERPROFILE%\.android\debug.keystore` instead of `~/.android/debug.keystore`

### "Invalid client" error
- Check that your client IDs match exactly
- For Expo Go: Make sure you're using a Web application OAuth client
- Ensure the redirect URI includes your correct Expo username

### Redirect not working
- Verify your redirect URIs are correctly configured
- Check that the scheme in app.json matches your configuration
- For Expo Go: URI must be `https://auth.expo.io/@YOUR_USERNAME/wanderplan`

### Facebook login fails
- Ensure your app is in "Live" mode (not "Development")
- Check that Facebook Login product is enabled
- Verify your App ID is correct
- Add the same Expo redirect URI as Googletch exactly
- Ensure the package name/bundle ID matches your app configuration

### Redirect not working
- Verify your redirect URIs are correctly configured
- Check that the scheme in app.json matches your configuration

### Facebook login fails
- Ensure your app is in "Live" mode (not "Development")
- Check that Facebook Login product is enabled
- Verify your App ID is correct
