import axios from 'axios';

const api = axios.create({
  baseURL: 'https://limpness-aspire-reliance.ngrok-free.dev/api/v1',
  timeout: 10000,
  headers: { 'ngrok-skip-browser-warning': 'true' },
});

export default api;
