import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import { useEffect, useState } from 'react';
import SplashScreen from './components/SplashScreen';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Courses from './pages/Courses';
import AdminPanel from './pages/AdminPanel';
import AssistantChat from './components/AssistantChat';
import MyCourses from './pages/MyCourses';
import Payment from './pages/Payment';
import CourseDetail from './pages/CourseDetail';
import Navbar from './components/Navbar';
import { useTheme } from './context/ThemeContext';
import ActivityDashboard from './pages/ActivityDashboard';
import { setupAuthErrorHandler } from './utils/authErrorHandler';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './toastTheme.css';

function GlobalSelectFix() {
  return (
    <style>
      {`
        select option {
          background-color: #111827 !important;
          color: #ffffff !important;
        }

        select option:checked {
          background-color: #8b5cf6 !important;
          color: #ffffff !important;
        }

        select option:hover {
          background-color: #7c3aed !important;
          color: #ffffff !important;
        }

        select {
          color-scheme: dark;
        }

        input::placeholder,
        textarea::placeholder {
          color: rgba(255, 255, 255, 0.55) !important;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        textarea:-webkit-autofill,
        textarea:-webkit-autofill:hover,
        textarea:-webkit-autofill:focus,
        select:-webkit-autofill,
        select:-webkit-autofill:hover,
        select:-webkit-autofill:focus {
          -webkit-text-fill-color: #ffffff !important;
          -webkit-box-shadow: 0 0 0px 1000px #111827 inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 0;
        }

        body {
          -webkit-tap-highlight-color: transparent;
        }

        img,
        video,
        iframe {
          max-width: 100%;
        }
      `}
    </style>
  );
}

function FlashPopup({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4200);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 2147483647,
        maxWidth: '380px',
        padding: '16px 18px',
        borderRadius: '18px',
        background: 'linear-gradient(135deg, rgba(127,29,29,0.96), rgba(30,41,59,0.98))',
        border: '1px solid rgba(248,113,113,0.55)',
        color: '#ffffff',
        boxShadow: '0 22px 70px rgba(0,0,0,0.45)',
        fontWeight: 900,
        fontSize: '14px',
        lineHeight: 1.5,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}
    >
      <div style={{ fontSize: '20px', lineHeight: 1 }}>⚠️</div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '15px', marginBottom: '2px' }}>
          Login Required
        </div>
        <div style={{ opacity: 0.9, fontWeight: 800 }}>
          {message}
        </div>
      </div>

      <button
        onClick={onClose}
        style={{
          border: 'none',
          background: 'rgba(255,255,255,0.12)',
          color: '#ffffff',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: 900,
          padding: '4px 8px',
        }}
      >
        ×
      </button>
    </div>
  );
}

function App() {
  const theme = useTheme();

  const [showSplash, setShowSplash] = useState(true);
  const [flashMessage, setFlashMessage] = useState('');

  // ✅ GLOBAL AUTH ERROR HANDLER
  useEffect(() => {
    setupAuthErrorHandler();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5300);

    return () => clearTimeout(timer);
  }, []);

  // ✅ GUARANTEED LOGOUT POPUP AFTER SPLASH
  useEffect(() => {
    if (showSplash) return;

    const msg = localStorage.getItem('auth_flash_message');

    if (msg) {
      localStorage.removeItem('auth_flash_message');

      setTimeout(() => {
        setFlashMessage(msg);
      }, 300);
    }
  }, [showSplash]);

  const toastTheme =
    theme?.isDark === false || theme?.mode === 'light' || theme?.theme === 'light'
      ? 'light'
      : 'dark';

  return (
    <>
      {showSplash && <SplashScreen />}

      <FlashPopup
        message={flashMessage}
        onClose={() => setFlashMessage('')}
      />

      <div
        style={{
          background: theme.bg,
          color: theme.text,
          minHeight: '100vh',
          transition: 'all 0.3s ease',
        }}
      >
        <GlobalSelectFix />

        <BrowserRouter>
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/admin/activity" element={<ActivityDashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/payment/:courseId" element={<Payment />} />
            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
          </Routes>

          <AssistantChat />

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick={true}
            pauseOnHover
            draggable
            theme={toastTheme}
            style={{ zIndex: 999999 }}
          />
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;