const API_BASE = '/api';

let authToken = localStorage.getItem('token');

function setToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

function getToken() {
  return authToken;
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('無法連線到伺服器，請確認後端服務是否已啟動');
  }

  if (response.status === 401 || response.status === 403) {
    setToken(null);
    window.location.href = '/login';
    return null;
  }

  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '請求失敗');
  }

  return data;
}

export const api = {
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getMe: () => request('/auth/me'),

  getDashboard: () => request('/parking/dashboard'),

  entry: (plateNumber, vehicleType) =>
    request('/parking/entry', {
      method: 'POST',
      body: JSON.stringify({ plateNumber, vehicleType }),
    }),

  calculateExit: (plateNumber) =>
    request('/parking/exit/calculate', {
      method: 'POST',
      body: JSON.stringify({ plateNumber }),
    }),

  confirmExit: (plateNumber, paymentMethod) =>
    request('/parking/exit/confirm', {
      method: 'POST',
      body: JSON.stringify({ plateNumber, paymentMethod }),
    }),

  getRecords: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/records${query ? `?${query}` : ''}`);
  },

  getRecord: (id) => request(`/records/${id}`),

  getMonthlyCars: () => request('/monthly'),

  createMonthlyCar: (data) =>
    request('/monthly', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMonthlyCar: (id, data) =>
    request(`/monthly/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteMonthlyCar: (id) =>
    request(`/monthly/${id}`, { method: 'DELETE' }),

  getBlacklist: () => request('/blacklist'),

  createBlacklist: (data) =>
    request('/blacklist', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateBlacklist: (id, data) =>
    request(`/blacklist/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteBlacklist: (id) =>
    request(`/blacklist/${id}`, { method: 'DELETE' }),

  getRateSettings: () => request('/rates'),

  updateRateSettings: (data) =>
    request('/rates', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getReports: () => request('/reports/summary'),

  getEventLogs: () => request('/reports/events'),

  getSettings: () => request('/settings'),

  updateSettings: (data) =>
    request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export { setToken, getToken };
