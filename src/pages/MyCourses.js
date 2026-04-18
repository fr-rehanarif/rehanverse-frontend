import API from '../api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const { colors } = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    axios.get('${API}/api/enroll/my/courses',
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(res => setCourses(res.data));
  }, []);

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* HEADER */}
        <h2 style={{ color: colors.primary, marginBottom: '8px' }}>
          🎒 Meri Courses
        </h2>
        <p style={{ color: colors.subtext, marginBottom: '30px' }}>
          Jin courses mein tumne enroll kiya hai
        </p>

        {/* DASHBOARD STATS */}
        {courses.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '30px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              flex: '1',
              background: colors.card,
              padding: '16px',
              borderRadius: '12px',
              border: `1px solid ${colors.border}`
            }}>
              <p style={{ color: colors.subtext, fontSize: '13px' }}>Total Courses</p>
              <h3 style={{ color: colors.text }}>{courses.length}</h3>
            </div>

            <div style={{
              flex: '1',
              background: colors.card,
              padding: '16px',
              borderRadius: '12px',
              border: `1px solid ${colors.border}`
            }}>
              <p style={{ color: colors.subtext, fontSize: '13px' }}>Learning Status</p>
              <h3 style={{ color: colors.text }}>Active 🚀</h3>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {courses.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '80px' }}>
            <p style={{ fontSize: '48px' }}>📭</p>
            <p style={{ color: colors.subtext, fontSize: '18px', marginTop: '16px' }}>
              Abhi koi course nahi!
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/courses')}
              style={{
                marginTop: '20px',
                padding: '12px 28px',
                background: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '15px'
              }}>
              Courses Dekho
            </motion.button>
          </div>
        ) : (

          /* COURSES GRID */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>

            {courses.map(course => (
              <motion.div
                key={course._id}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200 }}
                style={{
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.25)'
                }}
              >

                {/* Thumbnail */}
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '160px',
                    background: `linear-gradient(135deg, ${colors.primary}, #818cf8)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '40px' }}>🎓</span>
                  </div>
                )}

                <div style={{ padding: '18px' }}>
                  <h3 style={{ color: colors.text, marginBottom: '8px' }}>
                    {course.title}
                  </h3>

                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '14px'
                  }}>
                    <span style={{ fontSize: '12px', color: colors.subtext }}>
                      📹 {course.videos?.length || 0} videos
                    </span>
                    <span style={{ fontSize: '12px', color: colors.subtext }}>
                      📄 {course.pdfs?.length || 0} PDFs
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(`/course/${course._id}`)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: colors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}>
                    ▶️ Continue Learning
                  </motion.button>
                </div>

              </motion.div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}

export default MyCourses;