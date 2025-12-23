const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function handleResponse(response) {
  const text = await response.text();
  if (!response.ok) {
    try {
      const errorData = JSON.parse(text);
      return Promise.reject({ ...errorData, status: response.status, statusText: response.statusText });
    } catch {
      const error = new Error(text || 'Network error');
      error.status = response.status;
      return Promise.reject(error);
    }
  }
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export const api = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  getMyProfile: async (token) => {
    const response = await fetch(`${API_URL}/employees/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
  },

  fetchEmployees: async (token, page = 0, firstName = '') => {
    let url = `${API_URL}/employees?page=${page}`;
    if (firstName) url = `${API_URL}/employees/by-first-name/${firstName}?page=${page}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
  },

  fetchAllEmployees: async (token) => {
    const response = await fetch(`${API_URL}/employees?page=0&size=1000`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
  },

  fetchManagers: async (token) => {
    const response = await fetch(`${API_URL}/employees/managers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
  },

  fetchDirectReports: async (token) => {
    const response = await fetch(`${API_URL}/employees/by-manager`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
  },

  createEmployee: async (token, payload) => {
    const response = await fetch(`${API_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  updateEmployee: async (token, id, payload) => {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  deleteEmployee: async (token, id) => {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
  },

  fetchVacations: async (token, page = 0) => {
    const response = await fetch(`${API_URL}/vacations?page=${page}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
  },

  createVacation: async (token, payload) => {
    const response = await fetch(`${API_URL}/vacations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  updateVacationDecision: async (token, id, payload) => {
    const response = await fetch(`${API_URL}/vacations/${id}/decision`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  deleteVacation: async (token, id) => {
    const response = await fetch(`${API_URL}/vacations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
  },
};

export default api;
