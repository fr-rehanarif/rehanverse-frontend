import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import Reveal from '../components/Reveal';
import Footer from '../components/Footer';

function Home() {
  const theme = useTheme();

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };

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
      <div style={styles.bgGlowOne} />
      <div style={styles.bgGlowTwo} />

      {/* HERO */}
      <section style={styles.section}>
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
            <motion.h1
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55 }}
              style={{ ...styles.title, color: theme.primary }}
            >
              🎓 REHANVERSE
            </motion.h1>

            <p style={{ ...styles.subtitle, color: theme.muted }}>
              Learn anything, anytime — by Rehan Arif
            </p>

            <p style={{ ...styles.description, color: theme.textSecondary }}>
              Courses, notes, videos, PDFs, and a clean learning experience — all in one place.
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
                    boxShadow: `0 0 28px ${theme.primary}66`,
                  }}
                >
                  Browse Courses 🚀
                </motion.button>
              </Link>

              <Link to="/signup" style={{ textDecoration: 'none' }}>
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
                  Join Free
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </Reveal>
      </section>

      {/* FEATURES */}
      <section style={styles.section}>
        <div style={styles.grid3}>
          {[
            {
              icon: '📚',
              title: 'Smart Courses',
              text: 'Structured learning paths made for students who want clarity, speed, and results.',
            },
            {
              icon: '🎥',
              title: 'Video Learning',
              text: 'Watch lessons with a clean interface designed to keep you focused.',
            },
            {
              icon: '📝',
              title: 'Notes & PDFs',
              text: 'Access organized notes, PDFs, and study material from one simple dashboard.',
            },
          ].map((item, index) => (
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
                <div style={styles.icon}>{item.icon}</div>
                <h3 style={{ color: theme.text, marginBottom: '10px' }}>{item.title}</h3>
                <p style={{ color: theme.muted, lineHeight: '1.7' }}>{item.text}</p>
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
              boxShadow: `0 0 40px ${theme.primary}22`,
            }}
          >
            <h2 style={{ color: theme.primary, marginTop: 0 }}>Why REHANVERSE? ✨</h2>

            <p style={{ color: theme.textSecondary, lineHeight: '1.8' }}>
              Not just another course platform. REHANVERSE is designed to simplify the way students learn.
            </p>

            <p style={{ color: theme.textSecondary, lineHeight: '1.8' }}>
              Everything you need — organized, accessible, and built for focus.
            </p>

            <p style={{ color: theme.textSecondary, lineHeight: '1.8' }}>
              Clean interface. Structured content. Real learning.
            </p>

            <p style={{ color: theme.textSecondary, lineHeight: '1.8' }}>
              This is not about selling courses. This is about building a better learning experience.
            </p>

            <p style={{ color: theme.textSecondary, lineHeight: '1.8', marginBottom: 0 }}>
              🚀 Built for students. Constantly evolving.
            </p>
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
            <h2 style={{ color: theme.text, marginTop: 0 }}>Ready to start learning? 🚀</h2>

            <p style={{ color: theme.muted, marginBottom: '24px', lineHeight: '1.7' }}>
              Join now and access your courses, notes, videos, and study content in one place.
            </p>

            <Link to="/signup" style={{ textDecoration: 'none' }}>
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
                Create Your Account
              </motion.button>
            </Link>
          </motion.div>
        </Reveal>

        {/* IMPORTANT NOTICE */}
        <Reveal delay={0.1}>
          <motion.div
            animate={{
              boxShadow: [
                '0 0 18px rgba(239, 68, 68, 0.22)',
                '0 0 34px rgba(239, 68, 68, 0.34)',
                '0 0 18px rgba(239, 68, 68, 0.22)',
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
                ? 'linear-gradient(135deg, rgba(127, 29, 29, 0.28), rgba(15, 23, 42, 0.92))'
                : 'linear-gradient(135deg, #fff1f2, #ffffff)',
              border: `1px solid ${theme.isDark ? 'rgba(248, 113, 113, 0.55)' : '#fca5a5'}`,
              color: theme.isDark ? '#fecaca' : '#7f1d1d',
            }}
          >
            <div style={styles.noticeTop}>
              <span style={styles.noticeBadge}>⚠️ STRICT NOTICE</span>
              <span style={{ color: theme.isDark ? '#fda4af' : '#b91c1c', fontWeight: 800 }}>
                Account Ban Policy
              </span>
            </div>

            <h3
              style={{
                margin: '16px 0 12px 0',
                fontSize: '1.35rem',
                fontWeight: '900',
                color: theme.isDark ? '#fecaca' : '#991b1b',
              }}
            >
              Course Material Sharing Is Strictly Prohibited
            </h3>

            <p style={styles.noticeText}>
              Any sharing, redistribution, screen recording, resale, or unauthorized forwarding of
              course materials, PDFs, videos, notes, or any premium content is strictly prohibited.
            </p>

            <p style={styles.noticeText}>
              If any user is found sharing course material in any form, their account will be
              permanently banned without warning, and access to all courses will be removed immediately.
            </p>

            <p style={styles.noticeText}>
              Users who report valid proof of reselling, leaking, or unauthorized sharing may receive
              a paid course as a reward.
            </p>

            <p style={{ ...styles.noticeText, marginBottom: 0, fontWeight: 800 }}>
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
  bgGlowOne: {
    position: 'absolute',
    top: '90px',
    left: '-120px',
    width: '280px',
    height: '280px',
    borderRadius: '50%',
    background: 'rgba(124, 58, 237, 0.24)',
    filter: 'blur(90px)',
    zIndex: 0,
  },
  bgGlowTwo: {
    position: 'absolute',
    top: '620px',
    right: '-140px',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    background: 'rgba(59, 130, 246, 0.18)',
    filter: 'blur(95px)',
    zIndex: 0,
  },
  section: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '42px 20px',
    position: 'relative',
    zIndex: 1,
  },
  heroCard: {
    width: '100%',
    textAlign: 'center',
    padding: '64px 30px',
  },
  title: {
    fontSize: 'clamp(38px, 6vw, 62px)',
    fontWeight: '900',
    marginBottom: '14px',
    marginTop: 0,
    letterSpacing: '0.5px',
  },
  subtitle: {
    fontSize: '21px',
    marginBottom: '14px',
    marginTop: 0,
    fontWeight: '700',
  },
  description: {
    maxWidth: '720px',
    margin: '0 auto 34px',
    fontSize: '16px',
    lineHeight: '1.8',
  },
  buttons: {
    display: 'flex',
    gap: '18px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    padding: '14px 32px',
    border: 'none',
    borderRadius: '14px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '800',
  },
  btnSecondary: {
    padding: '14px 32px',
    borderRadius: '14px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '800',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '22px',
  },
  infoCard: {
    padding: '30px 24px',
    borderRadius: '22px',
    textAlign: 'center',
    minHeight: '210px',
  },
  icon: {
    fontSize: '38px',
    marginBottom: '12px',
  },
  bigCard: {
    padding: '36px 30px',
    borderRadius: '24px',
  },
  noticeCard: {
    padding: '30px 28px',
    borderRadius: '24px',
    marginTop: '20px',
  },
  noticeTop: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  noticeBadge: {
    padding: '7px 12px',
    borderRadius: '999px',
    background: 'rgba(239, 68, 68, 0.18)',
    fontWeight: '900',
    fontSize: '0.82rem',
    letterSpacing: '0.4px',
  },
  noticeText: {
    margin: '0 0 12px 0',
    lineHeight: '1.85',
    fontSize: '0.98rem',
  },
};

export default Home;