import { useEffect, useState } from 'react';
import axios from 'axios';
import API from '../api';
import { motion } from 'framer-motion';

function LiveClassesBox({ courseId, isEnrolled, theme }) {
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

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

      setLiveClasses(res.data);
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
        border: '1px solid rgba(239, 68, 68, 0.45)',
        boxShadow: '0 0 18px rgba(239, 68, 68, 0.28)',
      };
    }

    if (status === 'Upcoming') {
      return {
        background: 'rgba(59, 130, 246, 0.16)',
        color: '#93c5fd',
        border: '1px solid rgba(59, 130, 246, 0.45)',
      };
    }

    return {
      background: 'rgba(148, 163, 184, 0.12)',
      color: '#cbd5e1',
      border: '1px solid rgba(148, 163, 184, 0.28)',
    };
  };

  const handleJoin = async (liveClassId) => {
    try {
      if (!isEnrolled) {
        alert('You must enroll in this course to join live class.');
        return;
      }

      const res = await axios.get(`${API}/api/live-classes/join/${liveClassId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.data?.liveUrl) {
        alert('Live class link not found.');
        return;
      }

      window.open(res.data.liveUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.log('JOIN LIVE CLASS ERROR:', err);
      alert(err.response?.data?.message || 'Unable to join live class');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{
        marginTop: '30px',
        padding: '20px',
        borderRadius: '18px',
        background: theme?.card || 'rgba(255,255,255,0.06)',
        border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
        boxShadow: '0 10px 28px rgba(0,0,0,0.16)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '14px',
          flexWrap: 'wrap',
          marginBottom: '16px',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: theme?.text || '#fff',
              fontSize: '24px',
              fontWeight: '800',
            }}
          >
            🔴 Live Classes
          </h2>

          <p
            style={{
              color: theme?.muted || '#aaa',
              marginTop: '6px',
              marginBottom: 0,
              fontSize: '14px',
            }}
          >
            Join scheduled live sessions directly from this course.
          </p>
        </div>

        <span
          style={{
            padding: '8px 12px',
            borderRadius: '999px',
            background: isEnrolled
              ? 'rgba(34,197,94,0.14)'
              : 'rgba(239,68,68,0.14)',
            color: isEnrolled ? '#86efac' : '#fca5a5',
            border: isEnrolled
              ? '1px solid rgba(34,197,94,0.35)'
              : '1px solid rgba(239,68,68,0.35)',
            fontSize: '12px',
            fontWeight: '800',
          }}
        >
          {isEnrolled ? 'Access Granted ✅' : 'Locked 🔒'}
        </span>
      </div>

      {loading && (
        <div
          style={{
            padding: '16px',
            borderRadius: '14px',
            background: theme?.bg || 'rgba(0,0,0,0.18)',
            color: theme?.muted || '#aaa',
            border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
          }}
        >
          Loading live classes...
        </div>
      )}

      {!loading && msg && (
        <div
          style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(239,68,68,0.12)',
            color: '#fca5a5',
            border: '1px solid rgba(239,68,68,0.35)',
          }}
        >
          {msg}
        </div>
      )}

      {!loading && !msg && liveClasses.length === 0 && (
        <div
          style={{
            padding: '18px',
            borderRadius: '14px',
            background: theme?.bg || 'rgba(0,0,0,0.18)',
            color: theme?.muted || '#aaa',
            border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
          }}
        >
          No live class scheduled yet.
        </div>
      )}

      {!loading && !msg && liveClasses.length > 0 && (
        <div style={{ display: 'grid', gap: '14px' }}>
          {liveClasses.map((item) => {
            const status = getStatus(item.scheduledAt, item.durationMinutes || 60);

            return (
              <motion.div
                key={item._id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  background: theme?.bg || 'rgba(0,0,0,0.18)',
                  border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <h3
                    style={{
                      color: theme?.text || '#fff',
                      fontSize: '18px',
                      margin: 0,
                      fontWeight: '800',
                    }}
                  >
                    {item.title}
                  </h3>

                  <span
                    style={{
                      ...getStatusStyle(status),
                      padding: '6px 12px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: '800',
                    }}
                  >
                    {status}
                  </span>
                </div>

                {item.description && (
                  <p
                    style={{
                      color: theme?.muted || '#aaa',
                      marginTop: '10px',
                      marginBottom: 0,
                      fontSize: '14px',
                      lineHeight: 1.5,
                    }}
                  >
                    {item.description}
                  </p>
                )}

                <div
                  style={{
                    marginTop: '14px',
                    display: 'grid',
                    gap: '8px',
                    color: theme?.muted || '#aaa',
                    fontSize: '14px',
                  }}
                >
                  <span>
                    📅{' '}
                    {new Date(item.scheduledAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>

                  <span>⏱ Duration: {item.durationMinutes || 60} minutes</span>
                </div>

                <button
                  onClick={() => handleJoin(item._id)}
                  disabled={!isEnrolled}
                  style={{
                    marginTop: '16px',
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: isEnrolled ? 'pointer' : 'not-allowed',
                    fontWeight: '900',
                    color: '#fff',
                    background: isEnrolled
                      ? status === 'Ended'
                        ? 'linear-gradient(135deg, #64748b, #334155)'
                        : 'linear-gradient(135deg, #ef4444, #7f1d1d)'
                      : 'rgba(120,120,120,0.45)',
                    opacity: isEnrolled ? 1 : 0.7,
                  }}
                >
                  {isEnrolled
                    ? status === 'Ended'
                      ? 'Class Ended — Open Link'
                      : 'Join Live Class 🚀'
                    : 'Locked — Enroll First 🔒'}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

export default LiveClassesBox;