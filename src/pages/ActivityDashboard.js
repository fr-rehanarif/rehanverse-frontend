import { useEffect, useState } from 'react';
import axios from 'axios';
import API from '../api';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

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
        headers: { Authorization: `Bearer ${token}` },
      });

      setActivities(res.data);
    } catch (err) {
      console.log('Activity fetch error:', err);
    }
  };

  const getShortDevice = (device = '') => {
    if (device.includes('Windows')) return 'Windows • Chrome';
    if (device.includes('Android')) return 'Android • Mobile';
    if (device.includes('iPhone')) return 'iPhone • Safari';
    if (device.includes('Mac')) return 'MacOS';
    return 'Unknown Device';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          theme.isDark
            ? 'radial-gradient(circle at top left, rgba(139,92,246,0.18), transparent 35%), #020617'
            : theme.bg,
        color: theme.text,
        padding: '36px 42px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div style={styles.header}>
          <div>
            <h1 style={{ color: theme.primary, margin: 0, fontSize: '38px' }}>
              🕶️ Security Command Center
            </h1>
            <p style={{ color: theme.muted, marginTop: '10px' }}>
              Live user activity, course access, IP records and device intelligence.
            </p>
          </div>

          <button
            onClick={fetchActivities}
            style={{
              ...styles.refreshBtn,
              background: theme.primary,
              color: theme.buttonText || '#fff',
              boxShadow: `0 0 24px ${theme.primary}88`,
            }}
          >
            ↻ Refresh Logs
          </button>
        </div>

        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, borderColor: theme.primary }}>
            <span style={styles.statLabel}>Total Logs</span>
            <strong style={{ color: theme.primary }}>{activities.length}</strong>
          </div>

          <div style={{ ...styles.statCard, borderColor: '#22c55e' }}>
            <span style={styles.statLabel}>PDF Opens</span>
            <strong style={{ color: '#22c55e' }}>
              {activities.filter((a) => a.action?.includes('PDF')).length}
            </strong>
          </div>

          <div style={{ ...styles.statCard, borderColor: '#f97316' }}>
            <span style={styles.statLabel}>Course Views</span>
            <strong style={{ color: '#f97316' }}>
              {activities.filter((a) => a.action?.includes('Course Detail')).length}
            </strong>
          </div>

          <div style={{ ...styles.statCard, borderColor: '#ef4444' }}>
            <span style={styles.statLabel}>Blocked Attempts</span>
            <strong style={{ color: '#ef4444' }}>
              {activities.filter((a) => a.action?.includes('Blocked')).length}
            </strong>
          </div>
        </div>

        <div
          style={{
            ...styles.panel,
            border: `1px solid ${theme.border}`,
            boxShadow: `0 0 42px ${theme.primary}33`,
          }}
        >
          <div style={styles.panelTop}>
            <span style={styles.liveDot}></span>
            <span>LIVE SECURITY FEED</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Action</th>
                  <th style={styles.th}>Page</th>
                  <th style={styles.th}>IP</th>
                  <th style={styles.th}>Device</th>
                </tr>
              </thead>

              <tbody>
                {activities.map((a) => (
                  <motion.tr
                    key={a._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: 'rgba(139,92,246,0.12)' }}
                    style={styles.tr}
                  >
                    <td style={styles.td}>
                      <strong>{new Date(a.createdAt).toLocaleDateString()}</strong>
                      <br />
                      <span style={styles.muted}>
                        {new Date(a.createdAt).toLocaleTimeString()}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <strong>{a.user?.name || 'Unknown'}</strong>
                      <br />
                      <span style={styles.muted}>{a.user?.email || 'No email'}</span>
                    </td>

                    <td style={{ ...styles.td, color: theme.primary, fontWeight: 800 }}>
                      {a.action}
                    </td>

                    <td style={styles.td}>
                      <span style={styles.badge}>{a.page || 'Unknown'}</span>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.ipBadge}>{a.ip}</span>
                    </td>

                    <td style={styles.td}>
                      <strong>{getShortDevice(a.device)}</strong>
                      <br />
                      <span style={styles.deviceText}>{a.device}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {activities.length === 0 && (
              <p style={{ padding: '24px', color: theme.muted }}>
                No activity logs found yet.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    marginBottom: '26px',
  },
  refreshBtn: {
    border: 'none',
    borderRadius: '14px',
    padding: '13px 22px',
    cursor: 'pointer',
    fontWeight: 900,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '18px',
    marginBottom: '26px',
  },
  statCard: {
    background: 'rgba(15, 23, 42, 0.82)',
    border: '1px solid',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: '0 0 28px rgba(139,92,246,0.16)',
  },
  statLabel: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '13px',
    marginBottom: '8px',
    fontWeight: 800,
    letterSpacing: '0.7px',
    textTransform: 'uppercase',
  },
  panel: {
    background: 'rgba(15, 23, 42, 0.86)',
    borderRadius: '24px',
    overflow: 'hidden',
  },
  panelTop: {
    padding: '16px 20px',
    background: 'rgba(2, 6, 23, 0.9)',
    color: '#a78bfa',
    fontWeight: 900,
    letterSpacing: '1px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  liveDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 18px #22c55e',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '1100px',
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    color: '#e5e7eb',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.7px',
    background: '#020617',
  },
  tr: {
    borderTop: '1px solid rgba(148,163,184,0.18)',
    transition: '0.2s',
  },
  td: {
    padding: '16px',
    verticalAlign: 'top',
    fontSize: '14px',
    color: '#f8fafc',
  },
  muted: {
    color: '#94a3b8',
    fontSize: '12px',
  },
  badge: {
    padding: '6px 10px',
    borderRadius: '999px',
    background: 'rgba(139,92,246,0.18)',
    color: '#c4b5fd',
    fontWeight: 800,
  },
  ipBadge: {
    padding: '6px 10px',
    borderRadius: '10px',
    background: 'rgba(34,197,94,0.12)',
    color: '#86efac',
    fontWeight: 800,
  },
  deviceText: {
    color: '#94a3b8',
    fontSize: '11px',
    lineHeight: '1.5',
  },
};

export default ActivityDashboard;