import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API from '../api';
import CheckoutModal from '../components/CheckoutModal';

function Payment() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchCourseAndCheckEnrollment = async () => {
      try {
        if (!courseId) {
          setMsg('Course ID missing!');
          setLoading(false);
          return;
        }

        // ✅ 1. Course fetch
        const courseRes = await axios.get(`${API}/api/courses/${courseId}`);
        const courseData = courseRes.data;
        setCourse(courseData);

        // ✅ 2. User enrolled courses check
        const enrolledRes = await axios.get(`${API}/api/enroll/my/courses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const alreadyEnrolled = enrolledRes.data.some(
          (c) => c._id?.toString() === courseId.toString()
        );

        // ✅ 3. Agar already enrolled hai to payment modal nahi, direct course page
        if (alreadyEnrolled) {
          navigate(`/courses/${courseId}`, { replace: true });
          return;
        }

        setMsg('');
      } catch (err) {
        console.log('PAYMENT PAGE COURSE/ENROLLMENT CHECK ERROR:', err);
        setMsg(err.response?.data?.message || 'Course load failed!');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndCheckEnrollment();
  }, [courseId, navigate]);

  const goToCourse = () => {
    if (course?._id) {
      navigate(`/courses/${course._id}`, { replace: true });
    } else if (courseId) {
      navigate(`/courses/${courseId}`, { replace: true });
    } else {
      navigate('/courses', { replace: true });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#020617',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        color: '#fff',
        textAlign: 'center',
      }}
    >
      {loading && (
        <div
          style={{
            background: '#0f172a',
            border: '1px solid #312e81',
            borderRadius: '22px',
            padding: '30px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 0 30px rgba(99,102,241,0.15)',
          }}
        >
          <h2 style={{ color: '#8b5cf6', marginTop: 0 }}>
            Checking Enrollment...
          </h2>

          <p style={{ color: '#cbd5e1', marginBottom: 0 }}>
            Please wait, course access check ho raha hai.
          </p>
        </div>
      )}

      {!loading && msg && (
        <div
          style={{
            background: '#0f172a',
            border: '1px solid #7f1d1d',
            borderRadius: '22px',
            padding: '30px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 0 30px rgba(239,68,68,0.15)',
          }}
        >
          <h2 style={{ color: '#f87171', marginTop: 0 }}>Checkout Error</h2>

          <p style={{ color: '#fecaca' }}>❌ {msg}</p>

          <button
            onClick={() => navigate('/courses', { replace: true })}
            style={{
              marginTop: '14px',
              padding: '12px 20px',
              borderRadius: '12px',
              border: 'none',
              background: '#8b5cf6',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: '800',
            }}
          >
            Go To Courses
          </button>
        </div>
      )}

      {!loading && !msg && course && (
        <CheckoutModal
          course={course}
          onClose={goToCourse}
          onSuccess={goToCourse}
        />
      )}
    </div>
  );
}

export default Payment;