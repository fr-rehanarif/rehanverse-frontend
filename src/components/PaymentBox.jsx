import { useEffect, useState } from 'react';
import axios from 'axios';
import API from '../api';
import CheckoutModal from './CheckoutModal';

function PaymentBox({ courseId, course: courseProp }) {
  const [course, setCourse] = useState(courseProp || null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(!courseProp);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (courseProp) {
          setCourse(courseProp);
          setLoading(false);
          return;
        }

        if (!courseId) {
          setError('Course ID missing');
          setLoading(false);
          return;
        }

        setLoading(true);

        const res = await axios.get(`${API}/api/courses/${courseId}`);
        setCourse(res.data);
        setError('');
      } catch (err) {
        console.log('PAYMENTBOX COURSE FETCH ERROR:', err);
        setError(err.response?.data?.message || 'Course load failed');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, courseProp]);

  const goToCourse = () => {
    const finalCourseId = course?._id || courseId;

    if (finalCourseId) {
      window.location.href = `/courses/${finalCourseId}`;
    } else {
      window.location.href = '/courses';
    }
  };

  return (
    <div
      style={{
        marginTop: '20px',
        padding: '22px',
        borderRadius: '18px',
        background: '#0f172a',
        color: '#fff',
        border: '1px solid rgba(139,92,246,0.35)',
        textAlign: 'center',
        boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#a78bfa' }}>
        🔐 Secure Checkout
      </h3>

      <p style={{ color: '#cbd5e1', lineHeight: '1.6', marginBottom: '18px' }}>
        QR payment, coupon code aur screenshot upload ab ek hi checkout window mein hai.
      </p>

      {loading && (
        <p style={{ color: '#94a3b8', marginBottom: '14px' }}>
          Loading checkout...
        </p>
      )}

      {error && (
        <p style={{ color: '#f87171', marginBottom: '14px', fontWeight: '700' }}>
          {error}
        </p>
      )}

      <button
        onClick={() => setShowCheckout(true)}
        disabled={loading || !course}
        style={{
          padding: '14px 24px',
          borderRadius: '16px',
          border: 'none',
          background: 'linear-gradient(135deg, #22c55e, #3b82f6)',
          color: 'white',
          fontWeight: '900',
          cursor: loading || !course ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          opacity: loading || !course ? 0.65 : 1,
          boxShadow: '0 12px 35px rgba(34,197,94,0.25)',
        }}
      >
        Buy Now / Apply Coupon
      </button>

      {showCheckout && course && (
        <CheckoutModal
          course={course}
          onClose={() => setShowCheckout(false)}
          onSuccess={goToCourse}
        />
      )}
    </div>
  );
}

export default PaymentBox;