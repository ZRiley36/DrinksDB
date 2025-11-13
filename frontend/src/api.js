// API utility for making requests
// Uses environment variable for API URL, falls back to relative path for local dev

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = {
  get: async (endpoint) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.details || `Request failed: ${response.status}`);
    }
    return response.json();
  }
};

