import API from '../api';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import Reviews from '../components/Reviews';
import Reveal from '../components/Reveal';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

function CourseDetail() {
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('videos');
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    axios
      .get(`${API}/api/courses/${id}`)
      .then((res) => {
        setCourse(res.data);
        if (res.data.videos?.length > 0) setActiveVideo(res.data.videos[0]);
      })
      .catch(() => navigate('/my-courses'));
  }, [id]);

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
    <div style={{ background: theme.bg, minHeight: '100vh', transition: 'all 0.3s ease' }}>
      <div
        style={{
          background: theme.navbar,
          borderBottom: `1px solid ${theme.border}`,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          backdropFilter: theme.glass,
          boxShadow: theme.shadow,
        }}
      >
        <motion.button
          whileHover={{ x: -3 }}
          onClick={() => navigate('/my-courses')}
          style={{
            background: 'none',
            border: 'none',
            color: theme.primary,
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
          }}
        >
          ← Back
        </motion.button>

        <h2 style={{ color: theme.text, fontSize: '18px', margin: 0 }}>
          {course.title}
        </h2>
      </div>

      <div
        style={{
          display: 'flex',
          maxWidth: '1300px',
          margin: '0 auto',
          gap: '24px',
          padding: '24px',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Reveal>
            {activeTab === 'videos' && activeVideo && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div
                  style={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                    background: '#000',
                    aspectRatio: '16/9',
                    boxShadow: theme.shadowHover,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <iframe
                    src={getEmbedUrl(activeVideo.url)}
                    title={activeVideo.title}
                    width="100%"
                    height="100%"
                    style={{ border: 'none', minHeight: '400px' }}
                    allowFullScreen
                  />
                </div>

                <h3
                  style={{
                    color: theme.text,
                    marginTop: '16px',
                    fontSize: '18px',
                    marginBottom: '8px',
                  }}
                >
                  {activeVideo.title}
                </h3>

                <p style={{ color: theme.muted, fontSize: '14px', marginTop: 0 }}>
                  Abhi aap video section mein ho.
                </p>
              </motion.div>
            )}
          </Reveal>

          {activeTab === 'pdfs' && (
            <div>
              {course.pdfs?.length > 0 ? (
                course.pdfs.map((pdf, i) => (
                  <Reveal key={i} delay={i * 0.05}>
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ color: theme.text, marginBottom: '12px' }}>📄 {pdf.title}</h4>
                      <div
                        style={{
                          borderRadius: '16px',
                          overflow: 'hidden',
                          border: `1px solid ${theme.border}`,
                          boxShadow: theme.shadow,
                          background: theme.card,
                          backdropFilter: theme.glass,
                        }}
                      >
                        <iframe
                          src={getPdfEmbedUrl(pdf.url)}
                          width="100%"
                          height="600px"
                          style={{ border: 'none' }}
                          title={pdf.title}
                        />
                      </div>
                    </div>
                  </Reveal>
                ))
              ) : (
                <Reveal>
                  <div
                    style={{
                      background: theme.card,
                      border: `1px solid ${theme.border}`,
                      borderRadius: theme.radius,
                      padding: '24px',
                      boxShadow: theme.shadow,
                      backdropFilter: theme.glass,
                    }}
                  >
                    <p style={{ color: theme.muted, margin: 0 }}>Abhi koi PDF available nahi hai.</p>
                  </div>
                </Reveal>
              )}
            </div>
          )}

          <div style={{ marginTop: '32px' }}>
            <Reveal>
              <Reviews courseId={id} />
            </Reveal>
          </div>
        </div>

        <div style={{ width: '320px', flexShrink: 0 }}>
          <Reveal>
            <div
              style={{
                display: 'flex',
                background: theme.card,
                borderRadius: '14px',
                padding: '4px',
                marginBottom: '16px',
                border: `1px solid ${theme.border}`,
                boxShadow: theme.shadow,
                backdropFilter: theme.glass,
              }}
            >
              <button
                onClick={() => setActiveTab('videos')}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  background: activeTab === 'videos' ? theme.primary : 'transparent',
                  color: activeTab === 'videos' ? theme.buttonText : theme.muted,
                }}
              >
                📹 Videos
              </button>

              <button
                onClick={() => setActiveTab('pdfs')}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  background: activeTab === 'pdfs' ? theme.primary : 'transparent',
                  color: activeTab === 'pdfs' ? theme.buttonText : theme.muted,
                }}
              >
                📄 PDFs
              </button>
            </div>
          </Reveal>

          {activeTab === 'videos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {course.videos?.length > 0 ? (
                course.videos.map((video, i) => (
                  <Reveal key={i} delay={i * 0.04}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setActiveVideo(video)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        background:
                          activeVideo?.title === video.title ? theme.primary : theme.card,
                        border: `1px solid ${
                          activeVideo?.title === video.title ? theme.primary : theme.border
                        }`,
                        boxShadow: activeVideo?.title === video.title ? theme.glow : theme.shadow,
                        backdropFilter: theme.glass,
                      }}
                    >
                      <p
                        style={{
                          color:
                            activeVideo?.title === video.title
                              ? theme.buttonText
                              : theme.text,
                          fontSize: '13px',
                          margin: 0,
                          lineHeight: '1.5',
                          fontWeight: activeVideo?.title === video.title ? '600' : '500',
                        }}
                      >
                        ▶️ {i + 1}. {video.title}
                      </p>
                    </motion.div>
                  </Reveal>
                ))
              ) : (
                <Reveal>
                  <div
                    style={{
                      background: theme.card,
                      border: `1px solid ${theme.border}`,
                      borderRadius: theme.radius,
                      padding: '18px',
                      boxShadow: theme.shadow,
                      backdropFilter: theme.glass,
                    }}
                  >
                    <p style={{ color: theme.muted, margin: 0, fontSize: '14px' }}>
                      Abhi koi video available nahi hai.
                    </p>
                  </div>
                </Reveal>
              )}
            </div>
          )}

          {activeTab === 'pdfs' && (
            <Reveal>
              <div
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  borderRadius: theme.radius,
                  padding: '18px',
                  boxShadow: theme.shadow,
                  backdropFilter: theme.glass,
                }}
              >
                <p style={{ color: theme.text, marginTop: 0, fontWeight: '600' }}>
                  📄 PDFs List
                </p>

                {course.pdfs?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {course.pdfs.map((pdf, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '10px 12px',
                          background: theme.bgSecondary,
                          border: `1px solid ${theme.border}`,
                          borderRadius: '10px',
                        }}
                      >
                        <p
                          style={{
                            color: theme.text,
                            fontSize: '13px',
                            margin: 0,
                            lineHeight: '1.5',
                          }}
                        >
                          {i + 1}. {pdf.title}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: theme.muted, marginBottom: 0, fontSize: '14px' }}>
                    Abhi koi PDF available nahi hai.
                  </p>
                )}
              </div>
            </Reveal>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CourseDetail;