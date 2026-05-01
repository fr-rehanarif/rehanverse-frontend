import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import NotificationBell from './NotificationBell';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const theme = useTheme();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
      <motion.div whileHover={{ scale: 1.05 }}>
        <Link to="/" style={{ ...styles.logo, color: theme.primary }}>
          🎓 REHANVERSE
        </Link>
      </motion.div>

      <div style={styles.links}>
        <motion.div whileHover={{ y: -2 }}>
          <Link to="/courses" style={{ ...styles.link, color: theme.text }}>
            Courses
          </Link>
        </motion.div>

        {user && user.role === 'admin' && (
          <motion.div whileHover={{ y: -2 }}>
            <Link
              to="/admin"
              style={{
                ...styles.link,
                color: theme.primary,
                fontWeight: '600',
              }}
            >
              ⚙️ Admin
            </Link>
          </motion.div>
        )}

        <select
          value={theme.themeName}
          onChange={(e) => theme.setTheme(e.target.value)}
          style={{
            ...styles.select,
            background: theme.card,
            color: theme.text,
            border: `1px solid ${theme.border}`,
            boxShadow: theme.glow,
            backdropFilter: theme.glass,
            WebkitBackdropFilter: theme.glass,
          }}
        >
          {allThemes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.icon} {item.name}
            </option>
          ))}
        </select>

        {user && (
          <motion.div whileHover={{ y: -2 }}>
            <Link
              to="/my-courses"
              style={{ ...styles.link, color: theme.text }}
            >
              🎒 My Courses
            </Link>
          </motion.div>
        )}

        {user ? (
          <>
            <NotificationBell theme={theme} />

            <motion.div whileHover={{ y: -2 }}>
              <Link
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textDecoration: 'none',
                }}
              >
                {user.photo ? (
                  <img
                    src={user.photo}
                    alt="profile"
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: `2px solid ${theme.primary}`,
                      boxShadow: theme.shadow,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: theme.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.buttonText,
                      fontWeight: '700',
                      fontSize: '14px',
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}

                <span
                  style={{
                    color: theme.primary,
                    fontWeight: '600',
                    fontSize: '14px',
                  }}
                >
                  {user.name}
                </span>
              </Link>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              style={{
                ...styles.btn,
                background: theme.primary,
                color: theme.buttonText,
                boxShadow: theme.shadow,
              }}
            >
              Logout
            </motion.button>
          </>
        ) : (
          <>
            <motion.div whileHover={{ y: -2 }}>
              <Link to="/login" style={{ ...styles.link, color: theme.text }}>
                Login
              </Link>
            </motion.div>

            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  ...styles.btn,
                  background: theme.primary,
                  color: theme.buttonText,
                  boxShadow: theme.shadow,
                }}
              >
                Sign Up
              </motion.button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 40px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: '22px',
    fontWeight: 'bold',
    textDecoration: 'none',
    letterSpacing: '1px',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  link: {
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
  },
  btn: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  select: {
    padding: '10px 14px',
    borderRadius: '14px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    outline: 'none',
    minWidth: '210px',
  },
};

export default Navbar;