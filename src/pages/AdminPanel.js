import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import API from '../api';

function AdminPanel() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const [courses, setCourses] = useState([]);
  const [msg, setMsg] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', price: 0,
    isFree: false, thumbnail: '',
    videoTitle: '', videoUrl: '',
    pdfTitle: '', pdfUrl: ''
  });
  const [videos, setVideos] = useState([]);
  const [pdfs, setPdfs] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const res = await axios.get(`${API}/api/courses`);
    setCourses(res.data);
  };

  const startEdit = (course) => {
    setEditingId(course._id);
    setForm({
      title: course.title,
      description: course.description,
      price: course.price,
      isFree: course.isFree,
      thumbnail: course.thumbnail || '',
      videoTitle: '', videoUrl: '',
      pdfTitle: '', pdfUrl: ''
    });
    setVideos(course.videos || []);
    setPdfs(course.pdfs || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: '', description: '', price: 0, isFree: false, thumbnail: '', videoTitle: '', videoUrl: '', pdfTitle: '', pdfUrl: '' });
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
        await axios.put(`${API}/api/courses/${editingId}`,
          { ...form, videos, pdfs },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMsg('✅ Course updated!');
      } else {
        await axios.post(`${API}/api/courses`,
          { ...form, videos, pdfs },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMsg('✅ Course created!');
      }
      cancelEdit();
      fetchCourses();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ Error: ' + err.response?.data?.message);
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    await axios.delete(`${API}/api/courses/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (editingId === id) cancelEdit();
    fetchCourses();
  };

  const inputStyle = {
    width: '100%', padding: '11px', marginBottom: '14px',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
    background: colors.bg, color: colors.text,
    border: `1px solid ${colors.border}`
  };

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <h2 style={{ color: colors.primary, marginBottom: '4px' }}>⚙️ Admin Panel</h2>
        <p style={{ color: colors.subtext, marginBottom: '32px' }}>Welcome, {user?.name}!</p>

        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '32px', marginBottom: '40px' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: colors.text }}>
              {editingId ? '✏️ Course Edit Karo' : '➕ Naya Course Banao'}
            </h3>
            {editingId && (
              <button onClick={cancelEdit}
                style={{ padding: '7px 16px', background: 'transparent', color: colors.subtext, border: `1px solid ${colors.border}`, borderRadius: '8px', cursor: 'pointer' }}>
                ✕ Cancel
              </button>
            )}
          </div>

          {editingId && (
            <div style={{ padding: '10px 14px', background: '#fef3c7', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#92400e' }}>
              ✏️ Tum <strong>"{form.title}"</strong> ko edit kar rahe ho
            </div>
          )}

          <input style={inputStyle} placeholder="Course Title *"
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />

          <textarea style={{ ...inputStyle, height: '90px', resize: 'vertical' }}
            placeholder="Course Description *"
            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

          <input style={inputStyle} placeholder="Thumbnail Image URL (optional)"
            value={form.thumbnail} onChange={e => setForm({ ...form, thumbnail: e.target.value })} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <label style={{ color: colors.text }}>
              <input type="checkbox" checked={form.isFree}
                onChange={e => setForm({ ...form, isFree: e.target.checked, price: 0 })}
                style={{ marginRight: '6px' }} />
              Free Course
            </label>
            {!form.isFree && (
              <input style={{ ...inputStyle, width: '200px', marginBottom: 0 }}
                type="number" placeholder="Price (₹)"
                value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            )}
          </div>

          <div style={{ background: colors.bg, borderRadius: '10px', padding: '16px', marginBottom: '14px' }}>
            <p style={{ color: colors.text, fontWeight: '600', marginBottom: '10px' }}>📹 Videos</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="Video Title"
                value={form.videoTitle} onChange={e => setForm({ ...form, videoTitle: e.target.value })} />
              <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="YouTube / Drive URL"
                value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })} />
              <button onClick={addVideo}
                style={{ padding: '0 16px', background: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                + Add
              </button>
            </div>
            {videos.map((v, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: colors.card, borderRadius: '6px', marginBottom: '4px' }}>
                <span style={{ color: colors.text, fontSize: '13px' }}>📹 {v.title}</span>
                <button onClick={() => setVideos(videos.filter((_, idx) => idx !== i))}
                  style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '16px' }}>✕</button>
              </div>
            ))}
            {videos.length === 0 && <p style={{ color: colors.subtext, fontSize: '12px' }}>Abhi koi video nahi</p>}
          </div>

          <div style={{ background: colors.bg, borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
            <p style={{ color: colors.text, fontWeight: '600', marginBottom: '10px' }}>📄 PDFs / Notes</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="PDF Title"
                value={form.pdfTitle} onChange={e => setForm({ ...form, pdfTitle: e.target.value })} />
              <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="Google Drive URL"
                value={form.pdfUrl} onChange={e => setForm({ ...form, pdfUrl: e.target.value })} />
              <button onClick={addPdf}
                style={{ padding: '0 16px', background: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                + Add
              </button>
            </div>
            {pdfs.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: colors.card, borderRadius: '6px', marginBottom: '4px' }}>
                <span style={{ color: colors.text, fontSize: '13px' }}>📄 {p.title}</span>
                <button onClick={() => setPdfs(pdfs.filter((_, idx) => idx !== i))}
                  style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '16px' }}>✕</button>
              </div>
            ))}
            {pdfs.length === 0 && <p style={{ color: colors.subtext, fontSize: '12px' }}>Abhi koi PDF nahi</p>}
          </div>

          <button onClick={handleSubmit}
            style={{ width: '100%', padding: '14px', background: editingId ? '#10b981' : colors.primary, color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: '600' }}>
            {editingId ? '💾 Changes Save Karo' : '🚀 Course Publish Karo'}
          </button>

          {msg && (
            <p style={{ textAlign: 'center', marginTop: '12px', color: msg.includes('✅') ? 'green' : 'red' }}>
              {msg}
            </p>
          )}
        </div>

        <h3 style={{ color: colors.text, marginBottom: '16px' }}>📚 Mere Courses ({courses.length})</h3>
        {courses.length === 0 ? (
          <p style={{ color: colors.subtext }}>Abhi koi course nahi — upar se banao!</p>
        ) : (
          courses.map(course => (
            <div key={course._id} style={{
              background: editingId === course._id ? '#f0fdf4' : colors.card,
              border: `1px solid ${editingId === course._id ? '#10b981' : colors.border}`,
              borderRadius: '12px', padding: '20px', marginBottom: '12px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h4 style={{ color: colors.text, marginBottom: '4px' }}>{course.title}</h4>
                <p style={{ color: colors.subtext, fontSize: '13px' }}>
                  {course.isFree ? '🆓 Free' : `💰 ₹${course.price}`} &nbsp;|&nbsp;
                  📹 {course.videos?.length || 0} videos &nbsp;|&nbsp;
                  📄 {course.pdfs?.length || 0} PDFs
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => startEdit(course)}
                  style={{ padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                  ✏️ Edit
                </button>
                <button onClick={() => deleteCourse(course._id)}
                  style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminPanel;