import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api';

function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    referralCode: '',
  });

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const safeTheme = {
    bg: theme?.bg || '#050816',
    text: theme?.text || '#ffffff',
    textSecondary: theme?.textSecondary || '#cbd5e1',
    muted: theme?.muted || '#94a3b8',
    card: theme?.card || 'rgba(15,23,42,0.82)',
    border: theme?.border || 'rgba(148,163,184,0.22)',
    shadow: theme?.shadow || '0 18px 50px rgba(0,0,0,0.35)',
    shadowHover: theme?.shadowHover || '0 22px 70px rgba(0,0,0,0.45)',
    glass: theme?.glass || 'blur(18px)',
    radius: theme?.radius || '26px',
    primary: theme?.primary || '#8b5cf6',
    buttonText: theme?.buttonText || '#ffffff',
    success: theme?.success || '#22c55e',
    danger: theme?.danger || '#ef4444',
    isDark: theme?.isDark !== false,
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ? AUTO-FILL REFERRAL FROM URL: /signup?ref=CODE
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref') || params.get('referral') || params.get('code');

    if (refCode) {
      const cleanCode = refCode
        .replace(/\s/g, '')
        .toUpperCase()
        .slice(0, 20);

      setForm((prev) => ({
        ...prev,
        referralCode: cleanCode,
      }));

      setMsg('Referral code auto-applied.');
      setTimeout(() => setMsg(''), 2500);
    }
  }, [location.search]);

  const handleSubmit = async () => {
    if (loading || verifyLoading) return;

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setMsg('Please fill all required fields.');
      return;
    }

    if (form.password.length < 6) {
      setMsg('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setMsg('');

      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        referralCode: form.referralCode.trim().toUpperCase(),
      };

      const res = await axios.post(`${API}/api/auth/signup`, payload, {
        timeout: 30000,
      });

      setVerifiedEmail(payload.email);
      setOtpSent(true);
      setOtp('');

      if (res.data?.referralApplied) {
        setMsg('OTP sent ✅ Referral code applied successfully 🎁');
      } else {
        setMsg(res.data.message || 'OTP sent to your email ✅');
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setMsg('Server response slow hai. Please try again.');
      } else {
        setMsg(err.response?.data?.message || 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (verifyLoading || loading) return;

    if (!verifiedEmail) {
      setMsg('Email missing. Please send OTP again.');
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

      const res = await axios.post(
        `${API}/api/auth/verify-signup`,
        {
          email: verifiedEmail,
          otp: otp.trim(),
        },
        {
          timeout: 30000,
        }
      );

      if (res.data?.referralRewardGiven) {
        setMsg('Account created ✅ Referral reward unlocked for inviter 🎁');
      } else {
        setMsg(res.data.message || 'Account verified successfully ✅');
      }

      setTimeout(() => navigate('/login'), 1400);
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setMsg('Server response slow hai. Please try again.');
      } else {
        setMsg(err.response?.data?.message || 'OTP verification failed.');
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  const resendOtp = async () => {
    setOtp('');
    await handleSubmit();
  };

  const editEmail = () => {
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
      msg.toLowerCase().includes('created') ||
      msg.toLowerCase().includes('sent') ||
      msg.toLowerCase().includes('verified') ||
      msg.toLowerCase().includes('applied') ||
      msg.toLowerCase().includes('unlocked') ||
      msg.includes('✅'));

  return (
    <div
      style={{
        ...styles.page(isMobile),
        background: safeTheme.bg,
        color: safeTheme.text,
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
        style={styles.wrapper(isMobile)}
      >
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.35 }}
            style={{
              ...styles.brandCard(isMobile),
              background: safeTheme.card,
              border: `1px solid ${safeTheme.border}`,
              boxShadow: safeTheme.shadow,
              backdropFilter: safeTheme.glass,
              WebkitBackdropFilter: safeTheme.glass,
              borderRadius: safeTheme.radius,
            }}
          >
            <div style={styles.brandBadge}>🚀 START LEARNING</div>

            <h1 style={{ ...styles.heroTitle(isMobile), color: safeTheme.primary }}>
              Join REHANVERSE and unlock your study space.
            </h1>

            <p style={{ ...styles.heroText(isMobile), color: safeTheme.textSecondary }}>
              Create your account to access courses, notes, PDFs, videos, certificates, and a cleaner way to learn.
            </p>

            <div style={styles.points}>
              {[
                'One account for all courses',
                'Access notes and PDFs easily',
                'Earn certificates after completion',
                'Use referral code and help friends join',
                'Email OTP verification for safer access',
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    ...styles.point,
                    background: safeTheme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                    border: `1px solid ${safeTheme.border}`,
                    color: safeTheme.textSecondary,
                  }}
                >
                  <span>✅</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            style={{
              ...styles.mobileBrand,
              background: safeTheme.card,
              border: `1px solid ${safeTheme.border}`,
              boxShadow: safeTheme.shadow,
            }}
          >
            <div style={{ color: safeTheme.primary, fontWeight: 950, fontSize: '20px' }}>
              🎓 REHANVERSE
            </div>
            <div style={{ color: safeTheme.muted, fontSize: '12.5px', fontWeight: 800, lineHeight: 1.5 }}>
              Create account with secure email OTP verification.
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, duration: 0.35, ease: 'easeOut' }}
          style={{
            ...styles.card(isMobile),
            background: safeTheme.card,
            border: `1px solid ${safeTheme.border}`,
            boxShadow: safeTheme.shadowHover,
            backdropFilter: safeTheme.glass,
            WebkitBackdropFilter: safeTheme.glass,
            borderRadius: safeTheme.radius,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={otpSent ? 'signup-otp-header' : 'signup-header'}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={styles.cardHeader(isMobile)}
            >
              <div
                style={{
                  ...styles.iconBox(isMobile),
                  background: safeTheme.isDark ? 'rgba(167,139,250,0.12)' : 'rgba(124,58,237,0.10)',
                  border: `1px solid ${safeTheme.border}`,
                }}
              >
                {otpSent ? '🔐' : '✨'}
              </div>

              <h2 style={{ ...styles.title(isMobile), color: safeTheme.primary }}>
                {otpSent ? 'Verify Email 🔐' : 'Create Account 🚀'}
              </h2>

              <p style={{ ...styles.subtitle(isMobile), color: safeTheme.muted }}>
                {otpSent ? 'Enter OTP sent to your email' : 'Become a part of REHANVERSE'}
              </p>
            </motion.div>
          </AnimatePresence>

          <div style={styles.formArea}>
            <AnimatePresence mode="wait">
              {!otpSent ? (
                <motion.div
                  key="signup-form"
                  initial={{ opacity: 0, y: 18, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -14, scale: 0.97, filter: 'blur(3px)' }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  <label style={{ ...styles.label, color: safeTheme.textSecondary }}>Full Name</label>
                  <input
                    style={{
                      ...styles.input(isMobile),
                      background: safeTheme.isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.82)',
                      color: safeTheme.text,
                      border: `1px solid ${safeTheme.border}`,
                    }}
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    onKeyDown={handleKeyDown}
                  />

                  <label style={{ ...styles.label, color: safeTheme.textSecondary }}>Email Address</label>
                  <input
                    style={{
                      ...styles.input(isMobile),
                      background: safeTheme.isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.82)',
                      color: safeTheme.text,
                      border: `1px solid ${safeTheme.border}`,
                    }}
                    placeholder="Enter your email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onKeyDown={handleKeyDown}
                  />

                  <label style={{ ...styles.label, color: safeTheme.textSecondary }}>Password</label>
                  <div style={styles.passwordWrap}>
                    <input
                      style={{
                        ...styles.input(isMobile),
                        ...styles.passwordInput,
                        background: safeTheme.isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.82)',
                        color: safeTheme.text,
                        border: `1px solid ${safeTheme.border}`,
                      }}
                      placeholder="Create a password"
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
                        color: safeTheme.primary,
                      }}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  <div
                    style={{
                      ...styles.passwordHint(isMobile),
                      color: safeTheme.muted,
                    }}
                  >
                    Use at least 6 characters for better security.
                  </div>

                  <label style={{ ...styles.label, color: safeTheme.textSecondary }}>
                    Referral Code <span style={{ color: safeTheme.muted, fontWeight: 800 }}>(Optional)</span>
                  </label>

                  <input
                    style={{
                      ...styles.input(isMobile),
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      background: safeTheme.isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.82)',
                      color: safeTheme.text,
                      border: `1px solid ${safeTheme.border}`,
                    }}
                    placeholder="Enter friend's referral code"
                    value={form.referralCode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        referralCode: e.target.value
                          .replace(/\s/g, '')
                          .toUpperCase()
                          .slice(0, 20),
                      })
                    }
                    onKeyDown={handleKeyDown}
                  />

                  <div
                    style={{
                      ...styles.referralHint(isMobile),
                      color: safeTheme.muted,
                      background: safeTheme.isDark ? 'rgba(139,92,246,0.08)' : '#f5f3ff',
                      border: `1px solid ${safeTheme.border}`,
                    }}
                  >
                    🎁 Have a friend’s code? Apply it here before OTP.
                  </div>

                  <motion.button
                    whileHover={{ scale: loading ? 1 : 1.018, y: loading ? 0 : -1 }}
                    whileTap={{ scale: loading ? 1 : 0.985 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    style={{
                      ...styles.btn(isMobile),
                      background: loading ? safeTheme.muted : safeTheme.primary,
                      color: safeTheme.buttonText,
                      boxShadow: `0 0 20px ${safeTheme.primary}45`,
                      cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP ✉️'}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="signup-otp-form"
                  initial={{ opacity: 0, y: 22, scale: 0.96, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -14, scale: 0.96, filter: 'blur(4px)' }}
                  transition={{ duration: 0.34, ease: 'easeOut' }}
                >
                  <div
                    style={{
                      ...styles.otpInfoBox(isMobile),
                      background: safeTheme.isDark ? 'rgba(124,58,237,0.10)' : '#f5f3ff',
                      border: `1px solid ${safeTheme.border}`,
                      color: safeTheme.textSecondary,
                    }}
                  >
                    <div style={{ fontWeight: 950, color: safeTheme.text, marginBottom: '5px' }}>
                      OTP sent to:
                    </div>
                    <div style={{ wordBreak: 'break-all', fontWeight: 850 }}>
                      {verifiedEmail}
                    </div>

                    {form.referralCode.trim() && (
                      <div
                        style={{
                          marginTop: '8px',
                          fontWeight: 850,
                          color: safeTheme.primary,
                          wordBreak: 'break-word',
                        }}
                      >
                        🎁 Referral applied: {form.referralCode.trim().toUpperCase()}
                      </div>
                    )}
                  </div>

                  <label style={{ ...styles.label, color: safeTheme.textSecondary }}>Enter OTP</label>
                  <input
                    style={{
                      ...styles.input(isMobile),
                      ...styles.otpInput(isMobile),
                      background: safeTheme.isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.82)',
                      color: safeTheme.text,
                      border: `1px solid ${safeTheme.border}`,
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
                      ...styles.btn(isMobile),
                      background: verifyLoading ? safeTheme.muted : safeTheme.primary,
                      color: safeTheme.buttonText,
                      boxShadow: `0 0 20px ${safeTheme.primary}45`,
                      cursor: verifyLoading ? 'not-allowed' : 'pointer',
                    }}
                    onClick={handleVerifyOtp}
                    disabled={verifyLoading}
                  >
                    {verifyLoading ? 'Verifying...' : 'Verify & Create Account ✅'}
                  </motion.button>

                  <div style={styles.otpActions}>
                    <button
                      type="button"
                      onClick={resendOtp}
                      disabled={loading || verifyLoading}
                      style={{
                        ...styles.linkBtn,
                        color: safeTheme.primary,
                        opacity: loading || verifyLoading ? 0.6 : 1,
                        cursor: loading || verifyLoading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Resend OTP
                    </button>

                    <button
                      type="button"
                      onClick={editEmail}
                      disabled={loading || verifyLoading}
                      style={{
                        ...styles.linkBtn,
                        color: safeTheme.muted,
                        opacity: loading || verifyLoading ? 0.6 : 1,
                        cursor: loading || verifyLoading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Edit Details
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {msg && (
                <motion.p
                  key={msg}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  style={{
                    ...styles.msg(isMobile),
                    color: isSuccess ? safeTheme.success : safeTheme.danger,
                    background: isSuccess
                      ? safeTheme.isDark
                        ? 'rgba(34, 197, 94, 0.12)'
                        : '#d1fae5'
                      : safeTheme.isDark
                      ? 'rgba(239, 68, 68, 0.12)'
                      : '#fee2e2',
                    border: `1px solid ${
                      isSuccess
                        ? safeTheme.isDark
                          ? 'rgba(34, 197, 94, 0.24)'
                          : '#a7f3d0'
                        : safeTheme.isDark
                        ? 'rgba(239, 68, 68, 0.24)'
                        : '#fecaca'
                    }`,
                  }}
                >
                  {msg}
                </motion.p>
              )}
            </AnimatePresence>

            <div
              style={{
                ...styles.securityStrip(isMobile),
                background: safeTheme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                border: `1px solid ${safeTheme.border}`,
                color: safeTheme.muted,
              }}
            >
              <span>🛡️</span>
              <span>
                {otpSent
                  ? 'OTP verification helps stop fake email accounts.'
                  : 'Your account helps protect your course access.'}
              </span>
            </div>

            <p style={{ textAlign: 'center', marginTop: '18px', marginBottom: 0, color: safeTheme.muted }}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: safeTheme.primary,
                  fontWeight: '900',
                  textDecoration: 'none',
                }}
              >
                Login
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

const styles = {
  page: (isMobile) => ({
    minHeight: '100vh',
    padding: isMobile ? '24px 14px 34px' : '46px 20px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: isMobile ? 'flex-start' : 'center',
    justifyContent: 'center',
  }),

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

  wrapper: (isMobile) => ({
    width: '100%',
    maxWidth: isMobile ? '460px' : '1120px',
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1.05fr 0.95fr',
    gap: isMobile ? '14px' : '26px',
    alignItems: 'stretch',
    position: 'relative',
    zIndex: 1,
  }),

  mobileBrand: {
    width: '100%',
    padding: '16px 18px',
    borderRadius: '22px',
    display: 'grid',
    gap: '5px',
  },

  brandCard: (isMobile) => ({
    width: '100%',
    padding: isMobile ? '22px' : '42px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: isMobile ? 'auto' : '560px',
  }),

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

  heroTitle: (isMobile) => ({
    fontSize: isMobile ? '30px' : 'clamp(34px, 4vw, 54px)',
    lineHeight: 1.08,
    margin: '0 0 18px',
    fontWeight: '950',
    letterSpacing: '-1px',
  }),

  heroText: (isMobile) => ({
    fontSize: isMobile ? '14px' : '16px',
    lineHeight: '1.8',
    margin: '0 0 26px',
    maxWidth: '560px',
  }),

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

  card: (isMobile) => ({
    padding: isMobile ? '22px 18px' : '34px',
    width: '100%',
    maxWidth: isMobile ? '100%' : '460px',
    justifySelf: isMobile ? 'stretch' : 'end',
    overflow: 'hidden',
  }),

  cardHeader: (isMobile) => ({
    textAlign: 'center',
    marginBottom: isMobile ? '20px' : '24px',
  }),

  iconBox: (isMobile) => ({
    width: isMobile ? '50px' : '58px',
    height: isMobile ? '50px' : '58px',
    borderRadius: isMobile ? '17px' : '20px',
    display: 'grid',
    placeItems: 'center',
    margin: '0 auto 16px',
    fontSize: isMobile ? '24px' : '26px',
  }),

  title: (isMobile) => ({
    marginBottom: '10px',
    marginTop: 0,
    fontSize: isMobile ? '25px' : '32px',
    fontWeight: '950',
    lineHeight: 1.15,
  }),

  subtitle: (isMobile) => ({
    margin: 0,
    fontSize: isMobile ? '12px' : '14px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    lineHeight: 1.4,
  }),

  formArea: {
    width: '100%',
  },

  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '900',
    marginBottom: '8px',
  },

  input: (isMobile) => ({
    width: '100%',
    padding: isMobile ? '13px 14px' : '14px 15px',
    marginBottom: '16px',
    borderRadius: '14px',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    fontWeight: '700',
  }),

  passwordWrap: {
    position: 'relative',
  },

  passwordInput: {
    paddingRight: '72px',
    marginBottom: '8px',
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

  passwordHint: (isMobile) => ({
    fontSize: isMobile ? '11.5px' : '12px',
    fontWeight: '700',
    marginBottom: '16px',
    lineHeight: 1.45,
  }),

  referralHint: (isMobile) => ({
    fontSize: isMobile ? '11.5px' : '12px',
    fontWeight: '800',
    marginBottom: '16px',
    lineHeight: 1.45,
    padding: '10px 12px',
    borderRadius: '12px',
  }),

  btn: (isMobile) => ({
    width: '100%',
    padding: isMobile ? '13px' : '14px',
    border: 'none',
    borderRadius: '14px',
    fontSize: isMobile ? '15px' : '16px',
    fontWeight: '900',
  }),

  msg: (isMobile) => ({
    textAlign: 'center',
    marginTop: '14px',
    padding: '11px 12px',
    borderRadius: '12px',
    fontSize: isMobile ? '13px' : '14px',
    fontWeight: '800',
    lineHeight: 1.45,
  }),

  securityStrip: (isMobile) => ({
    marginTop: '16px',
    padding: '12px 14px',
    borderRadius: '14px',
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    fontSize: isMobile ? '12.5px' : '13px',
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 1.45,
  }),

  otpInfoBox: (isMobile) => ({
    padding: '13px 14px',
    borderRadius: '14px',
    marginBottom: '16px',
    fontSize: isMobile ? '13px' : '14px',
    lineHeight: 1.45,
  }),

  otpInput: (isMobile) => ({
    textAlign: 'center',
    letterSpacing: isMobile ? '4px' : '6px',
    fontSize: isMobile ? '20px' : '22px',
    fontWeight: '950',
  }),

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

export default Signup;