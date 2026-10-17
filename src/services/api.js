import axios from 'axios';
import { API_ENDPOINTS } from '../constants';

const rawBaseUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

const api = axios.create({
  baseURL: rawBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s to accommodate Render.com cold starts
});

const isSessionRequest = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url === API_ENDPOINTS.SESSION || url === API_ENDPOINTS.SESSION_LOGIN || url.includes('/api/session');
};

api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ka_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  response => {
    try {
      if (response.data?.token && typeof window !== 'undefined') {
        localStorage.setItem('ka_token', response.data.token);
      }
      const method = (response.config?.method || '').toLowerCase();
      const url = response.config?.url || '';
      if (['post', 'put', 'patch', 'delete'].includes(method) && (url.includes('/api/entries') || url.includes('/api/backup'))) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('entries-updated'));
        }
      }
    } catch {}
    return response;
  },
  async error => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // Auto-retry on timeout (cold starts), network connection drops, or gateway 502/503/504
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout');
    const isNetworkError = !error.response && Boolean(error.request);
    const isGatewayError = error.response && [502, 503, 504].includes(error.response.status);

    const shouldRetry = (isTimeout || isNetworkError || isGatewayError) &&
      (!originalRequest._retryCount || originalRequest._retryCount < 2);

    if (shouldRetry) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      const delay = originalRequest._retryCount * 2000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(originalRequest);
    }

    if (error.response?.status === 401 && !isSessionRequest(originalRequest.url) && !originalRequest._authRetry) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ka_token');
      }
      originalRequest._authRetry = true;
      // If user is currently composing or editing, avoid a hard page reload that destroys their written draft
      const isComposing = typeof window !== 'undefined' && (
        window.location.pathname.includes('/edit') ||
        window.location.pathname.includes('/entries') ||
        window.location.pathname.includes('/dashboard')
      );
      if (!isComposing && typeof window !== 'undefined') {
        window.location.href = '/';
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export const sessionApi = {
  create: (credentials) => api.post(API_ENDPOINTS.SESSION, credentials),
  login: (credentials) => api.post(API_ENDPOINTS.SESSION_LOGIN, credentials),
  checkUsername: (username) => api.get(API_ENDPOINTS.SESSION_USERNAME, { params: { username } }),
  get: () => api.get(API_ENDPOINTS.SESSION),
  updateName: (name) => api.patch(API_ENDPOINTS.SESSION_NAME, { name }),
  delete: () => api.delete(API_ENDPOINTS.SESSION_DELETE),
};

export const entriesApi = {
  list: (params = {}) => api.get(API_ENDPOINTS.ENTRIES, { params }),
  get: (id) => api.get(API_ENDPOINTS.ENTRY(id)),
  create: (data) => api.post(API_ENDPOINTS.ENTRIES, data),
  update: (id, data) => api.patch(API_ENDPOINTS.ENTRY(id), data),
  delete: (id) => api.delete(API_ENDPOINTS.ENTRY(id)),
  toggleFavorite: (id, value) => api.patch(API_ENDPOINTS.ENTRY_FAVORITE(id), { isFavorite: value }),
  togglePin: (id, value) => api.patch(API_ENDPOINTS.ENTRY_PIN(id), { isPinned: value }),
  search: (query, params = {}) => api.get(API_ENDPOINTS.SEARCH, { params: { q: query, ...params } }),
  calendar: (month) => api.get(API_ENDPOINTS.CALENDAR, { params: { month } }),
  onThisDay: () => api.get(API_ENDPOINTS.ON_THIS_DAY),
};

export const categoriesApi = {
  list: () => api.get(API_ENDPOINTS.CATEGORIES),
  create: (data) => api.post(API_ENDPOINTS.CATEGORIES, data),
  update: (id, data) => api.patch(API_ENDPOINTS.CATEGORY(id), data),
  delete: (id) => api.delete(API_ENDPOINTS.CATEGORY(id)),
};

export const exportApi = {
  entry: (id, format) => api.get(API_ENDPOINTS.EXPORT_ENTRY(id, format), { responseType: 'blob' }),
  bulk: (format, data = {}) => api.post(API_ENDPOINTS.EXPORT_BULK(format), data, {
    responseType: 'blob',
    params: data,
  }),
};

export const backupApi = {
  export: () => api.get(API_ENDPOINTS.BACKUP, { responseType: 'blob' }),
  import: (data) => {
    const payload = data instanceof File ? null : data;
    if (data instanceof File) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(reader.result);
            resolve(api.post(API_ENDPOINTS.BACKUP_RESTORE, parsed));
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(data);
      });
    }
    return api.post(API_ENDPOINTS.BACKUP_RESTORE, payload);
  },
  deleteAll: (pin) => api.post(API_ENDPOINTS.BACKUP_DELETE_ALL, { pin }),
};

export const statisticsApi = {
  get: () => api.get(API_ENDPOINTS.STATISTICS),
};

export const publicApi = {
  list: (params = {}) => api.get(API_ENDPOINTS.PUBLIC_ENTRIES, { params }),
  get: (id) => api.get(API_ENDPOINTS.PUBLIC_ENTRY(id)),
  quotes: (params = {}) => api.get(API_ENDPOINTS.PUBLIC_QUOTES, { params }),
  categories: () => api.get(API_ENDPOINTS.PUBLIC_CATEGORIES),
};

export const healthApi = {
  check: () => api.get(API_ENDPOINTS.HEALTH),
};

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default api;
