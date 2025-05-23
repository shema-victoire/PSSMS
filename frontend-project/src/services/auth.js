import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/';

// Register user
const register = async (username, password, role) => {
  return axios.post(
    API_URL + 'register', 
    { username, password, role }
  );
};

// Login user
const login = async (username, password) => {
  const response = await axios.post(API_URL + 'login', { username, password });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Get current user
const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

// Get token
const getToken = () => {
  const user = getCurrentUser();
  return user?.token;
};

// Check if user is authenticated
const isAuthenticated = () => {
  return !!getCurrentUser();
};

// Check if user is admin
const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  getToken,
  isAuthenticated,
  isAdmin
};

export default authService; 