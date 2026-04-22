import API from '../api';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import Reviews from '../components/Reviews';
import { motion } from 'framer-motion';

function CourseDetail() {
  const { id } = useParams();
  const { colors } = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('videos');
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    axios.get(`${API}/api/courses/${id}`)
      .then(res => {
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

  if (!course) return (
    <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: colors.subtext, fontSize: '18px' }}>⏳ Loading...</p>
    </div>
  );

  return (
    <div style={{ background: colors.bg, minHeight: '100vh' }}>

      {/* Top Bar */}
      <div style={{ 
        background: colors.card, 
        borderBottom: `1px solid ${colors.border}`, 
        padding: '16px 24px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        backdropFilter: 'blur(8px)'
      }}>
        <motion.button 
          whileHover={{ x: -3 }}
          onClick={() => navigate('/my-courses')}
          style={{ background: 'none', border: 'none', color: colors.primary, cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>
          ← Back
        </motion.button>

        <h2 style={{ color: colors.text, fontSize: '18px', margin: 0 }}>
          {course.title}
        </h2>
      </div>

      <div style={{ display: 'flex', maxWidth: '1300px', margin: '0 auto', gap: '24px', padding: '24px' }}>

        {/* LEFT SIDE */}
        <div style={{ flex: 1 }}>

          {activeTab === 'videos' && activeVideo && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              
              {/* Video */}
              <div style={{ 
                borderRadius: '16px', 
                overflow: 'hidden', 
                background: '#000', 
                aspectRatio: '16/9',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
              }}>
                <iframe
                  src={getEmbedUrl(activeVideo.url)}
                  title={activeVideo.title}
                  width="100%" height="100%"
                  style={{ border: 'none', minHeight: '400px' }}
                  allowFullScreen
                />
              </div>

              <h3 style={{ 
                color: colors.text, 
                marginTop: '16px', 
                fontSize: '18px' 
              }}>
                {activeVideo.title}
              </h3>

            </motion.div>
          )}

          {/* PDF Section */}
          {activeTab === 'pdfs' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {course.pdfs?.map((pdf, i) => (
                <div key={i} style={{ marginBottom: '24px' }}>
                  <h4 style={{ color: colors.text }}>📄 {pdf.title}</h4>
                  <div style={{ 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    border: `1px solid ${colors.border}` 
                  }}>
                    <iframe
                      src={getPdfEmbedUrl(pdf.url)}
                      width="100%" height="600px"
                      style={{ border: 'none' }}
                      title={pdf.title}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ width: '320px', flexShrink: 0 }}>

          {/* Tabs */}
          <div style={{ 
            display: 'flex', 
            background: colors.card, 
            borderRadius: '12px', 
            padding: '4px', 
            marginBottom: '16px', 
            border: `1px solid ${colors.border}` 
          }}>
            <button onClick={() => setActiveTab('videos')}
              style={{
                flex: 1,
                padding: '9px',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '500',
                background: activeTab === 'videos' ? colors.primary : 'transparent',
                color: activeTab === 'videos' ? 'white' : colors.subtext
              }}>
              📹 Videos
            </button>

            <button onClick={() => setActiveTab('pdfs')}
              style={{
                flex: 1,
                padding: '9px',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '500',
                background: activeTab === 'pdfs' ? colors.primary : 'transparent',
                color: activeTab === 'pdfs' ? 'white' : colors.subtext
              }}>
              📄 PDFs
            </button>
          </div>
          {/* Reviews Section */}
          <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 24px 40px' }}>
            <Reviews courseId={id} />
          </div>

          {/* Video List */}
          {activeTab === 'videos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {course.videos?.map((video, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveVideo(video)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: activeVideo?.title === video.title ? colors.primary : colors.card,
                    border: `1px solid ${activeVideo?.title === video.title ? colors.primary : colors.border}`
                  }}>
                  <p style={{
                    color: activeVideo?.title === video.title ? 'white' : colors.text,
                    fontSize: '13px',
                    margin: 0
                  }}>
                    ▶️ {i + 1}. {video.title}
                  </p>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default CourseDetail;