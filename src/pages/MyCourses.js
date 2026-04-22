import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import API from '../api';

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const theme = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    axios
      .get(`${API}/api/enroll/my/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCourses(res.data))
      .catch((err) => console.log(err));
  }, []);

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
        <h2 style={{ color: theme.primary, marginBottom: '8px' }}>🎒 Meri Courses</h2>
        <p style={{ color: theme.muted, marginBottom: '30px' }}>
          Jin courses mein tumne enroll kiya hai
        </p>

        {courses.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '30px',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                flex: '1',
                minWidth: '220px',
                background: theme.card,
                padding: '18px',
                borderRadius: theme.radius,
                border: `1px solid ${theme.border}`,
                boxShadow: theme.shadow,
                backdropFilter: theme.glass,
              }}
            >
              <p style={{ color: theme.muted, fontSize: '13px', marginTop: 0 }}>
                Total Courses
              </p>
              <h3 style={{ color: theme.text, marginBottom: 0 }}>{courses.length}</h3>
            </div>

            <div
              style={{
                flex: '1',
                minWidth: '220px',
                background: theme.card,
                padding: '18px',
                borderRadius: theme.radius,
                border: `1px solid ${theme.border}`,
                boxShadow: theme.shadow,
                backdropFilter: theme.glass,
              }}
            >
              <p style={{ color: theme.muted, fontSize: '13px', marginTop: 0 }}>
                Learning Status
              </p>
              <h3 style={{ color: theme.text, marginBottom: 0 }}>Active 🚀</h3>
            </div>
          </div>
        )}

        {courses.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '80px' }}>
            <p style={{ fontSize: '48px', marginBottom: '10px' }}>📭</p>
            <p
              style={{
                color: theme.muted,
                fontSize: '18px',
                marginTop: '16px',
              }}
            >
              Abhi koi course nahi!
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/courses')}
              style={{
                marginTop: '20px',
                padding: '12px 28px',
                background: theme.primary,
                color: theme.buttonText,
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                boxShadow: theme.shadow,
              }}
            >
              Courses Dekho
            </motion.button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {courses.map((course) => (
              <motion.div
                key={course._id}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 200 }}
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '18px',
                  overflow: 'hidden',
                  boxShadow: theme.shadow,
                  backdropFilter: theme.glass,
                }}
              >
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    style={{
                      width: '100%',
                      height: '160px',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '160px',
                      background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '40px' }}>🎓</span>
                  </div>
                )}

                <div style={{ padding: '18px' }}>
                  <h3
                    style={{
                      color: theme.text,
                      marginBottom: '8px',
                      marginTop: 0,
                    }}
                  >
                    {course.title}
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      marginBottom: '14px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: theme.muted }}>
                      📹 {course.videos?.length || 0} videos
                    </span>
                    <span style={{ fontSize: '12px', color: theme.muted }}>
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
                      background: theme.primary,
                      color: theme.buttonText,
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      boxShadow: theme.shadow,
                    }}
                  >
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