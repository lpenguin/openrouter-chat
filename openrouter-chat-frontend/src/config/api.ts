// Environment-aware API base URL configuration
// For Railway: Use VITE_API_URL if set, otherwise fallback to /api for development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export { API_BASE_URL };
