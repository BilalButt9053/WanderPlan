import { Platform } from 'react-native';

/**
 * WanderPlan API Configuration
 * 
 * Supports three modes:
 * 1. Local development (same machine)
 * 2. LAN access (physical device on same network)
 * 3. Ngrok tunnel (public URL for any device)
 */

// =============================================================================
// CONFIGURATION - Update these values based on your setup
// =============================================================================

// Your computer's local IP address (run 'ipconfig' on Windows, 'ifconfig' on Mac/Linux)
const SERVER_IP = '192.168.0.109';
const SERVER_PORT = 5000;

// Ngrok URL - Update this when you run: ngrok http 5000
// Set to empty string to use local network instead (phone + PC on same WiFi)
const NGROK_URL = 'https://apivorous-wariest-milena.ngrok-free.dev';

// =============================================================================
// API MODE SELECTION
// =============================================================================

// Set to 'ngrok' to use ngrok tunnel, 'local' for local network
const API_MODE = NGROK_URL ? 'ngrok' : 'local';

// API URLs
const LOCAL_API = `http://${SERVER_IP}:${SERVER_PORT}/api`;
const NGROK_API = NGROK_URL ? `${NGROK_URL}/api` : null;

// Production API (for future deployment)
const PRODUCTION_API = 'https://api.wanderplan.com/api';

// =============================================================================
// EXPORTS
// =============================================================================

export function getApiUrl() {
  // In production builds, use production API
  if (!__DEV__) {
    return PRODUCTION_API;
  }
  
  // In development, use ngrok if configured, otherwise local
  if (API_MODE === 'ngrok' && NGROK_API) {
    return NGROK_API;
  }
  
  return LOCAL_API;
}

export const BASE_URL = getApiUrl();

// Log configuration on startup
console.log('[Config] Mode:', API_MODE);
console.log('[Config] BASE_URL:', BASE_URL);
