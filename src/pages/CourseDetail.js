import API from '../api';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import Reviews from '../components/Reviews';
import Reveal from '../components/Reveal';
import Footer from '../components/Footer';
import PaymentBox from '../components/PaymentBox'; // 🔥 ADD KIYA
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
    <div style={{ background: theme.bg, minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div
        style={{
          background: theme.navbar,
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <button onClick={() => navigate('/my-courses')}>
          ← Back
        </button>

        <h2>{course.title}</h2>
      </div>

      <div style={{ display: 'flex', padding: '20px', gap: '20px' }}>

        {/* LEFT SIDE */}
        <div style={{ flex: 1 }}>

          {/* VIDEO */}
          {activeTab === 'videos' && activeVideo && (
            <div>
              <iframe
                src={getEmbedUrl(activeVideo.url)}
                width="100%"
                height="400px"
                title={activeVideo.title}
              />
              <h3>{activeVideo.title}</h3>
            </div>
          )}

          {/* PDF */}
          {activeTab === 'pdfs' && (
            <div>
              {course.pdfs?.map((pdf, i) => (
                <div key={i}>
                  <h4>{pdf.title}</h4>
                  <iframe src={getPdfEmbedUrl(pdf.url)} width="100%" height="500px" />
                </div>
              ))}
            </div>
          )}

          {/* 🔥 PAYMENT BOX (YAHI IMPORTANT HAI) */}
          <div style={{ marginTop: '30px' }}>
            <PaymentBox courseId={id} />
          </div>

          {/* REVIEWS */}
          <div style={{ marginTop: '30px' }}>
            <Reviews courseId={id} />
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div style={{ width: '300px' }}>
          
          <button onClick={() => setActiveTab('videos')}>
            Videos
          </button>

          <button onClick={() => setActiveTab('pdfs')}>
            PDFs
          </button>

          {course.videos?.map((video, i) => (
            <div key={i} onClick={() => setActiveVideo(video)}>
              {video.title}
            </div>
          ))}

        </div>

      </div>

      <Footer />
    </div>
  );
}

export default CourseDetail;