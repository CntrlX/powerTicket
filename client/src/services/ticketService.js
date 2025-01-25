import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tickets';

// Create axios instance with auth header
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const createTicket = async (formData) => {
  try {
    const response = await axiosInstance.post('/', formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getUserTickets = async () => {
  try {
    const response = await axiosInstance.get('/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTicket = async (ticketId) => {
  try {
    const response = await axiosInstance.get(`/${ticketId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateTicket = async (ticketId, formData) => {
  try {
    const response = await axiosInstance.patch(`/${ticketId}`, formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const addMessage = async (ticketId, formData) => {
  try {
    const response = await axiosInstance.post(`/${ticketId}/messages`, formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteTicket = async (ticketId) => {
  try {
    const response = await axiosInstance.delete(`/${ticketId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 