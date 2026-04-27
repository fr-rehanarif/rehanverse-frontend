import { useEffect, useState } from 'react';
import axios from 'axios';
import API from '../api';
import { useTheme } from '../context/ThemeContext';

function ActivityDashboard() {
  const theme = useTheme();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await axios.get(`${API}/api/activity/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setActivities(res.data);
    } catch (err) {
      console.log('Activity fetch error:', err);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.bg,
        color: theme.text,
        padding: '35px',
      }}
    >
      <h1 style={{ color: theme.primary, marginBottom: '8px' }}>
        🕶️ Security Activity Logs
      </h1>

      <p style={{ color: theme.muted, marginBottom: '25px' }}>
        Track user actions, login activity, course access, device info and IP records.
      </p>

      <div
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: '18px',
          overflowX: 'auto',
          boxShadow: `0 0 35px ${theme.primary}33`,
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: theme.isDark ? '#020617' : '#eef2ff' }}>
              <th style={styles.th}>Date & Time</th>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Action</th>
              <th style={styles.th}>Page</th>
              <th style={styles.th}>IP</th>
              <th style={styles.th}>Device</th>
            </tr>
          </thead>

          <tbody>
            {activities.map((a) => (
              <tr key={a._id} style={{ borderTop: `1px solid ${theme.border}` }}>
                <td style={styles.td}>
                  {new Date(a.createdAt).toLocaleString()}
                </td>

                <td style={styles.td}>
                  {a.user?.name || 'Unknown'}
                </td>

                <td style={styles.td}>
                  {a.user?.email || 'No email'}
                </td>

                <td style={{ ...styles.td, fontWeight: '700', color: theme.primary }}>
                  {a.action}
                </td>

                <td style={styles.td}>{a.page}</td>

                <td style={styles.td}>{a.ip}</td>

                <td style={styles.td}>
                  <span style={{ fontSize: '12px', color: theme.muted }}>
                    {a.device}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {activities.length === 0 && (
          <p style={{ padding: '20px', color: theme.muted }}>
            No activity logs found yet.
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  th: {
    padding: '14px',
    textAlign: 'left',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '14px',
    fontSize: '14px',
    verticalAlign: 'top',
  },
};

export default ActivityDashboard;