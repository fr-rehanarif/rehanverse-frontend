import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import NotificationBell from './NotificationBell';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 900);
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);

    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMenuOpen(false);
    navigate('/login');
  };

  const allThemes =
    theme.themeOptions && Array.isArray(theme.themeOptions)
      ? theme.themeOptions
      : [
          { id: 'cosmicDark', icon: '🌌', name: 'Cosmic Dark' },
          { id: 'liquidGlassDark', icon: '🫧', name: 'Liquid Glass Dark' },
          { id: 'liquidGlassLight', icon: '🍏', name: 'Liquid Glass Light' },
          { id: 'cosmicGlass', icon: '🪐', name: 'Cosmic Glass' },
          { id: 'midnightMinimal', icon: '🌑', name: 'Midnight Minimal' },
          { id: 'cleanGlass', icon: '💎', name: 'Clean Glass' },
          { id: 'softPremium', icon: '☀️', name: 'Soft Premium' },
        ];

  const isActive = (path) => location.pathname === path;

  const navLinkStyle = (path, special = false) => ({
    ...styles.link,
    color: isActive(path) ? theme.primary : theme.text,
    background: isActive(path)
      ? theme.isDark
        ? 'rgba(167, 139, 250, 0.13)'
        : 'rgba(124, 58, 237, 0.10)'
      : 'transparent',
    border: isActive(path)
      ? `1px solid ${theme.border}`
      : '1px solid transparent',
    boxShadow: isActive(path) ? `0 0 18px ${theme.primary}33` : 'none',
    fontWeight: special ? 900 : 800,
  });

  const NavItems = () => (
    <>
      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
        <Link
          to="/courses"
          onClick={() => setMenuOpen(false)}
          style={navLinkStyle('/courses')}
        >
          Courses
        </Link>
      </motion.div>

      {user && user.role === 'admin' && (
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
          <Link
            to="/admin"
            onClick={() => setMenuOpen(false)}
            style={navLinkStyle('/admin', true)}
          >
            ⚙️ Admin
          </Link>
        </motion.div>
      )}

      <div
        style={{
          ...styles.themeWrap,
          background: theme.card,
          border: `1px solid ${theme.border}`,
          boxShadow: theme.glow || theme.shadow,
          backdropFilter: theme.glass,
          WebkitBackdropFilter: theme.glass,
        }}
      >
        <span style={styles.themeIcon}>🎨</span>

        <select
          value={theme.themeName}
          onChange={(e) => theme.setTheme(e.target.value)}
          style={{
            ...styles.select,
            color: theme.text,
          }}
        >
          {allThemes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.icon} {item.name}
            </option>
          ))}
        </select>
      </div>

      {user && (
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
          <Link
            to="/my-courses"
            onClick={() => setMenuOpen(false)}
            style={navLinkStyle('/my-courses')}
          >
            🎒 My Courses
          </Link>
        </motion.div>
      )}

      {user ? (
        <>
          <div style={styles.bellWrap}>
            <NotificationBell theme={theme} />
          </div>

          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              style={{
                ...styles.profilePill,
                background: theme.isDark
                  ? 'rgba(255,255,255,0.045)'
                  : 'rgba(255,255,255,0.75)',
                border: `1px solid ${theme.border}`,
                boxShadow: isActive('/profile') ? `0 0 20px ${theme.primary}35` : 'none',
              }}
            >
              {user.photo ? (
                <img
                  src={user.photo}
                  alt="profile"
                  style={{
                    ...styles.avatar,
                    border: `2px solid ${theme.primary}`,
                    boxShadow: `0 0 16px ${theme.primary}45`,
                  }}
                />
              ) : (
                <div
                  style={{
                    ...styles.avatarFallback,
                    background: theme.primary,
                    color: theme.buttonText,
                    boxShadow: `0 0 16px ${theme.primary}45`,
                  }}
                >
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}

              <span
                style={{
                  color: theme.primary,
                  fontWeight: 900,
                  fontSize: '14px',
                  maxWidth: '100px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.name || 'User'}
              </span>
            </Link>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            style={{
              ...styles.btn,
              background: theme.primary,
              color: theme.buttonText,
              boxShadow: `0 0 22px ${theme.primary}50`,
            }}
          >
            Logout
          </motion.button>
        </>
      ) : (
        <>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              style={navLinkStyle('/login')}
            >
              Login
            </Link>
          </motion.div>

          <Link to="/signup" onClick={() => setMenuOpen(false)}>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{
                ...styles.btn,
                background: theme.primary,
                color: theme.buttonText,
                boxShadow: `0 0 22px ${theme.primary}50`,
              }}
            >
              Sign Up
            </motion.button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav
      style={{
        ...styles.nav,
        background: theme.navbar,
        borderBottom: `1px solid ${theme.border}`,
        boxShadow: theme.shadow,
        backdropFilter: theme.glass,
        WebkitBackdropFilter: theme.glass,
      }}
    >
      <div style={styles.navGlow} />

      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
        <Link to="/" style={{ ...styles.logo, color: theme.primary }}>
          <span style={styles.logoIcon}>🎓</span>
          <span>REHANVERSE</span>
        </Link>
      </motion.div>

      {!isMobile && (
        <div style={styles.links}>
          <NavItems />
        </div>
      )}

      {isMobile && (
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => setMenuOpen((prev) => !prev)}
          style={{
            ...styles.menuBtn,
            color: theme.text,
            background: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </motion.button>
      )}

      <AnimatePresence>
        {isMobile && menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            style={{
              ...styles.mobileMenu,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadowHover || theme.shadow,
              backdropFilter: theme.glass,
              WebkitBackdropFilter: theme.glass,
            }}
          >
            <NavItems />
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 38px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    minHeight: '72px',
  },
  navGlow: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(circle at 20% 0%, rgba(167,139,250,0.13), transparent 34%), radial-gradient(circle at 80% 0%, rgba(59,130,246,0.10), transparent 30%)',
    pointerEvents: 'none',
    zIndex: -1,
  },
  logo: {
    fontSize: '23px',
    fontWeight: '950',
    textDecoration: 'none',
    letterSpacing: '1.2px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textShadow: '0 0 18px rgba(167,139,250,0.25)',
  },
  logoIcon: {
    fontSize: '22px',
    filter: 'drop-shadow(0 0 10px rgba(167,139,250,0.5))',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  link: {
    textDecoration: 'none',
    fontSize: '15px',
    padding: '10px 12px',
    borderRadius: '14px',
    transition: '0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
  },
  btn: {
    padding: '11px 20px',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '900',
  },
  themeWrap: {
    minWidth: '225px',
    height: '46px',
    borderRadius: '17px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 12px',
    overflow: 'hidden',
  },
  themeIcon: {
    fontSize: '16px',
    flex: '0 0 auto',
  },
  select: {
    width: '100%',
    height: '100%',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '900',
    outline: 'none',
  },
  bellWrap: {
    display: 'flex',
    alignItems: 'center',
  },
  profilePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    padding: '7px 10px 7px 7px',
    borderRadius: '999px',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  avatarFallback: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
    fontSize: '14px',
  },
  menuBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    cursor: 'pointer',
    fontSize: '22px',
    fontWeight: '900',
  },
  mobileMenu: {
    position: 'absolute',
    top: '82px',
    left: '18px',
    right: '18px',
    borderRadius: '22px',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'stretch',
  },
};

export default Navbar;