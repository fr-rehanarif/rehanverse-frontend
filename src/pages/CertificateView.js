import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../api';

function CertificateView() {
  const { certificateId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificate();
    // eslint-disable-next-line
  }, [certificateId]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      setErr('');

      const res = await fetch(`${API}/api/certificates/verify/${certificateId}`);
      const json = await res.json();

      if (!res.ok || !json.verified) {
        throw new Error(json.message || 'Certificate not found');
      }

      setData(json.certificate);
    } catch (error) {
      setErr(error.message || 'Certificate verification failed');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not available';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingBox}>? Loading certificate...</div>
      </div>
    );
  }

  if (err) {
    return (
      <div style={styles.page}>
        <div style={styles.errorBox}>
          <h2>? Certificate Not Found</h2>
          <p>{err}</p>
          <button onClick={() => navigate('/profile')} style={styles.backBtn}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }

            #certificate-print-area,
            #certificate-print-area * {
              visibility: visible;
            }

            #certificate-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              box-shadow: none !important;
              margin: 0 !important;
            }

            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <div style={styles.bgGlowOne} />
      <div style={styles.bgGlowTwo} />

      <div className="no-print" style={styles.topBar}>
        <button onClick={() => navigate('/profile')} style={styles.topBtn}>
          ? Back to Profile
        </button>

        <button onClick={handlePrint} style={styles.printBtn}>
          ??? Print / Save PDF
        </button>
      </div>

      <motion.div
        id="certificate-print-area"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={styles.certificate}
      >
        <div style={styles.cornerTopLeft} />
        <div style={styles.cornerBottomRight} />

        <div style={styles.innerBorder}>
          <div style={styles.header}>
            <div style={styles.logoCircle}>R</div>

            <div>
              <h1 style={styles.brand}>REHANVERSE</h1>
              <p style={styles.brandSub}>Secure Learning Platform</p>
            </div>
          </div>

          <div style={styles.verifiedBadge}>? VERIFIED CERTIFICATE</div>

          <h2 style={styles.certTitle}>Certificate of Completion</h2>

          <p style={styles.presentedText}>This certificate is proudly presented to</p>

          <h3 style={styles.studentName}>{data?.studentName || 'Student'}</h3>

          <div style={styles.line} />

          <p style={styles.completionText}>
            for successfully completing the course
          </p>

          <h4 style={styles.courseName}>
            {data?.courseTitle || data?.course?.title || 'Course'}
          </h4>

          <div style={styles.metaGrid}>
            <div style={styles.metaBox}>
              <span>Certificate ID</span>
              <strong>{data?.certificateId}</strong>
            </div>

            <div style={styles.metaBox}>
              <span>Issued On</span>
              <strong>{formatDate(data?.issuedAt)}</strong>
            </div>

            <div style={styles.metaBox}>
              <span>Status</span>
              <strong style={{ color: '#16a34a' }}>Verified</strong>
            </div>
          </div>

          <div style={styles.footer}>
            <div style={styles.signatureBox}>
              <div style={styles.signatureLine} />
              <strong>Mohammad Rehan Arif</strong>
              <span>Founder, REHANVERSE</span>
            </div>

            <div style={styles.seal}>
              <span>??</span>
              <strong>RV</strong>
            </div>

            <div style={styles.signatureBox}>
              <div style={styles.signatureLine} />
              <strong>REHANVERSE</strong>
              <span>Official Verification</span>
            </div>
          </div>

          <p style={styles.note}>
            This certificate can be verified using the Certificate ID through REHANVERSE verification system.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top, #1e1b4b 0%, #020617 48%, #000 100%)',
    color: '#fff',
    padding: '28px 14px 50px',
    position: 'relative',
    overflow: 'hidden',
  },

  bgGlowOne: {
    position: 'absolute',
    top: '80px',
    left: '-100px',
    width: '280px',
    height: '280px',
    borderRadius: '50%',
    background: 'rgba(139,92,246,0.28)',
    filter: 'blur(90px)',
  },

  bgGlowTwo: {
    position: 'absolute',
    bottom: '80px',
    right: '-120px',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    background: 'rgba(14,165,233,0.18)',
    filter: 'blur(100px)',
  },

  topBar: {
    maxWidth: '1100px',
    margin: '0 auto 18px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
    position: 'relative',
    zIndex: 2,
  },

  topBtn: {
    padding: '12px 16px',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 900,
  },

  printBtn: {
    padding: '12px 16px',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 900,
    boxShadow: '0 16px 35px rgba(139,92,246,0.28)',
  },

  certificate: {
    maxWidth: '1100px',
    margin: '0 auto',
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    color: '#0f172a',
    borderRadius: '28px',
    padding: '18px',
    boxShadow: '0 30px 90px rgba(0,0,0,0.42)',
    position: 'relative',
    zIndex: 2,
    overflow: 'hidden',
  },

  innerBorder: {
    border: '3px double rgba(124,58,237,0.45)',
    borderRadius: '22px',
    minHeight: '680px',
    padding: '42px 34px',
    position: 'relative',
    textAlign: 'center',
    background:
      'linear-gradient(135deg, rgba(139,92,246,0.035), rgba(14,165,233,0.035))',
  },

  cornerTopLeft: {
    position: 'absolute',
    top: '-70px',
    left: '-70px',
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    background: 'rgba(139,92,246,0.16)',
  },

  cornerBottomRight: {
    position: 'absolute',
    bottom: '-80px',
    right: '-80px',
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    background: 'rgba(14,165,233,0.14)',
  },

  header: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '26px',
    flexWrap: 'wrap',
  },

  logoCircle: {
    width: '68px',
    height: '68px',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    color: '#fff',
    fontWeight: 950,
    fontSize: '32px',
    boxShadow: '0 14px 30px rgba(124,58,237,0.28)',
  },

  brand: {
    margin: 0,
    fontSize: '34px',
    letterSpacing: '2px',
    fontWeight: 950,
    color: '#4c1d95',
  },

  brandSub: {
    margin: '4px 0 0',
    color: '#64748b',
    fontWeight: 850,
  },

  verifiedBadge: {
    display: 'inline-flex',
    padding: '9px 14px',
    borderRadius: '999px',
    background: '#dcfce7',
    color: '#166534',
    fontWeight: 950,
    border: '1px solid #bbf7d0',
    marginBottom: '26px',
  },

  certTitle: {
    margin: '0 0 24px',
    fontSize: '46px',
    lineHeight: 1.1,
    color: '#111827',
    fontWeight: 950,
    fontFamily: 'Georgia, serif',
  },

  presentedText: {
    margin: '0 0 12px',
    color: '#64748b',
    fontSize: '17px',
    fontWeight: 800,
  },

  studentName: {
    margin: 0,
    fontSize: '44px',
    lineHeight: 1.15,
    color: '#7c3aed',
    fontWeight: 950,
    fontFamily: 'Georgia, serif',
    wordBreak: 'break-word',
  },

  line: {
    width: '68%',
    height: '2px',
    margin: '18px auto 24px',
    background: 'linear-gradient(90deg, transparent, #8b5cf6, transparent)',
  },

  completionText: {
    margin: '0 0 12px',
    color: '#475569',
    fontSize: '17px',
    fontWeight: 800,
  },

  courseName: {
    margin: '0 auto 30px',
    maxWidth: '820px',
    color: '#0f172a',
    fontSize: '30px',
    lineHeight: 1.25,
    fontWeight: 950,
    wordBreak: 'break-word',
  },

  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '14px',
    margin: '0 auto 34px',
    maxWidth: '850px',
  },

  metaBox: {
    padding: '15px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    background: 'rgba(255,255,255,0.78)',
    display: 'grid',
    gap: '6px',
  },

  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '18px',
    flexWrap: 'wrap',
    marginTop: '38px',
  },

  signatureBox: {
    flex: 1,
    minWidth: '210px',
    display: 'grid',
    gap: '6px',
    color: '#0f172a',
  },

  signatureLine: {
    width: '180px',
    height: '2px',
    background: '#0f172a',
    margin: '0 auto 8px',
  },

  seal: {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    border: '3px solid #8b5cf6',
    display: 'grid',
    placeItems: 'center',
    color: '#7c3aed',
    fontWeight: 950,
    background: '#f5f3ff',
  },

  note: {
    margin: '30px auto 0',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: 800,
    lineHeight: 1.6,
    maxWidth: '740px',
  },

  loadingBox: {
    maxWidth: '460px',
    margin: '120px auto',
    padding: '24px',
    borderRadius: '20px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.14)',
    textAlign: 'center',
    fontWeight: 900,
  },

  errorBox: {
    maxWidth: '520px',
    margin: '120px auto',
    padding: '28px',
    borderRadius: '22px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.14)',
    textAlign: 'center',
  },

  backBtn: {
    marginTop: '12px',
    padding: '12px 16px',
    borderRadius: '14px',
    border: 'none',
    background: '#8b5cf6',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 900,
  },
};

export default CertificateView;
