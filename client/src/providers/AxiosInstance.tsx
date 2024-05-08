import axios, { AxiosInstance } from 'axios';

// Create an Axios instance
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api/',
  timeout: 5000, 
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response.status === 401 &&!originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem('refreshToken'); // Ensure you have a refresh token stored
        if (refreshToken) {
          try {
            const response = await axios.post('/api/refresh', { refreshToken });
            localStorage.setItem('authToken', response.data.authToken);
            return axiosInstance(originalRequest);
          } catch (err) {
            console.error('Failed to refresh token', err);
            // Handle refresh token failure, e.g., redirect to login
          }
        }
      }
      return Promise.reject(error);
    }
  );
  