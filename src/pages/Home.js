import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import Reveal from '../components/Reveal';
import Footer from '../components/Footer';

function Home() {
  const theme = useTheme();

  return (
    <div
      style={{
        background: theme.bg,
        color: theme.text,
        minHeight: '100vh',
      }}
    >
      {/* HERO */}
      <section style={styles.section}>
        <Reveal>
          <div
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
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              style={{ ...styles.title, color: theme.primary }}
            >
              🎓 REHANVERSE
            </motion.h1>

            <p style={{ ...styles.subtitle, color: theme.muted }}>
              Learn anything, anytime — by Rehan
            </p>

            <p style={{ ...styles.description, color: theme.textSecondary }}>
              Courses, notes, videos, and a clean learning experience — all in one place.
            </p>

            <div style={styles.buttons}>
              <Link to="/courses" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    ...styles.btnPrimary,
                    background: theme.primary,
                    color: theme.buttonText,
                    boxShadow: theme.shadow,
                  }}
                >
                  Browse Courses
                </motion.button>
              </Link>

              <Link to="/signup" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
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
          </div>
        </Reveal>
      </section>

      {/* FEATURES */}
      <section style={styles.section}>
        <div style={styles.grid3}>
          <Reveal delay={0.05}>
            <div
              style={{
                ...styles.infoCard,
                background: theme.card,
                border: `1px solid ${theme.border}`,
                boxShadow: theme.shadow,
              }}
            >
              <div style={styles.icon}>📚</div>
              <h3 style={{ color: theme.text }}>Smart Courses</h3>
              <p style={{ color: theme.muted }}>
                Structured learning paths for students and self-learners.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div
              style={{
                ...styles.infoCard,
                background: theme.card,
                border: `1px solid ${theme.border}`,
                boxShadow: theme.shadow,
              }}
            >
              <div style={styles.icon}>🎥</div>
              <h3 style={{ color: theme.text }}>Video Learning</h3>
              <p style={{ color: theme.muted }}>
                Easy video-based understanding with a clean study interface.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div
              style={{
                ...styles.infoCard,
                background: theme.card,
                border: `1px solid ${theme.border}`,
                boxShadow: theme.shadow,
              }}
            >
              <div style={styles.icon}>📝</div>
              <h3 style={{ color: theme.text }}>Notes & PDFs</h3>
              <p style={{ color: theme.muted }}>
                All your notes and course material in one organized place.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* WHY REHANVERSE */}
      <section style={styles.section}>
        <Reveal>
          <div
            style={{
              ...styles.bigCard,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadowHover,
            }}
          >
            <h2 style={{ color: theme.primary, marginTop: 0 }}>Why REHANVERSE? ✨</h2>
            <p style={{ color: theme.textSecondary, lineHeight: '1.8' }}>
              REHANVERSE ko banaya hi aise bande ne hai jo trusted Ho 
              sabkuch ek jagah mil jayega but 39₹ mein PER unit 
              free ka backend server nhi chal rha hai mera ...
              Is backend SERVER ke 5$ har mahine jaa rhe 
              Ao bas WEB-APP enjoy karo bas..
              Good 2 Go
            </p>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section style={styles.section}>
        <Reveal>
          <div
            style={{
              ...styles.bigCard,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadowHover,
              textAlign: 'center',
            }}
          >
            <h2 style={{ color: theme.text, marginTop: 0 }}>Ready to start learning? 🚀</h2>
            <p style={{ color: theme.muted, marginBottom: '24px' }}>
              Join now and access your courses, notes, and study content in one place.
            </p>

            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  ...styles.btnPrimary,
                  background: theme.primary,
                  color: theme.buttonText,
                  boxShadow: theme.shadow,
                }}
              >
                Create Your Account
              </motion.button>
            </Link>
          </div>
        {/* 🚨 STRICT NOTICE */}
<div
  style={{
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  }}
>
  <div
    style={{
      background: theme.isDark
        ? 'rgba(127, 29, 29, 0.25)'
        : '#fef2f2',
      border: `1px solid ${
        theme.isDark ? 'rgba(239, 68, 68, 0.5)' : '#fca5a5'
      }`,
      color: theme.isDark ? '#fecaca' : '#991b1b',
      padding: '18px 22px',
      borderRadius: '16px',
      boxShadow: theme.shadow,
      marginBottom: '30px',
    }}
  >
    <h3
      style={{
        margin: '0 0 8px 0',
        fontSize: '1.1rem',
        fontWeight: '800',
        color: theme.isDark ? '#fda4af' : '#b91c1c',
      }}
    >
      ⚠️ IMPORTANT NOTICE
    </h3>

    <p
      style={{
        margin: 0,
        lineHeight: '1.7',
        fontSize: '0.95rem',
      }}
    >
      Any sharing, redistribution, screen recording, resale, or unauthorized
      forwarding of course materials, PDFs, videos, notes, or any premium
      content is strictly prohibited. If any user is found sharing course
      material in any form, their account will be permanently banned without
      warning and access to all courses will be removed immediately.
    </p>
  </div>
</div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}

const styles = {
  section: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  heroCard: {
    width: '100%',
    textAlign: 'center',
    padding: '56px 28px',
  },
  title: {
    fontSize: '52px',
    fontWeight: '800',
    marginBottom: '14px',
    marginTop: 0,
    letterSpacing: '0.5px',
  },
  subtitle: {
    fontSize: '21px',
    marginBottom: '14px',
    marginTop: 0,
    fontWeight: '600',
  },
  description: {
    maxWidth: '680px',
    margin: '0 auto 34px',
    fontSize: '16px',
    lineHeight: '1.7',
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
    borderRadius: '12px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  btnSecondary: {
    padding: '14px 32px',
    borderRadius: '12px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '20px',
  },
  infoCard: {
    padding: '28px 22px',
    borderRadius: '18px',
    textAlign: 'center',
  },
  icon: {
    fontSize: '34px',
    marginBottom: '12px',
  },
  bigCard: {
    padding: '34px 28px',
    borderRadius: '20px',
  },
};

export default Home;