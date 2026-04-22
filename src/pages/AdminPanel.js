import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import API from '../api';

function AdminPanel() {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('courses');
  const [enrolledUsers, setEnrolledUsers] = useState({});
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [msg, setMsg] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: 0,
    isFree: false,
    thumbnail: '',
    videoTitle: '',
    videoUrl: '',
    pdfTitle: '',
    pdfUrl: '',
  });
  const [videos, setVideos] = useState([]);
  const [pdfs, setPdfs] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchCourses();
    fetchUsers();
  }, []);

  const fetchCourses = async () => {
    const res = await axios.get(`${API}/api/courses`);
    setCourses(res.data);
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`${name} ko delete karo?`)) return;
    try {
      await axios.delete(`${API}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error!');
    }
  };

  const fetchEnrolledUsers = async (courseId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
      return;
    }

    try {
      const res = await axios.get(`${API}/api/courses/${courseId}/enrolled-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnrolledUsers({ ...enrolledUsers, [courseId]: res.data });
      setExpandedCourse(courseId);
    } catch (err) {
      console.log(err);
    }
  };

  const startEdit = (course) => {
    setEditingId(course._id);
    setForm({
      title: course.title,
      description: course.description,
      price: course.price,
      isFree: course.isFree,
      thumbnail: course.thumbnail || '',
      videoTitle: '',
      videoUrl: '',
      pdfTitle: '',
      pdfUrl: '',
    });
    setVideos(course.videos || []);
    setPdfs(course.pdfs || []);
    setActiveTab('courses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      price: 0,
      isFree: false,
      thumbnail: '',
      videoTitle: '',
      videoUrl: '',
      pdfTitle: '',
      pdfUrl: '',
    });
    setVideos([]);
    setPdfs([]);
  };

  const addVideo = () => {
    if (!form.videoTitle || !form.videoUrl) return;
    setVideos([...videos, { title: form.videoTitle, url: form.videoUrl }]);
    setForm({ ...form, videoTitle: '', videoUrl: '' });
  };

  const addPdf = () => {
    if (!form.pdfTitle || !form.pdfUrl) return;
    setPdfs([...pdfs, { title: form.pdfTitle, url: form.pdfUrl }]);
    setForm({ ...form, pdfTitle: '', pdfUrl: '' });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description) {
      setMsg('❌ Title aur Description zaroori hai!');
      setTimeout(() => setMsg(''), 3000);
      return;
    }

    try {
      if (editingId) {
        await axios.put(
          `${API}/api/courses/${editingId}`,
          { ...form, videos, pdfs },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMsg('✅ Course updated!');
      } else {
        await axios.post(
          `${API}/api/courses`,
          { ...form, videos, pdfs },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMsg('✅ Course created!');
      }

      cancelEdit();
      fetchCourses();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ Error: ' + (err.response?.data?.message || 'Something went wrong'));
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;

    await axios.delete(`${API}/api/courses/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (editingId === id) cancelEdit();
    fetchCourses();
  };

  const inputStyle = {
    width: '100%',
    padding: '11px',
    marginBottom: '14px',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    background: theme.bgSecondary,
    color: theme.text,
    border: `1px solid ${theme.border}`,
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        background: theme.bg,
        minHeight: '100vh',
        padding: '40px 20px',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ color: theme.primary, marginBottom: '4px' }}>⚙️ Admin Panel</h2>
        <p style={{ color: theme.muted, marginBottom: '24px' }}>
          Welcome, {user?.name}!
        </p>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('courses')}
            style={{
              padding: '10px 24px',
              borderRadius: '12px',
              border: `1px solid ${activeTab === 'courses' ? theme.primary : theme.border}`,
              cursor: 'pointer',
              fontWeight: '600',
              background: activeTab === 'courses' ? theme.primary : theme.card,
              color: activeTab === 'courses' ? theme.buttonText : theme.text,
              boxShadow: activeTab === 'courses' ? theme.shadow : 'none',
            }}
          >
            📚 Courses ({courses.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '10px 24px',
              borderRadius: '12px',
              border: `1px solid ${activeTab === 'users' ? theme.primary : theme.border}`,
              cursor: 'pointer',
              fontWeight: '600',
              background: activeTab === 'users' ? theme.primary : theme.card,
              color: activeTab === 'users' ? theme.buttonText : theme.text,
              boxShadow: activeTab === 'users' ? theme.shadow : 'none',
            }}
          >
            👥 Users ({users.length})
          </button>
        </div>

        {activeTab === 'courses' && (
          <div>
            <div
              style={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
                borderRadius: theme.radius,
                padding: '32px',
                marginBottom: '40px',
                boxShadow: theme.shadow,
                backdropFilter: theme.glass,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <h3 style={{ color: theme.text, margin: 0 }}>
                  {editingId ? '✏️ Course Edit Karo' : '➕ Naya Course Banao'}
                </h3>

                {editingId && (
                  <button
                    onClick={cancelEdit}
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      color: theme.muted,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    ✕ Cancel
                  </button>
                )}
              </div>

              {editingId && (
                <div
                  style={{
                    padding: '12px 14px',
                    background: theme.mode === 'dark' ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
                    border: `1px solid ${theme.mode === 'dark' ? 'rgba(245, 158, 11, 0.35)' : '#fcd34d'}`,
                    borderRadius: '12px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    color: theme.mode === 'dark' ? '#fcd34d' : '#92400e',
                  }}
                >
                  ✏️ Tum <strong>"{form.title}"</strong> ko edit kar rahe ho
                </div>
              )}

              <input
                style={inputStyle}
                placeholder="Course Title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <textarea
                style={{ ...inputStyle, height: '90px', resize: 'vertical' }}
                placeholder="Course Description *"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />

              <input
                style={inputStyle}
                placeholder="Thumbnail Image URL (optional)"
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '14px',
                  flexWrap: 'wrap',
                }}
              >
                <label style={{ color: theme.text }}>
                  <input
                    type="checkbox"
                    checked={form.isFree}
                    onChange={(e) =>
                      setForm({ ...form, isFree: e.target.checked, price: 0 })
                    }
                    style={{ marginRight: '6px' }}
                  />
                  Free Course
                </label>

                {!form.isFree && (
                  <input
                    style={{ ...inputStyle, width: '200px', marginBottom: 0 }}
                    type="number"
                    placeholder="Price (₹)"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                )}
              </div>

              <div
                style={{
                  background: theme.bgSecondary,
                  borderRadius: '14px',
                  padding: '16px',
                  marginBottom: '14px',
                  border: `1px solid ${theme.border}`,
                }}
              >
                <p style={{ color: theme.text, fontWeight: '600', marginBottom: '10px' }}>
                  📹 Videos
                </p>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <input
                    style={{ ...inputStyle, marginBottom: 0, flex: 1, minWidth: '200px' }}
                    placeholder="Video Title"
                    value={form.videoTitle}
                    onChange={(e) => setForm({ ...form, videoTitle: e.target.value })}
                  />
                  <input
                    style={{ ...inputStyle, marginBottom: 0, flex: 1, minWidth: '220px' }}
                    placeholder="YouTube / Drive URL"
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  />
                  <button
                    onClick={addVideo}
                    style={{
                      padding: '0 16px',
                      background: theme.primary,
                      color: theme.buttonText,
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      minHeight: '44px',
                    }}
                  >
                    + Add
                  </button>
                </div>

                {videos.map((v, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      background: theme.cardSolid,
                      borderRadius: '10px',
                      marginBottom: '6px',
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <span style={{ color: theme.text, fontSize: '13px' }}>📹 {v.title}</span>
                    <button
                      onClick={() => setVideos(videos.filter((_, idx) => idx !== i))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.danger,
                        cursor: 'pointer',
                        fontSize: '16px',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {videos.length === 0 && (
                  <p style={{ color: theme.muted, fontSize: '12px' }}>Abhi koi video nahi</p>
                )}
              </div>

              <div
                style={{
                  background: theme.bgSecondary,
                  borderRadius: '14px',
                  padding: '16px',
                  marginBottom: '20px',
                  border: `1px solid ${theme.border}`,
                }}
              >
                <p style={{ color: theme.text, fontWeight: '600', marginBottom: '10px' }}>
                  📄 PDFs / Notes
                </p>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <input
                    style={{ ...inputStyle, marginBottom: 0, flex: 1, minWidth: '200px' }}
                    placeholder="PDF Title"
                    value={form.pdfTitle}
                    onChange={(e) => setForm({ ...form, pdfTitle: e.target.value })}
                  />
                  <input
                    style={{ ...inputStyle, marginBottom: 0, flex: 1, minWidth: '220px' }}
                    placeholder="Google Drive URL"
                    value={form.pdfUrl}
                    onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
                  />
                  <button
                    onClick={addPdf}
                    style={{
                      padding: '0 16px',
                      background: theme.primary,
                      color: theme.buttonText,
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      minHeight: '44px',
                    }}
                  >
                    + Add
                  </button>
                </div>

                {pdfs.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      background: theme.cardSolid,
                      borderRadius: '10px',
                      marginBottom: '6px',
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <span style={{ color: theme.text, fontSize: '13px' }}>📄 {p.title}</span>
                    <button
                      onClick={() => setPdfs(pdfs.filter((_, idx) => idx !== i))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.danger,
                        cursor: 'pointer',
                        fontSize: '16px',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {pdfs.length === 0 && (
                  <p style={{ color: theme.muted, fontSize: '12px' }}>Abhi koi PDF nahi</p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: editingId ? theme.success : theme.primary,
                  color: theme.buttonText,
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  boxShadow: theme.shadow,
                }}
              >
                {editingId ? '💾 Changes Save Karo' : '🚀 Course Publish Karo'}
              </button>

              {msg && (
                <p
                  style={{
                    textAlign: 'center',
                    marginTop: '12px',
                    color: msg.includes('✅') ? theme.success : theme.danger,
                  }}
                >
                  {msg}
                </p>
              )}
            </div>

            <h3 style={{ color: theme.text, marginBottom: '16px' }}>
              📚 Mere Courses ({courses.length})
            </h3>

            {courses.length === 0 ? (
              <p style={{ color: theme.muted }}>Abhi koi course nahi!</p>
            ) : (
              courses.map((course) => (
                <div key={course._id} style={{ marginBottom: '12px' }}>
                  <div
                    style={{
                      background:
                        editingId === course._id
                          ? theme.mode === 'dark'
                            ? 'rgba(34, 197, 94, 0.12)'
                            : '#f0fdf4'
                          : theme.card,
                      border: `1px solid ${
                        editingId === course._id ? theme.success : theme.border
                      }`,
                      borderRadius: '16px',
                      padding: '20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px',
                      flexWrap: 'wrap',
                      boxShadow: theme.shadow,
                      backdropFilter: theme.glass,
                    }}
                  >
                    <div>
                      <h4 style={{ color: theme.text, marginBottom: '4px', marginTop: 0 }}>
                        {course.title}
                      </h4>
                      <p style={{ color: theme.muted, fontSize: '13px', margin: 0 }}>
                        {course.isFree ? '🆓 Free' : `💰 ₹${course.price}`} &nbsp;|&nbsp;
                        📹 {course.videos?.length || 0} videos &nbsp;|&nbsp;
                        📄 {course.pdfs?.length || 0} PDFs
                      </p>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <button
                        onClick={() => fetchEnrolledUsers(course._id)}
                        style={{
                          padding: '8px 16px',
                          background: theme.accent,
                          color: theme.buttonText,
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontWeight: '500',
                        }}
                      >
                        👥 {expandedCourse === course._id ? 'Hide' : 'Students'}
                      </button>

                      <button
                        onClick={() => startEdit(course)}
                        style={{
                          padding: '8px 16px',
                          background: theme.warning,
                          color: theme.buttonText,
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontWeight: '500',
                        }}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() => deleteCourse(course._id)}
                        style={{
                          padding: '8px 16px',
                          background: theme.danger,
                          color: theme.buttonText,
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  {expandedCourse === course._id && (
                    <div
                      style={{
                        background: theme.bgSecondary,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '0 0 14px 14px',
                        padding: '16px',
                        marginTop: '-4px',
                      }}
                    >
                      <p
                        style={{
                          color: theme.text,
                          fontWeight: '600',
                          marginBottom: '12px',
                          fontSize: '14px',
                        }}
                      >
                        👥 Enrolled Students ({enrolledUsers[course._id]?.length || 0})
                      </p>

                      {enrolledUsers[course._id]?.length === 0 ? (
                        <p style={{ color: theme.muted, fontSize: '13px' }}>
                          Abhi koi student enroll nahi!
                        </p>
                      ) : (
                        enrolledUsers[course._id]?.map((u, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              background: theme.card,
                              borderRadius: '10px',
                              marginBottom: '6px',
                              border: `1px solid ${theme.border}`,
                              gap: '12px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span style={{ color: theme.text, fontSize: '13px' }}>
                              👤 {u.name}
                            </span>
                            <span style={{ color: theme.muted, fontSize: '13px' }}>
                              {u.email}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h3 style={{ color: theme.text, marginBottom: '20px' }}>
              👥 Registered Users ({users.length})
            </h3>

            {users.length === 0 ? (
              <p style={{ color: theme.muted }}>Abhi koi user nahi!</p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '16px',
                }}
              >
                {users.map((u, i) => (
                  <div
                    key={u._id}
                    style={{
                      background: theme.card,
                      border: `1px solid ${
                        u.role === 'admin' ? theme.primary : theme.border
                      }`,
                      borderRadius: theme.radius,
                      padding: '20px',
                      position: 'relative',
                      boxShadow: theme.shadow,
                      backdropFilter: theme.glass,
                    }}
                  >
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background:
                            u.role === 'admin'
                              ? theme.mode === 'dark'
                                ? 'rgba(245, 158, 11, 0.18)'
                                : '#fef3c7'
                              : theme.mode === 'dark'
                              ? 'rgba(34, 197, 94, 0.18)'
                              : '#d1fae5',
                          color:
                            u.role === 'admin'
                              ? theme.mode === 'dark'
                                ? '#fcd34d'
                                : '#92400e'
                              : theme.mode === 'dark'
                              ? '#86efac'
                              : '#065f46',
                        }}
                      >
                        {u.role === 'admin' ? '👑 Admin' : '🎓 Student'}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '14px',
                      }}
                    >
                      {u.photo ? (
                        <img
                          src={u.photo}
                          alt={u.name}
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: `2px solid ${theme.primary}`,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            background: theme.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: theme.buttonText,
                            fontWeight: '700',
                            fontSize: '20px',
                            flexShrink: 0,
                          }}
                        >
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <h4
                          style={{
                            color: theme.text,
                            margin: 0,
                            fontSize: '15px',
                            fontWeight: '700',
                          }}
                        >
                          {u.name}
                        </h4>
                        <p style={{ color: theme.muted, margin: 0, fontSize: '12px' }}>
                          #{i + 1}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        marginBottom: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px' }}>📧</span>
                        <span style={{ color: theme.muted, fontSize: '12px' }}>
                          {u.email}
                        </span>
                      </div>

                      {u.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px' }}>📱</span>
                          <span style={{ color: theme.muted, fontSize: '12px' }}>
                            {u.phone}
                          </span>
                        </div>
                      )}

                      {u.bio && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{ fontSize: '12px' }}>💬</span>
                          <span
                            style={{
                              color: theme.muted,
                              fontSize: '12px',
                              fontStyle: 'italic',
                            }}
                          >
                            "{u.bio}"
                          </span>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px' }}>📅</span>
                        <span style={{ color: theme.muted, fontSize: '12px' }}>
                          Joined: {new Date(u.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {u.enrolledCourses?.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <p
                          style={{
                            color: theme.text,
                            fontSize: '12px',
                            fontWeight: '600',
                            marginBottom: '6px',
                          }}
                        >
                          📚 Enrolled:
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {u.enrolledCourses.map((c, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: '3px 8px',
                                background:
                                  theme.mode === 'dark'
                                    ? `${theme.primary}33`
                                    : `${theme.primary}1A`,
                                color: theme.primary,
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '500',
                              }}
                            >
                              {c.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {u.role !== 'admin' && (
                      <button
                        onClick={() => deleteUser(u._id, u.name)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: theme.danger,
                          color: theme.buttonText,
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                        }}
                      >
                        🗑️ Delete User
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;