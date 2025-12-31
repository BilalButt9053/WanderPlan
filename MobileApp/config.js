import { Platform } from 'react-native';

/**
 * Simple, reliable API configuration
 * Set your computer's IP address here
 */

// IMPORTANT: Update this with your computer's IP address
// To find it: Run 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux) in terminal
// Look for IPv4 Address under your active network connection
const SERVER_IP = '192.168.0.101'; // <-- UPDATE THIS with your PC's IP
const SERVER_PORT = 5000;

export function getApiUrl() {
  // Always use the SERVER_IP for physical devices (Expo Go)
  // Physical devices need your computer's LAN IP
  return `http://${SERVER_IP}:${SERVER_PORT}/api`;
}

export const BASE_URL = getApiUrl();
console.log('[Config] Final BASE_URL:', BASE_URL);
