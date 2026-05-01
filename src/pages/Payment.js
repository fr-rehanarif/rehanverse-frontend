import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API from '../api';
import CheckoutModal from '../components/CheckoutModal';

function Payment() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    const fetchCourse = async () => {
      try {
        if (!courseId) {
          setMsg('Course ID missing!');
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API}/api/courses/${courseId}`);
        setCourse(res.data);
        setShowCheckout(true);
        setMsg('');
      } catch (err) {
        console.log('PAYMENT PAGE COURSE FETCH ERROR:', err);
        setMsg(err.response?.data?.message || 'Course load failed!');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, navigate]);

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
      <div
        style={{
          background: '#0f172a',
          border: '1px solid #312e81',
          borderRadius: '22px',
          padding: '30px',
          maxWidth: '560px',
          width: '100%',
          boxShadow: '0 0 30px rgba(99,102,241,0.15)',
        }}
      >
        <h2
          style={{
            color: '#8b5cf6',
            marginTop: 0,
            marginBottom: '10px',
          }}
        >
          Secure Checkout
        </h2>

        {loading && (
          <p style={{ color: '#cbd5e1' }}>
            Loading checkout...
          </p>
        )}

        {!loading && msg && (
          <p
            style={{
              color: '#f87171',
              fontWeight: '700',
              marginBottom: '18px',
            }}
          >
            ❌ {msg}
          </p>
        )}

        {!loading && course && (
          <>
            <p
              style={{
                color: '#cbd5e1',
                lineHeight: '1.6',
                marginBottom: '20px',
              }}
            >
              Course: <strong>{course.title}</strong>
              <br />
              QR payment, coupon code aur screenshot upload ek hi checkout
              window mein hoga.
            </p>

            <button
              onClick={() => setShowCheckout(true)}
              style={{
                padding: '14px 24px',
                borderRadius: '16px',
                border: 'none',
                background: 'linear-gradient(135deg, #22c55e, #3b82f6)',
                color: 'white',
                fontWeight: '900',
                cursor: 'pointer',
                fontSize: '16px',
                boxShadow: '0 12px 35px rgba(34,197,94,0.25)',
              }}
            >
              Buy Now / Apply Coupon
            </button>
          </>
        )}

        <p
          onClick={() => navigate(-1)}
          style={{
            marginTop: '20px',
            color: '#cbd5e1',
            cursor: 'pointer',
          }}
        >
          ← Go Back
        </p>
      </div>

      {showCheckout && course && (
        <CheckoutModal
          course={course}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}

export default Payment;