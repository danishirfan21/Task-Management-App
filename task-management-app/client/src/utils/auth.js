// Authentication utility functions

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

/**
 * Get current user from localStorage
 * @returns {object|null}
 */
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Get auth token from localStorage
 * @returns {string|null}
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Store user data and token
 * @param {string} token - JWT token
 * @param {object} user - User data
 */
export const setAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Remove user data and token (logout)
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Format user name for display
 * @param {object} user - User object
 * @returns {string}
 */
export const formatUserName = (user) => {
  if (!user || !user.name) return 'User';
  return user.name.split(' ')[0]; // Return first name only
};
