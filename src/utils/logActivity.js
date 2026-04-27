import axios from 'axios';
import API from '../api';

const logActivity = async (action, page = '') => {
  try {
    const token = localStorage.getItem('token');

    if (!token) return;

    await axios.post(
      `${API}/api/activity/log`,
      { action, page },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (err) {
    console.log('Activity log failed:', err);
  }
};

export default logActivity;