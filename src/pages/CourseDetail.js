import API from '../api';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import Reviews from '../components/Reviews';
import Footer from '../components/Footer';
import PaymentBox from '../components/PaymentBox';
import { motion } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function SecurePDFViewer({ pdf, theme }) {
  const [numPages, setNumPages] = useState(null);
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
        overflowY: 'auto',
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
          zIndex: 20,
          background: theme.card,
          color: theme.text,
          padding: '12px',
          borderRadius: '12px',
          marginBottom: '14px',
          border: `1px solid ${theme.border || '#334155'}`,
        }}
      >
        📄 {pdf.title} (View only)
      </div>

      {/* WATERMARK */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(-25deg)',
          fontSize: '28px',
          fontWeight: 800,
          color: 'rgba(255,0,0,0.15)',
        }}
      >
        {user?.name} • {user?.email}
      </div>

      {/* 🔥 FIXED PART */}
      <Document
        file={{
          url: `${API}/api/pdf/${pdf.filename || pdf.url?.split('/').pop()}`,
          httpHeaders: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        {Array.from(new Array(numPages), (_, index) => (
          <Page
            key={index}
            pageNumber={index + 1}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={Math.min(window.innerWidth - 80, 780)}
          />
        ))}
      </Document>
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
        navigate('/my-courses');
      }
    };

    fetchData();
  }, [id, token, navigate]);

  if (!course) return <p>Loading...</p>;

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', color: theme.text }}>
      <h2 style={{ padding: '20px' }}>{course.title}</h2>

      <div style={{ padding: '20px' }}>
        <button onClick={() => setActiveTab('videos')}>Videos</button>
        <button onClick={() => setActiveTab('pdfs')}>PDFs</button>

        {activeTab === 'videos' && activeVideo && (
          <iframe
            src={activeVideo.url}
            width="100%"
            height="400"
            title="video"
          />
        )}

        {activeTab === 'pdfs' && activePdf && (
          <SecurePDFViewer pdf={activePdf} theme={theme} />
        )}
      </div>

      <Footer />
    </div>
  );
}

export default CourseDetail;