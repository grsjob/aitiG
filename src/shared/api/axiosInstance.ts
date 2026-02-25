import axios from 'axios';
export const axiosInstance = axios.create({
  baseURL: 'https://dummyjson.com/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
    }

    try {
      const refreshToken =
        localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

      if (refreshToken) {
        const response = await axiosInstance.post('/auth/refresh', {
          refreshToken,
          expiresInMins: 30,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('accessToken', accessToken);

        localStorage.setItem('refreshToken', newRefreshToken);
        sessionStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      }
    } catch (error) {
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');

      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('refreshToken');

      return Promise.reject(error);
    }
  }
);
