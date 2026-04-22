import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import API from '../api';

const IMGBB_KEY = 'be84806d0aaa75b350df6e02185b1f8f';
const QR_IMAGE = 'https://i.ibb.co/PZMssw64/qr.jpg';
const UPI_ID = 'dost@upi'; // ← apna ya dost ka UPI ID daalo

function Payment() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const token = localStorage.getItem('token');

  const [course, setCourse] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    axios.get(`${API}/api/courses/${courseId}`)
      .then(res => setCourse(res.data))
      .catch(() => navigate('/courses'));
  }, [courseId]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file) {
      setMsg('❌ Screenshot upload karo!');
      return;
    }

    setUploading(true);
    setMsg('⏳ Screenshot upload ho rahi hai...');

    try {
      const formData = new FormData();
      formData.append('image', file);
      const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
        method: 'POST',
        body: formData
      });
      const imgData = await imgRes.json();

      if (!imgData.success) {
        setMsg('❌ Screenshot upload failed!');
        setUploading(false);
        return;
      }

      const res = await axios.post(`${API}/api/payment/request`,
        { courseId, screenshotUrl: imgData.data.url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg('✅ ' + res.data.message);
      setStep(3);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Error!'));
    }
    setUploading(false);
  };

  if (!course) return (
    <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: colors.subtext }}>⏳ Loading...</p>
    </div>
  );

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

        <button onClick={() => navigate('/courses')}
          style={{ background: 'none', border: 'none', color: colors.primary, cursor: 'pointer', fontSize: '15px', marginBottom: '20px' }}>
          ← Wapas Jao
        </button>

        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '32px', textAlign: 'center' }}>

          {/* Step 1 — QR Code */}
          {step === 1 && (
            <>
              <h2 style={{ color: colors.primary, marginBottom: '4px' }}>💳 Payment</h2>
              <p style={{ color: colors.subtext, marginBottom: '20px' }}>QR scan karke pay karo</p>

              <div style={{ background: colors.bg, borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <p style={{ color: colors.text, fontWeight: '600', margin: 0 }}>{course.title}</p>
                <p style={{ color: colors.primary, fontSize: '24px', fontWeight: '800', margin: '8px 0 0' }}>₹{course.price}</p>
              </div>

              <img src={QR_IMAGE} alt="QR Code"
                style={{ width: '200px', height: '200px', borderRadius: '12px', border: `3px solid ${colors.primary}`, objectFit: 'contain', background: 'white', padding: '8px' }} />

              <div style={{ background: colors.bg, borderRadius: '10px', padding: '12px', margin: '16px 0' }}>
                <p style={{ color: colors.subtext, fontSize: '12px', margin: 0 }}>UPI ID</p>
                <p style={{ color: colors.text, fontWeight: '700', fontSize: '16px', margin: '4px 0 0' }}>{UPI_ID}</p>
              </div>

              <button onClick={() => setStep(2)}
                style={{ width: '100%', padding: '14px', background: colors.primary, color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: '600' }}>
                Pay kar diya → Screenshot Upload Karo
              </button>
            </>
          )}

          {/* Step 2 — Screenshot Upload */}
          {step === 2 && (
            <>
              <h2 style={{ color: colors.primary, marginBottom: '4px' }}>📸 Screenshot Upload Karo</h2>
              <p style={{ color: colors.subtext, marginBottom: '20px' }}>Payment ka screenshot upload karo</p>

              {preview ? (
                <img src={preview} alt="preview"
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px', border: `2px solid ${colors.primary}` }} />
              ) : (
                <div style={{ width: '100%', height: '160px', background: colors.bg, borderRadius: '12px', border: `2px dashed ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <p style={{ color: colors.subtext }}>📷 Screenshot select karo</p>
                </div>
              )}

              <label style={{ cursor: 'pointer', display: 'block', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '10px', color: colors.subtext, fontSize: '14px' }}>
                  📁 {file ? file.name : 'Choose Screenshot'}
                </div>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>

              {msg && (
                <p style={{ color: msg.includes('✅') ? '#10b981' : msg.includes('⏳') ? colors.primary : '#ef4444', marginBottom: '12px', fontSize: '14px' }}>
                  {msg}
                </p>
              )}

              <button onClick={handleSubmit} disabled={uploading}
                style={{ width: '100%', padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: '600', opacity: uploading ? 0.7 : 1 }}>
                {uploading ? '⏳ Submitting...' : '✅ Submit Payment Proof'}
              </button>

              <button onClick={() => setStep(1)}
                style={{ width: '100%', padding: '10px', background: 'transparent', color: colors.subtext, border: 'none', cursor: 'pointer', marginTop: '8px' }}>
                ← Wapas QR Dekho
              </button>
            </>
          )}

          {/* Step 3 — Success */}
          {step === 3 && (
            <>
              <p style={{ fontSize: '60px', margin: '0 0 16px' }}>🎉</p>
              <h2 style={{ color: '#10b981', marginBottom: '8px' }}>Submitted!</h2>
              <p style={{ color: colors.subtext, lineHeight: '1.6', marginBottom: '24px' }}>
                Tera payment verify ho raha hai.<br />
                <strong>24 hours</strong> mein course access mil jaega!
              </p>
              <button onClick={() => navigate('/my-courses')}
                style={{ padding: '12px 28px', background: colors.primary, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px' }}>
                My Courses Dekho
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default Payment;