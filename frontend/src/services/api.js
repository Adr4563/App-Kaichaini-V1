import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.44:3000/api/v1',
  timeout: 10000,
});

export default api;
