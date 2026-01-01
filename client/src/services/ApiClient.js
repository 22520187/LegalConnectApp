import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

// Clean and process API URL from environment variable
const cleanApiUrl = API_URL 
  ? API_URL.replace(/['"\s]+/g, '').trim().replace(/\/+$/, '') 
  : 'http://localhost:8080';

// Construct API base URL
const API_BASE_URL = cleanApiUrl + '/api';

// Debug logging (remove in production if needed)
if (__DEV__) {
  console.log('🔧 API Configuration:');
  console.log('  - API_URL from env:', API_URL);
  console.log('  - Clean API URL:', cleanApiUrl);
  console.log('  - Final API_BASE_URL:', API_BASE_URL);
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout for better network reliability
  validateStatus: status => status >= 200 && status < 500,
  withCredentials: true,
});

// Add request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {

    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // config.headers.Authorization = token;

    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle common errors here
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);

      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          console.log('Unauthorized access, clearing auth data and redirecting to login');
          // Clear auth data when token is invalid
          try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            console.log('Auth data cleared due to 401 error');

            // You might want to navigate to login screen here
            // This would require importing navigation or using a global state
          } catch (clearError) {
            console.error('Error clearing auth data:', clearError);
          }
          break;
        case 403:
          console.log('Forbidden access, you do not have permission');
          break;
        case 404:
          console.log('Resource not found');
          break;
        case 422:
          console.log('Validation error:', error.response.data);
          break;
        case 429:
          console.log('Too many requests, please try again later');
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          console.log('Server error, please try again later');
          break;
        default:
          console.log('An error occurred:', error.response.data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('❌ Network Error: No response received from server');
      console.error('  - Server might be down or unreachable');
      console.error('  - Check if backend is running at:', API_BASE_URL);
      console.error('  - Check network connection');
      console.error('  - Full error:', error.message);
    } else {
      // Error in setting up the request
      console.error('❌ Request setup error:', error.message);
    }

    // Debug information
    if (__DEV__) {
      console.log('📋 Error Details:');
      console.log('  - Time:', new Date().toISOString());
      console.log('  - Request URL:', error.config?.baseURL + error.config?.url);
      console.log('  - Request method:', error.config?.method?.toUpperCase());
      console.log('  - Full URL:', error.config?.url ? `${error.config.baseURL}${error.config.url}` : 'N/A');
    }

    return Promise.reject(error);
  }
);

export default apiClient;