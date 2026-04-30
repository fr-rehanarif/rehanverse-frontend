import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import Reveal from '../components/Reveal';
import Footer from '../components/Footer';
import API from '../api';

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [liveCounts, setLiveCounts] = useState({});

  const theme = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetchMyCourses();
    // eslint-disable-next-line
  }, [token, navigate]);

  const fetchMyCourses = async () => {
    try {
      const res = await axios.get(`${API}/api/enroll/my/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCourses(res.data);
      fetchLiveCounts(res.data);
    } catch (err) {
      console.log('MY COURSES FETCH ERROR:', err);
    }
  };

  const fetchLiveCounts = async (courseList) => {
    try {
      const counts = {};

      await Promise.all(
        courseList.map(async (course) => {
          try {
            const res = await axios.get(
              `${API}/api/live-classes/course/${course._id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            counts[course._id] = res.data?.length || 0;
          } catch (err) {
            console.log(`LIVE COUNT ERROR FOR ${course.title}:`, err);
            counts[course._id] = 0;
          }
        })
      );

      setLiveCounts(counts);
    } catch (err) {
      console.log('LIVE COUNTS ERROR:', err);
    }
  };

  return (
    <div
      style={{
        background: theme.bg,
        minHeight: '100vh',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '40px 20px' }}>
        <Reveal>
          <div>
            <h2
              style={{
                color: theme.primary,
                marginBottom: '8px',
                fontSize: '2.2rem',
                fontWeight: '800',
              }}
            >
              🎒 Our Courses
            </h2>

            <p
              style={{
                color: theme.muted,
                marginBottom: '34px',
                fontSize: '1.05rem',
              }}
            >
              Courses you are enrolled in
            </p>
          </div>
        </Reveal>

        {courses.length > 0 && (
          <Reveal>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '18px',
                marginBottom: '34px',
              }}
            >
              <div
                style={{
                  background: theme.card,
                  padding: '22px 24px',
                  borderRadius: '22px',
                  border: `1px solid ${theme.border}`,
                  boxShadow: theme.shadow,
                  backdropFilter: theme.glass,
                  minHeight: '110px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <p
                  style={{
                    color: theme.muted,
                    fontSize: '14px',
                    marginTop: 0,
                    marginBottom: '8px',
                  }}
                >
                  Total Courses
                </p>

                <h3
                  style={{
                    color: theme.text,
                    margin: 0,
                    fontSize: '2rem',
                    fontWeight: '800',
                  }}
                >
                  {courses.length}
                </h3>
              </div>

              <div
                style={{
                  background: theme.card,
                  padding: '22px 24px',
                  borderRadius: '22px',
                  border: `1px solid ${theme.border}`,
                  boxShadow: theme.shadow,
                  backdropFilter: theme.glass,
                  minHeight: '110px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <p
                  style={{
                    color: theme.muted,
                    fontSize: '14px',
                    marginTop: 0,
                    marginBottom: '8px',
                  }}
                >
                  Learning Status
                </p>

                <h3
                  style={{
                    color: theme.text,
                    margin: 0,
                    fontSize: '2rem',
                    fontWeight: '800',
                  }}
                >
                  Active 🚀
                </h3>
              </div>
            </div>
          </Reveal>
        )}

        {courses.length === 0 ? (
          <Reveal>
            <div style={{ textAlign: 'center', marginTop: '80px' }}>
              <p style={{ fontSize: '48px', marginBottom: '10px' }}>📭</p>

              <p
                style={{
                  color: theme.muted,
                  fontSize: '18px',
                  marginTop: '16px',
                }}
              >
                No courses are Purchased !!
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/courses')}
                style={{
                  marginTop: '20px',
                  padding: '12px 28px',
                  background: theme.primary,
                  color: theme.buttonText,
                  border: 'none',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '700',
                  boxShadow: theme.shadow,
                }}
              >
                See some Courses by us
              </motion.button>
            </div>
          </Reveal>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {courses.map((course, index) => (
              <Reveal key={course._id} delay={index * 0.05}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.015 }}
                  transition={{ type: 'spring', stiffness: 220 }}
                  style={{
                    background: theme.card,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: theme.shadow,
                    backdropFilter: theme.glass,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '430px',
                  }}
                >
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      style={{
                        width: '100%',
                        height: '190px',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '190px',
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: '44px' }}>🎓</span>
                    </div>
                  )}

                  <div
                    style={{
                      padding: '20px 22px 22px',
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                    }}
                  >
                    <h3
                      style={{
                        color: theme.text,
                        marginTop: 0,
                        marginBottom: '12px',
                        fontSize: '1.1rem',
                        fontWeight: '800',
                        lineHeight: '1.35',
                        minHeight: '58px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {course.title}
                    </h3>

                    <div
                      style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '20px',
                        flexWrap: 'wrap',
                        minHeight: '24px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '13px',
                          color: theme.muted,
                          fontWeight: '500',
                        }}
                      >
                        📹 {course.videos?.length || 0} videos
                      </span>

                      <span
                        style={{
                          fontSize: '13px',
                          color: theme.muted,
                          fontWeight: '500',
                        }}
                      >
                        📄 {course.pdfs?.length || 0} PDFs
                      </span>

                      <span
                        style={{
                          fontSize: '13px',
                          color:
                            (liveCounts[course._id] || 0) > 0
                              ? '#f87171'
                              : theme.muted,
                          fontWeight: (liveCounts[course._id] || 0) > 0 ? '800' : '500',
                        }}
                      >
                        🔴 {liveCounts[course._id] || 0} Live Classes
                      </span>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate(`/course/${course._id}`)}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          background: theme.primary,
                          color: theme.buttonText,
                          border: 'none',
                          borderRadius: '14px',
                          cursor: 'pointer',
                          fontWeight: '700',
                          fontSize: '1rem',
                          boxShadow: theme.shadow,
                        }}
                      >
                        ▶️ Continue Learning With US
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default MyCourses;