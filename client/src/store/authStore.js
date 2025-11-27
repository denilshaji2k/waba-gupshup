import create from 'zustand';
import { jwtDecode } from 'jwt-decode';
import API from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // Initialize auth from localStorage
  initAuth: () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          set({ token, isAuthenticated: true });
          API.setAuthToken(token);
          // Fetch user data
          get().getCurrentUser();
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
  },

  // Register user
  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await API.post('/auth/register', userData);
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      API.setAuthToken(token);
      
      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Login user
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await API.post('/auth/login', { email, password });
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      API.setAuthToken(token);
      
      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await API.get('/auth/me');
      set({ user: response.data.data });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const response = await API.put('/auth/profile', profileData);
      set({ user: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Update failed';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    set({ loading: true, error: null });
    try {
      const response = await API.put('/auth/change-password', passwordData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    API.setAuthToken(null);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },
}));

export default useAuthStore;
