import { useEffect, useState } from 'react';
import API from '../api';

function AdminNotificationSender({ theme }) {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'general',
    targetType: 'all',
    courseId: '',
  });

  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

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

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
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
    } catch (err) {
      console.log('Send notification error:', err);
      setMsg('❌ Network error while sending notification');
    } finally {
      setLoading(false);
    }
  };

  return (
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
          margin: '0 0 22px',
          opacity: 0.75,
          fontSize: '14px',
        }}
      >
        New course, live class, offer ya course update ke liye users ko notification bhejo.
      </p>

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
                background: theme?.input || 'rgba(255,255,255,0.06)',
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
                background: theme?.input || 'rgba(255,255,255,0.06)',
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
                background: theme?.input || 'rgba(255,255,255,0.06)',
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
                  background: theme?.input || 'rgba(255,255,255,0.06)',
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
              background: theme?.input || 'rgba(255,255,255,0.06)',
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
  );
}

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