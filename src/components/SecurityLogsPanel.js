import { useEffect, useState } from 'react';
import axios from 'axios';
import API from '../api';
import { motion } from 'framer-motion';

function SecurityLogsPanel({ theme }) {
  const [activities, setActivities] = useState([]);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await axios.get(`${API}/api/activity/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setActivities(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchActivities();

    const interval = setInterval(fetchActivities, 4000); // 🔥 live refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* 🔥 HEADER */}
      <motion.div
        animate={{
          boxShadow: [
            `0 0 15px ${theme.primary}44`,
            `0 0 45px ${theme.primary}88`,
            `0 0 15px ${theme.primary}44`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          padding: '20px',
          borderRadius: '18px',
          border: `1px solid ${theme.primary}`,
          marginBottom: '20px',
          background: 'rgba(2,6,23,0.9)',
        }}
      >
        <h2 style={{ color: theme.primary }}>🕶️ Security Command Center</h2>
        <p style={{ color: theme.muted }}>
          Real-time tracking of user activity, IP, device and actions.
        </p>
      </motion.div>

      {/* 🔥 TABLE */}
      <div
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: '18px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            background: '#020617',
            color: '#a78bfa',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{
              width: '10px',
              height: '10px',
              background: '#22c55e',
              borderRadius: '50%',
              boxShadow: '0 0 10px #22c55e',
            }}
          />
          LIVE ACTIVITY FEED
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#020617' }}>
              <th style={th}>Time</th>
              <th style={th}>User</th>
              <th style={th}>Action</th>
              <th style={th}>IP</th>
              <th style={th}>Device</th>
            </tr>
          </thead>

          <tbody>
            {activities.map((a) => (
              <motion.tr
                key={a._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: 'rgba(139,92,246,0.15)' }}
              >
                <td style={td}>
                  {new Date(a.createdAt).toLocaleString()}
                </td>

                <td style={td}>
                  {a.user?.name}
                  <br />
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {a.user?.email}
                  </span>
                </td>

                <td style={{ ...td, color: theme.primary, fontWeight: '800' }}>
                  {a.action}
                </td>

                <td style={td}>{a.ip}</td>

                <td style={{ ...td, fontSize: '12px', color: '#94a3b8' }}>
                  {a.device}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = {
  padding: '12px',
  color: '#e5e7eb',
  textAlign: 'left',
};

const td = {
  padding: '12px',
  color: '#f8fafc',
};

export default SecurityLogsPanel;