import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const signup = async (username, email, password) => {
  try {
    const response = await api.post('/auth/signup', { username, email, password });
    return response.data;
  } catch (error) {
    console.error('Signup error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Network error');
  }
};

export const signin = async (username, password) => {
  try {
    const response = await api.post('/auth/signin', { username, password });
    return response.data;
  } catch (error) {
    console.error('Signin error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Network error');
  }
};

export const getProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    const response = await api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Network error');
  }
};

export const updateStats = async (stats) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    const response = await api.put('/auth/stats', stats, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Update stats error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Network error');
  }
};

export const submitScore = async (username, score) => {
    try {
      const response = await axios.post(`${API_URL}/leaderboard/submit`, { username, score });
      return response.data;
    } catch (error) {
      console.error('Error submitting score:', error.response?.data || error.message);
      throw error.response?.data || new Error('Network error');
    }
  };
  
  export const getTopScores = async () => {
    try {
      const response = await axios.get(`${API_URL}/leaderboard/top`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top scores:', error.response?.data || error.message);
      throw error.response?.data || new Error('Network error');
    }
  };

export default api;