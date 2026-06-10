/**
 * SENA Mobile App — Environment Configuration
 *
 * Centralized environment variables
 */

// API base URL pointing to the Express.js backend
export const API_URL = __DEV__
  ? 'http://10.0.2.2:5000/api' // Android emulator localhost
  : 'https://your-production-api.com/api';

// For iOS simulator, use: 'http://localhost:5000/api'
// For physical device, use your machine's local IP: 'http://192.168.x.x:5000/api'
