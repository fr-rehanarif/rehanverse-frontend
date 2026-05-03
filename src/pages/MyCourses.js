import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import Reveal from '../components/Reveal';
import Footer from '../components/Footer';
import API from '../api';

function MyCourses() {
  const [courseRows, setCourseRows] = useState([]);
  const [liveCounts, setLiveCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const theme = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetchMyCoursesWithProgress();
    // eslint-disable-next-line
  }, [token, navigate]);

  const getWithTimeout = (url, config = {}, timeoutMs = 8000) => {
    return Promise.race([
      axios.get(url, config),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
      ),
    ]);
  };

  const fetchMyCoursesWithProgress = async () => {
    try {
      setLoading(true);

      let rows = [];

      try {
        const res = await getWithTimeout(
          `${API}/api/progress/my-courses`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
          8000
        );

        rows = Array.isArray(res.data) ? res.data : [];
      } catch (progressErr) {
        console.log('PROGRESS API FAILED, USING FALLBACK:', progressErr.message);

        const fallbackRes = await getWithTimeout(
          `${API}/api/enroll/my/courses`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
          8000
        );

        const oldCourses = Array.isArray(fallbackRes.data) ? fallbackRes.data : [];

        rows = oldCourses.map((course) => ({
          course,
          progress: {
            progressPercent: 0,

            openedItems: 0,
            completedItems: 0,
            totalItems: (course.videos?.length || 0) + (course.pdfs?.length || 0),

            openedVideosCount: 0,
            openedPdfsCount: 0,

            completedVideosCount: 0,
            completedPdfsCount: 0,

            streakCount: 0,
            lastStudyDate: '',
            lastOpenedAt: null,
            lastOpenedType: '',
            lastOpenedTitle: '',
          },
        }));
      }

      setCourseRows(rows);

      const onlyCourses = rows.map((item) => item.course).filter(Boolean);

      // ✅ live count background mein chalega, page loading stuck nahi karega
      fetchLiveCounts(onlyCourses);
    } catch (err) {
      console.log('MY COURSES FINAL ERROR:', err);
      setCourseRows([]);
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
            const res = await getWithTimeout(
              `${API}/api/live-classes/course/${course._id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
              5000
            );

            counts[course._id] = res.data?.length || 0;
          } catch (err) {
            console.log(`LIVE COUNT ERROR FOR ${course.title}:`, err.message || err);
            counts[course._id] = 0;
          }
        })
      );

      setLiveCounts(counts);
    } catch (err) {
      console.log('LIVE COUNTS ERROR:', err);
    }
  };

  const formatLastOpened = (dateValue) => {
    if (!dateValue) return 'Not started yet';

    const date = new Date(dateValue);

    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const getLastOpenedLabel = (progress) => {
    if (!progress?.lastOpenedAt) return 'Open a video or PDF to start tracking';

    const typeLabel =
      progress.lastOpenedType === 'video'
        ? 'Video'
        : progress.lastOpenedType === 'pdf'
        ? 'PDF'
        : 'Course';

    return `${typeLabel}: ${progress.lastOpenedTitle || 'Course Content'}`;
  };

  const courses = courseRows.map((item) => item.course).filter(Boolean);

  const totalVideos = courses.reduce(
    (sum, course) => sum + (course.videos?.length || 0),
    0
  );

  const totalPdfs = courses.reduce(
    (sum, course) => sum + (course.pdfs?.length || 0),
    0
  );

  const totalLiveClasses = Object.values(liveCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  const totalCompletedItems = courseRows.reduce(
    (sum, item) => sum + Number(item.progress?.completedItems || 0),
    0
  );

  const totalOpenedItems = courseRows.reduce(
    (sum, item) => sum + Number(item.progress?.openedItems || 0),
    0
  );

  const totalTrackableItems = courseRows.reduce(
    (sum, item) => sum + Number(item.progress?.totalItems || 0),
    0
  );

  const bestStreak = courseRows.reduce(
    (max, item) => Math.max(max, Number(item.progress?.streakCount || 0)),
    0
  );

  const latestProgress = courseRows
    .map((item) => item.progress)
    .filter((progress) => progress?.lastOpenedAt)
    .sort((a, b) => new Date(b.lastOpenedAt) - new Date(a.lastOpenedAt))[0];

  const stats = [
    {
      icon: '📚',
      label: 'Enrolled Courses',
      value: courses.length,
    },
    {
      icon: '🔥',
      label: 'Best Real Streak',
      value: `${bestStreak} day${bestStreak > 1 ? 's' : ''}`,
    },
    {
      icon: '✅',
      label: 'Completed Items',
      value: `${totalCompletedItems}/${totalTrackableItems}`,
    },
    {
      icon: '👀',
      label: 'Opened Items',
      value: `${totalOpenedItems}/${totalTrackableItems}`,
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

      <main style={styles.page(isMobile)}>
        <Reveal>
          <div
            style={{
              ...styles.hero(isMobile),
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadow,
              backdropFilter: theme.glass,
              WebkitBackdropFilter: theme.glass,
              borderRadius: theme.radius,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p style={{ ...styles.kicker(isMobile), color: theme.primary }}>
                🎒 MY LEARNING DASHBOARD
              </p>

              <h2 style={{ ...styles.heroTitle(isMobile), color: theme.text }}>
                Continue where you left off.
              </h2>

              <p style={{ ...styles.heroText(isMobile), color: theme.muted }}>
                Real progress yahan sirf “Mark as Done” se badhega. Open karne se last opened aur streak update hota hai.
              </p>
            </div>

            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{
                ...styles.streakCard(isMobile),
                background: theme.isDark
                  ? 'linear-gradient(135deg, rgba(249,115,22,0.16), rgba(139,92,246,0.12))'
                  : 'linear-gradient(135deg, rgba(255,237,213,0.95), rgba(237,233,254,0.90))',
                border: `1px solid ${theme.border}`,
              }}
            >
              <div style={styles.streakIcon(isMobile)}>🔥</div>

              <div style={{ minWidth: 0 }}>
                <p style={{ ...styles.streakLabel(isMobile), color: theme.muted }}>
                  Real Study Streak
                </p>

                <h3 style={{ ...styles.streakValue(isMobile), color: theme.primary }}>
                  {bestStreak} Day{bestStreak > 1 ? 's' : ''}
                </h3>

                <p style={{ ...styles.streakSub(isMobile), color: theme.textSecondary }}>
                  {latestProgress
                    ? `Last studied: ${formatLastOpened(latestProgress.lastOpenedAt)}`
                    : 'Open a video or PDF to begin'}
                </p>
              </div>
            </motion.div>
          </div>
        </Reveal>

        <Reveal>
          <div style={styles.statsGrid(isMobile)}>
            {stats.map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{
                  ...styles.statCard(isMobile),
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  boxShadow: theme.shadow,
                  backdropFilter: theme.glass,
                  WebkitBackdropFilter: theme.glass,
                }}
              >
                <span style={styles.statIcon(isMobile)}>{item.icon}</span>

                <div style={{ minWidth: 0 }}>
                  <p style={{ ...styles.statLabel(isMobile), color: theme.muted }}>
                    {item.label}
                  </p>

                  <h3 style={{ ...styles.statValue(isMobile), color: theme.text }}>
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
              ...styles.noticeStrip(isMobile),
              background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.76)',
              border: `1px solid ${theme.border}`,
              color: theme.textSecondary,
            }}
          >
            <span>🎯</span>
            <span>
              Honest tracking: video/PDF open karne se last opened + streak update hoga. Progress percentage sirf “Mark as Done” button dabane se badhega.
            </span>
          </div>
        </Reveal>

        {loading ? (
          <Reveal>
            <div
              style={{
                ...styles.emptyBox(isMobile),
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
                ...styles.emptyBox(isMobile),
                background: theme.card,
                border: `1px solid ${theme.border}`,
                boxShadow: theme.shadow,
                color: theme.muted,
              }}
            >
              <div style={styles.emptyIcon(isMobile)}>📭</div>

              <h3 style={{ color: theme.text, margin: '0 0 8px', fontSize: isMobile ? '21px' : '24px' }}>
                No courses purchased yet
              </h3>

              <p style={{ margin: '0 auto 22px', maxWidth: '520px', lineHeight: 1.7, fontSize: isMobile ? '13.5px' : '14px' }}>
                Abhi tumhare account me koi enrolled course nahi hai. Start with a free course or preview paid courses.
              </p>

              <motion.button
                whileHover={{ scale: 1.018, y: -1 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                onClick={() => navigate('/courses')}
                style={{
                  ...styles.primaryBtn(isMobile),
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
              <div style={styles.sectionHeader(isMobile)}>
                <div>
                  <h3 style={{ ...styles.sectionTitle(isMobile), color: theme.text }}>
                    🚀 Continue Learning
                  </h3>

                  <p style={{ ...styles.sectionSubtitle(isMobile), color: theme.muted }}>
                    Your enrolled courses with real manual progress
                  </p>
                </div>

                <span
                  style={{
                    ...styles.courseCount(isMobile),
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

            <div style={styles.courseGrid(isMobile)}>
              {courseRows.map((row, index) => {
                const course = row.course;
                const progress = row.progress || {};
                const liveCount = liveCounts[course._id] || 0;

                const progressValue = Number(progress.progressPercent || 0);
                const completedItems = Number(progress.completedItems || 0);
                const openedItems = Number(progress.openedItems || 0);
                const totalItems = Number(progress.totalItems || 0);

                return (
                  <Reveal key={course._id} delay={index * 0.04}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      style={{
                        ...styles.courseCard(isMobile),
                        background: theme.card,
                        border: `1px solid ${theme.border}`,
                        boxShadow: theme.shadow,
                        backdropFilter: theme.glass,
                        WebkitBackdropFilter: theme.glass,
                      }}
                    >
                      <div style={styles.thumbnailWrap(isMobile)}>
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

                        <div style={styles.ownedBadge(isMobile)}>✅ Enrolled</div>
                      </div>

                      <div style={styles.cardBody(isMobile)}>
                        <h3 style={{ ...styles.cardTitle(isMobile), color: theme.text }}>
                          {course.title}
                        </h3>

                        <p style={{ ...styles.cardDesc(isMobile), color: theme.muted }}>
                          {course.description
                            ? course.description.length > 90
                              ? `${course.description.slice(0, 90)}...`
                              : course.description
                            : 'Continue your learning journey with this course.'}
                        </p>

                        <div style={styles.metaGrid(isMobile)}>
                          <div
                            style={{
                              ...styles.metaPill(isMobile),
                              background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                              border: `1px solid ${theme.border}`,
                              color: theme.muted,
                            }}
                          >
                            🎥 {progress.completedVideosCount || 0}/{course.videos?.length || 0} Videos done
                          </div>

                          <div
                            style={{
                              ...styles.metaPill(isMobile),
                              background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                              border: `1px solid ${theme.border}`,
                              color: theme.muted,
                            }}
                          >
                            📄 {progress.completedPdfsCount || 0}/{course.pdfs?.length || 0} PDFs done
                          </div>

                          <div
                            style={{
                              ...styles.metaPill(isMobile),
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

                        <div
                          style={{
                            ...styles.lastOpenedBox(isMobile),
                            background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          <p style={{ ...styles.lastOpenedLabel, color: theme.muted }}>
                            Last opened
                          </p>

                          <p style={{ ...styles.lastOpenedTitle(isMobile), color: theme.text }}>
                            {getLastOpenedLabel(progress)}
                          </p>

                          <p style={{ ...styles.lastOpenedTime(isMobile), color: theme.muted }}>
                            {formatLastOpened(progress.lastOpenedAt)}
                          </p>
                        </div>

                        <div style={styles.progressArea(isMobile)}>
                          <div style={styles.progressTop}>
                            <span style={{ color: theme.muted }}>
                              Real learning progress
                            </span>

                            <strong style={{ color: theme.primary }}>
                              {progressValue}%
                            </strong>
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

                          <p style={{ ...styles.progressSmall(isMobile), color: theme.muted }}>
                            {completedItems}/{totalItems} items completed • {openedItems}/{totalItems} opened • Course streak: {progress.streakCount || 0} day{Number(progress.streakCount || 0) > 1 ? 's' : ''}
                          </p>
                        </div>

                        <div style={styles.bottomRow(isMobile)}>
                          <div>
                            <p style={{ ...styles.smallLabel, color: theme.muted }}>
                              Status
                            </p>

                            <strong style={{ color: theme.success, fontSize: isMobile ? '14px' : '15px' }}>
                              {progressValue >= 100
                                ? 'Completed'
                                : progressValue > 0
                                ? 'In Progress'
                                : openedItems > 0
                                ? 'Started'
                                : 'Not Started'}
                            </strong>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.018, y: -1 }}
                            whileTap={{ scale: 0.985 }}
                            transition={{ duration: 0.16, ease: 'easeOut' }}
                            onClick={() => navigate(`/courses/${course._id}`)}
                            style={{
                              ...styles.continueBtn(isMobile),
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
                  ...styles.summaryBox(isMobile),
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  boxShadow: theme.shadow,
                  color: theme.textSecondary,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ color: theme.text, margin: '0 0 8px', fontSize: isMobile ? '18px' : '20px' }}>
                    📌 Your Learning Summary
                  </h3>

                  <p style={{ margin: 0, lineHeight: 1.7, fontSize: isMobile ? '13px' : '14px' }}>
                    You have {courses.length} enrolled course{courses.length > 1 ? 's' : ''}, {totalVideos} videos, {totalPdfs} PDFs, {totalLiveClasses} live class{totalLiveClasses !== 1 ? 'es' : ''}, {totalOpenedItems}/{totalTrackableItems} opened, and {totalCompletedItems}/{totalTrackableItems} manually completed.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.018, y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  onClick={() => navigate('/courses')}
                  style={{
                    ...styles.secondaryBtn(isMobile),
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

  page: (isMobile) => ({
    maxWidth: '1180px',
    margin: '0 auto',
    padding: isMobile ? '24px 14px' : '40px 20px',
    position: 'relative',
    zIndex: 1,
    width: '100%',
  }),

  hero: (isMobile) => ({
    padding: isMobile ? '24px 18px' : '30px',
    marginBottom: isMobile ? '18px' : '24px',
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1.25fr 0.75fr',
    gap: isMobile ? '18px' : '24px',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  }),

  kicker: (isMobile) => ({
    margin: '0 0 8px',
    fontWeight: 950,
    letterSpacing: '0.5px',
    fontSize: isMobile ? '12px' : '13px',
    lineHeight: 1.4,
  }),

  heroTitle: (isMobile) => ({
    fontSize: isMobile ? 'clamp(30px, 10vw, 42px)' : 'clamp(30px, 4vw, 48px)',
    lineHeight: 1.08,
    margin: '0 0 12px',
    fontWeight: 950,
    letterSpacing: '-0.8px',
    wordBreak: 'normal',
  }),

  heroText: (isMobile) => ({
    margin: 0,
    lineHeight: 1.7,
    fontSize: isMobile ? '14px' : '15px',
    maxWidth: '680px',
  }),

  streakCard: (isMobile) => ({
    padding: isMobile ? '18px' : '22px',
    borderRadius: isMobile ? '20px' : '24px',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '12px' : '16px',
    minHeight: isMobile ? 'auto' : '150px',
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
  }),

  streakIcon: (isMobile) => ({
    width: isMobile ? '52px' : '62px',
    height: isMobile ? '52px' : '62px',
    borderRadius: isMobile ? '17px' : '20px',
    display: 'grid',
    placeItems: 'center',
    background: 'rgba(249, 115, 22, 0.16)',
    fontSize: isMobile ? '26px' : '32px',
    flex: '0 0 auto',
  }),

  streakLabel: (isMobile) => ({
    margin: '0 0 6px',
    fontSize: isMobile ? '11px' : '13px',
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  }),

  streakValue: (isMobile) => ({
    margin: '0 0 6px',
    fontSize: isMobile ? '26px' : '34px',
    fontWeight: 950,
    lineHeight: 1.1,
  }),

  streakSub: (isMobile) => ({
    margin: 0,
    fontSize: isMobile ? '12px' : '13px',
    fontWeight: 800,
    lineHeight: 1.45,
  }),

  statsGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: isMobile ? '12px' : '16px',
    marginBottom: '18px',
    width: '100%',
  }),

  statCard: (isMobile) => ({
    padding: isMobile ? '16px' : '20px',
    borderRadius: isMobile ? '18px' : '22px',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '12px' : '14px',
    minHeight: isMobile ? '86px' : '105px',
    width: '100%',
    overflow: 'hidden',
  }),

  statIcon: (isMobile) => ({
    width: isMobile ? '43px' : '48px',
    height: isMobile ? '43px' : '48px',
    borderRadius: isMobile ? '14px' : '16px',
    display: 'grid',
    placeItems: 'center',
    background: 'rgba(167, 139, 250, 0.12)',
    fontSize: isMobile ? '22px' : '24px',
    flex: '0 0 auto',
  }),

  statLabel: (isMobile) => ({
    margin: '0 0 5px',
    fontSize: isMobile ? '12px' : '13px',
    fontWeight: 900,
    lineHeight: 1.3,
  }),

  statValue: (isMobile) => ({
    margin: 0,
    fontSize: isMobile ? '20px' : '24px',
    fontWeight: 950,
    lineHeight: 1.15,
  }),

  noticeStrip: (isMobile) => ({
    padding: isMobile ? '13px 14px' : '14px 16px',
    borderRadius: '18px',
    marginBottom: isMobile ? '22px' : '28px',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    fontWeight: 800,
    lineHeight: 1.5,
    fontSize: isMobile ? '12.5px' : '14px',
  }),

  sectionHeader: (isMobile) => ({
    display: 'flex',
    alignItems: isMobile ? 'flex-start' : 'flex-end',
    justifyContent: 'space-between',
    gap: '14px',
    marginBottom: '18px',
    flexWrap: 'wrap',
  }),

  sectionTitle: (isMobile) => ({
    margin: 0,
    fontSize: isMobile ? '21px' : '24px',
    fontWeight: 950,
    lineHeight: 1.25,
  }),

  sectionSubtitle: (isMobile) => ({
    margin: '6px 0 0',
    fontSize: isMobile ? '13px' : '14px',
    lineHeight: 1.5,
  }),

  courseCount: (isMobile) => ({
    fontWeight: 900,
    padding: '8px 13px',
    borderRadius: '999px',
    fontSize: isMobile ? '12px' : '13px',
  }),

  courseGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: isMobile ? '18px' : '24px',
    marginBottom: '30px',
    width: '100%',
  }),

  courseCard: (isMobile) => ({
    borderRadius: isMobile ? '20px' : '24px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: isMobile ? 'auto' : '620px',
    width: '100%',
  }),

  thumbnailWrap: (isMobile) => ({
    height: isMobile ? '190px' : '200px',
    position: 'relative',
    overflow: 'hidden',
    background: '#111827',
  }),

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

  ownedBadge: (isMobile) => ({
    position: 'absolute',
    top: isMobile ? '12px' : '14px',
    right: isMobile ? '12px' : '14px',
    background: 'rgba(34,197,94,0.95)',
    color: '#fff',
    padding: isMobile ? '6px 10px' : '7px 11px',
    borderRadius: '999px',
    fontSize: isMobile ? '11px' : '12px',
    fontWeight: 950,
    boxShadow: '0 8px 24px rgba(34,197,94,0.22)',
  }),

  cardBody: (isMobile) => ({
    padding: isMobile ? '16px' : '20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  }),

  cardTitle: (isMobile) => ({
    margin: '0 0 9px',
    fontSize: isMobile ? '17px' : '18px',
    fontWeight: 950,
    lineHeight: 1.3,
    minHeight: isMobile ? 'auto' : '46px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  }),

  cardDesc: (isMobile) => ({
    fontSize: isMobile ? '13px' : '13px',
    margin: '0 0 16px',
    lineHeight: 1.65,
    minHeight: isMobile ? 'auto' : '44px',
  }),

  metaGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: '10px',
    marginBottom: '14px',
  }),

  metaPill: (isMobile) => ({
    padding: isMobile ? '10px 11px' : '9px 10px',
    borderRadius: '13px',
    fontSize: isMobile ? '12px' : '12px',
    fontWeight: 850,
    lineHeight: 1.45,
  }),

  lastOpenedBox: (isMobile) => ({
    padding: isMobile ? '12px' : '12px 13px',
    borderRadius: '15px',
    marginBottom: '16px',
  }),

  lastOpenedLabel: {
    margin: '0 0 5px',
    fontSize: '11px',
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },

  lastOpenedTitle: (isMobile) => ({
    margin: '0 0 5px',
    fontSize: isMobile ? '12.5px' : '13px',
    fontWeight: 950,
    lineHeight: 1.45,
    wordBreak: 'normal',
    overflowWrap: 'break-word',
  }),

  lastOpenedTime: (isMobile) => ({
    margin: 0,
    fontSize: isMobile ? '11.5px' : '12px',
    fontWeight: 800,
  }),

  progressArea: (isMobile) => ({
    marginBottom: isMobile ? '16px' : '18px',
  }),

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

  progressSmall: (isMobile) => ({
    margin: '8px 0 0',
    fontSize: isMobile ? '11.5px' : '12px',
    fontWeight: 800,
    lineHeight: 1.45,
  }),

  bottomRow: (isMobile) => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'stretch' : 'center',
    gap: '12px',
    flexWrap: isMobile ? 'wrap' : 'nowrap',
  }),

  smallLabel: {
    margin: '0 0 3px',
    fontSize: '12px',
    fontWeight: 800,
  },

  continueBtn: (isMobile) => ({
    padding: isMobile ? '12px 14px' : '12px 16px',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    fontSize: isMobile ? '13px' : '13px',
    fontWeight: 950,
    minWidth: isMobile ? '100%' : '130px',
  }),

  emptyBox: (isMobile) => ({
    padding: isMobile ? '28px 18px' : '38px 24px',
    borderRadius: isMobile ? '20px' : '24px',
    textAlign: 'center',
    fontWeight: 800,
    marginTop: isMobile ? '20px' : '28px',
  }),

  emptyIcon: (isMobile) => ({
    fontSize: isMobile ? '42px' : '52px',
    marginBottom: '12px',
  }),

  primaryBtn: (isMobile) => ({
    width: isMobile ? '100%' : 'auto',
    maxWidth: isMobile ? '260px' : 'none',
    padding: isMobile ? '13px 20px' : '13px 24px',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    fontWeight: 950,
    fontSize: isMobile ? '14px' : '15px',
  }),

  summaryBox: (isMobile) => ({
    padding: isMobile ? '18px' : '22px',
    borderRadius: isMobile ? '20px' : '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'stretch' : 'center',
    gap: '18px',
    flexWrap: 'wrap',
    width: '100%',
  }),

  secondaryBtn: (isMobile) => ({
    width: isMobile ? '100%' : 'auto',
    padding: '12px 18px',
    borderRadius: '14px',
    cursor: 'pointer',
    fontWeight: 950,
    fontSize: '14px',
  }),
};

export default MyCourses;