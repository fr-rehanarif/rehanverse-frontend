import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Payment() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (courseId) {
      navigate(`/courses/${courseId}`, { replace: true });
    } else {
      navigate('/courses', { replace: true });
    }
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
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 0 30px rgba(99,102,241,0.15)',
        }}
      >
        <h2 style={{ color: '#8b5cf6', marginTop: 0 }}>
          Redirecting to Checkout...
        </h2>

        <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
          Payment ab new secure checkout se hoga — QR, coupon code aur screenshot upload ek hi window mein.
        </p>
      </div>
    </div>
  );
}

export default Payment;