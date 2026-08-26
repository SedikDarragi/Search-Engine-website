// Centralized API base URL — set via Netlify env REACT_APP_API_URL in production.
// Falls back to localhost for local dev and honors CRA proxy in dev if unset.
export const API_URL =
  (process.env.REACT_APP_API_URL || '').replace(/\/$/, '') || 'http://localhost:3000';

export const API = {
  search: (q, type, page) =>
    `${API_URL}/api/search?q=${encodeURIComponent(q)}&type=${type}&page=${page}`,
  login: `${API_URL}/api/login`,
  signup: `${API_URL}/api/signup`,
  history: `${API_URL}/api/history`,
  historyItem: (id) => `${API_URL}/api/history/${id}`,
  health: `${API_URL}/api/health`,
};
