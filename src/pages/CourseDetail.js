import API from '../api';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import Reviews from '../components/Reviews';
import CheckoutModal from '../components/CheckoutModal';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import logActivity from '../utils/logActivity';
import LiveClassesBox from '../components/LiveClassesBox';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

function SecurePDFViewer({ pdf, theme, courseTitle }) {
  const [numPages, setNumPages] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfError, setPdfError] = useState('');
  const [zoom, setZoom] = useState(1);

  const baseWidth = Math.min(window.innerWidth - 100, 850);
  const pageWidth = baseWidth * zoom;

  const zoomIn = () => {
    setZoom((prev) => Math.min(1.8, Number((prev + 0.1).toFixed(1))));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(0.8, Number((prev - 0.1).toFixed(1))));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  useEffect(() => {
    if (pdf?.title) {
      logActivity(
        `Opened PDF: ${pdf.title} | Course: ${courseTitle || 'Unknown Course'}`,
        'CourseDetail'
      );
    }
  }, [pdf?.title, courseTitle]);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setPdfError('');
        setPdfBlobUrl(null);
        setNumPages(null);
        setZoom(1);

        if (!pdf?.url) {
          setPdfError('PDF URL missing');
          return;
        }

        const res = await fetch(`${API}/api/pdf/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ pdfUrl: pdf.url }),
        });

        if (!res.ok) {
          throw new Error(`PDF fetch failed: ${res.status}`);
        }

        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(blobUrl);
      } catch (err) {
        console.log('PDF LOAD ERROR:', err);
        setPdfError('PDF load failed. URL/policy check karo.');
      }
    };

    loadPdf();

    return () => {
      setPdfBlobUrl((oldUrl) => {
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        return null;
      });
    };
  }, [pdf?.url]);

  useEffect(() => {
    const blockKeys = (e) => {
      const key = e.key.toLowerCase();

      if ((e.ctrlKey && ['s', 'p', 'u', 'c'].includes(key)) || key === 'f12') {
        e.preventDefault();

        logActivity(
          `Blocked shortcut attempt: CTRL + ${key.toUpperCase()} | PDF: ${
            pdf?.title || 'Unknown PDF'
          }`,
          'SecurePDFViewer'
        );
      }

      if (e.ctrlKey && (key === '+' || key === '=')) {
        e.preventDefault();
        zoomIn();
      }

      if (e.ctrlKey && key === '-') {
        e.preventDefault();
        zoomOut();
      }

      if (e.ctrlKey && key === '0') {
        e.preventDefault();
        resetZoom();
      }
    };

    window.addEventListener('keydown', blockKeys);
    return () => window.removeEventListener('keydown', blockKeys);
    // eslint-disable-next-line
  }, [pdf?.title]);

  const block = (e) => {
    e.preventDefault();

    logActivity(
      `Blocked right-click/copy attempt | PDF: ${pdf?.title || 'Unknown PDF'}`,
      'SecurePDFViewer'
    );
  };

  return (
    <div
      onContextMenu={block}
      onCopy={block}
      onCut={block}
      onDragStart={block}
      style={{
        position: 'relative',
        height: '620px',
        overflowY: 'auto',
        overflowX: 'auto',
        borderRadius: '16px',
        border: `1px solid ${theme.border || '#334155'}`,
        background: theme.bg,
        padding: '16px',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: theme.card,
          color: theme.text,
          padding: '12px 14px',
          borderRadius: '12px',
          marginBottom: '14px',
          border: `1px solid ${theme.border || '#334155'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <strong>📄 {pdf?.title || 'PDF'}</strong>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={zoomOut}
            disabled={zoom <= 0.8}
            style={{
              padding: '7px 10px',
              borderRadius: '10px',
              border: `1px solid ${theme.border || '#334155'}`,
              background: zoom <= 0.8 ? 'rgba(148,163,184,0.18)' : theme.bg,
              color: theme.text,
              cursor: zoom <= 0.8 ? 'not-allowed' : 'pointer',
              fontWeight: '900',
            }}
          >
            −
          </button>

          <span
            style={{
              minWidth: '52px',
              textAlign: 'center',
              color: theme.primary,
              fontSize: '13px',
              fontWeight: '900',
            }}
          >
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={zoomIn}
            disabled={zoom >= 1.8}
            style={{
              padding: '7px 10px',
              borderRadius: '10px',
              border: `1px solid ${theme.border || '#334155'}`,
              background: zoom >= 1.8 ? 'rgba(148,163,184,0.18)' : theme.bg,
              color: theme.text,
              cursor: zoom >= 1.8 ? 'not-allowed' : 'pointer',
              fontWeight: '900',
            }}
          >
            +
          </button>

          <button
            onClick={resetZoom}
            style={{
              padding: '7px 12px',
              borderRadius: '10px',
              border: 'none',
              background: theme.primary,
              color: '#fff',
              cursor: 'pointer',
              fontWeight: '800',
              fontSize: '12px',
            }}
          >
            Fit Width
          </button>

          <span style={{ color: theme.muted, fontSize: '13px' }}>
            View only • Protected by REHANVERSE
          </span>
        </div>
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
          fontSize: '22px',
          fontWeight: 800,
          color: 'rgba(239,68,68,0.18)',
          textAlign: 'center',
          padding: '20px',
        }}
      >
        REHANVERSE • Protected Content
      </div>

      {pdfError ? (
        <p style={{ color: '#fca5a5', textAlign: 'center' }}>{pdfError}</p>
      ) : !pdfBlobUrl ? (
        <p style={{ color: theme.muted, textAlign: 'center' }}>
          Loading PDF...
        </p>
      ) : (
        <Document
          file={pdfBlobUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          error={
            <p style={{ color: '#fca5a5', textAlign: 'center' }}>
              PDF render failed.
            </p>
          }
        >
          {Array.from(new Array(numPages || 0), (_, index) => (
            <div
              key={index}
              style={{
                marginBottom: '18px',
                display: 'flex',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 5,
              }}
            >
              <Page
                pageNumber={index + 1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={pageWidth}
              />
            </div>
          ))}
        </Document>
      )}
    </div>
  );
}

function LockedCoursePreview({ course, theme, onUnlock }) {
  const videosCount = course.videos?.length || 0;
  const pdfsCount = course.pdfs?.length || 0;

  const previewCards = [
    {
      icon: '🎥',
      count: videosCount,
      label: 'Video Lectures',
    },
    {
      icon: '📄',
      count: pdfsCount,
      label: 'Premium PDFs',
    },
    {
      icon: '🔴',
      count: 'Live',
      label: 'Class Access',
    },
  ];

  return (
    <div
      style={{
        padding: '24px',
        borderRadius: '18px',
        background: theme.bg,
        border: `1px solid ${theme.border || '#334155'}`,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '26px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '999px',
            background:
              'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(59,130,246,0.16))',
            border: '1px solid rgba(34,197,94,0.35)',
            color: '#86efac',
            fontWeight: '900',
            fontSize: '13px',
            marginBottom: '14px',
          }}
        >
          ✨ Premium Course Preview
        </div>

        <h2
          style={{
            margin: '0 0 10px',
            color: theme.text,
            fontSize: '28px',
            lineHeight: '1.2',
          }}
        >
          🔒 Unlock Full Course Access
        </h2>

        <p
          style={{
            color: theme.muted,
            lineHeight: '1.75',
            maxWidth: '760px',
            margin: '0 auto',
            fontSize: '15px',
          }}
        >
          Is course ke andar structured videos, premium protected PDFs, live
          classes aur complete learning material milega. Neeche full content
          preview dekh sakte ho — access enrollment ke baad unlock hoga.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        {previewCards.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -4, scale: 1.02 }}
            style={{
              padding: '18px',
              borderRadius: '16px',
              background: theme.card,
              border: `1px solid ${theme.border || '#334155'}`,
              textAlign: 'center',
              boxShadow: '0 8px 22px rgba(0,0,0,0.10)',
            }}
          >
            <div style={{ fontSize: '26px', marginBottom: '8px' }}>
              {item.icon}
            </div>

            <h3
              style={{
                margin: 0,
                color: theme.primary,
                fontSize: '26px',
              }}
            >
              {item.count}
            </h3>

            <p
              style={{
                margin: '6px 0 0',
                color: theme.muted,
                fontWeight: '700',
                fontSize: '13px',
              }}
            >
              {item.label}
            </p>
          </motion.div>
        ))}
      </div>

      <div
        style={{
          padding: '18px',
          borderRadius: '18px',
          background:
            'linear-gradient(135deg, rgba(139,92,246,0.16), rgba(59,130,246,0.10))',
          border: `1px solid ${theme.border || '#334155'}`,
          marginBottom: '22px',
        }}
      >
        <h3 style={{ marginTop: 0, color: theme.text }}>
          🚀 What You’ll Unlock
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '10px',
            color: theme.text,
            fontWeight: '700',
            fontSize: '14px',
          }}
        >
          <span>✅ Complete course content</span>
          <span>✅ Premium protected notes</span>
          <span>✅ Videos + PDFs in one place</span>
          <span>✅ Live class access</span>
          <span>✅ Structured unit-wise learning</span>
          <span>✅ Lifetime course access</span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '18px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            padding: '18px',
            borderRadius: '18px',
            background: theme.card,
            border: `1px solid ${theme.border || '#334155'}`,
          }}
        >
          <h3 style={{ marginTop: 0, color: theme.text }}>🎥 Videos Preview</h3>

          {course.videos?.length > 0 ? (
            course.videos.map((video, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  marginBottom: '10px',
                  background: theme.bg,
                  border: `1px solid ${theme.border || '#334155'}`,
                  color: theme.text,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '10px',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: '700' }}>
                  🔒 {video.title || `Video ${i + 1}`}
                </span>

                <span
                  style={{
                    color: '#fbbf24',
                    fontSize: '12px',
                    fontWeight: '900',
                  }}
                >
                  Locked
                </span>
              </div>
            ))
          ) : (
            <p style={{ color: theme.muted }}>No videos listed.</p>
          )}
        </div>

        <div
          style={{
            padding: '18px',
            borderRadius: '18px',
            background: theme.card,
            border: `1px solid ${theme.border || '#334155'}`,
          }}
        >
          <h3 style={{ marginTop: 0, color: theme.text }}>📄 PDFs Preview</h3>

          {course.pdfs?.length > 0 ? (
            course.pdfs.map((pdf, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  marginBottom: '10px',
                  background: theme.bg,
                  border: `1px solid ${theme.border || '#334155'}`,
                  color: theme.text,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '10px',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: '700' }}>
                  🔒 {pdf.title || `PDF ${i + 1}`}
                </span>

                <span
                  style={{
                    color: '#fbbf24',
                    fontSize: '12px',
                    fontWeight: '900',
                  }}
                >
                  Locked
                </span>
              </div>
            ))
          ) : (
            <p style={{ color: theme.muted }}>No PDFs listed.</p>
          )}
        </div>
      </div>

      <div
        style={{
          textAlign: 'center',
          padding: '24px',
          borderRadius: '18px',
          background:
            'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(59,130,246,0.16))',
          border: '1px solid rgba(34,197,94,0.35)',
          boxShadow: '0 14px 40px rgba(34,197,94,0.12)',
        }}
      >
        <h3 style={{ marginTop: 0, color: theme.text }}>
          ⚡ Ready to unlock this course?
        </h3>

        <p
          style={{
            color: theme.muted,
            lineHeight: '1.65',
            maxWidth: '680px',
            margin: '0 auto 18px',
          }}
        >
          Enroll karne ke baad complete videos, PDFs aur live classes approval ke
          baad accessible ho jayengi. Launch pricing ke time access lena best
          rahega.
        </p>

        <button
          onClick={onUnlock}
          style={{
            padding: '14px 28px',
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(135deg, #22c55e, #3b82f6)',
            color: 'white',
            fontWeight: '900',
            cursor: 'pointer',
            fontSize: '16px',
            boxShadow: '0 12px 35px rgba(34,197,94,0.25)',
          }}
        >
          Buy Now / Apply Coupon
        </button>

        <div
          style={{
            marginTop: '12px',
            color: theme.muted,
            fontSize: '12px',
            fontWeight: '700',
          }}
        >
          🔐 Content unlocks only after enrollment/payment approval.
        </div>
      </div>
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
  const [showCheckout, setShowCheckout] = useState(false);
  const [lockedMsg, setLockedMsg] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const courseRes = await axios.get(`${API}/api/courses/${id}`);
        setCourse(courseRes.data);

        logActivity(
          `Opened Course Detail Page | Course: ${courseRes.data.title}`,
          'CourseDetail'
        );

        if (courseRes.data.videos?.length > 0) {
          setActiveVideo(courseRes.data.videos[0]);

          logActivity(
            `Auto loaded first video: ${courseRes.data.videos[0].title} | Course: ${courseRes.data.title}`,
            'CourseDetail'
          );
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

        logActivity(
          enrolled
            ? `Enrollment check: User is enrolled | Course: ${courseRes.data.title}`
            : `Enrollment check: User is not enrolled | Course: ${courseRes.data.title}`,
          'CourseDetail'
        );
      } catch (err) {
        console.log('Course detail error:', err);

        logActivity(
          `Course detail error or unauthorized access attempt | Course ID: ${id}`,
          'CourseDetail'
        );

        navigate('/my-courses');
      }
    };

    fetchData();
  }, [id, token, navigate]);

  const getEmbedUrl = (url) => {
    if (!url) return null;

    const ytMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (driveMatch) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }

    return url;
  };

  const openCheckout = (source = 'CourseDetail') => {
    logActivity(
      `Opened checkout modal from ${source} | Course: ${
        course?.title || 'Unknown Course'
      }`,
      'CourseDetail'
    );

    setShowCheckout(true);
  };

  const showLockedMessage = (contentTitle = 'content') => {
    setLockedMsg(`🔒 ${contentTitle} enrollment ke baad unlock hoga.`);

    logActivity(
      `Locked content clicked: ${contentTitle} | Course: ${
        course?.title || 'Unknown Course'
      }`,
      'CourseDetail'
    );

    setTimeout(() => setLockedMsg(''), 3000);
  };

  const handleVideoClick = (video) => {
    const locked = course?.price > 0 && !isEnrolled;

    if (locked) {
      showLockedMessage(video?.title || 'Video');
      return;
    }

    setActiveVideo(video);

    logActivity(
      `Clicked video: ${video.title} | Course: ${
        course?.title || 'Unknown Course'
      }`,
      'CourseDetail'
    );
  };

  const handlePdfClick = (pdf) => {
    const locked = course?.price > 0 && !isEnrolled;

    if (locked) {
      showLockedMessage(pdf?.title || 'PDF');
      return;
    }

    setActivePdf(pdf);

    logActivity(
      `Clicked PDF: ${pdf.title} | Course: ${
        course?.title || 'Unknown Course'
      }`,
      'CourseDetail'
    );
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    logActivity(
      `Switched tab to: ${tab} | Course: ${
        course?.title || 'Unknown Course'
      }`,
      'CourseDetail'
    );
  };

  const handleCheckoutSuccess = () => {
    logActivity(
      `Checkout success | Redirecting to My Courses | Course: ${
        course?.title || 'Unknown Course'
      }`,
      'CourseDetail'
    );

    setShowCheckout(false);
    window.location.href = '/my-courses';
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
          onClick={() => {
            logActivity(
              `Clicked back button from course: ${course.title}`,
              'CourseDetail'
            );
            navigate('/my-courses');
          }}
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
          {lockedMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginBottom: '14px',
                padding: '12px 16px',
                borderRadius: '14px',
                background:
                  theme.mode === 'dark'
                    ? 'rgba(251,191,36,0.14)'
                    : '#fef3c7',
                color: theme.mode === 'dark' ? '#fbbf24' : '#92400e',
                border:
                  theme.mode === 'dark'
                    ? '1px solid rgba(251,191,36,0.28)'
                    : '1px solid #fde68a',
                fontWeight: '800',
              }}
            >
              {lockedMsg}
            </motion.div>
          )}

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
              <LockedCoursePreview
                course={course}
                theme={theme}
                onUnlock={() => openCheckout('locked preview')}
              />
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

                {activeTab === 'videos' && !activeVideo && (
                  <p style={{ color: theme.muted }}>No videos available.</p>
                )}

                {activeTab === 'pdfs' && (
                  <div>
                    {activePdf ? (
                      <SecurePDFViewer
                        pdf={activePdf}
                        theme={theme}
                        courseTitle={course.title}
                      />
                    ) : (
                      <p style={{ color: theme.muted }}>No PDFs available.</p>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>

          <LiveClassesBox courseId={id} isEnrolled={isEnrolled} theme={theme} />

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
            <div
              style={{
                marginTop: '30px',
                padding: '20px',
                borderRadius: '18px',
                background: theme.card,
                border: `1px solid ${theme.border || '#334155'}`,
                boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                textAlign: 'center',
              }}
            >
              <h3 style={{ marginTop: 0 }}>🔐 Unlock This Course</h3>

              <p
                style={{
                  color: theme.muted,
                  lineHeight: '1.6',
                  marginBottom: '18px',
                }}
              >
                Apply coupon code, scan QR, upload payment screenshot, or enroll
                directly if your coupon makes this course free.
              </p>

              <button
                onClick={() => openCheckout('bottom unlock card')}
                style={{
                  padding: '14px 24px',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #22c55e, #3b82f6)',
                  color: 'white',
                  fontWeight: '900',
                  cursor: 'pointer',
                  fontSize: '16px',
                  boxShadow: '0 12px 35px rgba(34,197,94,0.25)',
                }}
              >
                Buy Now / Apply Coupon
              </button>
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

          {locked && (
            <div
              style={{
                padding: '12px',
                borderRadius: '12px',
                marginBottom: '14px',
                background:
                  'linear-gradient(135deg, rgba(251,191,36,0.14), rgba(239,68,68,0.10))',
                border: '1px solid rgba(251,191,36,0.30)',
                color: theme.muted,
                fontSize: '13px',
                lineHeight: '1.55',
                fontWeight: '700',
              }}
            >
              🔒 Preview only. Enroll karne ke baad actual videos, PDFs aur live
              classes unlock honge.
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
            <button
              onClick={() => handleTabChange('videos')}
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
              onClick={() => handleTabChange('pdfs')}
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
                    onClick={() => handleVideoClick(video)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      marginBottom: '10px',
                      cursor: 'pointer',
                      background:
                        !locked && activeVideo?.title === video.title
                          ? theme.primary
                          : theme.bg,
                      color:
                        !locked && activeVideo?.title === video.title
                          ? '#fff'
                          : theme.text,
                      border: `1px solid ${theme.border || '#334155'}`,
                      fontWeight: '500',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <span>
                      {locked ? '🔒' : '▶️'} {video.title}
                    </span>

                    {locked && (
                      <span
                        style={{
                          color: '#fbbf24',
                          fontSize: '11px',
                          fontWeight: '900',
                        }}
                      >
                        Locked
                      </span>
                    )}
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
                    onClick={() => handlePdfClick(pdf)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      marginBottom: '10px',
                      cursor: 'pointer',
                      background:
                        !locked && activePdf?.title === pdf.title
                          ? theme.primary
                          : theme.bg,
                      color:
                        !locked && activePdf?.title === pdf.title
                          ? '#fff'
                          : theme.text,
                      border: `1px solid ${theme.border || '#334155'}`,
                      fontWeight: '500',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <span>
                      {locked ? '🔒' : '📄'} {pdf.title}
                    </span>

                    {locked && (
                      <span
                        style={{
                          color: '#fbbf24',
                          fontSize: '11px',
                          fontWeight: '900',
                        }}
                      >
                        Locked
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: theme.muted }}>No PDFs available.</p>
              )}
            </div>
          )}

          {locked && (
            <button
              onClick={() => openCheckout('sidebar locked preview')}
              style={{
                marginTop: '14px',
                width: '100%',
                padding: '13px 16px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #22c55e, #3b82f6)',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '900',
                boxShadow: '0 12px 28px rgba(34,197,94,0.22)',
              }}
            >
              Unlock Full Access
            </button>
          )}
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          course={course}
          onClose={() => {
            logActivity(
              `Closed checkout modal | Course: ${course.title}`,
              'CourseDetail'
            );
            setShowCheckout(false);
          }}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      <Footer />
    </div>
  );
}

export default CourseDetail;