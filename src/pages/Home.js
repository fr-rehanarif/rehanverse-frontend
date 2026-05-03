import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import Reveal from '../components/Reveal';
import Footer from '../components/Footer';

function Home() {
  const theme = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
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
      <div style={styles.bgGlowOne} />
      <div style={styles.bgGlowTwo} />
      <div style={styles.bgGlowThree} />

      {/* HERO */}
      <section style={styles.sectionHero(isMobile)}>
        <Reveal>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.45, ease: 'easeOut' }}
            style={{
              ...styles.heroCard(isMobile),
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadowHover,
              backdropFilter: theme.glass,
              WebkitBackdropFilter: theme.glass,
              borderRadius: theme.radius,
            }}
          >
            <motion.div
              style={styles.heroBadge(isMobile)}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35, ease: 'easeOut' }}
            >
              <span>⚡ Built for students</span>
              <span style={styles.badgeDot}>•</span>
              <span>Clean learning experience</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ ...styles.title(isMobile), color: theme.primary }}
            >
              🎓 REHANVERSE
            </motion.h1>

            <p style={{ ...styles.subtitle(isMobile), color: theme.muted }}>
              {user?.name ? `Welcome back, ${user.name} 👋` : 'Learn anything, anytime — by Rehan Arif'}
            </p>

            <p style={{ ...styles.description(isMobile), color: theme.textSecondary }}>
              Courses, notes, videos, PDFs, and a clean learning experience — all organized for students who want clarity, speed, and focus.
            </p>

            <div style={styles.buttons(isMobile)}>
              <Link to="/courses" style={styles.buttonLink(isMobile)}>
                <motion.button
                  whileHover={{ scale: 1.025, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  style={{
                    ...styles.btnPrimary(isMobile),
                    background: theme.primary,
                    color: theme.buttonText,
                    boxShadow: `0 0 24px ${theme.primary}55`,
                  }}
                >
                  Browse Courses 🚀
                </motion.button>
              </Link>

              <Link to={user ? '/my-courses' : '/signup'} style={styles.buttonLink(isMobile)}>
                <motion.button
                  whileHover={{ scale: 1.025, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  style={{
                    ...styles.btnSecondary(isMobile),
                    color: theme.primary,
                    border: `1.5px solid ${theme.primary}`,
                    background: theme.cardSolid,
                  }}
                >
                  {user ? 'Continue Learning' : 'Join Free'}
                </motion.button>
              </Link>
            </div>

            <div style={styles.statsRow(isMobile)}>
              {stats.map((item, index) => (
                <motion.div
                  key={item.label}
                  style={{
                    ...styles.statBox(isMobile),
                    border: `1px solid ${theme.border}`,
                    background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + index * 0.06, duration: 0.32, ease: 'easeOut' }}
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
      <section style={styles.section(isMobile)}>
        <div style={styles.quickGrid(isMobile)}>
          {quickActions.map((item, index) => (
            <Reveal delay={index * 0.06} key={item.title}>
              <Link to={item.link} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  style={{
                    ...styles.quickCard(isMobile),
                    background: theme.card,
                    border: `1px solid ${theme.border}`,
                    boxShadow: theme.shadow,
                  }}
                >
                  <div style={styles.quickIcon(isMobile)}>{item.icon}</div>

                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ ...styles.quickTitle(isMobile), color: theme.text }}>
                      {item.title}
                    </h3>

                    <p style={{ ...styles.quickText(isMobile), color: theme.muted }}>
                      {item.text}
                    </p>

                    <span style={{ color: theme.primary, fontWeight: 900, fontSize: isMobile ? '13px' : '14px' }}>
                      {item.button} →
                    </span>
                  </div>
                </motion.div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={styles.section(isMobile)}>
        <div style={styles.sectionHead}>
          <p style={{ color: theme.primary, margin: 0, fontWeight: 900 }}>FEATURES</p>
          <h2 style={{ ...styles.sectionTitle(isMobile), color: theme.text }}>
            Everything students need in one place ✨
          </h2>
        </div>

        <div style={styles.grid3(isMobile)}>
          {features.map((item, index) => (
            <Reveal delay={index * 0.06} key={item.title}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{
                  ...styles.infoCard(isMobile),
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  boxShadow: theme.shadow,
                }}
              >
                <div style={styles.cardTop}>
                  <div style={styles.icon(isMobile)}>{item.icon}</div>
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
      <section style={styles.section(isMobile)}>
        <Reveal>
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              ...styles.bigCard(isMobile),
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: `0 0 32px ${theme.primary}20`,
            }}
          >
            <div style={styles.whyLayout(isMobile)}>
              <div>
                <p style={{ color: theme.primary, margin: '0 0 8px', fontWeight: 900 }}>
                  WHY REHANVERSE
                </p>

                <h2 style={{ ...styles.sectionTitle(isMobile), color: theme.text, marginTop: 0 }}>
                  Built to make studying feel simple, not stressful ✨
                </h2>

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
                      ...styles.whyPoint(isMobile),
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
      <section style={styles.section(isMobile)}>
        <Reveal>
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              ...styles.bigCard(isMobile),
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadowHover,
              textAlign: 'center',
            }}
          >
            <p style={{ color: theme.primary, fontWeight: 900, margin: '0 0 8px' }}>
              START NOW
            </p>

            <h2 style={{ ...styles.sectionTitle(isMobile), color: theme.text, marginTop: 0 }}>
              Ready to start learning? 🚀
            </h2>

            <p style={{ color: theme.muted, marginBottom: '24px', lineHeight: '1.7' }}>
              Join now and access your courses, notes, videos, and study content in one place.
            </p>

            <Link to={user ? '/courses' : '/signup'} style={styles.buttonLink(isMobile)}>
              <motion.button
                whileHover={{ scale: 1.025, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.16 }}
                style={{
                  ...styles.btnPrimary(isMobile),
                  background: theme.primary,
                  color: theme.buttonText,
                  boxShadow: `0 0 24px ${theme.primary}55`,
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
            whileHover={{ y: -3 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              ...styles.noticeCard(isMobile),
              background: theme.isDark
                ? 'linear-gradient(135deg, rgba(127, 29, 29, 0.24), rgba(15, 23, 42, 0.92))'
                : 'linear-gradient(135deg, #fff1f2, #ffffff)',
              border: `1px solid ${theme.isDark ? 'rgba(248, 113, 113, 0.55)' : '#fca5a5'}`,
              color: theme.isDark ? '#fecaca' : '#7f1d1d',
              boxShadow: '0 0 22px rgba(239, 68, 68, 0.18)',
            }}
          >
            <div style={styles.noticeTop(isMobile)}>
              <span style={styles.noticeBadge}>⚠️ STRICT NOTICE</span>
              <span style={{ color: theme.isDark ? '#fda4af' : '#b91c1c', fontWeight: 900 }}>
                Account Ban Policy
              </span>
            </div>

            <h3
              style={{
                margin: '18px 0 12px 0',
                fontSize: isMobile ? '1.12rem' : '1.45rem',
                lineHeight: 1.35,
                fontWeight: '900',
                color: theme.isDark ? '#fecaca' : '#991b1b',
              }}
            >
              Course Material Sharing Is Strictly Prohibited
            </h3>

            <div style={styles.noticeGrid(isMobile)}>
              {[
                'No sharing, redistribution, screen recording, resale, or unauthorized forwarding.',
                'If material sharing is found, account access may be permanently removed.',
                'Users who report valid proof of leaking or reselling may receive a reward.',
              ].map((text) => (
                <div key={text} style={styles.noticeMini(isMobile)}>
                  <span>🔒</span>
                  <p style={styles.noticeText(isMobile)}>{text}</p>
                </div>
              ))}
            </div>

            <p style={{ ...styles.noticeText(isMobile), marginBottom: 0, fontWeight: 900 }}>
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
      'linear-gradient(rgba(167,139,250,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.035) 1px, transparent 1px)',
    backgroundSize: '44px 44px',
    maskImage: 'linear-gradient(to bottom, black, transparent 88%)',
    pointerEvents: 'none',
    zIndex: 0,
  },

  bgGlowOne: {
    position: 'absolute',
    top: '90px',
    left: '-120px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'rgba(124, 58, 237, 0.22)',
    filter: 'blur(95px)',
    zIndex: 0,
    pointerEvents: 'none',
  },

  bgGlowTwo: {
    position: 'absolute',
    top: '650px',
    right: '-140px',
    width: '330px',
    height: '330px',
    borderRadius: '50%',
    background: 'rgba(59, 130, 246, 0.16)',
    filter: 'blur(100px)',
    zIndex: 0,
    pointerEvents: 'none',
  },

  bgGlowThree: {
    position: 'absolute',
    top: '260px',
    left: '42%',
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    background: 'rgba(236, 72, 153, 0.12)',
    filter: 'blur(105px)',
    zIndex: 0,
    pointerEvents: 'none',
  },

  sectionHero: (isMobile) => ({
    maxWidth: '1200px',
    margin: '0 auto',
    padding: isMobile ? '28px 14px 22px' : '48px 20px 36px',
    position: 'relative',
    zIndex: 1,
    width: '100%',
  }),

  section: (isMobile) => ({
    maxWidth: '1200px',
    margin: '0 auto',
    padding: isMobile ? '20px 14px' : '34px 20px',
    position: 'relative',
    zIndex: 1,
    width: '100%',
  }),

  heroCard: (isMobile) => ({
    width: '100%',
    textAlign: 'center',
    padding: isMobile ? '36px 16px 24px' : '64px 30px 38px',
    position: 'relative',
    overflow: 'hidden',
  }),

  heroBadge: (isMobile) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isMobile ? '5px' : '8px',
    padding: isMobile ? '8px 10px' : '9px 14px',
    borderRadius: '999px',
    background: 'rgba(167, 139, 250, 0.12)',
    color: '#c4b5fd',
    fontWeight: 900,
    fontSize: isMobile ? '0.68rem' : '0.9rem',
    marginBottom: isMobile ? '16px' : '20px',
    border: '1px solid rgba(167, 139, 250, 0.25)',
    flexWrap: isMobile ? 'wrap' : 'nowrap',
    maxWidth: '100%',
  }),

  badgeDot: {
    opacity: 0.7,
  },

  title: (isMobile) => ({
    fontSize: isMobile ? 'clamp(28px, 8vw, 42px)' : 'clamp(42px, 6.5vw, 72px)',
    fontWeight: '950',
    marginBottom: isMobile ? '10px' : '14px',
    marginTop: 0,
    letterSpacing: isMobile ? '0.2px' : '0.5px',
    textShadow: '0 0 22px rgba(167, 139, 250, 0.22)',
    lineHeight: 1.1,
    wordBreak: 'normal',
  }),

  subtitle: (isMobile) => ({
    fontSize: isMobile ? '15px' : '22px',
    marginBottom: isMobile ? '10px' : '14px',
    marginTop: 0,
    fontWeight: '800',
    lineHeight: 1.45,
  }),

  description: (isMobile) => ({
    maxWidth: '760px',
    margin: isMobile ? '0 auto 22px' : '0 auto 34px',
    fontSize: isMobile ? '13.5px' : '17px',
    lineHeight: isMobile ? '1.65' : '1.8',
  }),

  buttons: (isMobile) => ({
    display: 'flex',
    gap: isMobile ? '12px' : '18px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    width: '100%',
  }),

  buttonLink: (isMobile) => ({
    textDecoration: 'none',
    width: isMobile ? '100%' : 'auto',
    maxWidth: isMobile ? '280px' : 'none',
  }),

  btnPrimary: (isMobile) => ({
    width: isMobile ? '100%' : 'auto',
    padding: isMobile ? '13px 20px' : '15px 34px',
    border: 'none',
    borderRadius: '15px',
    fontSize: isMobile ? '14px' : '16px',
    cursor: 'pointer',
    fontWeight: '900',
  }),

  btnSecondary: (isMobile) => ({
    width: isMobile ? '100%' : 'auto',
    padding: isMobile ? '13px 20px' : '15px 34px',
    borderRadius: '15px',
    fontSize: isMobile ? '14px' : '16px',
    cursor: 'pointer',
    fontWeight: '900',
  }),

  statsRow: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? 'repeat(3, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: isMobile ? '8px' : '14px',
    maxWidth: '650px',
    margin: isMobile ? '24px auto 0' : '34px auto 0',
    width: '100%',
  }),

  statBox: (isMobile) => ({
    padding: isMobile ? '11px 8px' : '14px 12px',
    borderRadius: isMobile ? '14px' : '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: isMobile ? '11px' : '14px',
    minWidth: 0,
  }),

  quickGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
    gap: isMobile ? '14px' : '18px',
    width: '100%',
  }),

  quickCard: (isMobile) => ({
    padding: isMobile ? '18px' : '24px',
    borderRadius: isMobile ? '20px' : '24px',
    minHeight: isMobile ? 'auto' : '160px',
    display: 'flex',
    gap: isMobile ? '12px' : '16px',
    alignItems: 'flex-start',
    width: '100%',
    overflow: 'hidden',
  }),

  quickIcon: (isMobile) => ({
    width: isMobile ? '44px' : '52px',
    height: isMobile ? '44px' : '52px',
    borderRadius: isMobile ? '15px' : '18px',
    display: 'grid',
    placeItems: 'center',
    fontSize: isMobile ? '22px' : '26px',
    background: 'rgba(167, 139, 250, 0.12)',
    border: '1px solid rgba(167, 139, 250, 0.22)',
    flex: '0 0 auto',
  }),

  quickTitle: (isMobile) => ({
    margin: '0 0 8px',
    fontSize: isMobile ? '16px' : '18px',
    lineHeight: 1.25,
  }),

  quickText: (isMobile) => ({
    margin: '0 0 12px',
    lineHeight: '1.6',
    fontSize: isMobile ? '13px' : '14px',
  }),

  sectionHead: {
    textAlign: 'center',
    marginBottom: '24px',
  },

  sectionTitle: (isMobile) => ({
    margin: '8px 0 0',
    fontSize: isMobile ? '24px' : '32px',
    lineHeight: 1.2,
  }),

  grid3: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: isMobile ? '14px' : '22px',
    width: '100%',
  }),

  infoCard: (isMobile) => ({
    padding: isMobile ? '20px 18px' : '28px 24px',
    borderRadius: isMobile ? '20px' : '24px',
    minHeight: isMobile ? 'auto' : '230px',
  }),

  cardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    gap: '10px',
  },

  icon: (isMobile) => ({
    width: isMobile ? '50px' : '58px',
    height: isMobile ? '50px' : '58px',
    display: 'grid',
    placeItems: 'center',
    fontSize: isMobile ? '28px' : '34px',
    borderRadius: '20px',
    background: 'rgba(167, 139, 250, 0.11)',
    border: '1px solid rgba(167, 139, 250, 0.20)',
    flex: '0 0 auto',
  }),

  cardTag: {
    padding: '7px 10px',
    borderRadius: '999px',
    fontSize: '0.78rem',
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },

  bigCard: (isMobile) => ({
    padding: isMobile ? '24px 18px' : '38px 32px',
    borderRadius: isMobile ? '22px' : '26px',
    width: '100%',
    overflow: 'hidden',
  }),

  whyLayout: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1.35fr 0.85fr',
    gap: isMobile ? '20px' : '28px',
    alignItems: 'center',
  }),

  whyPoints: {
    display: 'grid',
    gap: '12px',
  },

  whyPoint: (isMobile) => ({
    padding: isMobile ? '13px 12px' : '14px 14px',
    borderRadius: '16px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    fontWeight: 800,
    fontSize: isMobile ? '13px' : '14px',
    lineHeight: 1.45,
  }),

  noticeCard: (isMobile) => ({
    padding: isMobile ? '22px 16px' : '30px 28px',
    borderRadius: isMobile ? '20px' : '24px',
    marginTop: '22px',
    width: '100%',
    overflow: 'hidden',
  }),

  noticeTop: (isMobile) => ({
    display: 'flex',
    gap: isMobile ? '8px' : '12px',
    alignItems: 'center',
    justifyContent: isMobile ? 'flex-start' : 'space-between',
    flexWrap: 'wrap',
  }),

  noticeBadge: {
    padding: '8px 13px',
    borderRadius: '999px',
    background: 'rgba(239, 68, 68, 0.18)',
    fontWeight: '900',
    fontSize: '0.82rem',
    letterSpacing: '0.4px',
  },

  noticeGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '14px',
    margin: '18px 0',
  }),

  noticeMini: (isMobile) => ({
    padding: isMobile ? '13px 12px' : '14px',
    borderRadius: '16px',
    background: 'rgba(0,0,0,0.12)',
    border: '1px solid rgba(248,113,113,0.22)',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  }),

  noticeText: (isMobile) => ({
    margin: '0',
    lineHeight: '1.7',
    fontSize: isMobile ? '0.88rem' : '0.98rem',
  }),
};

export default Home;