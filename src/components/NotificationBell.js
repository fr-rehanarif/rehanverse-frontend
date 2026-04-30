import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function NotificationBell({ theme }) {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const firstLoadDone = useRef(false);
  const previousIds = useRef(new Set());

  const token = localStorage.getItem('token');

  const fetchNotifications = async () => {
    try {
      if (!token) return;

      setLoading(true);

      const res = await fetch(`${API}/api/notifications/my`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        const newIds = new Set(data.map((n) => n._id));

        if (firstLoadDone.current) {
          const freshNotification = data.find(
            (n) => !previousIds.current.has(n._id) && !n.isRead
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

        setNotifications(data);
      } else {
        console.log('Notification fetch error:', data.message);
      }
    } catch (err) {
      console.log('Notification fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOpen = () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen) {
      fetchNotifications();
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      if (!token) return;

      await fetch(`${API}/api/notifications/read/${notificationId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

  const markAllAsRead = async () => {
    try {
      if (!token) return;

      await fetch(`${API}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
        }))
      );
    } catch (err) {
      console.log('Mark all notifications read failed:', err);
    }
  };

  const clearReadNotifications = async () => {
    try {
      if (!token) return;

      await fetch(`${API}/api/notifications/clear-read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prev) => prev.filter((n) => !n.isRead));
    } catch (err) {
      console.log('Clear read notifications failed:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;

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
    if (['course', 'pdf', 'video', 'live'].includes(notification.type)) {
      return 'Open course →';
    }

    if (notification.type === 'payment') {
      return 'Open my courses →';
    }

    return 'Explore →';
  };

  const formatDate = (date) => {
    if (!date) return '';

    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const headerButtonStyle = {
    border: 'none',
    background: 'transparent',
    color: theme?.primary || '#38bdf8',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    padding: 0,
    whiteSpace: 'nowrap',
  };

  return (
    <>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          onClick={toggleOpen}
          style={{
            position: 'relative',
            border: 'none',
            background: theme?.card || 'rgba(255,255,255,0.08)',
            color: theme?.text || '#fff',
            borderRadius: '999px',
            padding: '9px 12px',
            cursor: 'pointer',
            fontSize: '18px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
          }}
          title="Notifications"
        >
          🔔

          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: '#ff2d55',
                color: '#fff',
                minWidth: '20px',
                height: '20px',
                borderRadius: '999px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                border: '2px solid #111',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '380px',
              maxHeight: '430px',
              overflowY: 'auto',
              background: theme?.card || '#111827',
              color: theme?.text || '#fff',
              borderRadius: '18px',
              boxShadow: '0 18px 45px rgba(0,0,0,0.35)',
              border: `1px solid ${theme?.border || 'rgba(255,255,255,0.1)'}`,
              zIndex: 9999,
              padding: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '10px',
                marginBottom: '10px',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '16px' }}>
                  Notifications
                </h3>
                <p
                  style={{
                    margin: '3px 0 0',
                    fontSize: '11px',
                    opacity: 0.6,
                  }}
                >
                  {unreadCount} unread • {readCount} read
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  onClick={fetchNotifications}
                  disabled={loading}
                  style={{
                    ...headerButtonStyle,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>

                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} style={headerButtonStyle}>
                    Mark all read
                  </button>
                )}

                {readCount > 0 && (
                  <button
                    onClick={clearReadNotifications}
                    style={{
                      ...headerButtonStyle,
                      color: theme?.danger || '#ef4444',
                    }}
                  >
                    Clear read
                  </button>
                )}
              </div>
            </div>

            {loading && notifications.length === 0 && (
              <p style={{ opacity: 0.7, fontSize: '14px' }}>
                Loading notifications...
              </p>
            )}

            {!loading && notifications.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '28px 10px',
                  opacity: 0.75,
                }}
              >
                <div style={{ fontSize: '34px', marginBottom: '8px' }}>🔕</div>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  No notifications yet
                </p>
              </div>
            )}

            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  padding: '12px',
                  marginBottom: '9px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  background: n.isRead
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(56,189,248,0.16)',
                  border: n.isRead
                    ? '1px solid rgba(255,255,255,0.08)'
                    : '1px solid rgba(56,189,248,0.35)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{getIcon(n.type)}</span>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '14px',
                          fontWeight: n.isRead ? '600' : '800',
                        }}
                      >
                        {n.title}
                      </h4>

                      {!n.isRead && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#38bdf8',
                            marginTop: '5px',
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>

                    <p
                      style={{
                        margin: '5px 0 7px',
                        fontSize: '13px',
                        lineHeight: '1.4',
                        opacity: 0.82,
                      }}
                    >
                      {n.message}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <small style={{ opacity: 0.55, fontSize: '11px' }}>
                        {formatDate(n.createdAt)}
                      </small>

                      <small
                        style={{
                          color: theme?.primary || '#38bdf8',
                          fontSize: '11px',
                          fontWeight: '800',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {getActionText(n)}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div
          onClick={() => handleNotificationClick(toast)}
          style={{
            position: 'fixed',
            right: '24px',
            bottom: '24px',
            width: '330px',
            maxWidth: 'calc(100vw - 40px)',
            zIndex: 99999,
            padding: '16px',
            borderRadius: '18px',
            background: theme?.card || '#111827',
            color: theme?.text || '#fff',
            border: `1px solid ${theme?.primary || '#38bdf8'}`,
            boxShadow: '0 18px 45px rgba(0,0,0,0.35)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '24px' }}>{getIcon(toast.type)}</div>

            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: '0 0 4px',
                  fontSize: '12px',
                  fontWeight: '800',
                  color: theme?.primary || '#38bdf8',
                }}
              >
                New Notification
              </p>

              <h4
                style={{
                  margin: '0 0 6px',
                  fontSize: '15px',
                  fontWeight: '900',
                }}
              >
                {toast.title}
              </h4>

              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  lineHeight: '1.4',
                  opacity: 0.8,
                }}
              >
                {toast.message}
              </p>

              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: '12px',
                  fontWeight: '800',
                  color: theme?.primary || '#38bdf8',
                }}
              >
                {getActionText(toast)}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setToast(null);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                color: theme?.muted || '#9ca3af',
                cursor: 'pointer',
                fontSize: '18px',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default NotificationBell;