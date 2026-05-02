import { useEffect, useState } from 'react';
import axios from 'axios';
import API from '../api';
import { motion } from 'framer-motion';

function LiveClassesBox({ courseId, isEnrolled, theme }) {
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [joinMsg, setJoinMsg] = useState('');

  const token = localStorage.getItem('token');

  const fetchLiveClasses = async () => {
    try {
      setLoading(true);
      setMsg('');

      const res = await axios.get(`${API}/api/live-classes/course/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLiveClasses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log('LIVE CLASSES FETCH ERROR:', err);
      setMsg(err.response?.data?.message || 'Failed to load live classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchLiveClasses();
    }
    // eslint-disable-next-line
  }, [courseId]);

  const getStatus = (scheduledAt, durationMinutes) => {
    const now = new Date();
    const start = new Date(scheduledAt);
    const end = new Date(start.getTime() + (durationMinutes || 60) * 60000);

    if (now < start) return 'Upcoming';
    if (now >= start && now <= end) return 'Live Now';
    return 'Ended';
  };

  const getStatusStyle = (status) => {
    if (status === 'Live Now') {
      return {
        background: 'rgba(239, 68, 68, 0.16)',
        color: '#fca5a5',
        border: '1px solid rgba(239, 68, 68, 0.42)',
        boxShadow: '0 0 16px rgba(239, 68, 68, 0.22)',
      };
    }

    if (status === 'Upcoming') {
      return {
        background: 'rgba(59, 130, 246, 0.14)',
        color: '#93c5fd',
        border: '1px solid rgba(59, 130, 246, 0.36)',
        boxShadow: 'none',
      };
    }

    return {
      background: 'rgba(148, 163, 184, 0.12)',
      color: '#cbd5e1',
      border: '1px solid rgba(148, 163, 184, 0.24)',
      boxShadow: 'none',
    };
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return 'Not scheduled';

    return new Date(dateValue).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const handleJoin = async (liveClassId) => {
    try {
      setJoinMsg('');

      if (!isEnrolled) {
        setJoinMsg('🔒 You must enroll in this course to join live class.');
        setTimeout(() => setJoinMsg(''), 3000);
        return;
      }

      const res = await axios.get(`${API}/api/live-classes/join/${liveClassId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.data?.liveUrl) {
        setJoinMsg('⚠️ Live class link not found.');
        setTimeout(() => setJoinMsg(''), 3000);
        return;
      }

      window.open(res.data.liveUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.log('JOIN LIVE CLASS ERROR:', err);
      setJoinMsg('⚠️ ' + (err.response?.data?.message || 'Unable to join live class'));
      setTimeout(() => setJoinMsg(''), 3000);
    }
  };

  const totalLive = liveClasses.length;
  const liveNowCount = liveClasses.filter(
    (item) => getStatus(item.scheduledAt, item.durationMinutes || 60) === 'Live Now'
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{
        ...styles.box,
        background: theme?.card || 'rgba(255,255,255,0.06)',
        border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
        boxShadow: theme?.shadow || '0 10px 28px rgba(0,0,0,0.16)',
        backdropFilter: theme?.glass || 'blur(16px)',
        WebkitBackdropFilter: theme?.glass || 'blur(16px)',
      }}
    >
      <div style={styles.glow} />

      <div style={styles.header}>
        <div>
          <p style={{ ...styles.kicker, color: theme?.primary || '#a78bfa' }}>
            🔴 LIVE LEARNING
          </p>

          <h2 style={{ ...styles.title, color: theme?.text || '#fff' }}>
            Live Classes
          </h2>

          <p style={{ ...styles.subtitle, color: theme?.muted || '#aaa' }}>
            Join scheduled live sessions directly from this course.
          </p>
        </div>

        <div style={styles.headerBadges}>
          <span
            style={{
              ...styles.accessBadge,
              background: isEnrolled
                ? 'rgba(34,197,94,0.14)'
                : 'rgba(239,68,68,0.14)',
              color: isEnrolled ? '#86efac' : '#fca5a5',
              border: isEnrolled
                ? '1px solid rgba(34,197,94,0.35)'
                : '1px solid rgba(239,68,68,0.35)',
            }}
          >
            {isEnrolled ? 'Access Granted ✅' : 'Locked 🔒'}
          </span>

          <span
            style={{
              ...styles.countBadge,
              background: theme?.isDark
                ? 'rgba(255,255,255,0.035)'
                : 'rgba(255,255,255,0.72)',
              color: theme?.muted || '#aaa',
              border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
            }}
          >
            {totalLive} scheduled
          </span>
        </div>
      </div>

      <div style={styles.statsRow}>
        <div
          style={{
            ...styles.statMini,
            background: theme?.isDark
              ? 'rgba(255,255,255,0.035)'
              : 'rgba(255,255,255,0.72)',
            border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
          }}
        >
          <span>📅</span>
          <div>
            <strong style={{ color: theme?.text || '#fff' }}>{totalLive}</strong>
            <p style={{ color: theme?.muted || '#aaa' }}>Total Classes</p>
          </div>
        </div>

        <div
          style={{
            ...styles.statMini,
            background: liveNowCount > 0
              ? 'rgba(239,68,68,0.12)'
              : theme?.isDark
              ? 'rgba(255,255,255,0.035)'
              : 'rgba(255,255,255,0.72)',
            border: liveNowCount > 0
              ? '1px solid rgba(239,68,68,0.32)'
              : `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
          }}
        >
          <span>🔴</span>
          <div>
            <strong style={{ color: liveNowCount > 0 ? '#fca5a5' : theme?.text || '#fff' }}>
              {liveNowCount}
            </strong>
            <p style={{ color: theme?.muted || '#aaa' }}>Live Now</p>
          </div>
        </div>
      </div>

      {joinMsg && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            ...styles.messageBox,
            background: joinMsg.includes('🔒')
              ? 'rgba(251,191,36,0.12)'
              : 'rgba(239,68,68,0.12)',
            color: joinMsg.includes('🔒') ? '#fbbf24' : '#fca5a5',
            border: joinMsg.includes('🔒')
              ? '1px solid rgba(251,191,36,0.25)'
              : '1px solid rgba(239,68,68,0.25)',
          }}
        >
          {joinMsg}
        </motion.div>
      )}

      {loading && (
        <StateBox
          icon="⏳"
          title="Loading live classes..."
          text="Please wait while we fetch scheduled sessions."
          theme={theme}
        />
      )}

      {!loading && msg && (
        <StateBox
          icon="⚠️"
          title="Unable to load live classes"
          text={msg}
          theme={theme}
          danger
        />
      )}

      {!loading && !msg && liveClasses.length === 0 && (
        <StateBox
          icon="📭"
          title="No live class scheduled yet"
          text="Live sessions will appear here when admin schedules them."
          theme={theme}
        />
      )}

      {!loading && !msg && liveClasses.length > 0 && (
        <div style={styles.list}>
          {liveClasses.map((item) => {
            const status = getStatus(item.scheduledAt, item.durationMinutes || 60);

            return (
              <motion.div
                key={item._id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{
                  ...styles.card,
                  background: theme?.isDark
                    ? 'rgba(255,255,255,0.035)'
                    : 'rgba(255,255,255,0.72)',
                  border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
                }}
              >
                <div style={styles.cardTop}>
                  <div>
                    <h3 style={{ ...styles.classTitle, color: theme?.text || '#fff' }}>
                      {item.title}
                    </h3>

                    {item.description && (
                      <p style={{ ...styles.description, color: theme?.muted || '#aaa' }}>
                        {item.description}
                      </p>
                    )}
                  </div>

                  <span
                    style={{
                      ...styles.statusPill,
                      ...getStatusStyle(status),
                    }}
                  >
                    {status === 'Live Now' ? '🔴 Live Now' : status}
                  </span>
                </div>

                <div style={styles.metaGrid}>
                  <div
                    style={{
                      ...styles.metaPill,
                      background: theme?.isDark
                        ? 'rgba(15,23,42,0.52)'
                        : 'rgba(255,255,255,0.78)',
                      border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
                      color: theme?.muted || '#aaa',
                    }}
                  >
                    📅 {formatDateTime(item.scheduledAt)}
                  </div>

                  <div
                    style={{
                      ...styles.metaPill,
                      background: theme?.isDark
                        ? 'rgba(15,23,42,0.52)'
                        : 'rgba(255,255,255,0.78)',
                      border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
                      color: theme?.muted || '#aaa',
                    }}
                  >
                    ⏱ {item.durationMinutes || 60} minutes
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: isEnrolled ? 1.014 : 1, y: isEnrolled ? -1 : 0 }}
                  whileTap={{ scale: isEnrolled ? 0.985 : 1 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  onClick={() => handleJoin(item._id)}
                  disabled={!isEnrolled}
                  style={{
                    ...styles.joinBtn,
                    cursor: isEnrolled ? 'pointer' : 'not-allowed',
                    background: isEnrolled
                      ? status === 'Ended'
                        ? 'linear-gradient(135deg, #64748b, #334155)'
                        : 'linear-gradient(135deg, #ef4444, #7f1d1d)'
                      : 'rgba(120,120,120,0.45)',
                    opacity: isEnrolled ? 1 : 0.72,
                  }}
                >
                  {isEnrolled
                    ? status === 'Ended'
                      ? 'Class Ended — Open Link'
                      : 'Join Live Class 🚀'
                    : 'Locked — Enroll First 🔒'}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function StateBox({ icon, title, text, theme, danger = false }) {
  return (
    <div
      style={{
        ...styles.stateBox,
        background: danger
          ? 'rgba(239,68,68,0.12)'
          : theme?.isDark
          ? 'rgba(255,255,255,0.035)'
          : 'rgba(255,255,255,0.72)',
        color: danger ? '#fca5a5' : theme?.muted || '#aaa',
        border: danger
          ? '1px solid rgba(239,68,68,0.30)'
          : `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
      }}
    >
      <div style={styles.stateIcon}>{icon}</div>
      <h3 style={{ color: danger ? '#fca5a5' : theme?.text || '#fff', margin: '0 0 6px' }}>
        {title}
      </h3>
      <p style={{ margin: 0, lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}

const styles = {
  box: {
    marginTop: '30px',
    padding: '22px',
    borderRadius: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: '-80px',
    right: '-80px',
    width: '190px',
    height: '190px',
    borderRadius: '50%',
    background: 'rgba(239,68,68,0.12)',
    filter: 'blur(70px)',
    pointerEvents: 'none',
  },
  header: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '14px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  kicker: {
    margin: '0 0 6px',
    fontSize: '12px',
    fontWeight: 950,
    letterSpacing: '0.5px',
  },
  title: {
    margin: 0,
    fontSize: '26px',
    fontWeight: 950,
  },
  subtitle: {
    marginTop: '6px',
    marginBottom: 0,
    fontSize: '14px',
    lineHeight: 1.6,
    fontWeight: 750,
  },
  headerBadges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  accessBadge: {
    padding: '8px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 950,
  },
  countBadge: {
    padding: '8px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 950,
  },
  statsRow: {
    position: 'relative',
    zIndex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginBottom: '16px',
  },
  statMini: {
    padding: '14px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  messageBox: {
    position: 'relative',
    zIndex: 1,
    padding: '12px 14px',
    borderRadius: '16px',
    marginBottom: '14px',
    fontWeight: 850,
    lineHeight: 1.55,
  },
  list: {
    position: 'relative',
    zIndex: 1,
    display: 'grid',
    gap: '14px',
  },
  card: {
    padding: '18px',
    borderRadius: '20px',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  classTitle: {
    fontSize: '18px',
    margin: 0,
    fontWeight: 950,
    lineHeight: 1.35,
  },
  description: {
    marginTop: '8px',
    marginBottom: 0,
    fontSize: '14px',
    lineHeight: 1.55,
    fontWeight: 700,
  },
  statusPill: {
    padding: '7px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 950,
    flex: '0 0 auto',
  },
  metaGrid: {
    marginTop: '14px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '10px',
  },
  metaPill: {
    padding: '10px 12px',
    borderRadius: '14px',
    fontSize: '13px',
    fontWeight: 850,
    lineHeight: 1.45,
  },
  joinBtn: {
    marginTop: '16px',
    width: '100%',
    padding: '13px 16px',
    borderRadius: '15px',
    border: 'none',
    fontWeight: 950,
    color: '#fff',
    fontSize: '14px',
  },
  stateBox: {
    position: 'relative',
    zIndex: 1,
    padding: '26px 18px',
    borderRadius: '20px',
    textAlign: 'center',
    fontWeight: 800,
  },
  stateIcon: {
    fontSize: '34px',
    marginBottom: '8px',
  },
};

export default LiveClassesBox;