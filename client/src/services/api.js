import axios from 'axios';
import { normalizeApiUrl, docsUrl } from '../utils/apiUrl';

// Always ends in /api/v1, even if the deployment's setting gave only the host.
const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);

export const DOCS_URL = docsUrl(API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// The access token lives in memory only: a script injected into the page cannot read it from storage, and a
// reload gets a fresh one from the httpOnly refresh cookie (see restoreSession). The only thing kept in
// localStorage is a harmless flag saying "this browser had a session", so a first-time visitor does not
// make a pointless refresh request.
let accessToken = null;
const SESSION_FLAG = 'pv_session';

export const setAccessToken = (token) => { accessToken = token; };
export const hasSessionFlag = () => localStorage.getItem(SESSION_FLAG) === '1';
export const setSessionFlag = (on) => (on ? localStorage.setItem(SESSION_FLAG, '1') : localStorage.removeItem(SESSION_FLAG));

// Earlier versions kept the access token and the user in localStorage; remove what they left behind.
['accessToken', 'user'].forEach((key) => localStorage.removeItem(key));

// One refresh at a time. When the 15-minute token expires, a page's parallel requests all get a 401 together.
// The server rotates the refresh token on every refresh, so if each of them refreshed separately only the
// first would succeed and the rest would sign the user out. They share this one promise instead.
let refreshing = null;
let redirecting = false;
export function refreshSession() {
  if (!refreshing) {
    refreshing = axios
      .post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        const { user, accessToken: token } = res.data.data;
        accessToken = token;
        return user;
      })
      .finally(() => { refreshing = null; });
  }
  return refreshing;
}

// Request interceptor - attach access token
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // A 401 from the sign-in calls themselves (wrong password) is an answer, not an expired session:
    // refreshing there would fail and reload the page, losing the error message.
    const isAuthCall = /^\/auth\/(login|register|guest|refresh)/.test(originalRequest?.url || '');

    // If 401 and not already retried, try refresh
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthCall) {
      originalRequest._retry = true;

      try {
        await refreshSession();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout. Several requests can fail together; send the user to sign in once.
        accessToken = null;
        setSessionFlag(false);
        if (!redirecting && window.location.pathname !== '/login') {
          redirecting = true;
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth API ───────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  guest: () => api.post('/auth/guest'),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
};

// A sleeping free-tier server can take about a minute to answer its first request. Used to show that wait.
export const pingServer = (signal) => axios.get(`${API_URL}/health`, { timeout: 90000, signal });

// ─── Users API ──────────────────────────────────────────────
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/users/${id}`),
};

// ─── Crypto Assets API ───────────────────────────────────────────
export const assetsAPI = {
  getAll: (params) => api.get('/assets', { params }),
  getById: (id) => api.get(`/assets/${id}`),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
  getCategories: () => api.get('/assets/categories'),
};

export default api;
