import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import API from '../api';
import { motion } from 'framer-motion';

function SecurityLogsPanel({ theme }) {
  const [activities, setActivities] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const previousLogCount = useRef(0);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await axios.get(`${API}/api/activity/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setActivities(res.data || []);

      if (
        soundEnabled &&
        previousLogCount.current !== 0 &&
        res.data.length > previousLogCount.current
      ) {
        playAlertSound();
      }

      previousLogCount.current = res.data.length;
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchActivities();

    const interval = setInterval(fetchActivities, 4000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const playAlertSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();

      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(520, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.18);

      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.25);
    } catch (err) {
      console.log('Sound blocked:', err);
    }
  };

  const getThreatScore = (a) => {
    let score = 10;
    const action = a.action?.toLowerCase() || '';

    if (action.includes('blocked')) score += 55;
    if (action.includes('right-click')) score += 25;
    if (action.includes('ctrl')) score += 25;
    if (action.includes('pdf')) score += 15;
    if (action.includes('unauthorized')) score += 45;
    if (!a.user?.email) score += 20;

    return Math.min(score, 100);
  };

  const getThreatLevel = (score) => {
    if (score >= 75) return { label: 'HIGH RISK', color: '#ef4444', emoji: '🚨' };
    if (score >= 45) return { label: 'SUSPICIOUS', color: '#f97316', emoji: '⚠️' };
    return { label: 'NORMAL', color: '#22c55e', emoji: '✅' };
  };

  const getCleanDevice = (device = '') => {
    const ua = device.toLowerCase();

    let type = 'Unknown Device';
    let os = 'Unknown OS';
    let browser = 'Unknown Browser';

    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      type = 'Mobile';
    } else if (ua.includes('windows') || ua.includes('linux') || ua.includes('mac')) {
      type = 'Desktop / Laptop';
    }

    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('iphone')) os = 'iPhone';
    else if (ua.includes('mac os') || ua.includes('macintosh')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';

    if (ua.includes('edg')) browser = 'Microsoft Edge';
    else if (ua.includes('opr') || ua.includes('opera')) browser = 'Opera';
    else if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';

    return `${type} • ${os} • ${browser}`;
  };

  const suspiciousLogs = useMemo(() => {
    return activities.filter((a) => getThreatScore(a) >= 45);
  }, [activities]);

  const highRiskLogs = useMemo(() => {
    return activities.filter((a) => getThreatScore(a) >= 75);
  }, [activities]);

  return (
    <div>
      {/* HEADER */}
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
          padding: '22px',
          borderRadius: '20px',
          border: `1px solid ${theme.primary}`,
          marginBottom: '20px',
          background: 'linear-gradient(135deg, rgba(2,6,23,0.96), rgba(15,23,42,0.92))',
        }}
      >
        <h2 style={{ color: theme.primary, marginTop: 0 }}>
          🕶️ Security Command Center
        </h2>

        <p style={{ color: theme.muted, marginBottom: '18px' }}>
          Real-time activity tracking with suspicious behavior detection, threat score and live alerts.
        </p>

        <button
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            if (!soundEnabled) playAlertSound();
          }}
          style={{
            padding: '10px 16px',
            borderRadius: '12px',
            border: `1px solid ${soundEnabled ? '#22c55e' : theme.border}`,
            background: soundEnabled ? 'rgba(34,197,94,0.18)' : 'rgba(15,23,42,0.9)',
            color: soundEnabled ? '#86efac' : theme.text,
            cursor: 'pointer',
            fontWeight: '800',
          }}
        >
          {soundEnabled ? '🔊 Alert Sound ON' : '🔇 Enable Alert Sound'}
        </button>
      </motion.div>

      {/* STATS */}
      <div style={statsGrid}>
        <StatCard title="Total Logs" value={activities.length} color={theme.primary} />
        <StatCard title="Suspicious Logs" value={suspiciousLogs.length} color="#f97316" />
        <StatCard title="High Risk Alerts" value={highRiskLogs.length} color="#ef4444" blink />
        <StatCard title="System Status" value="ONLINE" color="#22c55e" blink />
      </div>

      {/* RED ALERT CARDS */}
      {highRiskLogs.length > 0 && (
        <motion.div
          animate={{
            boxShadow: [
              '0 0 18px rgba(239,68,68,0.35)',
              '0 0 45px rgba(239,68,68,0.75)',
              '0 0 18px rgba(239,68,68,0.35)',
            ],
          }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{
            padding: '18px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(127,29,29,0.55), rgba(2,6,23,0.95))',
            border: '1px solid rgba(248,113,113,0.7)',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ color: '#fecaca', marginTop: 0 }}>
            🚨 Suspicious Activity Detected
          </h3>

          <p style={{ color: '#fca5a5' }}>
            High-risk behavior found. Check blocked attempts, PDF access and shortcut abuse.
          </p>

          <div style={{ display: 'grid', gap: '10px' }}>
            {highRiskLogs.slice(0, 3).map((a) => (
              <div
                key={a._id}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(15,23,42,0.75)',
                  border: '1px solid rgba(248,113,113,0.35)',
                  color: '#fee2e2',
                }}
              >
                <strong>{a.user?.name || 'Unknown User'}</strong> — {a.action}
                <br />
                <span style={{ fontSize: '12px', color: '#fca5a5' }}>
                  {new Date(a.createdAt).toLocaleString()} • {a.ip}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* TABLE */}
      <div
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: `0 0 35px ${theme.primary}22`,
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

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1050px' }}>
            <thead>
              <tr style={{ background: '#020617' }}>
                <th style={th}>Time</th>
                <th style={th}>User</th>
                <th style={th}>Action</th>
                <th style={th}>Threat</th>
                <th style={th}>IP</th>
                <th style={th}>Device</th>
              </tr>
            </thead>

            <tbody>
              {activities.map((a) => {
                const score = getThreatScore(a);
                const level = getThreatLevel(score);

                return (
                  <motion.tr
                    key={a._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: 'rgba(139,92,246,0.15)' }}
                    style={{
                      borderTop: '1px solid rgba(148,163,184,0.18)',
                    }}
                  >
                    <td style={td}>{new Date(a.createdAt).toLocaleString()}</td>

                    <td style={td}>
                      {a.user?.name || 'Unknown'}
                      <br />
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {a.user?.email || 'No email'}
                      </span>
                    </td>

                    <td style={{ ...td, color: theme.primary, fontWeight: '800' }}>
                      {a.action}
                    </td>

                    <td style={td}>
                      <span
                        style={{
                          padding: '6px 10px',
                          borderRadius: '999px',
                          background: `${level.color}22`,
                          color: level.color,
                          fontWeight: '900',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {level.emoji} {level.label} • {score}%
                      </span>
                    </td>

                    <td style={td}>{a.ip}</td>

                    <td style={{ ...td, maxWidth: '320px' }}>
                      <strong style={{ color: '#e5e7eb' }}>
                        {getCleanDevice(a.device)}
                      </strong>
                      <br />
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {a.device}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {activities.length === 0 && (
            <p style={{ padding: '20px', color: theme.muted }}>
              No activity logs found yet.
            </p>
          )}
        </div>
      </div>

      <p style={{ color: theme.muted, fontSize: '12px', marginTop: '12px' }}>
        🤖 AI Detection here means rule-based threat scoring from user actions, not real machine learning.
      </p>
    </div>
  );
}

function StatCard({ title, value, color, blink }) {
  return (
    <motion.div
      animate={
        blink
          ? {
              opacity: [0.7, 1, 0.7],
              boxShadow: [
                `0 0 12px ${color}33`,
                `0 0 30px ${color}88`,
                `0 0 12px ${color}33`,
              ],
            }
          : {}
      }
      transition={{ duration: 1.4, repeat: Infinity }}
      style={{
        padding: '18px',
        borderRadius: '16px',
        border: `1px solid ${color}`,
        background: 'rgba(15,23,42,0.9)',
      }}
    >
      <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px', fontWeight: '800' }}>
        {title}
      </p>
      <h2 style={{ margin: '8px 0 0', color }}>{value}</h2>
    </motion.div>
  );
}

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '14px',
  marginBottom: '20px',
};

const th = {
  padding: '12px',
  color: '#e5e7eb',
  textAlign: 'left',
  fontSize: '13px',
  whiteSpace: 'nowrap',
};

const td = {
  padding: '12px',
  color: '#f8fafc',
  verticalAlign: 'top',
  fontSize: '14px',
};

export default SecurityLogsPanel;