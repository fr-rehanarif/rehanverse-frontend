import API from '../api';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import Reviews from '../components/Reviews';
import Footer from '../components/Footer';
import PaymentBox from '../components/PaymentBox';
import { motion } from 'framer-motion';

function CourseDetail() {
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('videos');
  const [activeVideo, setActiveVideo] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // 1) Course fetch karo
        const courseRes = await axios.get(`${API}/api/courses/${id}`);
        setCourse(courseRes.data);

        if (courseRes.data.videos?.length > 0) {
          setActiveVideo(courseRes.data.videos[0]);
        }

        // 2) User ke enrolled courses fetch karo
        const enrolledRes = await axios.get(`${API}/api/enroll/my/courses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  const getPdfEmbedUrl = (url) => {
    if (!url) return null;

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

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', color: theme.text }}>
      {/* HEADER */}
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
        {/* LEFT SIDE */}
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
            {/* VIDEO */}
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

            {/* PDF */}
            {activeTab === 'pdfs' && (
              <div>
                {course.pdfs?.length > 0 ? (
                  course.pdfs.map((pdf, i) => (
                    <div key={i} style={{ marginBottom: '24px' }}>
                      <h4>{pdf.title}</h4>
                      <iframe
                        src={getPdfEmbedUrl(pdf.url)}
                        width="100%"
                        height="500px"
                        title={pdf.title}
                        style={{
                          border: 'none',
                          borderRadius: '14px',
                          background: '#fff',
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <p style={{ color: theme.muted }}>No PDFs available.</p>
                )}
              </div>
            )}
          </motion.div>

          {/* REVIEWS */}
          <div style={{ marginTop: '30px' }}>
            <Reviews courseId={id} />
          </div>

          {/* ENROLLED MESSAGE */}
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

          {/* PAYMENT BOX - SIRF TAB JAB ENROLLED NA HO */}
          {course.price > 0 && !isEnrolled && (
            <div style={{ marginTop: '30px' }}>
              <PaymentBox courseId={id} />
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
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
                    {video.title}
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
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      marginBottom: '10px',
                      background: theme.bg,
                      color: theme.text,
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