import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Courses from './pages/Courses';
import AdminPanel from './pages/AdminPanel';
import MyCourses from './pages/MyCourses';
import Payment from './pages/Payment';
import CourseDetail from './pages/CourseDetail';
import Navbar from './components/Navbar';
import { useTheme } from './context/ThemeContext';

function App() {
  const theme = useTheme();

  return (
    <div
      style={{
        background: theme.bg,
        color: theme.text,
        minHeight: '100vh',
        transition: 'all 0.3s ease'
      }}
    >
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/payment/:courseId" element={<Payment />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/course/:id" element={<CourseDetail />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;