import axios from 'axios';

let interceptorAdded = false;
let logoutInProgress = false;

export const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('role');
  localStorage.removeItem('isAdmin');
};

export const setupAuthErrorHandler = () => {
  if (interceptorAdded) return;

  interceptorAdded = true;

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        '';

      const lowerMessage = String(message).toLowerCase();

      const isAuthError =
        status === 401 ||
        lowerMessage.includes('jwt') ||
        lowerMessage.includes('token') ||
        lowerMessage.includes('unauthorized') ||
        lowerMessage.includes('not authorized') ||
        lowerMessage.includes('invalid token') ||
        lowerMessage.includes('expired') ||
        lowerMessage.includes('session');

      if (isAuthError && !logoutInProgress) {
        logoutInProgress = true;

        const currentPath = window.location.pathname;
        const logoutMsg = 'Session expired. Please login again.';

        clearAuthStorage();

        if (currentPath !== '/login' && currentPath !== '/signup') {
          localStorage.setItem('auth_flash_message', logoutMsg);
          window.location.href = '/login';
        } else {
          localStorage.setItem('auth_flash_message', logoutMsg);

          setTimeout(() => {
            logoutInProgress = false;
          }, 1500);
        }
      }

      return Promise.reject(error);
    }
  );
};