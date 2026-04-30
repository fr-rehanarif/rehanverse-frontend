import { useEffect, useState } from 'react';
import API from '../api';

function AdminNotificationSender({ theme }) {
  const [courses, setCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'general',
    targetType: 'all',
    courseId: '',
  });

  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const token = localStorage.getItem('token');

  const templates = [
    {
      label: '🚀 New Course',
      title: '🚀 New Course Launched',
      message: 'A new premium course is now live on REHANVERSE. Check it out now!',
      type: 'course',
      targetType: 'all',
    },
    {
      label: '🔴 Live Class',
      title: '🔴 Live Class Alert',
      message: 'Your live class has been scheduled. Join on time and do not miss it!',
      type: 'live',
      targetType: 'course',
    },
    {
      label: '⚡ Offer',
      title: '⚡ Limited Time Offer',
      message: 'A special offer is live for a limited time. Enroll before it ends!',
      type: 'offer',
      targetType: 'all',
    },
    {
      label: '📄 Notes Added',
      title: '📄 New Notes Added',
      message: 'New study notes/PDF have been added to your enrolled course.',
      type: 'pdf',
      targetType: 'course',
    },
    {
      label: '🎥 Video Added',
      title: '🎥 New Video Added',
      message: 'A new video lecture has been added to your enrolled course.',
      type: 'video',
      targetType: 'course',
    },
    {
      label: '✅ Payment Info',
      title: '✅ Payment Update',
      message: 'Your payment status has been updated. Please check your course access.',
      type: 'payment',
      targetType: 'all',
    },
  ];

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API}/api/courses`);
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        setCourses(data);
      } else if (res.ok && Array.isArray(data.courses)) {
        setCourses(data.courses);
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.log('Courses fetch error:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      setHistoryLoading(true);

      const res = await fetch(`${API}/api/notifications/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.log('Notifications history fetch error:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchNotifications();
  }, []);

  const applyTemplate = (template) => {
    setForm((prev) => ({
      ...prev,
      title: template.title,
      message: template.message,
      type: template.type,
      targetType: template.targetType,
      courseId: template.targetType === 'course' ? prev.courseId : '',
    }));

    setMsg('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'targetType' && value === 'all' ? { courseId: '' } : {}),
    }));
  };

  const sendNotification = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.message.trim()) {
      setMsg('❌ Title aur message required hai');
      return;
    }

    if (form.targetType === 'course' && !form.courseId) {
      setMsg('❌ Course select karo');
      return;
    }

    try {
      setLoading(true);
      setMsg('');

      const payload = {
        title: form.title,
        message: form.message,
        type: form.type,
        targetType: form.targetType,
        courseId: form.targetType === 'course' ? form.courseId : null,
      };

      const res = await fetch(`${API}/api/notifications/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(`❌ ${data.message || 'Notification send failed'}`);
        return;
      }

      setMsg('✅ Notification sent successfully');

      setForm({
        title: '',
        message: '',
        type: 'general',
        targetType: 'all',
        courseId: '',
      });

      fetchNotifications();
    } catch (err) {
      console.log('Send notification error:', err);
      setMsg('❌ Network error while sending notification');
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm('Ye notification delete karni hai?')) return;

    try {
      const res = await fetch(`${API}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(`❌ ${data.message || 'Delete failed'}`);
        return;
      }

      setMsg('✅ Notification deleted successfully');
      setNotifications((prev) => prev.filter((n) => n._id !== id));

      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.log('Delete notification error:', err);
      setMsg('❌ Network error while deleting notification');
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

  const getTargetLabel = (n) => {
    if (n.targetType === 'all') return '🌍 All Users';
    if (n.targetType === 'course') {
      return `🎒 Course: ${n.courseId?.title || 'Selected Course'}`;
    }
    if (n.targetType === 'user') {
      return `👤 User: ${n.userId?.name || n.userId?.email || 'Specific User'}`;
    }
    return n.targetType;
  };

  const formatDate = (date) => {
    if (!date) return 'Not available';

    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div>
      <div
        style={{
          marginTop: '30px',
          padding: '24px',
          borderRadius: '24px',
          background: theme?.card || '#111827',
          color: theme?.text || '#fff',
          border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
          boxShadow: theme?.shadow || '0 20px 45px rgba(0,0,0,0.25)',
        }}
      >
        <h2
          style={{
            margin: '0 0 8px',
            color: theme?.primary || '#8b5cf6',
            fontSize: '24px',
          }}
        >
          🔔 Send Notification
        </h2>

        <p
          style={{
            margin: '0 0 18px',
            opacity: 0.75,
            fontSize: '14px',
          }}
        >
          New course, live class, offer ya course update ke liye users ko notification bhejo.
        </p>

        <div
          style={{
            marginBottom: '22px',
            padding: '16px',
            borderRadius: '18px',
            background: theme?.bgSecondary || 'rgba(255,255,255,0.04)',
            border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
          }}
        >
          <p
            style={{
              margin: '0 0 12px',
              fontSize: '14px',
              fontWeight: '800',
              color: theme?.text || '#fff',
            }}
          >
            ⚡ Quick Templates
          </p>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            {templates.map((template) => (
              <button
                key={template.label}
                type="button"
                onClick={() => applyTemplate(template)}
                style={{
                  padding: '9px 13px',
                  borderRadius: '999px',
                  border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
                  background: theme?.cardSolid || 'rgba(255,255,255,0.06)',
                  color: theme?.text || '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '700',
                }}
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={sendNotification}>
          <div style={styles.grid}>
            <div>
              <label style={styles.label}>Notification Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Example: 🚀 New Course Launched"
                style={{
                  ...styles.input,
                  background: theme?.input || theme?.bgSecondary || 'rgba(255,255,255,0.06)',
                  color: theme?.text || '#fff',
                  border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
                }}
              />
            </div>

            <div>
              <label style={styles.label}>Notification Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  background: theme?.input || theme?.bgSecondary || 'rgba(255,255,255,0.06)',
                  color: theme?.text || '#fff',
                  border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
                }}
              >
                <option value="general">🔔 General</option>
                <option value="course">🚀 Course Launch</option>
                <option value="live">🔴 Live Class</option>
                <option value="offer">⚡ Offer</option>
                <option value="payment">✅ Payment</option>
                <option value="pdf">📄 New PDF</option>
                <option value="video">🎥 New Video</option>
              </select>
            </div>

            <div>
              <label style={styles.label}>Target Users</label>
              <select
                name="targetType"
                value={form.targetType}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  background: theme?.input || theme?.bgSecondary || 'rgba(255,255,255,0.06)',
                  color: theme?.text || '#fff',
                  border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
                }}
              >
                <option value="all">🌍 All Users</option>
                <option value="course">🎒 Specific Course Students</option>
              </select>
            </div>

            {form.targetType === 'course' && (
              <div>
                <label style={styles.label}>Select Course</label>
                <select
                  name="courseId"
                  value={form.courseId}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    background: theme?.input || theme?.bgSecondary || 'rgba(255,255,255,0.06)',
                    color: theme?.text || '#fff',
                    border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
                  }}
                >
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div style={{ marginTop: '18px' }}>
            <label style={styles.label}>Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Example: Your live class starts today at 7 PM."
              rows="4"
              style={{
                ...styles.input,
                resize: 'vertical',
                background: theme?.input || theme?.bgSecondary || 'rgba(255,255,255,0.06)',
                color: theme?.text || '#fff',
                border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
              }}
            />
          </div>

          {msg && (
            <div
              style={{
                marginTop: '15px',
                padding: '12px 14px',
                borderRadius: '14px',
                background: msg.startsWith('✅')
                  ? 'rgba(34,197,94,0.14)'
                  : 'rgba(239,68,68,0.14)',
                color: msg.startsWith('✅') ? '#22c55e' : '#ef4444',
                fontWeight: '700',
                fontSize: '14px',
              }}
            >
              {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '18px',
              padding: '13px 22px',
              border: 'none',
              borderRadius: '16px',
              background: theme?.primary || '#8b5cf6',
              color: theme?.buttonText || '#fff',
              fontWeight: '800',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: theme?.shadow || '0 12px 25px rgba(0,0,0,0.25)',
            }}
          >
            {loading ? 'Sending...' : '🚀 Send Notification'}
          </button>
        </form>
      </div>

      <div
        style={{
          marginTop: '28px',
          padding: '24px',
          borderRadius: '24px',
          background: theme?.card || '#111827',
          color: theme?.text || '#fff',
          border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
          boxShadow: theme?.shadow || '0 20px 45px rgba(0,0,0,0.25)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: theme?.primary || '#8b5cf6',
                fontSize: '22px',
              }}
            >
              📜 Notification History
            </h2>

            <p
              style={{
                margin: '6px 0 0',
                opacity: 0.7,
                fontSize: '13px',
              }}
            >
              Sent notifications yahan dikhenge. Galti wali notification delete kar sakte ho.
            </p>
          </div>

          <button
            onClick={fetchNotifications}
            disabled={historyLoading}
            style={{
              padding: '10px 15px',
              borderRadius: '12px',
              border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
              background: theme?.bgSecondary || 'rgba(255,255,255,0.06)',
              color: theme?.text || '#fff',
              cursor: historyLoading ? 'not-allowed' : 'pointer',
              fontWeight: '800',
              opacity: historyLoading ? 0.7 : 1,
            }}
          >
            {historyLoading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {historyLoading && notifications.length === 0 ? (
          <p style={{ color: theme?.muted || '#9ca3af' }}>Loading notification history...</p>
        ) : notifications.length === 0 ? (
          <div
            style={{
              padding: '24px',
              borderRadius: '18px',
              background: theme?.bgSecondary || 'rgba(255,255,255,0.04)',
              border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
              textAlign: 'center',
              color: theme?.muted || '#9ca3af',
            }}
          >
            🔕 Abhi koi notification history nahi hai.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {notifications.map((n) => (
              <div
                key={n._id}
                style={{
                  padding: '16px',
                  borderRadius: '18px',
                  background: theme?.bgSecondary || 'rgba(255,255,255,0.04)',
                  border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <h3
                    style={{
                      margin: '0 0 7px',
                      fontSize: '16px',
                      color: theme?.text || '#fff',
                    }}
                  >
                    {getIcon(n.type)} {n.title}
                  </h3>

                  <p
                    style={{
                      margin: '0 0 10px',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      color: theme?.muted || '#9ca3af',
                    }}
                  >
                    {n.message}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <span style={badgeStyle(theme)}>
                      {getTargetLabel(n)}
                    </span>

                    <span style={badgeStyle(theme)}>
                      Type: {n.type}
                    </span>

                    <span style={badgeStyle(theme)}>
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteNotification(n._id)}
                  style={{
                    alignSelf: 'center',
                    padding: '10px 14px',
                    background: theme?.danger || '#ef4444',
                    color: theme?.buttonText || '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '800',
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const badgeStyle = (theme) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '5px 9px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: '700',
  background: theme?.cardSolid || 'rgba(255,255,255,0.07)',
  color: theme?.muted || '#9ca3af',
  border: `1px solid ${theme?.border || 'rgba(255,255,255,0.12)'}`,
});

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '7px',
    fontSize: '13px',
    fontWeight: '700',
    opacity: 0.85,
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '14px',
    outline: 'none',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
};

export default AdminNotificationSender;