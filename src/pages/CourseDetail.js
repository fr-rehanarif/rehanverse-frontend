import API from '../api';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import Reviews from '../components/Reviews';
import Footer from '../components/Footer';
import PaymentBox from '../components/PaymentBox';
import { motion } from 'framer-motion';

function SecurePDFViewer({ pdf, theme }) {
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const blockKeys = (e) => {
      const key = e.key.toLowerCase();

      if ((e.ctrlKey && ['s', 'p', 'u', 'c'].includes(key)) || key === 'f12') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', blockKeys);
    return () => window.removeEventListener('keydown', blockKeys);
  }, []);

  const block = (e) => e.preventDefault();

  return (
    <div
      onContextMenu={block}
      onCopy={block}
      onCut={block}
      onDragStart={block}
      style={{
        position: 'relative',
        height: '620px',
        overflow: 'hidden',
        borderRadius: '16px',
        border: `1px solid ${theme.border || '#334155'}`,
        background: theme.bg,
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          zIndex: 30,
          background: theme.card,
          color: theme.text,
          padding: '12px 14px',
          borderRadius: '12px',
          border: `1px solid ${theme.border || '#334155'}`,
          display: 'flex',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <strong>📄 {pdf.title}</strong>
        <span style={{ color: theme.muted, fontSize: '13px' }}>
          View only • Download disabled
        </span>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 20,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(-25deg)',
          fontSize: '28px',
          fontWeight: 800,
          color: 'rgba(239,68,68,0.18)',
          textAlign: 'center',
          padding: '20px',
        }}
      >
        {user?.name || 'User'} • {user?.email || 'Protected'}
      </div>

      {pdf?.url ? (
        <iframe
          src={pdf.url}
          width="100%"
          height="100%"
          title={pdf.title}
          style={{
            border: 'none',
            background: '#fff',
            paddingTop: '68px',
            boxSizing: 'border-box',
          }}
        />
      ) : (
        <p style={{ color: '#fca5a5', textAlign: 'center', paddingTop: '100px' }}>
          PDF URL missing hai.
        </p>
      )}
    </div>
  );
}

function CourseDetail() {
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('videos');
  const [activeVideo, setActiveVideo] = useState(null);
  const [activePdf, setActivePdf] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const courseRes = await axios.get(`${API}/api/courses/${id}`);
        setCourse(courseRes.data);

        if (courseRes.data.videos?.length > 0) {
          setActiveVideo(courseRes.data.videos[0]);
        }

        if (courseRes.data.pdfs?.length > 0) {
          setActivePdf(courseRes.data.pdfs[0]);
        }

        const enrolledRes = await axios.get(`${API}/api/enroll/my/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const enrolled = enrolledRes.data.some(
          (c) => c._id?.toString() === id.toString()
        );

        setIsEnrolled(enrolled);
      } catch (err) {
        console.log('Course detail error:', err);
        navigate('/my-courses');
      }
    };

    fetchData();
  }, [id, token, navigate]);

  const getEmbedUrl = (url) => {
    if (!url) return null;

    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;

    return url;
  };

  if (!course) {
    return (
      <div
        style={{
          background: theme.bg,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: theme.muted, fontSize: '18px' }}>⏳ Loading...</p>
      </div>
    );
  }

  const locked = course.price > 0 && !isEnrolled;

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', color: theme.text }}>
      <div
        style={{
          background: theme.navbar,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          borderBottom: `1px solid ${theme.border || '#334155'}`,
        }}
      >
        <button
          onClick={() => navigate('/my-courses')}
          style={{
            background: theme.primary,
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          ← Back
        </button>

        <h2 style={{ margin: 0 }}>{course.title}</h2>
      </div>

      <div
        style={{
          display: 'flex',
          padding: '20px',
          gap: '20px',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '300px' }}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              background: theme.card,
              borderRadius: '18px',
              padding: '18px',
              border: `1px solid ${theme.border || '#334155'}`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            }}
          >
            {locked ? (
              <div
                style={{
                  padding: '22px',
                  borderRadius: '16px',
                  background: theme.bg,
                  border: `1px solid ${theme.border || '#334155'}`,
                  textAlign: 'center',
                }}
              >
                <h3>🔒 Course Locked</h3>
                <p style={{ color: theme.muted }}>
                  Payment approve hone ke baad videos aur PDFs unlock honge.
                </p>
              </div>
            ) : (
              <>
                {activeTab === 'videos' && activeVideo && (
                  <div>
                    <iframe
                      src={getEmbedUrl(activeVideo.url)}
                      width="100%"
                      height="400px"
                      title={activeVideo.title}
                      style={{
                        border: 'none',
                        borderRadius: '14px',
                        background: '#000',
                      }}
                      allowFullScreen
                    />
                    <h3 style={{ marginTop: '14px' }}>{activeVideo.title}</h3>
                  </div>
                )}

                {activeTab === 'pdfs' && (
                  <div>
                    {activePdf ? (
                      <SecurePDFViewer pdf={activePdf} theme={theme} />
                    ) : (
                      <p style={{ color: theme.muted }}>No PDFs available.</p>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>

          <div style={{ marginTop: '30px' }}>
            <Reviews courseId={id} />
          </div>

          {course.price > 0 && isEnrolled && (
            <div
              style={{
                marginTop: '30px',
                padding: '16px',
                borderRadius: '14px',
                background: '#052e16',
                color: '#bbf7d0',
                fontWeight: '600',
                border: '1px solid #166534',
              }}
            >
              ✅ Payment approved. You are enrolled in this course.
            </div>
          )}

          {course.price > 0 && !isEnrolled && (
            <div style={{ marginTop: '30px' }}>
              <PaymentBox courseId={id} />
            </div>
          )}
        </div>

        <div
          style={{
            width: '300px',
            maxWidth: '100%',
            background: theme.card,
            borderRadius: '18px',
            padding: '18px',
            border: `1px solid ${theme.border || '#334155'}`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Course Content</h3>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
            <button
              onClick={() => setActiveTab('videos')}
              style={{
                flex: 1,
                background: activeTab === 'videos' ? theme.primary : theme.bg,
                color: activeTab === 'videos' ? '#fff' : theme.text,
                border: `1px solid ${theme.border || '#334155'}`,
                padding: '10px 14px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Videos
            </button>

            <button
              onClick={() => setActiveTab('pdfs')}
              style={{
                flex: 1,
                background: activeTab === 'pdfs' ? theme.primary : theme.bg,
                color: activeTab === 'pdfs' ? '#fff' : theme.text,
                border: `1px solid ${theme.border || '#334155'}`,
                padding: '10px 14px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              PDFs
            </button>
          </div>

          {activeTab === 'videos' && (
            <div>
              {course.videos?.length > 0 ? (
                course.videos.map((video, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveVideo(video)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      marginBottom: '10px',
                      cursor: 'pointer',
                      background:
                        activeVideo?.title === video.title ? theme.primary : theme.bg,
                      color: activeVideo?.title === video.title ? '#fff' : theme.text,
                      border: `1px solid ${theme.border || '#334155'}`,
                      fontWeight: '500',
                    }}
                  >
                    ▶️ {video.title}
                  </div>
                ))
              ) : (
                <p style={{ color: theme.muted }}>No videos available.</p>
              )}
            </div>
          )}

          {activeTab === 'pdfs' && (
            <div>
              {course.pdfs?.length > 0 ? (
                course.pdfs.map((pdf, i) => (
                  <div
                    key={i}
                    onClick={() => setActivePdf(pdf)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      marginBottom: '10px',
                      cursor: 'pointer',
                      background:
                        activePdf?.title === pdf.title ? theme.primary : theme.bg,
                      color: activePdf?.title === pdf.title ? '#fff' : theme.text,
                      border: `1px solid ${theme.border || '#334155'}`,
                      fontWeight: '500',
                    }}
                  >
                    📄 {pdf.title}
                  </div>
                ))
              ) : (
                <p style={{ color: theme.muted }}>No PDFs available.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CourseDetail;