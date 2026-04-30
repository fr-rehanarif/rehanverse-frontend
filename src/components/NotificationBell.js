import { useEffect, useState } from 'react';
import API from '../api';

function NotificationBell({ theme }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

      if (res.ok) {
        setNotifications(Array.isArray(data) ? data : []);
      } else {
        console.log('Notification fetch error:', data.message);
      }
    } catch (err) {
      console.log('Notification fetch failed:', err);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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

  const formatDate = (date) => {
    if (!date) return '';

    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
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
            width: '340px',
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
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '16px' }}>Notifications</h3>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: theme?.primary || '#38bdf8',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                Mark all read
              </button>
            )}
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
              onClick={() => markAsRead(n._id)}
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

                  <small style={{ opacity: 0.55, fontSize: '11px' }}>
                    {formatDate(n.createdAt)}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;