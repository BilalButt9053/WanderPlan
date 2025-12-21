import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth Configuration
export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  });

  return { request, response, promptAsync };
};

// Facebook OAuth Configuration
export const useFacebookAuth = () => {
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: 'YOUR_FACEBOOK_APP_ID',
  });

  return { request, response, promptAsync };
};

// Handle Google Sign In
export const handleGoogleSignIn = async (promptAsync, onSuccess, onError) => {
  try {
    const result = await promptAsync();
    
    if (result.type === 'success') {
      const { authentication } = result;
      
      // Fetch user info from Google
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${authentication.accessToken}` },
        }
      );
      
      const userInfo = await userInfoResponse.json();
      
      // Return user data
      return {
        success: true,
        user: {
          email: userInfo.email,
          fullName: userInfo.name,
          profilePhoto: userInfo.picture,
          provider: 'google',
          providerId: userInfo.id,
        },
        accessToken: authentication.accessToken,
      };
    } else if (result.type === 'cancel') {
      return { success: false, cancelled: true };
    } else {
      return { success: false, error: 'Authentication failed' };
    }
  } catch (error) {
    console.error('Google sign in error:', error);
    return { success: false, error: error.message };
  }
};

// Handle Facebook Sign In
export const handleFacebookSignIn = async (promptAsync, onSuccess, onError) => {
  try {
    const result = await promptAsync();
    
    if (result.type === 'success') {
      const { authentication } = result;
      
      // Fetch user info from Facebook
      const userInfoResponse = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${authentication.accessToken}`
      );
      
      const userInfo = await userInfoResponse.json();
      
      // Return user data
      return {
        success: true,
        user: {
          email: userInfo.email,
          fullName: userInfo.name,
          profilePhoto: userInfo.picture?.data?.url,
          provider: 'facebook',
          providerId: userInfo.id,
        },
        accessToken: authentication.accessToken,
      };
    } else if (result.type === 'cancel') {
      return { success: false, cancelled: true };
    } else {
      return { success: false, error: 'Authentication failed' };
    }
  } catch (error) {
    console.error('Facebook sign in error:', error);
    return { success: false, error: error.message };
  }
};

// Generic social login function that can be used with backend
export const sendSocialAuthToBackend = async (socialAuthData, endpoint) => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: socialAuthData.user.email,
        fullName: socialAuthData.user.fullName,
        profilePhoto: socialAuthData.user.profilePhoto,
        provider: socialAuthData.user.provider,
        providerId: socialAuthData.user.providerId,
        accessToken: socialAuthData.accessToken,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Backend authentication error:', error);
    throw error;
  }
};
