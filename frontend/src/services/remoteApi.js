import axios from 'axios';

const BASE_URL = 'http://10.119.43.37:5001';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const getSettings = async (signal) => {
  try {
    const response = await api.get('/api/settings', { signal });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) throw error;
    console.error('Failed to get settings', error);
    return { refresh_interval: 60 }; // Default fallback
  }
};

export const getPrinterList = async (signal) => {
  try {
    const response = await api.get('/api/iplist?mode=printer_db', { signal });
    return response.data; // Expected: ["ip1", "ip2"]
  } catch (error) {
    if (axios.isCancel(error)) throw error;
    console.error('Failed to get printer list', error);
    return [];
  }
};

export const getBlacklist = async (signal) => {
  try {
    const response = await api.get('/api/iplist?mode=blacklist', { signal });
    return response.data; // Expected: ["ip"]
  } catch (error) {
    if (axios.isCancel(error)) throw error;
    console.error('Failed to get blacklist', error);
    return [];
  }
};

export const getLogs = async (signal) => {
  try {
    const response = await api.get('/api/logs', { signal });
    return response.data; 
    /* Expected format: 
      {
        "IP": {
          "logs": [{ "datetime": "...", "drum": 86, "toner": 60 }],
          "name": "PRINTER_NAME"
        }
      }
    */
  } catch (error) {
    if (axios.isCancel(error)) throw error;
    console.error('Failed to get logs', error);
    return {};
  }
};

export const getFavorites = async (signal) => {
  try {
    const response = await api.get('/api/favorites', { signal });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) throw error;
    console.error('Failed to get favorites', error);
    return [];
  }
};
