import API from '../api';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import Reviews from '../components/Reviews';
import CheckoutModal from '../components/CheckoutModal';
import Footer from '../components/Footer';
import LiveClassesBox from '../components/LiveClassesBox';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const token = localStorage.getItem('token');

  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('videos');
  const [activeVideo, setActiveVideo] = useState(null);
  const [activePdf, setActivePdf] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const [courseProgress, setCourseProgress] = useState({
    progressPercent: 0,
    completedVideoUrls: [],
    completedPdfUrls: [],
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetchCourseDetail();
    // eslint-disable-next-line
  }, [id, token]);

  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);

      const courseRes = await axios.get(`${API}/api/courses/${id}`);
      const courseData = courseRes.data;

      setCourse(courseData);

      if (courseData.videos?.length > 0) {
        setActiveVideo(courseData.videos[0]);
      }

      if (courseData.pdfs?.length > 0) {
        setActivePdf(courseData.pdfs[0]);
      }

      try {
        const enrolledRes = await axios.get(`${API}/api/enroll/my/courses`, authHeader);

        const owned = enrolledRes.data.some(
          (c) => c._id?.toString() === id?.toString()
        );

        setIsEnrolled(owned);

        if (owned) {
          fetchCourseProgress();
          if (courseData.videos?.length > 0) {
            trackProgress({
              type: 'video',
              title: courseData.videos[0].title,
              url: courseData.videos[0].url,
              action: 'open',
            });
          }
        }
      } catch (enrollErr) {
        console.log('ENROLLMENT CHECK ERROR:', enrollErr.response?.data || enrollErr.message);
      }
    } catch (err) {
      console.log('COURSE DETAIL FETCH ERROR:', err.response?.data || err.message);
      setMsg('⚠️ Course load nahi ho pa raha. Backend ya course ID check karo.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseProgress = async () => {
    try {
      const res = await axios.get(`${API}/api/progress/course/${id}`, authHeader);

      setCourseProgress({
        progressPercent: res.data.progressPercent || 0,
        completedVideoUrls: res.data.completedVideoUrls || [],
        completedPdfUrls: res.data.completedPdfUrls || [],
      });
    } catch (err) {
      console.log('COURSE PROGRESS FETCH ERROR:', err.response?.data || err.message);
    }
  };

  const trackProgress = async ({ type, title, url, action = 'open' }) => {
    try {
      if (!id || !type) return;

      const res = await axios.post(
        `${API}/api/progress/track`,
        {
          courseId: id,
          type,
          title: title || '',
          url: url || '',
          action,
        },
        authHeader
      );

      if (action === 'complete') {
        setMsg(`✅ ${title || 'Content'} marked as done`);
        setTimeout(() => setMsg(''), 2500);
        await fetchCourseProgress();
      }

      return res.data;
    } catch (err) {
      console.log('PROGRESS TRACK ERROR:', err.response?.data || err.message);
      if (action === 'complete') {
        setMsg('⚠️ Mark as done failed. Try again.');
        setTimeout(() => setMsg(''), 2500);
      }
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';

    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;

    return url;
  };

  const isVideoDone = (video) => {
    if (!video?.url) return false;
    return courseProgress.completedVideoUrls.includes(video.url);
  };

  const isPdfDone = (pdf) => {
    if (!pdf?.url) return false;
    return courseProgress.completedPdfUrls.includes(pdf.url);
  };

  const handleVideoClick = async (video) => {
    if (isLocked) {
      setMsg('🔒 Enroll/payment approval ke baad video unlock hoga.');
      setTimeout(() => setMsg(''), 2500);
      return;
    }

    setActiveTab('videos');
    setActiveVideo(video);

    await trackProgress({
      type: 'video',
      title: video?.title || 'Video',
      url: video?.url || '',
      action: 'open',
    });
  };

  const handlePdfClick = async (pdf) => {
    if (isLocked) {
      setMsg('🔒 Enroll/payment approval ke baad PDF unlock hoga.');
      setTimeout(() => setMsg(''), 2500);
      return;
    }

    setActiveTab('pdfs');
    setActivePdf(pdf);

    await trackProgress({
      type: 'pdf',
      title: pdf?.title || 'PDF',
      url: pdf?.url || '',
      action: 'open',
    });
  };

  const markVideoDone = async () => {
    if (!activeVideo || isVideoDone(activeVideo)) return;

    await trackProgress({
      type: 'video',
      title: activeVideo?.title || 'Video',
      url: activeVideo?.url || '',
      action: 'complete',
    });
  };

  const markPdfDone = async () => {
    if (!activePdf || isPdfDone(activePdf)) return;

    await trackProgress({
      type: 'pdf',
      title: activePdf?.title || 'PDF',
      url: activePdf?.url || '',
      action: 'complete',
    });
  };

  const handleFreeEnroll = async () => {
    if (!course || enrolling) return;

    try {
      setEnrolling(true);

      const res = await axios.post(`${API}/api/enroll/${course._id}`, {}, authHeader);

      setIsEnrolled(true);
      setMsg(`✅ ${res.data.message || 'Course enrolled successfully'}`);

      if (course.videos?.length > 0) {
        await trackProgress({
          type: 'video',
          title: course.videos[0].title,
          url: course.videos[0].url,
          action: 'open',
        });
      }

      fetchCourseProgress();
      setTimeout(() => setMsg(''), 2500);
    } catch (err) {
      setMsg('⚠️ ' + (err.response?.data?.message || 'Enrollment failed'));
      setTimeout(() => setMsg(''), 2500);
    } finally {
      setEnrolling(false);
    }
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setMsg('✅ Payment request submitted. Approval ke baad course unlock hoga.');
    setTimeout(() => setMsg(''), 3000);
  };

  if (loading) {
    return (
      <div
        style={{
          background: theme.bg,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          color: theme.text,
        }}
      >
        <h2>Loading course...</h2>
      </div>
    );
  }

  if (!course) {
    return (
      <div
        style={{
          background: theme.bg,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          color: theme.text,
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <div>
          <h2>Course not found</h2>
          <p style={{ color: theme.muted }}>{msg || 'Course load nahi ho paaya.'}</p>
          <button
            onClick={() => navigate('/my-courses')}
            style={{
              ...styles.primaryBtn,
              background: theme.primary,
              color: theme.buttonText,
            }}
          >
            Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  const isFreeCourse = course.isFree || Number(course.price || 0) === 0;
  const isLocked = !isEnrolled && !isFreeCourse;
  const totalVideos = course.videos?.length || 0;
  const totalPdfs = course.pdfs?.length || 0;

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
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
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
            <button
              onClick={() => navigate('/my-courses')}
              style={{
                ...styles.backBtn,
                background: theme.bgSecondary,
                color: theme.text,
                border: `1px solid ${theme.border}`,
              }}
            >
              ← Back
            </button>

            <div style={styles.tags}>
              <span style={{ ...styles.tag, color: isEnrolled ? theme.success : theme.primary }}>
                {isEnrolled ? '✅ Enrolled' : isFreeCourse ? '🆓 Free Course' : '🔒 Premium Course'}
              </span>

              <span style={{ ...styles.tag, color: theme.muted }}>
                🎥 {totalVideos} Videos
              </span>

              <span style={{ ...styles.tag, color: theme.muted }}>
                📄 {totalPdfs} PDFs
              </span>

              {isEnrolled && (
                <span style={{ ...styles.tag, color: theme.success }}>
                  📈 {courseProgress.progressPercent || 0}% Done
                </span>
              )}
            </div>

            <h1 style={{ ...styles.title, color: theme.text }}>
              {course.title}
            </h1>

            <p style={{ ...styles.desc, color: theme.muted }}>
              {course.description}
            </p>
          </div>

          <div
            style={{
              ...styles.priceCard,
              background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.78)',
              border: `1px solid ${theme.border}`,
            }}
          >
            <p style={{ margin: 0, color: theme.muted, fontWeight: 900 }}>
              Course Access
            </p>

            <h2
              style={{
                margin: '8px 0',
                fontSize: '34px',
                color: isFreeCourse ? theme.success : '#f97316',
              }}
            >
              {isFreeCourse ? 'Free' : `₹${course.price}`}
            </h2>

            {isEnrolled ? (
              <p style={{ color: theme.muted, fontWeight: 800 }}>
                You already own this course.
              </p>
            ) : isFreeCourse ? (
              <button
                onClick={handleFreeEnroll}
                disabled={enrolling}
                style={{
                  ...styles.primaryBtn,
                  width: '100%',
                  background: theme.success,
                  color: '#fff',
                  opacity: enrolling ? 0.7 : 1,
                }}
              >
                {enrolling ? 'Enrolling...' : 'Enroll Free 🚀'}
              </button>
            ) : (
              <button
                onClick={() => setShowCheckout(true)}
                style={{
                  ...styles.primaryBtn,
                  width: '100%',
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  color: '#fff',
                }}
              >
                Unlock Course 🚀
              </button>
            )}
          </div>
        </motion.div>

        {msg && (
          <div
            style={{
              ...styles.msg,
              background: msg.includes('✅')
                ? theme.isDark
                  ? 'rgba(34,197,94,0.13)'
                  : '#dcfce7'
                : theme.isDark
                ? 'rgba(251,191,36,0.13)'
                : '#fef3c7',
              color: msg.includes('✅')
                ? theme.isDark
                  ? '#86efac'
                  : '#166534'
                : theme.isDark
                ? '#fbbf24'
                : '#92400e',
              border: `1px solid ${theme.border}`,
            }}
          >
            {msg}
          </div>
        )}

        <div style={styles.layout}>
          <section
            style={{
              ...styles.playerCard,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadow,
              backdropFilter: theme.glass,
              WebkitBackdropFilter: theme.glass,
            }}
          >
            {isLocked ? (
              <div style={styles.lockedBox}>
                <h2 style={{ color: theme.text }}>🔒 Course Locked</h2>
                <p style={{ color: theme.muted, lineHeight: 1.7 }}>
                  Payment approval ke baad videos, PDFs aur live classes unlock ho jayenge.
                </p>

                <button
                  onClick={() => setShowCheckout(true)}
                  style={{
                    ...styles.primaryBtn,
                    background: 'linear-gradient(135deg, #22c55e, #3b82f6)',
                    color: '#fff',
                  }}
                >
                  Unlock Now 🚀
                </button>
              </div>
            ) : (
              <>
                {activeTab === 'videos' && (
                  <div>
                    {activeVideo ? (
                      <>
                        <iframe
                          src={getEmbedUrl(activeVideo.url)}
                          title={activeVideo.title}
                          width="100%"
                          height="430"
                          allowFullScreen
                          style={{
                            border: 'none',
                            borderRadius: '18px',
                            background: '#000',
                          }}
                        />

                        <h3 style={{ color: theme.text, marginTop: '16px' }}>
                          ▶️ {activeVideo.title}
                        </h3>

                        <button
                          onClick={markVideoDone}
                          disabled={isVideoDone(activeVideo)}
                          style={{
                            ...styles.doneBtn,
                            background: isVideoDone(activeVideo)
                              ? 'linear-gradient(135deg, #16a34a, #15803d)'
                              : theme.success,
                            opacity: isVideoDone(activeVideo) ? 0.75 : 1,
                            cursor: isVideoDone(activeVideo) ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {isVideoDone(activeVideo) ? '✅ Video Done' : '✅ Mark Video as Done'}
                        </button>
                      </>
                    ) : (
                      <p style={{ color: theme.muted }}>No videos available.</p>
                    )}
                  </div>
                )}

                {activeTab === 'pdfs' && (
                  <div>
                    {activePdf ? (
                      <>
                        <iframe
                          src={activePdf.url}
                          title={activePdf.title}
                          width="100%"
                          height="640"
                          style={{
                            border: 'none',
                            borderRadius: '18px',
                            background: '#fff',
                          }}
                        />

                        <h3 style={{ color: theme.text, marginTop: '16px' }}>
                          📄 {activePdf.title}
                        </h3>

                        <button
                          onClick={markPdfDone}
                          disabled={isPdfDone(activePdf)}
                          style={{
                            ...styles.doneBtn,
                            background: isPdfDone(activePdf)
                              ? 'linear-gradient(135deg, #16a34a, #15803d)'
                              : theme.success,
                            opacity: isPdfDone(activePdf) ? 0.75 : 1,
                            cursor: isPdfDone(activePdf) ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {isPdfDone(activePdf) ? '✅ PDF Done' : '✅ Mark PDF as Done'}
                        </button>
                      </>
                    ) : (
                      <p style={{ color: theme.muted }}>No PDFs available.</p>
                    )}
                  </div>
                )}
              </>
            )}
          </section>

          <aside
            style={{
              ...styles.sidebar,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadow,
              backdropFilter: theme.glass,
              WebkitBackdropFilter: theme.glass,
            }}
          >
            <h3 style={{ marginTop: 0, color: theme.text }}>
              Course Content
            </h3>

            {isEnrolled && (
              <div
                style={{
                  ...styles.progressBox,
                  background: theme.isDark ? 'rgba(34,197,94,0.10)' : '#dcfce7',
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
              >
                📈 Progress: {courseProgress.progressPercent || 0}%
                <br />
                <span style={{ color: theme.muted }}>
                  Open = streak, Done = progress
                </span>
              </div>
            )}

            <div style={styles.tabRow}>
              <button
                onClick={() => setActiveTab('videos')}
                style={{
                  ...styles.tabBtn,
                  background: activeTab === 'videos' ? theme.primary : theme.bgSecondary,
                  color: activeTab === 'videos' ? '#fff' : theme.text,
                  border: `1px solid ${theme.border}`,
                }}
              >
                Videos
              </button>

              <button
                onClick={() => setActiveTab('pdfs')}
                style={{
                  ...styles.tabBtn,
                  background: activeTab === 'pdfs' ? theme.primary : theme.bgSecondary,
                  color: activeTab === 'pdfs' ? '#fff' : theme.text,
                  border: `1px solid ${theme.border}`,
                }}
              >
                PDFs
              </button>
            </div>

            {activeTab === 'videos' && (
              <ContentList
                items={course.videos}
                type="video"
                activeTitle={activeVideo?.title}
                completedUrls={courseProgress.completedVideoUrls}
                locked={isLocked}
                theme={theme}
                onClick={handleVideoClick}
              />
            )}

            {activeTab === 'pdfs' && (
              <ContentList
                items={course.pdfs}
                type="pdf"
                activeTitle={activePdf?.title}
                completedUrls={courseProgress.completedPdfUrls}
                locked={isLocked}
                theme={theme}
                onClick={handlePdfClick}
              />
            )}
          </aside>
        </div>

        <LiveClassesBox courseId={id} isEnrolled={isEnrolled} theme={theme} />

        <div style={{ marginTop: '30px' }}>
          <Reviews courseId={id} />
        </div>
      </main>

      {showCheckout && (
        <CheckoutModal
          course={course}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      <Footer />
    </div>
  );
}

function ContentList({ items, type, activeTitle, completedUrls = [], locked, theme, onClick }) {
  if (!items?.length) {
    return (
      <p style={{ color: theme.muted }}>
        No {type === 'video' ? 'videos' : 'PDFs'} available.
      </p>
    );
  }

  return (
    <div>
      {items.map((item, index) => {
        const active = !locked && activeTitle === item.title;
        const done = item?.url && completedUrls.includes(item.url);

        return (
          <div
            key={index}
            onClick={() => onClick(item)}
            style={{
              ...styles.contentItem,
              background: active
                ? theme.primary
                : done
                ? theme.isDark
                  ? 'rgba(34,197,94,0.13)'
                  : '#dcfce7'
                : theme.isDark
                ? 'rgba(255,255,255,0.035)'
                : 'rgba(255,255,255,0.72)',
              color: active ? '#fff' : theme.text,
              border: `1px solid ${done ? 'rgba(34,197,94,0.35)' : theme.border}`,
            }}
          >
            <span>
              {locked ? '🔒' : type === 'video' ? '▶️' : '📄'} {item.title || `${type} ${index + 1}`}
            </span>

            {locked ? (
              <small style={{ color: '#fbbf24', fontWeight: 900 }}>Locked</small>
            ) : done ? (
              <small style={{ color: '#22c55e', fontWeight: 900 }}>Done</small>
            ) : (
              <small style={{ color: theme.muted, fontWeight: 900 }}>Open</small>
            )}
          </div>
        );
      })}
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
    top: '100px',
    left: '-140px',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    background: 'rgba(124,58,237,0.18)',
    filter: 'blur(95px)',
    pointerEvents: 'none',
  },
  glowTwo: {
    position: 'absolute',
    top: '720px',
    right: '-150px',
    width: '340px',
    height: '340px',
    borderRadius: '50%',
    background: 'rgba(59,130,246,0.14)',
    filter: 'blur(100px)',
    pointerEvents: 'none',
  },
  page: {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '34px 20px',
    position: 'relative',
    zIndex: 1,
  },
  hero: {
    padding: '28px',
    marginBottom: '22px',
    display: 'grid',
    gridTemplateColumns: '1.35fr 0.65fr',
    gap: '24px',
    alignItems: 'center',
  },
  backBtn: {
    padding: '10px 14px',
    borderRadius: '14px',
    cursor: 'pointer',
    fontWeight: 900,
    marginBottom: '16px',
  },
  tags: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '14px',
  },
  tag: {
    padding: '8px 12px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    fontSize: '12px',
    fontWeight: 950,
  },
  title: {
    margin: '0 0 12px',
    fontSize: 'clamp(30px, 4vw, 48px)',
    lineHeight: 1.08,
    fontWeight: 950,
  },
  desc: {
    margin: 0,
    lineHeight: 1.75,
    fontSize: '15px',
  },
  priceCard: {
    padding: '22px',
    borderRadius: '24px',
  },
  primaryBtn: {
    padding: '13px 18px',
    border: 'none',
    borderRadius: '15px',
    cursor: 'pointer',
    fontWeight: 950,
    fontSize: '15px',
  },
  msg: {
    marginBottom: '18px',
    padding: '13px 16px',
    borderRadius: '16px',
    fontWeight: 900,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 330px',
    gap: '22px',
    alignItems: 'start',
  },
  playerCard: {
    borderRadius: '24px',
    padding: '18px',
    minWidth: 0,
  },
  lockedBox: {
    minHeight: '420px',
    display: 'grid',
    placeItems: 'center',
    textAlign: 'center',
    padding: '30px',
  },
  doneBtn: {
    marginTop: '10px',
    padding: '12px 16px',
    borderRadius: '14px',
    border: 'none',
    color: '#fff',
    fontWeight: 950,
  },
  sidebar: {
    borderRadius: '24px',
    padding: '18px',
    position: 'sticky',
    top: '92px',
  },
  progressBox: {
    padding: '12px',
    borderRadius: '14px',
    marginBottom: '14px',
    lineHeight: 1.6,
    fontWeight: 900,
  },
  tabRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '18px',
  },
  tabBtn: {
    flex: 1,
    padding: '11px 14px',
    borderRadius: '13px',
    cursor: 'pointer',
    fontWeight: 900,
  },
  contentItem: {
    padding: '12px 14px',
    borderRadius: '14px',
    marginBottom: '10px',
    fontWeight: 800,
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
    alignItems: 'center',
    cursor: 'pointer',
  },
};

export default CourseDetail;