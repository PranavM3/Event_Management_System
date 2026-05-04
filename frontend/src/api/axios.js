import axios from 'axios';

const API = axios.create({
  baseURL: "https://event-management-system-5h3m.onrender.com/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('REQUEST:', config.method?.toUpperCase(), config.baseURL + config.url, config.data || '');
  return config;
});

API.interceptors.response.use(
  (response) => {
    console.log('RESPONSE:', response.status, response.config.url);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    console.log('ERROR:', status, error.config?.url, error.response?.data);
    if (status === 401 && !error.config?.url?.includes('/auth/')) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
