import API from '../api';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async () => {
    if (loading || verifyLoading) return;

    if (!form.email.trim() || !form.password.trim()) {
      setMsg('Please enter email and password.');
      return;
    }

    try {
      setLoading(true);
      setMsg('');

      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };

      const res = await axios.post(`${API}/api/auth/login`, payload);

      setVerifiedEmail(payload.email);
      setOtpSent(true);
      setOtp('');
      setMsg(res.data.message || 'Login OTP sent to your email ✅');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (verifyLoading || loading) return;

    if (!verifiedEmail) {
      setMsg('Email missing. Please login again.');
      return;
    }

    if (!otp.trim()) {
      setMsg('Please enter OTP.');
      return;
    }

    if (otp.trim().length !== 6) {
      setMsg('OTP must be 6 digits.');
      return;
    }

    try {
      setVerifyLoading(true);
      setMsg('');

      const res = await axios.post(`${API}/api/auth/verify-login`, {
        email: verifiedEmail,
        otp: otp.trim(),
      });

      localStorage.setItem('token', res.data.token);

      const meRes = await axios.get(`${API}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${res.data.token}`,
        },
      });

      localStorage.setItem('user', JSON.stringify(meRes.data));

      navigate('/courses');
    } catch (err) {
      setMsg(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const resendOtp = async () => {
    setOtp('');
    await handleSubmit();
  };

  const editLoginDetails = () => {
    setOtpSent(false);
    setOtp('');
    setVerifiedEmail('');
    setMsg('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (otpSent) {
        handleVerifyOtp();
      } else {
        handleSubmit();
      }
    }
  };

  const isSuccess =
    msg &&
    (msg.toLowerCase().includes('success') ||
      msg.toLowerCase().includes('sent') ||
      msg.toLowerCase().includes('verified') ||
      msg.includes('✅'));

  return (
    <div
      style={{
        ...styles.page,
        background: theme.bg,
        color: theme.text,
      }}
    >
      <div style={styles.bgGrid} />
      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />
      <div style={styles.glowThree} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: 'easeOut' }}
        style={styles.wrapper}
      >
        <div style={styles.leftPanel}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.35 }}
            style={{
              ...styles.brandCard,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadow,
              backdropFilter: theme.glass,
              WebkitBackdropFilter: theme.glass,
              borderRadius: theme.radius,
            }}
          >
            <div style={styles.brandBadge}>🎓 REHANVERSE</div>

            <h1 style={{ ...styles.heroTitle, color: theme.primary }}>
              Welcome back to your learning space.
            </h1>

            <p style={{ ...styles.heroText, color: theme.textSecondary }}>
              Continue your courses, access notes, watch videos, and stay focused with a clean student-first platform.
            </p>

            <div style={styles.points}>
              {[
                'Secure course access',
                'Organized notes and PDFs',
                'Clean learning dashboard',
                'Email OTP login protection',
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    ...styles.point,
                    background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                    border: `1px solid ${theme.border}`,
                    color: theme.textSecondary,
                  }}
                >
                  <span>✅</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, duration: 0.35, ease: 'easeOut' }}
          style={{
            ...styles.card,
            background: theme.card,
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadowHover,
            backdropFilter: theme.glass,
            WebkitBackdropFilter: theme.glass,
            borderRadius: theme.radius,
          }}
        >
          <div style={styles.cardHeader}>
            <div
              style={{
                ...styles.iconBox,
                background: theme.isDark ? 'rgba(167,139,250,0.12)' : 'rgba(124,58,237,0.10)',
                border: `1px solid ${theme.border}`,
              }}
            >
              {otpSent ? '📩' : '🔐'}
            </div>

            <h2 style={{ ...styles.title, color: theme.primary }}>
              {otpSent ? 'Verify Login OTP 📩' : 'Welcome Back 👋'}
            </h2>

            <p style={{ ...styles.subtitle, color: theme.muted }}>
              {otpSent ? 'Enter OTP sent to your email' : 'Login and get back to REHANVERSE'}
            </p>
          </div>

          <div style={styles.formArea}>
            {!otpSent ? (
              <>
                <label style={{ ...styles.label, color: theme.textSecondary }}>Email Address</label>
                <input
                  style={{
                    ...styles.input,
                    background: theme.isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.82)',
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                  }}
                  placeholder="Enter your email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onKeyDown={handleKeyDown}
                />

                <label style={{ ...styles.label, color: theme.textSecondary }}>Password</label>
                <div style={styles.passwordWrap}>
                  <input
                    style={{
                      ...styles.input,
                      ...styles.passwordInput,
                      background: theme.isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.82)',
                      color: theme.text,
                      border: `1px solid ${theme.border}`,
                    }}
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    onKeyDown={handleKeyDown}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{
                      ...styles.eyeBtn,
                      color: theme.primary,
                    }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.018, y: loading ? 0 : -1 }}
                  whileTap={{ scale: loading ? 1 : 0.985 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  style={{
                    ...styles.btn,
                    background: loading ? theme.muted : theme.primary,
                    color: theme.buttonText,
                    boxShadow: `0 0 20px ${theme.primary}45`,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Sending OTP...' : 'Send Login OTP ✉️'}
                </motion.button>
              </>
            ) : (
              <>
                <div
                  style={{
                    ...styles.otpInfoBox,
                    background: theme.isDark ? 'rgba(124,58,237,0.10)' : '#f5f3ff',
                    border: `1px solid ${theme.border}`,
                    color: theme.textSecondary,
                  }}
                >
                  <div style={{ fontWeight: 950, color: theme.text, marginBottom: '5px' }}>
                    OTP sent to:
                  </div>
                  <div style={{ wordBreak: 'break-all', fontWeight: 850 }}>
                    {verifiedEmail}
                  </div>
                </div>

                <label style={{ ...styles.label, color: theme.textSecondary }}>Enter OTP</label>
                <input
                  style={{
                    ...styles.input,
                    ...styles.otpInput,
                    background: theme.isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.82)',
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                  }}
                  placeholder="6 digit OTP"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={handleKeyDown}
                />

                <motion.button
                  whileHover={{ scale: verifyLoading ? 1 : 1.018, y: verifyLoading ? 0 : -1 }}
                  whileTap={{ scale: verifyLoading ? 1 : 0.985 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  style={{
                    ...styles.btn,
                    background: verifyLoading ? theme.muted : theme.primary,
                    color: theme.buttonText,
                    boxShadow: `0 0 20px ${theme.primary}45`,
                    cursor: verifyLoading ? 'not-allowed' : 'pointer',
                  }}
                  onClick={handleVerifyOtp}
                  disabled={verifyLoading}
                >
                  {verifyLoading ? 'Verifying...' : 'Verify & Login ✅'}
                </motion.button>

                <div style={styles.otpActions}>
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={loading || verifyLoading}
                    style={{
                      ...styles.linkBtn,
                      color: theme.primary,
                      opacity: loading || verifyLoading ? 0.6 : 1,
                      cursor: loading || verifyLoading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Resend OTP
                  </button>

                  <button
                    type="button"
                    onClick={editLoginDetails}
                    disabled={loading || verifyLoading}
                    style={{
                      ...styles.linkBtn,
                      color: theme.muted,
                      opacity: loading || verifyLoading ? 0.6 : 1,
                      cursor: loading || verifyLoading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Edit Login
                  </button>
                </div>
              </>
            )}

            {msg && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  ...styles.msg,
                  color: isSuccess ? theme.success : theme.danger,
                  background: isSuccess
                    ? theme.isDark
                      ? 'rgba(34, 197, 94, 0.12)'
                      : '#d1fae5'
                    : theme.isDark
                    ? 'rgba(239, 68, 68, 0.12)'
                    : '#fee2e2',
                  border: `1px solid ${
                    isSuccess
                      ? theme.isDark
                        ? 'rgba(34, 197, 94, 0.24)'
                        : '#a7f3d0'
                      : theme.isDark
                      ? 'rgba(239, 68, 68, 0.24)'
                      : '#fecaca'
                  }`,
                }}
              >
                {msg}
              </motion.p>
            )}

            <div
              style={{
                ...styles.securityStrip,
                background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                border: `1px solid ${theme.border}`,
                color: theme.muted,
              }}
            >
              <span>🛡️</span>
              <span>
                {otpSent
                  ? 'OTP verification protects your learning access.'
                  : 'Your learning access is protected.'}
              </span>
            </div>

            <p style={{ textAlign: 'center', marginTop: '18px', marginBottom: 0, color: theme.muted }}>
              No account?{' '}
              <Link
                to="/signup"
                style={{
                  color: theme.primary,
                  fontWeight: '900',
                  textDecoration: 'none',
                }}
              >
                Create account
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    padding: '46px 20px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    top: '80px',
    left: '-120px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'rgba(124, 58, 237, 0.20)',
    filter: 'blur(95px)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  glowTwo: {
    position: 'absolute',
    bottom: '60px',
    right: '-140px',
    width: '340px',
    height: '340px',
    borderRadius: '50%',
    background: 'rgba(59, 130, 246, 0.16)',
    filter: 'blur(100px)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  glowThree: {
    position: 'absolute',
    top: '45%',
    left: '42%',
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    background: 'rgba(236, 72, 153, 0.10)',
    filter: 'blur(105px)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  wrapper: {
    width: '100%',
    maxWidth: '1120px',
    display: 'grid',
    gridTemplateColumns: '1.05fr 0.95fr',
    gap: '26px',
    alignItems: 'stretch',
    position: 'relative',
    zIndex: 1,
  },
  leftPanel: {
    display: 'flex',
  },
  brandCard: {
    width: '100%',
    padding: '42px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '520px',
  },
  brandBadge: {
    width: 'fit-content',
    padding: '9px 14px',
    borderRadius: '999px',
    background: 'rgba(167, 139, 250, 0.12)',
    border: '1px solid rgba(167, 139, 250, 0.25)',
    color: '#c4b5fd',
    fontWeight: '900',
    marginBottom: '22px',
    letterSpacing: '0.5px',
  },
  heroTitle: {
    fontSize: 'clamp(34px, 4vw, 54px)',
    lineHeight: 1.08,
    margin: '0 0 18px',
    fontWeight: '950',
    letterSpacing: '-1px',
  },
  heroText: {
    fontSize: '16px',
    lineHeight: '1.8',
    margin: '0 0 26px',
    maxWidth: '560px',
  },
  points: {
    display: 'grid',
    gap: '12px',
  },
  point: {
    padding: '14px 16px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: '800',
  },
  card: {
    padding: '34px',
    width: '100%',
    maxWidth: '460px',
    justifySelf: 'end',
  },
  cardHeader: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  iconBox: {
    width: '58px',
    height: '58px',
    borderRadius: '20px',
    display: 'grid',
    placeItems: 'center',
    margin: '0 auto 16px',
    fontSize: '26px',
  },
  title: {
    marginBottom: '10px',
    marginTop: 0,
    fontSize: '32px',
    fontWeight: '950',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  formArea: {
    width: '100%',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '900',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '14px 15px',
    marginBottom: '16px',
    borderRadius: '14px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    fontWeight: '700',
  },
  passwordWrap: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: '72px',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    top: '12px',
    border: 'none',
    background: 'transparent',
    fontWeight: '900',
    cursor: 'pointer',
    fontSize: '13px',
  },
  btn: {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: '900',
    marginTop: '4px',
  },
  msg: {
    textAlign: 'center',
    marginTop: '14px',
    padding: '11px 12px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '800',
  },
  securityStrip: {
    marginTop: '16px',
    padding: '12px 14px',
    borderRadius: '14px',
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: '800',
  },
  otpInfoBox: {
    padding: '13px 14px',
    borderRadius: '14px',
    marginBottom: '16px',
    fontSize: '14px',
    lineHeight: 1.45,
  },
  otpInput: {
    textAlign: 'center',
    letterSpacing: '6px',
    fontSize: '22px',
    fontWeight: '950',
  },
  otpActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    marginTop: '14px',
  },
  linkBtn: {
    border: 'none',
    background: 'transparent',
    fontWeight: '900',
    fontSize: '13px',
    cursor: 'pointer',
  },
};

export default Login;