import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api';

function NotificationBell({ theme }) {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');

  const wrapperRef = useRef(null);
  const firstLoadDone = useRef(false);
  const previousIds = useRef(new Set());
  const sessionRedirecting = useRef(false);

  const safeText = theme?.text || '#ffffff';
  const safeCard = theme?.card || 'rgba(15, 23, 42, 0.92)';
  const safeBorder = theme?.border || 'rgba(255,255,255,0.12)';
  const safePrimary = theme?.primary || '#8b5cf6';
  const safeMuted = theme?.muted || 'rgba(255,255,255,0.65)';
  const safeDanger = theme?.danger || '#ef4444';

  const normalizeNotifications = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.notifications)) return data.notifications;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  // ✅ One clean logout handler for expired/invalid token
  const handleUnauthorized = useCallback(() => {
    if (sessionRedirecting.current) return;

    sessionRedirecting.current = true;

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();

    setNotifications([]);
    setOpen(false);
    setToast(null);
    setError('');

    // ✅ Avoid redirect loop
    const path = window.location.pathname;
    if (path !== '/login' && path !== '/signup') {
      window.dispatchEvent(
        new CustomEvent('rehanverse-session-expired', {
          detail: {
            message: 'Session expired. Please login again.',
          },
        })
      );

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 500);
    }
  }, [navigate]);

  const parseResponseJson = async (res) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const authFetch = useCallback(
    async (url, options = {}) => {
      const token = localStorage.getItem('token');

      if (!token) {
        setNotifications([]);
        return null;
      }

      const res = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        handleUnauthorized();
        return null;
      }

      return res;
    },
    [handleUnauthorized]
  );

  const fetchNotifications = useCallback(
    async (silent = false) => {
      const token = localStorage.getItem('token');

      if (!token) {
        setNotifications([]);
        setError('');
        setToast(null);
        return;
      }

      try {
        if (!silent) setLoading(true);
        setError('');

        const res = await authFetch(`${API}/api/notifications/my`, {
          method: 'GET',
        });

        if (!res) return;

        const data = await parseResponseJson(res);

        if (!res.ok) {
          const msg = data?.message || 'Unable to load notifications';
          setError(msg);
          console.log('Notification fetch error:', msg);
          return;
        }

        const list = normalizeNotifications(data);

        const sortedList = [...list].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        const newIds = new Set(sortedList.map((n) => n._id));

        if (firstLoadDone.current) {
          const freshNotification = sortedList.find(
            (n) => n?._id && !previousIds.current.has(n._id) && !n.isRead
          );

          if (freshNotification) {
            setToast(freshNotification);

            setTimeout(() => {
              setToast(null);
            }, 5000);
          }
        }

        previousIds.current = newIds;
        firstLoadDone.current = true;

        setNotifications(sortedList);
      } catch (err) {
        // ✅ Network issue only. 401/403 already handled above.
        setError('Network issue while loading notifications');
        console.log('Notification fetch failed:', err);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [authFetch]
  );

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setNotifications([]);
      setError('');
      return undefined;
    }

    fetchNotifications(true);

    const interval = setInterval(() => {
      const freshToken = localStorage.getItem('token');

      if (!freshToken) {
        clearInterval(interval);
        setNotifications([]);
        return;
      }

      fetchNotifications(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;

  const toggleOpen = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setOpen(false);
      setNotifications([]);
      navigate('/login', { replace: true });
      return;
    }

    setOpen((prev) => {
      const next = !prev;
      if (next) fetchNotifications();
      return next;
    });
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !notificationId) return;

      const res = await authFetch(`${API}/api/notifications/read/${notificationId}`, {
        method: 'PUT',
      });

      if (!res) return;

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      console.log('Mark notification read failed:', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification) return;

    await markAsRead(notification._id);

    setOpen(false);
    setToast(null);

    if (
      ['course', 'pdf', 'video', 'live'].includes(notification.type) &&
      notification.courseId
    ) {
      navigate(`/course/${notification.courseId}`);
      return;
    }

    if (notification.type === 'payment') {
      navigate('/my-courses');
      return;
    }

    navigate('/courses');
  };

  const markAllAsRead = async (e) => {
    e?.stopPropagation();

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      setActionLoading(true);

      const res = await authFetch(`${API}/api/notifications/read-all`, {
        method: 'PUT',
      });

      if (!res) return;

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
        }))
      );
    } catch (err) {
      console.log('Mark all notifications read failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const clearReadNotifications = async (e) => {
    e?.stopPropagation();

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      setActionLoading(true);

      const res = await authFetch(`${API}/api/notifications/clear-read`, {
        method: 'PUT',
      });

      if (!res) return;

      setNotifications((prev) => prev.filter((n) => !n.isRead));
    } catch (err) {
      console.log('Clear read notifications failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'course':
        return '🚀';
      case 'live':
        return '🔴';
      case 'offer':
        return '⚡';
      case 'payment':
        return '✅';
      case 'pdf':
        return '📄';
      case 'video':
        return '🎥';
      default:
        return '🔔';
    }
  };

  const getActionText = (notification) => {
    if (['course', 'pdf', 'video', 'live'].includes(notification?.type)) {
      return 'Open course';
    }

    if (notification?.type === 'payment') {
      return 'My courses';
    }

    return 'Explore';
  };

  const getPriorityBadge = (type) => {
    switch (type) {
      case 'live':
        return {
          label: 'Live',
          bg: 'rgba(239,68,68,0.14)',
          color: '#fca5a5',
        };

      case 'payment':
        return {
          label: 'Important',
          bg: 'rgba(34,197,94,0.14)',
          color: '#86efac',
        };

      case 'offer':
        return {
          label: 'Offer',
          bg: 'rgba(245,158,11,0.14)',
          color: '#fcd34d',
        };

      case 'pdf':
      case 'video':
        return {
          label: 'Course Update',
          bg: 'rgba(59,130,246,0.14)',
          color: '#93c5fd',
        };

      case 'course':
        return {
          label: 'New Course',
          bg: 'rgba(139,92,246,0.14)',
          color: '#c4b5fd',
        };

      default:
        return {
          label: 'Info',
          bg: 'rgba(148,163,184,0.14)',
          color: '#cbd5e1',
        };
    }
  };

  const formatDate = (date) => {
    if (!date) return '';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return '';

    return parsedDate.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const headerButtonStyle = {
    border: `1px solid ${safeBorder}`,
    background: 'rgba(255,255,255,0.045)',
    color: safePrimary,
    cursor: actionLoading ? 'not-allowed' : 'pointer',
    fontSize: '11px',
    fontWeight: '900',
    padding: '7px 10px',
    borderRadius: '999px',
    whiteSpace: 'nowrap',
    opacity: actionLoading ? 0.65 : 1,
  };

  const badgeStyle = (type) => {
    const badge = getPriorityBadge(type);

    return {
      display: 'inline-flex',
      alignItems: 'center',
      width: 'fit-content',
      marginTop: '7px',
      marginBottom: '2px',
      padding: '4px 8px',
      borderRadius: '999px',
      fontSize: '10px',
      fontWeight: '950',
      letterSpacing: '0.2px',
      background: badge.bg,
      color: badge.color,
      border: `1px solid ${badge.color}33`,
    };
  };

  return (
    <>
      <div ref={wrapperRef} style={styles.wrapper}>
        <motion.button
          whileHover={{ y: -1, scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          onClick={toggleOpen}
          style={{
            ...styles.bellButton,
            color: safeText,
            background: open
              ? `linear-gradient(135deg, ${safePrimary}, rgba(99,102,241,0.92))`
              : 'rgba(255,255,255,0.035)',
            border: `1px solid ${open ? safePrimary : safeBorder}`,
            boxShadow: open
              ? `0 0 22px ${safePrimary}55`
              : `0 0 15px ${safePrimary}18`,
          }}
          title="Notifications"
          aria-label="Notifications"
        >
          <span style={styles.bellIcon}>{open ? '🔕' : '🔔'}</span>

          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              style={styles.unreadBadge}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{
                ...styles.dropdown,
                background:
                  theme?.isDark === false
                    ? 'rgba(255,255,255,0.94)'
                    : 'rgba(8, 13, 28, 0.96)',
                color: safeText,
                border: `1px solid ${safeBorder}`,
                boxShadow: `0 24px 70px rgba(0,0,0,0.42), 0 0 35px ${safePrimary}18`,
              }}
            >
              <div style={styles.dropdownGlow} />

              <div style={styles.header}>
                <div>
                  <h3 style={styles.title}>Notifications</h3>
                  <p style={{ ...styles.subTitle, color: safeMuted }}>
                    {unreadCount} unread • {readCount} read
                  </p>
                </div>

                <button
                  onClick={() => fetchNotifications()}
                  disabled={loading}
                  style={{
                    ...styles.refreshBtn,
                    color: safePrimary,
                    border: `1px solid ${safeBorder}`,
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                  title="Refresh notifications"
                >
                  {loading ? '⏳' : '↻'}
                </button>
              </div>

              <div style={styles.actionsRow}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    disabled={actionLoading}
                    style={headerButtonStyle}
                  >
                    Mark all read
                  </button>
                )}

                {readCount > 0 && (
                  <button
                    onClick={clearReadNotifications}
                    disabled={actionLoading}
                    style={{
                      ...headerButtonStyle,
                      color: safeDanger,
                    }}
                  >
                    Clear read
                  </button>
                )}
              </div>

              {error && (
                <div
                  style={{
                    ...styles.errorBox,
                    border: `1px solid ${safeDanger}55`,
                    color: safeDanger,
                  }}
                >
                  {error}
                </div>
              )}

              {loading && notifications.length === 0 && (
                <div style={styles.centerState}>
                  <div style={styles.loaderDot}>🔄</div>
                  <p style={{ ...styles.centerText, color: safeMuted }}>
                    Loading notifications...
                  </p>
                </div>
              )}

              {!loading && notifications.length === 0 && !error && (
                <div style={styles.centerState}>
                  <div style={styles.emptyIcon}>🔕</div>
                  <h4 style={styles.emptyTitle}>All clear</h4>
                  <p style={{ ...styles.centerText, color: safeMuted }}>
                    No notifications yet. Updates will appear here.
                  </p>
                </div>
              )}

              {notifications.length > 0 && (
                <div style={styles.list}>
                  {notifications.map((n) => (
                    <motion.div
                      key={n._id}
                      whileHover={{ y: -1, scale: 1.005 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.14, ease: 'easeOut' }}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        ...styles.notificationItem,
                        background: n.isRead
                          ? 'rgba(255,255,255,0.04)'
                          : `linear-gradient(135deg, ${safePrimary}22, rgba(59,130,246,0.10))`,
                        border: n.isRead
                          ? '1px solid rgba(255,255,255,0.08)'
                          : `1px solid ${safePrimary}55`,
                      }}
                    >
                      <div
                        style={{
                          ...styles.iconBubble,
                          background: n.isRead
                            ? 'rgba(255,255,255,0.06)'
                            : `${safePrimary}25`,
                          border: `1px solid ${safeBorder}`,
                        }}
                      >
                        {getIcon(n.type)}
                      </div>

                      <div style={styles.notificationBody}>
                        <div style={styles.itemTop}>
                          <h4
                            style={{
                              ...styles.itemTitle,
                              color: safeText,
                              fontWeight: n.isRead ? 800 : 950,
                            }}
                          >
                            {n.title || 'Notification'}
                          </h4>

                          {!n.isRead && (
                            <span
                              style={{
                                ...styles.unreadDot,
                                background: safePrimary,
                                boxShadow: `0 0 10px ${safePrimary}`,
                              }}
                            />
                          )}
                        </div>

                        <div style={badgeStyle(n.type)}>
                          {getPriorityBadge(n.type).label}
                        </div>

                        <p style={{ ...styles.message, color: safeMuted }}>
                          {n.message || 'You have a new update.'}
                        </p>

                        <div style={styles.footerLine}>
                          <small style={{ ...styles.dateText, color: safeMuted }}>
                            {formatDate(n.createdAt)}
                          </small>

                          <small
                            style={{
                              ...styles.actionText,
                              color: safePrimary,
                            }}
                          >
                            {getActionText(n)} →
                          </small>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 35, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 35, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={() => handleNotificationClick(toast)}
            style={{
              ...styles.toast,
              background:
                theme?.isDark === false
                  ? 'rgba(255,255,255,0.96)'
                  : 'rgba(8, 13, 28, 0.96)',
              color: safeText,
              border: `1px solid ${safePrimary}88`,
              boxShadow: `0 22px 60px rgba(0,0,0,0.40), 0 0 30px ${safePrimary}25`,
            }}
          >
            <div style={styles.toastInner}>
              <div
                style={{
                  ...styles.toastIcon,
                  background: `${safePrimary}20`,
                  border: `1px solid ${safePrimary}55`,
                }}
              >
                {getIcon(toast.type)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ ...styles.toastLabel, color: safePrimary }}>
                  New notification
                </p>

                <h4 style={styles.toastTitle}>
                  {toast.title || 'Notification'}
                </h4>

                <div
                  style={{
                    ...badgeStyle(toast.type),
                    marginTop: 0,
                    marginBottom: '7px',
                  }}
                >
                  {getPriorityBadge(toast.type).label}
                </div>

                <p style={{ ...styles.toastMessage, color: safeMuted }}>
                  {toast.message || 'You have a new update.'}
                </p>

                <p style={{ ...styles.toastAction, color: safePrimary }}>
                  {getActionText(toast)} →
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setToast(null);
                }}
                style={{
                  ...styles.closeToast,
                  color: safeMuted,
                }}
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const styles = {
  wrapper: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bellButton: {
    width: '46px',
    height: '46px',
    borderRadius: '999px',
    cursor: 'pointer',
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
  },

  bellIcon: {
    fontSize: '19px',
    lineHeight: 1,
    filter: 'drop-shadow(0 0 7px rgba(255,255,255,0.18))',
  },

  unreadBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: 'linear-gradient(135deg, #fb7185, #ef4444)',
    color: '#fff',
    minWidth: '19px',
    height: '19px',
    padding: '0 5px',
    borderRadius: '999px',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '950',
    border: '2px solid rgba(8,13,28,0.95)',
    boxShadow: '0 0 14px rgba(239,68,68,0.45)',
  },

  dropdown: {
    position: 'absolute',
    right: 0,
    top: '58px',
    width: '390px',
    maxWidth: 'calc(100vw - 28px)',
    maxHeight: '520px',
    overflow: 'hidden',
    borderRadius: '24px',
    zIndex: 99999,
    padding: '14px',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  dropdownGlow: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background:
      'radial-gradient(circle at 20% 0%, rgba(139,92,246,0.16), transparent 35%), radial-gradient(circle at 100% 10%, rgba(59,130,246,0.12), transparent 35%)',
    zIndex: -1,
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '10px',
  },

  title: {
    margin: 0,
    fontSize: '17px',
    fontWeight: '950',
    letterSpacing: '-0.2px',
  },

  subTitle: {
    margin: '4px 0 0',
    fontSize: '12px',
    fontWeight: '700',
  },

  refreshBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.045)',
    fontSize: '17px',
    fontWeight: '950',
    lineHeight: 1,
  },

  actionsRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '10px',
  },

  errorBox: {
    padding: '10px 12px',
    borderRadius: '14px',
    background: 'rgba(239,68,68,0.08)',
    fontSize: '12px',
    fontWeight: '800',
    marginBottom: '10px',
  },

  centerState: {
    textAlign: 'center',
    padding: '34px 14px 38px',
  },

  loaderDot: {
    fontSize: '30px',
    marginBottom: '10px',
  },

  emptyIcon: {
    fontSize: '38px',
    marginBottom: '8px',
  },

  emptyTitle: {
    margin: '0 0 6px',
    fontSize: '15px',
    fontWeight: '950',
  },

  centerText: {
    margin: 0,
    fontSize: '13px',
    lineHeight: 1.5,
    fontWeight: '650',
  },

  list: {
    maxHeight: '410px',
    overflowY: 'auto',
    paddingRight: '3px',
  },

  notificationItem: {
    display: 'flex',
    gap: '11px',
    padding: '12px',
    marginBottom: '9px',
    borderRadius: '18px',
    cursor: 'pointer',
  },

  iconBubble: {
    width: '38px',
    height: '38px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '18px',
  },

  notificationBody: {
    flex: 1,
    minWidth: 0,
  },

  itemTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
    alignItems: 'flex-start',
  },

  itemTitle: {
    margin: 0,
    fontSize: '13.5px',
    lineHeight: 1.25,
    wordBreak: 'break-word',
  },

  unreadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginTop: '5px',
    flexShrink: 0,
  },

  message: {
    margin: '6px 0 9px',
    fontSize: '12.5px',
    lineHeight: 1.45,
    fontWeight: '600',
    wordBreak: 'break-word',
  },

  footerLine: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
  },

  dateText: {
    fontSize: '10.5px',
    fontWeight: '700',
  },

  actionText: {
    fontSize: '11px',
    fontWeight: '950',
    whiteSpace: 'nowrap',
  },

  toast: {
    position: 'fixed',
    right: '24px',
    bottom: '24px',
    width: '350px',
    maxWidth: 'calc(100vw - 40px)',
    zIndex: 999999,
    padding: '15px',
    borderRadius: '22px',
    cursor: 'pointer',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
  },

  toastInner: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },

  toastIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '21px',
    flexShrink: 0,
  },

  toastLabel: {
    margin: '0 0 4px',
    fontSize: '11px',
    fontWeight: '950',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },

  toastTitle: {
    margin: '0 0 6px',
    fontSize: '14.5px',
    fontWeight: '950',
    lineHeight: 1.25,
  },

  toastMessage: {
    margin: 0,
    fontSize: '12.5px',
    lineHeight: 1.45,
    fontWeight: '600',
  },

  toastAction: {
    margin: '8px 0 0',
    fontSize: '12px',
    fontWeight: '950',
  },

  closeToast: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '20px',
    lineHeight: 1,
    padding: 0,
    marginLeft: '2px',
  },
};

export default NotificationBell;