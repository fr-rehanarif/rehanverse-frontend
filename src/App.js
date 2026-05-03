import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
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

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './toastTheme.css';

function GlobalSelectFix() {
  return (
    <style>
      {`
        /* ✅ Select dropdown options readable in dark theme */
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

        /* ✅ Makes browser native dropdown prefer dark UI */
        select {
          color-scheme: dark;
        }

        /* ✅ Placeholder readable in dark theme */
        input::placeholder,
        textarea::placeholder {
          color: rgba(255, 255, 255, 0.55) !important;
        }

        /* ✅ Autofill color fix for Chrome */
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
      `}
    </style>
  );
}

function App() {
  const theme = useTheme();

  const toastTheme =
    theme?.isDark === false || theme?.mode === 'light' || theme?.theme === 'light'
      ? 'light'
      : 'dark';

  return (
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

        {/* ✅ REHANVERSE Assistant Floating Chat */}
        <AssistantChat />

        {/* ✅ Top-right notifications support */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick={true}
          pauseOnHover
          draggable
          theme={toastTheme}
        />
      </BrowserRouter>
    </div>
  );
}

export default App;