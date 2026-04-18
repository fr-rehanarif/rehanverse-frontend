import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import API from '../api';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [msg, setMsg] = useState('');
  const { colors } = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCourses();
    if (token) fetchEnrolled();
  }, []);

  const fetchCourses = async () => {
    const res = await axios.get(`${API}/api/courses`);
    setCourses(res.data);
  };

  const fetchEnrolled = async () => {
    try {
      const res = await axios.get(`${API}/api/enroll/my/courses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEnrolledIds(res.data.map(c => c._id));
    } catch (err) {
      console.log(err);
    }
  };

  const handleEnroll = async (course) => {
    if (!token) { navigate('/login'); return; }
    try {
      const res = await axios.post(
        `${API}/api/enroll/${course._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg('✅ ' + res.data.message);
      setEnrolledIds([...enrolledIds, course._id]);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      if (err.response?.data?.message === 'PAYMENT_REQUIRED') {
        navigate(`/payment/${course._id}`);
      } else {
        setMsg('⚠️ ' + err.response?.data?.message);
        setTimeout(() => setMsg(''), 3000);
      }
    }
  };

  const isEnrolled = (id) => enrolledIds.includes(id);

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ color: colors.primary, marginBottom: '8px' }}>📚 All Courses</h2>
        <p style={{ color: colors.subtext, marginBottom: '30px' }}>Apni skills badao — aaj hi shuru karo!</p>

        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '12px 20px', borderRadius: '10px', marginBottom: '20px',
              background: msg.includes('✅') ? '#d1fae5' : '#fee2e2',
              color: msg.includes('✅') ? '#065f46' : '#991b1b' }}>
            {msg}
          </motion.div>
        )}

        {courses.length === 0 ? (
          <p style={{ color: colors.subtext, textAlign: 'center', marginTop: '60px', fontSize: '18px' }}>
            Abhi koi course nahi hai — jald aayenge! 🚀
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {courses.map(course => (
              <motion.div
                key={course._id}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200 }}
                style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '18px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', cursor: 'pointer' }}>
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '180px', background: `linear-gradient(135deg, ${colors.primary}, #818cf8)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '48px' }}>🎓</span>
                  </div>
                )}
                <div style={{ padding: '20px' }}>
                  <h3 style={{ color: colors.text, marginBottom: '8px', fontSize: '17px' }}>{course.title}</h3>
                  <p style={{ color: colors.subtext, fontSize: '13px', marginBottom: '12px', lineHeight: '1.5' }}>
                    {course.description?.slice(0, 80)}...
                  </p>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '12px', color: colors.subtext }}>📹 {course.videos?.length || 0} videos</span>
                    <span style={{ fontSize: '12px', color: colors.subtext }}>📄 {course.pdfs?.length || 0} PDFs</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '18px', color: colors.primary }}>
                      {course.isFree ? '🆓 Free' : `₹${course.price}`}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEnroll(course)}
                      style={{ padding: '9px 20px', background: isEnrolled(course._id) ? '#10b981' : colors.primary, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                      {isEnrolled(course._id) ? '✅ Enrolled' : 'Enroll Now'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Courses;