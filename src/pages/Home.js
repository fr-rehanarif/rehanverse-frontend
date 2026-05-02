import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import Reveal from '../components/Reveal';
import Footer from '../components/Footer';

function Home() {
  const theme = useTheme();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };

  const features = [
    {
      icon: '📚',
      title: 'Smart Courses',
      text: 'Structured learning paths with videos, notes, PDFs, and clean access in one place.',
      tag: 'Organized',
    },
    {
      icon: '🎥',
      title: 'Video Learning',
      text: 'Watch lessons with a distraction-free interface designed for better focus.',
      tag: 'Focused',
    },
    {
      icon: '📝',
      title: 'Notes & PDFs',
      text: 'Access study material quickly without searching through messy folders again.',
      tag: 'Fast Access',
    },
  ];

  const quickActions = [
    {
      icon: '🚀',
      title: 'Browse Courses',
      text: 'Explore available learning material.',
      link: '/courses',
      button: 'Explore Now',
    },
    {
      icon: '🎒',
      title: 'My Courses',
      text: 'Continue your enrolled courses.',
      link: '/my-courses',
      button: 'Continue',
    },
    {
      icon: '🔐',
      title: 'Protected Learning',
      text: 'Secure PDFs and fair-use policy.',
      link: '/courses',
      button: 'View Courses',
    },
  ];

  const stats = [
    { number: '24/7', label: 'Access' },
    { number: 'Clean', label: 'Interface' },
    { number: 'Secure', label: 'Study Material' },
  ];

  return (
    <div
      style={{
        background: theme.bg,
        color: theme.text,
        minHeight: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={styles.bgGrid} />
      <motion.div
        style={styles.bgGlowOne}
        animate={{ x: [0, 35, 0], y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        style={styles.bgGlowTwo}
        animate={{ x: [0, -30, 0], y: [0, 28, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        style={styles.bgGlowThree}
        animate={{ opacity: [0.18, 0.34, 0.18], scale: [1, 1.08, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* HERO */}
      <section style={styles.sectionHero}>
        <Reveal>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6 }}
            style={{
              ...styles.heroCard,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadowHover,
              backdropFilter: theme.glass,
              borderRadius: theme.radius,
            }}
          >
            <motion.div
              style={styles.heroBadge}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.45 }}
            >
              <span>⚡ Built for students</span>
              <span style={styles.badgeDot}>•</span>
              <span>Clean learning experience</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55 }}
              style={{ ...styles.title, color: theme.primary }}
            >
              🎓 REHANVERSE
            </motion.h1>

            <p style={{ ...styles.subtitle, color: theme.muted }}>
              {user?.name ? `Welcome back, ${user.name} 👋` : 'Learn anything, anytime — by Rehan Arif'}
            </p>

            <p style={{ ...styles.description, color: theme.textSecondary }}>
              Courses, notes, videos, PDFs, and a clean learning experience — all organized for students who want clarity, speed, and focus.
            </p>

            <div style={styles.buttons}>
              <Link to="/courses" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    ...styles.btnPrimary,
                    background: theme.primary,
                    color: theme.buttonText,
                    boxShadow: `0 0 30px ${theme.primary}70`,
                  }}
                >
                  Browse Courses 🚀
                </motion.button>
              </Link>

              <Link to={user ? '/my-courses' : '/signup'} style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    ...styles.btnSecondary,
                    color: theme.primary,
                    border: `1.5px solid ${theme.primary}`,
                    background: theme.cardSolid,
                  }}
                >
                  {user ? 'Continue Learning' : 'Join Free'}
                </motion.button>
              </Link>
            </div>

            <div style={styles.statsRow}>
              {stats.map((item, index) => (
                <motion.div
                  key={item.label}
                  style={{
                    ...styles.statBox,
                    border: `1px solid ${theme.border}`,
                    background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                  }}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * 0.08 }}
                >
                  <strong style={{ color: theme.primary }}>{item.number}</strong>
                  <span style={{ color: theme.muted }}>{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Reveal>
      </section>

      {/* QUICK ACTIONS */}
      <section style={styles.section}>
        <div style={styles.quickGrid}>
          {quickActions.map((item, index) => (
            <Reveal delay={index * 0.08} key={item.title}>
              <Link to={item.link} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 230 }}
                  style={{
                    ...styles.quickCard,
                    background: theme.card,
                    border: `1px solid ${theme.border}`,
                    boxShadow: theme.shadow,
                  }}
                >
                  <div style={styles.quickIcon}>{item.icon}</div>
                  <div>
                    <h3 style={{ color: theme.text, margin: '0 0 8px' }}>{item.title}</h3>
                    <p style={{ color: theme.muted, margin: '0 0 16px', lineHeight: '1.6' }}>{item.text}</p>
                    <span style={{ color: theme.primary, fontWeight: 900 }}>{item.button} →</span>
                  </div>
                </motion.div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={styles.section}>
        <div style={styles.sectionHead}>
          <p style={{ color: theme.primary, margin: 0, fontWeight: 900 }}>FEATURES</p>
          <h2 style={{ color: theme.text, margin: '8px 0 0' }}>Everything students need in one place ✨</h2>
        </div>

        <div style={styles.grid3}>
          {features.map((item, index) => (
            <Reveal delay={index * 0.08} key={item.title}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 220 }}
                style={{
                  ...styles.infoCard,
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  boxShadow: theme.shadow,
                }}
              >
                <div style={styles.cardTop}>
                  <div style={styles.icon}>{item.icon}</div>
                  <span
                    style={{
                      ...styles.cardTag,
                      color: theme.primary,
                      border: `1px solid ${theme.border}`,
                      background: theme.isDark ? 'rgba(167, 139, 250, 0.10)' : 'rgba(167, 139, 250, 0.14)',
                    }}
                  >
                    {item.tag}
                  </span>
                </div>

                <h3 style={{ color: theme.text, marginBottom: '10px' }}>{item.title}</h3>
                <p style={{ color: theme.muted, lineHeight: '1.7', marginBottom: 0 }}>{item.text}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* WHY REHANVERSE */}
      <section style={styles.section}>
        <Reveal>
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.25 }}
            style={{
              ...styles.bigCard,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: `0 0 42px ${theme.primary}24`,
            }}
          >
            <div style={styles.whyLayout}>
              <div>
                <p style={{ color: theme.primary, margin: '0 0 8px', fontWeight: 900 }}>WHY REHANVERSE</p>
                <h2 style={{ color: theme.text, marginTop: 0 }}>Built to make studying feel simple, not stressful ✨</h2>

                <p style={{ color: theme.textSecondary, lineHeight: '1.8' }}>
                  REHANVERSE is designed to simplify the way students learn. Everything you need is organized, accessible, and built for focus.
                </p>

                <p style={{ color: theme.textSecondary, lineHeight: '1.8' }}>
                  Clean interface. Structured content. Real learning. This is not just about selling courses — this is about building a better learning experience.
                </p>

                <p style={{ color: theme.textSecondary, lineHeight: '1.8', marginBottom: 0, fontWeight: 800 }}>
                  🚀 Built for students. Constantly evolving.
                </p>
              </div>

              <div style={styles.whyPoints}>
                {[
                  'No messy content searching',
                  'Simple course dashboard',
                  'Secure study material',
                  'Student-first experience',
                ].map((point) => (
                  <div
                    key={point}
                    style={{
                      ...styles.whyPoint,
                      border: `1px solid ${theme.border}`,
                      background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.7)',
                      color: theme.textSecondary,
                    }}
                  >
                    <span>✅</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </Reveal>
      </section>

      {/* CTA */}
      <section style={styles.section}>
        <Reveal>
          <motion.div
            whileHover={{ scale: 1.01 }}
            style={{
              ...styles.bigCard,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadowHover,
              textAlign: 'center',
            }}
          >
            <p style={{ color: theme.primary, fontWeight: 900, margin: '0 0 8px' }}>START NOW</p>
            <h2 style={{ color: theme.text, marginTop: 0 }}>Ready to start learning? 🚀</h2>

            <p style={{ color: theme.muted, marginBottom: '24px', lineHeight: '1.7' }}>
              Join now and access your courses, notes, videos, and study content in one place.
            </p>

            <Link to={user ? '/courses' : '/signup'} style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.07, y: -2 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  ...styles.btnPrimary,
                  background: theme.primary,
                  color: theme.buttonText,
                  boxShadow: `0 0 30px ${theme.primary}66`,
                }}
              >
                {user ? 'Explore Courses' : 'Create Your Account'}
              </motion.button>
            </Link>
          </motion.div>
        </Reveal>

        {/* IMPORTANT NOTICE */}
        <Reveal delay={0.1}>
          <motion.div
            animate={{
              boxShadow: [
                '0 0 18px rgba(239, 68, 68, 0.20)',
                '0 0 34px rgba(239, 68, 68, 0.34)',
                '0 0 18px rgba(239, 68, 68, 0.20)',
              ],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              ...styles.noticeCard,
              background: theme.isDark
                ? 'linear-gradient(135deg, rgba(127, 29, 29, 0.24), rgba(15, 23, 42, 0.92))'
                : 'linear-gradient(135deg, #fff1f2, #ffffff)',
              border: `1px solid ${theme.isDark ? 'rgba(248, 113, 113, 0.55)' : '#fca5a5'}`,
              color: theme.isDark ? '#fecaca' : '#7f1d1d',
            }}
          >
            <div style={styles.noticeTop}>
              <span style={styles.noticeBadge}>⚠️ STRICT NOTICE</span>
              <span style={{ color: theme.isDark ? '#fda4af' : '#b91c1c', fontWeight: 900 }}>
                Account Ban Policy
              </span>
            </div>

            <h3
              style={{
                margin: '18px 0 12px 0',
                fontSize: '1.45rem',
                fontWeight: '900',
                color: theme.isDark ? '#fecaca' : '#991b1b',
              }}
            >
              Course Material Sharing Is Strictly Prohibited
            </h3>

            <div style={styles.noticeGrid}>
              {[
                'No sharing, redistribution, screen recording, resale, or unauthorized forwarding.',
                'If material sharing is found, account access may be permanently removed.',
                'Users who report valid proof of leaking or reselling may receive a reward.',
              ].map((text) => (
                <div key={text} style={styles.noticeMini}>
                  <span>🔒</span>
                  <p style={styles.noticeText}>{text}</p>
                </div>
              ))}
            </div>

            <p style={{ ...styles.noticeText, marginBottom: 0, fontWeight: 900 }}>
              Learn honestly. Respect the creator. Protect the platform.
            </p>
          </motion.div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}

const styles = {
  bgGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(167,139,250,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.045) 1px, transparent 1px)',
    backgroundSize: '44px 44px',
    maskImage: 'linear-gradient(to bottom, black, transparent 88%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgGlowOne: {
    position: 'absolute',
    top: '90px',
    left: '-120px',
    width: '310px',
    height: '310px',
    borderRadius: '50%',
    background: 'rgba(124, 58, 237, 0.28)',
    filter: 'blur(95px)',
    zIndex: 0,
  },
  bgGlowTwo: {
    position: 'absolute',
    top: '650px',
    right: '-140px',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'rgba(59, 130, 246, 0.20)',
    filter: 'blur(100px)',
    zIndex: 0,
  },
  bgGlowThree: {
    position: 'absolute',
    top: '260px',
    left: '42%',
    width: '240px',
    height: '240px',
    borderRadius: '50%',
    background: 'rgba(236, 72, 153, 0.16)',
    filter: 'blur(105px)',
    zIndex: 0,
  },
  sectionHero: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '48px 20px 36px',
    position: 'relative',
    zIndex: 1,
  },
  section: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '34px 20px',
    position: 'relative',
    zIndex: 1,
  },
  heroCard: {
    width: '100%',
    textAlign: 'center',
    padding: '64px 30px 38px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 14px',
    borderRadius: '999px',
    background: 'rgba(167, 139, 250, 0.12)',
    color: '#c4b5fd',
    fontWeight: 900,
    fontSize: '0.9rem',
    marginBottom: '20px',
    border: '1px solid rgba(167, 139, 250, 0.25)',
  },
  badgeDot: {
    opacity: 0.7,
  },
  title: {
    fontSize: 'clamp(42px, 6.5vw, 72px)',
    fontWeight: '950',
    marginBottom: '14px',
    marginTop: 0,
    letterSpacing: '0.5px',
    textShadow: '0 0 26px rgba(167, 139, 250, 0.25)',
  },
  subtitle: {
    fontSize: '22px',
    marginBottom: '14px',
    marginTop: 0,
    fontWeight: '800',
  },
  description: {
    maxWidth: '760px',
    margin: '0 auto 34px',
    fontSize: '17px',
    lineHeight: '1.8',
  },
  buttons: {
    display: 'flex',
    gap: '18px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    padding: '15px 34px',
    border: 'none',
    borderRadius: '15px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '900',
  },
  btnSecondary: {
    padding: '15px 34px',
    borderRadius: '15px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '900',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '14px',
    maxWidth: '650px',
    margin: '34px auto 0',
  },
  statBox: {
    padding: '14px 12px',
    borderRadius: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '18px',
  },
  quickCard: {
    padding: '24px',
    borderRadius: '24px',
    minHeight: '160px',
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  quickIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '18px',
    display: 'grid',
    placeItems: 'center',
    fontSize: '26px',
    background: 'rgba(167, 139, 250, 0.12)',
    border: '1px solid rgba(167, 139, 250, 0.22)',
    flex: '0 0 auto',
  },
  sectionHead: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '22px',
  },
  infoCard: {
    padding: '28px 24px',
    borderRadius: '24px',
    minHeight: '230px',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  icon: {
    width: '58px',
    height: '58px',
    display: 'grid',
    placeItems: 'center',
    fontSize: '34px',
    borderRadius: '20px',
    background: 'rgba(167, 139, 250, 0.11)',
    border: '1px solid rgba(167, 139, 250, 0.20)',
  },
  cardTag: {
    padding: '7px 10px',
    borderRadius: '999px',
    fontSize: '0.78rem',
    fontWeight: 900,
  },
  bigCard: {
    padding: '38px 32px',
    borderRadius: '26px',
  },
  whyLayout: {
    display: 'grid',
    gridTemplateColumns: '1.35fr 0.85fr',
    gap: '28px',
    alignItems: 'center',
  },
  whyPoints: {
    display: 'grid',
    gap: '12px',
  },
  whyPoint: {
    padding: '14px 14px',
    borderRadius: '16px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    fontWeight: 800,
  },
  noticeCard: {
    padding: '30px 28px',
    borderRadius: '24px',
    marginTop: '22px',
  },
  noticeTop: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  noticeBadge: {
    padding: '8px 13px',
    borderRadius: '999px',
    background: 'rgba(239, 68, 68, 0.18)',
    fontWeight: '900',
    fontSize: '0.82rem',
    letterSpacing: '0.4px',
  },
  noticeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '14px',
    margin: '18px 0',
  },
  noticeMini: {
    padding: '14px',
    borderRadius: '16px',
    background: 'rgba(0,0,0,0.12)',
    border: '1px solid rgba(248,113,113,0.22)',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  noticeText: {
    margin: '0',
    lineHeight: '1.75',
    fontSize: '0.98rem',
  },
};

export default Home;