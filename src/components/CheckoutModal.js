import { useState } from 'react';
import axios from 'axios';
import API from '../api';

function CheckoutModal({ course, onClose, onSuccess }) {
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const token = localStorage.getItem('token');

  const originalPrice = Number(course?.price ?? 39);
  const finalPrice = Number(couponData?.finalPrice ?? originalPrice);
  const discountAmount = Number(couponData?.discountAmount ?? 0);
  const isFreeByCoupon = couponData?.isFreeByCoupon === true || finalPrice === 0;

  const finishSuccess = (fallbackPath) => {
    if (onSuccess) {
      onSuccess();
      return;
    }

    window.location.href = fallbackPath || `/courses/${course._id}`;
  };

  const applyCoupon = async () => {
    try {
      setMessage('');
      setMessageType('');

      if (!couponCode.trim()) {
        setMessage('Please enter coupon code');
        setMessageType('error');
        return;
      }

      if (!token) {
        setMessage('Please login first to apply coupon');
        setMessageType('error');
        return;
      }

      setLoading(true);

      const res = await axios.post(
        `${API}/api/coupon/apply`,
        {
          code: couponCode.trim(),
          courseId: course._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCouponData(res.data);
      setScreenshot(null);
      setMessage(res.data.message || 'Coupon applied successfully');
      setMessageType('success');
    } catch (err) {
      setCouponData(null);
      setMessage(err.response?.data?.message || 'Invalid coupon code');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const enrollFreeWithCoupon = async () => {
    try {
      setMessage('');
      setMessageType('');

      if (!couponData?.coupon?.id) {
        setMessage('Please apply a valid free coupon first');
        setMessageType('error');
        return;
      }

      if (!token) {
        setMessage('Please login first to enroll');
        setMessageType('error');
        return;
      }

      setLoading(true);

      const res = await axios.post(
        `${API}/api/coupon/enroll-free`,
        {
          courseId: course._id,
          couponId: couponData.coupon.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message || 'Enrolled successfully');

      finishSuccess(`/courses/${course._id}`);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Enrollment failed');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const submitPaymentProof = async () => {
    try {
      setMessage('');
      setMessageType('');

      if (!token) {
        setMessage('Please login first to submit payment');
        setMessageType('error');
        return;
      }

      if (!screenshot) {
        setMessage('Please upload payment screenshot');
        setMessageType('error');
        return;
      }

      if (finalPrice <= 0) {
        setMessage('Final price is ₹0. Use direct enroll instead.');
        setMessageType('error');
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append('courseId', course._id);
      formData.append('couponCode', couponData?.coupon?.code || '');
      formData.append('screenshot', screenshot);

      const res = await axios.post(`${API}/api/payment/request`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert(res.data.message || 'Payment proof submitted successfully');

      finishSuccess(`/courses/${course._id}`);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Payment proof upload failed');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (!course) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '18px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '980px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#0f172a',
          color: '#fff',
          borderRadius: '24px',
          boxShadow: '0 30px 100px rgba(0,0,0,0.65)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '15px',
            background:
              'linear-gradient(135deg, rgba(34,197,94,0.22), rgba(59,130,246,0.18))',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '24px' }}>
              Complete Your Enrollment
            </h2>
            <p style={{ margin: '6px 0 0', color: '#cbd5e1' }}>
              {course.title}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            style={{
              minWidth: '42px',
              height: '42px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              opacity: loading ? 0.7 : 1,
            }}
          >
            ✕
          </button>
        </div>

        <div
          className="checkout-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
          }}
        >
          <div
            style={{
              padding: '28px',
              borderRight: '1px solid rgba(255,255,255,0.1)',
              background:
                'radial-gradient(circle at top left, rgba(34,197,94,0.18), transparent 42%)',
            }}
          >
            <h3 style={{ marginTop: 0, fontSize: '20px' }}>
              {isFreeByCoupon ? 'Coupon Applied' : 'Scan & Pay'}
            </h3>

            <p
              style={{
                marginTop: '6px',
                color: '#94a3b8',
                lineHeight: '1.6',
              }}
            >
              {isFreeByCoupon
                ? 'Your coupon makes this course free. No QR payment needed.'
                : 'Scan the QR and pay the final amount shown below.'}
            </p>

            {!isFreeByCoupon ? (
              <div
                style={{
                  marginTop: '20px',
                  background: '#fff',
                  borderRadius: '22px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: '0 18px 45px rgba(0,0,0,0.35)',
                }}
              >
                <img
                  src="/qr.jpeg"
                  alt="Payment QR"
                  style={{
                    width: '270px',
                    maxWidth: '100%',
                    borderRadius: '16px',
                    display: 'block',
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  marginTop: '20px',
                  minHeight: '270px',
                  borderRadius: '22px',
                  padding: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  background: 'rgba(34,197,94,0.12)',
                  border: '1px solid rgba(34,197,94,0.3)',
                }}
              >
                <div>
                  <div style={{ fontSize: '56px', marginBottom: '10px' }}>
                    🎉
                  </div>
                  <h2 style={{ margin: 0, color: '#22c55e' }}>
                    Free Access Unlocked
                  </h2>
                  <p style={{ color: '#cbd5e1', marginBottom: 0 }}>
                    Click enroll from the right side.
                  </p>
                </div>
              </div>
            )}

            <div
              style={{
                marginTop: '22px',
                padding: '18px',
                borderRadius: '18px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  color: '#cbd5e1',
                }}
              >
                <span>Original Price</span>
                <b>₹{originalPrice}</b>
              </div>

              {couponData && (
                <>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                      color: '#22c55e',
                    }}
                  >
                    <span>Coupon Applied</span>
                    <b>{couponData.coupon.code}</b>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                      color: '#cbd5e1',
                    }}
                  >
                    <span>Discount</span>
                    <b>₹{discountAmount}</b>
                  </div>
                </>
              )}

              <div
                style={{
                  height: '1px',
                  background: 'rgba(255,255,255,0.12)',
                  margin: '14px 0',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#fff',
                }}
              >
                <span style={{ fontSize: '18px', fontWeight: '700' }}>
                  Final Price
                </span>
                <span
                  style={{
                    fontSize: '28px',
                    fontWeight: '900',
                    color: '#22c55e',
                  }}
                >
                  ₹{finalPrice}
                </span>
              </div>
            </div>

            <p
              style={{
                marginTop: '16px',
                color: '#94a3b8',
                fontSize: '14px',
                lineHeight: '1.6',
              }}
            >
              {isFreeByCoupon
                ? 'Free coupon users can enroll directly without uploading any screenshot.'
                : 'After payment, upload a clear screenshot from the right side. Admin approval will unlock the course.'}
            </p>
          </div>

          <div
            style={{
              padding: '28px',
              background:
                'radial-gradient(circle at top right, rgba(59,130,246,0.15), transparent 45%)',
            }}
          >
            <h3 style={{ marginTop: 0, fontSize: '20px' }}>
              Apply Coupon Code
            </h3>

            <p
              style={{
                color: '#94a3b8',
                lineHeight: '1.6',
                marginTop: '6px',
              }}
            >
              Enter coupon code. If coupon makes this course free, you can
              enroll directly without payment screenshot.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                marginTop: '16px',
              }}
            >
              <input
                type="text"
                placeholder="Example: REHAN100"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    applyCoupon();
                  }
                }}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '14px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.16)',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  outline: 'none',
                  fontWeight: '700',
                  letterSpacing: '0.5px',
                }}
              />

              <button
                onClick={applyCoupon}
                disabled={loading}
                style={{
                  padding: '14px 18px',
                  borderRadius: '14px',
                  border: 'none',
                  background: '#22c55e',
                  color: '#fff',
                  fontWeight: '800',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.75 : 1,
                }}
              >
                {loading ? '...' : 'Apply'}
              </button>
            </div>

            {message && (
              <div
                style={{
                  marginTop: '14px',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background:
                    messageType === 'success'
                      ? 'rgba(34,197,94,0.12)'
                      : 'rgba(239,68,68,0.12)',
                  border:
                    messageType === 'success'
                      ? '1px solid rgba(34,197,94,0.25)'
                      : '1px solid rgba(239,68,68,0.25)',
                  color: messageType === 'success' ? '#22c55e' : '#f87171',
                  fontWeight: '700',
                }}
              >
                {message}
              </div>
            )}

            {isFreeByCoupon ? (
              <div
                style={{
                  marginTop: '26px',
                  padding: '22px',
                  borderRadius: '20px',
                  background: 'rgba(34,197,94,0.12)',
                  border: '1px solid rgba(34,197,94,0.32)',
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                    color: '#22c55e',
                    fontSize: '22px',
                  }}
                >
                  🎉 Course is Free Now
                </h3>

                <p
                  style={{
                    color: '#cbd5e1',
                    lineHeight: '1.6',
                  }}
                >
                  This coupon makes your final price ₹0. No QR payment and no
                  screenshot required.
                </p>

                <button
                  onClick={enrollFreeWithCoupon}
                  disabled={loading}
                  style={{
                    width: '100%',
                    marginTop: '14px',
                    padding: '15px',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: '#fff',
                    fontWeight: '900',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    opacity: loading ? 0.75 : 1,
                  }}
                >
                  {loading ? 'Enrolling...' : 'Enroll Free Now'}
                </button>
              </div>
            ) : (
              <div
                style={{
                  marginTop: '26px',
                  padding: '22px',
                  borderRadius: '20px',
                  background: 'rgba(255,255,255,0.065)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <h3 style={{ marginTop: 0, fontSize: '20px' }}>
                  Upload Payment Screenshot
                </h3>

                <p
                  style={{
                    color: '#94a3b8',
                    lineHeight: '1.6',
                    marginTop: '6px',
                  }}
                >
                  Upload screenshot after paying ₹{finalPrice}.
                </p>

                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => setScreenshot(e.target.files[0])}
                  style={{
                    width: '100%',
                    marginTop: '14px',
                    padding: '13px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    color: '#fff',
                  }}
                />

                {screenshot && (
                  <p
                    style={{
                      marginTop: '10px',
                      color: '#22c55e',
                      fontWeight: '700',
                      fontSize: '14px',
                    }}
                  >
                    Selected: {screenshot.name}
                  </p>
                )}

                <button
                  onClick={submitPaymentProof}
                  disabled={loading}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '15px',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: '#fff',
                    fontWeight: '900',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    opacity: loading ? 0.75 : 1,
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Payment Proof'}
                </button>
              </div>
            )}
          </div>
        </div>

        <style>
          {`
            @media (max-width: 800px) {
              .checkout-grid {
                grid-template-columns: 1fr !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
}

export default CheckoutModal;