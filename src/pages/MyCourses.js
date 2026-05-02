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
  const [loading, setLoading] = useState(true);

  const [streak, setStreak] = useState(1);
  const [lastVisitText, setLastVisitText] = useState('Today');

  const theme = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    updateDailyStreak();
    fetchMyCourses();
    // eslint-disable-next-line
  }, [token, navigate]);

  const getTodayKey = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getYesterdayKey = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  };

  const updateDailyStreak = () => {
    const today = getTodayKey();
    const yesterday = getYesterdayKey();

    const savedLastVisit = localStorage.getItem('rehanverse_last_visit');
    const savedStreak = Number(localStorage.getItem('rehanverse_learning_streak') || 0);

    if (!savedLastVisit) {
      localStorage.setItem('rehanverse_last_visit', today);
      localStorage.setItem('rehanverse_learning_streak', '1');
      setStreak(1);
      setLastVisitText('First day');
      return;
    }

    if (savedLastVisit === today) {
      setStreak(savedStreak || 1);
      setLastVisitText('Today');
      return;
    }

    if (savedLastVisit === yesterday) {
      const newStreak = (savedStreak || 1) + 1;
      localStorage.setItem('rehanverse_last_visit', today);
      localStorage.setItem('rehanverse_learning_streak', String(newStreak));
      setStreak(newStreak);
      setLastVisitText('Yesterday');
      return;
    }

    localStorage.setItem('rehanverse_last_visit', today);
    localStorage.setItem('rehanverse_learning_streak', '1');
    setStreak(1);
    setLastVisitText('Restarted today');
  };

  const fetchMyCourses = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/api/enroll/my/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const courseData = Array.isArray(res.data) ? res.data : [];

      setCourses(courseData);
      fetchLiveCounts(courseData);
    } catch (err) {
      console.log('MY COURSES FETCH ERROR:', err);
    } finally {
      setLoading(false);
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

  const totalVideos = courses.reduce((sum, course) => sum + (course.videos?.length || 0), 0);
  const totalPdfs = courses.reduce((sum, course) => sum + (course.pdfs?.length || 0), 0);
  const totalLiveClasses = Object.values(liveCounts).reduce((sum, count) => sum + count, 0);

  const stats = [
    {
      icon: '📚',
      label: 'Enrolled Courses',
      value: courses.length,
    },
    {
      icon: '🔥',
      label: 'Daily Streak',
      value: `${streak} day${streak > 1 ? 's' : ''}`,
    },
    {
      icon: '🎥',
      label: 'Total Videos',
      value: totalVideos,
    },
    {
      icon: '📄',
      label: 'Total PDFs',
      value: totalPdfs,
    },
  ];

  return (
    <div
      style={{
        background: theme.bg,
        minHeight: '100vh',
        color: theme.text,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={styles.bgGrid} />
      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />

      <main style={styles.page}>
        <Reveal>
          <div
            style={{
              ...styles.hero,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadow,
              backdropFilter: theme.glass,
              WebkitBackdropFilter: theme.glass,
              borderRadius: theme.radius,
            }}
          >
            <div>
              <p style={{ ...styles.kicker, color: theme.primary }}>
                🎒 MY LEARNING DASHBOARD
              </p>

              <h2 style={{ ...styles.heroTitle, color: theme.text }}>
                Continue where you left off.
              </h2>

              <p style={{ ...styles.heroText, color: theme.muted }}>
                Your enrolled courses, learning stats, live classes, notes, and daily streak — all in one place.
              </p>
            </div>

            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{
                ...styles.streakCard,
                background: theme.isDark
                  ? 'linear-gradient(135deg, rgba(249,115,22,0.16), rgba(139,92,246,0.12))'
                  : 'linear-gradient(135deg, rgba(255,237,213,0.95), rgba(237,233,254,0.90))',
                border: `1px solid ${theme.border}`,
              }}
            >
              <div style={styles.streakIcon}>🔥</div>

              <div>
                <p style={{ ...styles.streakLabel, color: theme.muted }}>
                  Learning Streak
                </p>

                <h3 style={{ ...styles.streakValue, color: theme.primary }}>
                  {streak} Day{streak > 1 ? 's' : ''}
                </h3>

                <p style={{ ...styles.streakSub, color: theme.textSecondary }}>
                  Last checked: {lastVisitText}
                </p>
              </div>
            </motion.div>
          </div>
        </Reveal>

        <Reveal>
          <div style={styles.statsGrid}>
            {stats.map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{
                  ...styles.statCard,
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  boxShadow: theme.shadow,
                  backdropFilter: theme.glass,
                  WebkitBackdropFilter: theme.glass,
                }}
              >
                <span style={styles.statIcon}>{item.icon}</span>

                <div>
                  <p style={{ ...styles.statLabel, color: theme.muted }}>
                    {item.label}
                  </p>

                  <h3 style={{ ...styles.statValue, color: theme.text }}>
                    {item.value}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div
            style={{
              ...styles.noticeStrip,
              background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.76)',
              border: `1px solid ${theme.border}`,
              color: theme.textSecondary,
            }}
          >
            <span>🎯</span>
            <span>
              Tip: Daily streak maintain karne ke liye roz ek baar dashboard open karo aur course continue karo.
            </span>
          </div>
        </Reveal>

        {loading ? (
          <Reveal>
            <div
              style={{
                ...styles.emptyBox,
                background: theme.card,
                border: `1px solid ${theme.border}`,
                color: theme.muted,
              }}
            >
              Loading your courses...
            </div>
          </Reveal>
        ) : courses.length === 0 ? (
          <Reveal>
            <div
              style={{
                ...styles.emptyBox,
                background: theme.card,
                border: `1px solid ${theme.border}`,
                boxShadow: theme.shadow,
                color: theme.muted,
              }}
            >
              <div style={styles.emptyIcon}>📭</div>

              <h3 style={{ color: theme.text, margin: '0 0 8px', fontSize: '24px' }}>
                No courses purchased yet
              </h3>

              <p style={{ margin: '0 auto 22px', maxWidth: '520px', lineHeight: 1.7 }}>
                Abhi tumhare account me koi enrolled course nahi hai. Start with a free course or preview paid courses.
              </p>

              <motion.button
                whileHover={{ scale: 1.018, y: -1 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                onClick={() => navigate('/courses')}
                style={{
                  ...styles.primaryBtn,
                  background: theme.primary,
                  color: theme.buttonText,
                  boxShadow: `0 0 20px ${theme.primary}40`,
                }}
              >
                Browse Courses 🚀
              </motion.button>
            </div>
          </Reveal>
        ) : (
          <>
            <Reveal>
              <div style={styles.sectionHeader}>
                <div>
                  <h3 style={{ ...styles.sectionTitle, color: theme.text }}>
                    🚀 Continue Learning
                  </h3>
                  <p style={{ ...styles.sectionSubtitle, color: theme.muted }}>
                    Your active enrolled courses
                  </p>
                </div>

                <span
                  style={{
                    ...styles.courseCount,
                    color: theme.primary,
                    background: theme.isDark
                      ? 'rgba(139,92,246,0.12)'
                      : 'rgba(139,92,246,0.10)',
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  {courses.length} owned
                </span>
              </div>
            </Reveal>

            <div style={styles.courseGrid}>
              {courses.map((course, index) => {
                const liveCount = liveCounts[course._id] || 0;
                const progressValue = Math.min(
                  95,
                  Math.max(
                    18,
                    ((course.videos?.length || 0) + (course.pdfs?.length || 0) + liveCount) * 8
                  )
                );

                return (
                  <Reveal key={course._id} delay={index * 0.04}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      style={{
                        ...styles.courseCard,
                        background: theme.card,
                        border: `1px solid ${theme.border}`,
                        boxShadow: theme.shadow,
                        backdropFilter: theme.glass,
                        WebkitBackdropFilter: theme.glass,
                      }}
                    >
                      <div style={styles.thumbnailWrap}>
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            style={styles.thumbnail}
                          />
                        ) : (
                          <div
                            style={{
                              ...styles.emptyThumb,
                              background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                            }}
                          >
                            🎓
                          </div>
                        )}

                        <div style={styles.ownedBadge}>✅ Enrolled</div>
                      </div>

                      <div style={styles.cardBody}>
                        <h3 style={{ ...styles.cardTitle, color: theme.text }}>
                          {course.title}
                        </h3>

                        <p style={{ ...styles.cardDesc, color: theme.muted }}>
                          {course.description
                            ? course.description.length > 90
                              ? `${course.description.slice(0, 90)}...`
                              : course.description
                            : 'Continue your learning journey with this course.'}
                        </p>

                        <div style={styles.metaGrid}>
                          <div
                            style={{
                              ...styles.metaPill,
                              background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                              border: `1px solid ${theme.border}`,
                              color: theme.muted,
                            }}
                          >
                            🎥 {course.videos?.length || 0} Videos
                          </div>

                          <div
                            style={{
                              ...styles.metaPill,
                              background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                              border: `1px solid ${theme.border}`,
                              color: theme.muted,
                            }}
                          >
                            📄 {course.pdfs?.length || 0} PDFs
                          </div>

                          <div
                            style={{
                              ...styles.metaPill,
                              background: liveCount > 0
                                ? 'rgba(239, 68, 68, 0.12)'
                                : theme.isDark
                                ? 'rgba(255,255,255,0.035)'
                                : 'rgba(255,255,255,0.72)',
                              border: `1px solid ${
                                liveCount > 0 ? 'rgba(248,113,113,0.35)' : theme.border
                              }`,
                              color: liveCount > 0 ? '#f87171' : theme.muted,
                              gridColumn: '1 / -1',
                            }}
                          >
                            🔴 {liveCount} Live Classes
                          </div>
                        </div>

                        <div style={styles.progressArea}>
                          <div style={styles.progressTop}>
                            <span style={{ color: theme.muted }}>Learning progress</span>
                            <strong style={{ color: theme.primary }}>{progressValue}%</strong>
                          </div>

                          <div
                            style={{
                              ...styles.progressTrack,
                              background: theme.isDark
                                ? 'rgba(255,255,255,0.08)'
                                : 'rgba(15,23,42,0.10)',
                            }}
                          >
                            <div
                              style={{
                                ...styles.progressFill,
                                width: `${progressValue}%`,
                                background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                              }}
                            />
                          </div>
                        </div>

                        <div style={styles.bottomRow}>
                          <div>
                            <p style={{ ...styles.smallLabel, color: theme.muted }}>
                              Status
                            </p>
                            <strong style={{ color: theme.success }}>
                              Active
                            </strong>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.018, y: -1 }}
                            whileTap={{ scale: 0.985 }}
                            transition={{ duration: 0.16, ease: 'easeOut' }}
                            onClick={() => navigate(`/course/${course._id}`)}
                            style={{
                              ...styles.continueBtn,
                              background: theme.primary,
                              color: theme.buttonText,
                              boxShadow: `0 0 18px ${theme.primary}35`,
                            }}
                          >
                            ▶️ Continue
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  </Reveal>
                );
              })}
            </div>

            <Reveal>
              <div
                style={{
                  ...styles.summaryBox,
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  boxShadow: theme.shadow,
                  color: theme.textSecondary,
                }}
              >
                <div>
                  <h3 style={{ color: theme.text, margin: '0 0 8px' }}>
                    📌 Your Learning Summary
                  </h3>
                  <p style={{ margin: 0, lineHeight: 1.7 }}>
                    You have {courses.length} enrolled course{courses.length > 1 ? 's' : ''}, {totalVideos} videos, {totalPdfs} PDFs, and {totalLiveClasses} live class{totalLiveClasses !== 1 ? 'es' : ''} available.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.018, y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  onClick={() => navigate('/courses')}
                  style={{
                    ...styles.secondaryBtn,
                    border: `1px solid ${theme.border}`,
                    color: theme.primary,
                    background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.78)',
                  }}
                >
                  Explore More →
                </motion.button>
              </div>
            </Reveal>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

const styles = {
  bgGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(167,139,250,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.035) 1px, transparent 1px)',
    backgroundSize: '44px 44px',
    maskImage: 'linear-gradient(to bottom, black, transparent 88%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  glowOne: {
    position: 'absolute',
    top: '90px',
    left: '-130px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'rgba(124, 58, 237, 0.18)',
    filter: 'blur(95px)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  glowTwo: {
    position: 'absolute',
    top: '650px',
    right: '-140px',
    width: '340px',
    height: '340px',
    borderRadius: '50%',
    background: 'rgba(59, 130, 246, 0.14)',
    filter: 'blur(100px)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  page: {
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '40px 20px',
    position: 'relative',
    zIndex: 1,
  },
  hero: {
    padding: '30px',
    marginBottom: '24px',
    display: 'grid',
    gridTemplateColumns: '1.25fr 0.75fr',
    gap: '24px',
    alignItems: 'center',
  },
  kicker: {
    margin: '0 0 8px',
    fontWeight: 950,
    letterSpacing: '0.5px',
    fontSize: '13px',
  },
  heroTitle: {
    fontSize: 'clamp(30px, 4vw, 48px)',
    lineHeight: 1.08,
    margin: '0 0 12px',
    fontWeight: 950,
    letterSpacing: '-0.8px',
  },
  heroText: {
    margin: 0,
    lineHeight: 1.7,
    fontSize: '15px',
    maxWidth: '680px',
  },
  streakCard: {
    padding: '22px',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    minHeight: '150px',
  },
  streakIcon: {
    width: '62px',
    height: '62px',
    borderRadius: '20px',
    display: 'grid',
    placeItems: 'center',
    background: 'rgba(249, 115, 22, 0.16)',
    fontSize: '32px',
    flex: '0 0 auto',
  },
  streakLabel: {
    margin: '0 0 6px',
    fontSize: '13px',
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  streakValue: {
    margin: '0 0 6px',
    fontSize: '34px',
    fontWeight: 950,
  },
  streakSub: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 800,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '16px',
    marginBottom: '18px',
  },
  statCard: {
    padding: '20px',
    borderRadius: '22px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    minHeight: '105px',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    display: 'grid',
    placeItems: 'center',
    background: 'rgba(167, 139, 250, 0.12)',
    fontSize: '24px',
    flex: '0 0 auto',
  },
  statLabel: {
    margin: '0 0 5px',
    fontSize: '13px',
    fontWeight: 900,
  },
  statValue: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 950,
  },
  noticeStrip: {
    padding: '14px 16px',
    borderRadius: '18px',
    marginBottom: '28px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    fontWeight: 800,
    lineHeight: 1.5,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '14px',
    marginBottom: '18px',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 950,
  },
  sectionSubtitle: {
    margin: '6px 0 0',
    fontSize: '14px',
  },
  courseCount: {
    fontWeight: 900,
    padding: '8px 13px',
    borderRadius: '999px',
    fontSize: '13px',
  },
  courseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
    marginBottom: '30px',
  },
  courseCard: {
    borderRadius: '24px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '520px',
  },
  thumbnailWrap: {
    height: '200px',
    position: 'relative',
    overflow: 'hidden',
    background: '#111827',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  emptyThumb: {
    width: '100%',
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    fontSize: '52px',
  },
  ownedBadge: {
    position: 'absolute',
    top: '14px',
    right: '14px',
    background: 'rgba(34,197,94,0.95)',
    color: '#fff',
    padding: '7px 11px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 950,
    boxShadow: '0 8px 24px rgba(34,197,94,0.22)',
  },
  cardBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  cardTitle: {
    margin: '0 0 9px',
    fontSize: '18px',
    fontWeight: 950,
    lineHeight: 1.3,
    minHeight: '46px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardDesc: {
    fontSize: '13px',
    margin: '0 0 16px',
    lineHeight: 1.65,
    minHeight: '44px',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '18px',
  },
  metaPill: {
    padding: '9px 10px',
    borderRadius: '13px',
    fontSize: '12px',
    fontWeight: 850,
  },
  progressArea: {
    marginBottom: '18px',
  },
  progressTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    marginBottom: '8px',
    fontSize: '12px',
    fontWeight: 900,
  },
  progressTrack: {
    width: '100%',
    height: '9px',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '999px',
  },
  bottomRow: {
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  smallLabel: {
    margin: '0 0 3px',
    fontSize: '12px',
    fontWeight: 800,
  },
  continueBtn: {
    padding: '12px 16px',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 950,
    minWidth: '130px',
  },
  emptyBox: {
    padding: '38px 24px',
    borderRadius: '24px',
    textAlign: 'center',
    fontWeight: 800,
    marginTop: '28px',
  },
  emptyIcon: {
    fontSize: '52px',
    marginBottom: '12px',
  },
  primaryBtn: {
    padding: '13px 24px',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    fontWeight: 950,
    fontSize: '15px',
  },
  summaryBox: {
    padding: '22px',
    borderRadius: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '18px',
    flexWrap: 'wrap',
  },
  secondaryBtn: {
    padding: '12px 18px',
    borderRadius: '14px',
    cursor: 'pointer',
    fontWeight: 950,
    fontSize: '14px',
  },
};

export default MyCourses;