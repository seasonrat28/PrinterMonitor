import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8088',
  timeout: 10000,
});

// Intercept errors to extract readable message from FastAPI detail
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const detail = err?.response?.data?.detail;
    const msg = typeof detail === 'string' ? detail : err.message;
    return Promise.reject(new Error(msg));
  }
);

export const getDashboardSummary = async () => {
  const response = await api.get('/dashboard/summary');
  return response.data;
};

export const getPrinters = async () => {
  const response = await api.get('/printers/');
  return response.data;
};

export const scanAndSavePrinters = async (network, start = 1, end = 254) => {
  const response = await api.post('/scanner/scan-save', null, {
    params: { network, start, end },
    timeout: 180000, // 3 minutes for full network scan
  });
  return response.data;
};

export const refreshPrinter = async (id) => {
  const response = await api.post(`/printers/${id}/refresh`, null, { timeout: 15000 });
  return response.data;
};

export const getPrinterHistory = async (id) => {
  const response = await api.get(`/printers/${id}/history`);
  return response.data;
};

export const deletePrinter = async (id) => {
  const response = await api.delete(`/printers/${id}`);
  return response.data;
};

// Add one or more printers by IP address
export const addPrinterByIp = async (ips) => {
  // Accept string or array
  const ipList = Array.isArray(ips) ? ips : [ips];
  const response = await api.post('/printers/add-by-ip', { ips: ipList }, { timeout: 60000 });
  return response.data;
};

export const deletePrinterByIp = async (ip) => {
  const response = await api.delete(`/printers/ip/${ip}`);
  return response.data;
};

export default api;
