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

      setMessage(res.data.message || 'Enrolled successfully');
      setMessageType('success');

      setTimeout(() => {
        finishSuccess(`/courses/${course._id}`);
      }, 700);
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

      setMessage(res.data.message || 'Payment proof submitted successfully');
      setMessageType('success');

      setTimeout(() => {
        finishSuccess(`/courses/${course._id}`);
      }, 800);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Payment proof upload failed');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (!course) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.bgGlowOne} />
      <div style={styles.bgGlowTwo} />

      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <div style={styles.headerBadge}>🔐 Secure Enrollment</div>

            <h2 style={styles.heading}>Complete Your Enrollment</h2>

            <p style={styles.courseTitle}>{course.title}</p>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            style={{
              ...styles.closeBtn,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            ✕
          </button>
        </div>

        <div className="checkout-grid" style={styles.grid}>
          {/* LEFT SIDE */}
          <div style={styles.leftPanel}>
            <div style={styles.sectionTop}>
              <div style={styles.sectionIcon}>
                {isFreeByCoupon ? '🎉' : '📲'}
              </div>

              <div>
                <h3 style={styles.sectionTitle}>
                  {isFreeByCoupon ? 'Coupon Applied' : 'Scan & Pay'}
                </h3>

                <p style={styles.sectionText}>
                  {isFreeByCoupon
                    ? 'Your coupon makes this course free. No QR payment needed.'
                    : 'Scan the QR and pay the final amount shown below.'}
                </p>
              </div>
            </div>

            {!isFreeByCoupon ? (
              <div style={styles.qrOuter}>
                <div style={styles.qrCard}>
                  <img src="/qr.jpeg" alt="Payment QR" style={styles.qrImage} />
                </div>

                <div style={styles.qrNote}>
                  <span>⚡</span>
                  <span>Pay exactly ₹{finalPrice} and upload clear screenshot.</span>
                </div>
              </div>
            ) : (
              <div style={styles.freeBox}>
                <div style={{ fontSize: '58px', marginBottom: '10px' }}>🎉</div>

                <h2 style={{ margin: 0, color: '#22c55e' }}>
                  Free Access Unlocked
                </h2>

                <p style={{ color: '#cbd5e1', marginBottom: 0, lineHeight: 1.6 }}>
                  Click enroll from the right side. No screenshot required.
                </p>
              </div>
            )}

            <div style={styles.priceBox}>
              <div style={styles.priceRow}>
                <span>Original Price</span>
                <b>₹{originalPrice}</b>
              </div>

              {couponData && (
                <>
                  <div style={{ ...styles.priceRow, color: '#22c55e' }}>
                    <span>Coupon Applied</span>
                    <b>{couponData.coupon.code}</b>
                  </div>

                  <div style={styles.priceRow}>
                    <span>Discount</span>
                    <b>₹{discountAmount}</b>
                  </div>
                </>
              )}

              <div style={styles.line} />

              <div style={styles.finalPriceRow}>
                <span>Final Price</span>
                <strong>₹{finalPrice}</strong>
              </div>
            </div>

            <div style={styles.infoStrip}>
              <span>🛡️</span>
              <span>
                {isFreeByCoupon
                  ? 'Free coupon users can enroll directly without payment proof.'
                  : 'Admin approval will unlock your course after payment proof verification.'}
              </span>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div style={styles.rightPanel}>
            <div style={styles.sectionTop}>
              <div style={styles.sectionIcon}>🏷️</div>

              <div>
                <h3 style={styles.sectionTitle}>Apply Coupon Code</h3>

                <p style={styles.sectionText}>
                  Enter coupon code. If coupon makes this course free, you can enroll directly.
                </p>
              </div>
            </div>

            <div style={styles.couponRow}>
              <input
                type="text"
                placeholder="Example: REHAN100"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyCoupon();
                }}
                style={styles.input}
              />

              <button
                onClick={applyCoupon}
                disabled={loading}
                style={{
                  ...styles.applyBtn,
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
                  ...styles.messageBox,
                  background:
                    messageType === 'success'
                      ? 'rgba(34,197,94,0.12)'
                      : 'rgba(239,68,68,0.12)',
                  border:
                    messageType === 'success'
                      ? '1px solid rgba(34,197,94,0.25)'
                      : '1px solid rgba(239,68,68,0.25)',
                  color: messageType === 'success' ? '#4ade80' : '#f87171',
                }}
              >
                {messageType === 'success' ? '✅ ' : '⚠️ '}
                {message}
              </div>
            )}

            {isFreeByCoupon ? (
              <div style={styles.freeEnrollCard}>
                <div style={styles.freeMiniIcon}>🎉</div>

                <h3 style={styles.freeTitle}>Course is Free Now</h3>

                <p style={styles.freeText}>
                  This coupon makes your final price ₹0. No QR payment and no screenshot required.
                </p>

                <button
                  onClick={enrollFreeWithCoupon}
                  disabled={loading}
                  style={{
                    ...styles.freeEnrollBtn,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.75 : 1,
                  }}
                >
                  {loading ? 'Enrolling...' : 'Enroll Free Now 🚀'}
                </button>
              </div>
            ) : (
              <div style={styles.uploadCard}>
                <div style={styles.sectionTopSmall}>
                  <div style={styles.sectionIcon}>📤</div>

                  <div>
                    <h3 style={styles.uploadTitle}>Upload Payment Screenshot</h3>

                    <p style={styles.uploadText}>
                      Upload screenshot after paying ₹{finalPrice}.
                    </p>
                  </div>
                </div>

                <label style={styles.fileBox}>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => setScreenshot(e.target.files[0])}
                    style={{ display: 'none' }}
                  />

                  <span style={styles.fileIcon}>🖼️</span>

                  <span style={styles.fileText}>
                    {screenshot ? screenshot.name : 'Click to choose screenshot'}
                  </span>

                  <span style={styles.fileSubText}>
                    JPG, PNG or WEBP supported
                  </span>
                </label>

                {screenshot && (
                  <div style={styles.selectedFile}>
                    ✅ Selected: {screenshot.name}
                  </div>
                )}

                <button
                  onClick={submitPaymentProof}
                  disabled={loading}
                  style={{
                    ...styles.submitBtn,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.75 : 1,
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Payment Proof 🚀'}
                </button>
              </div>
            )}

            <div style={styles.bottomWarning}>
              <span>⚠️</span>
              <span>
                Please upload a clear payment screenshot. Incorrect/fake proofs may be rejected.
              </span>
            </div>
          </div>
        </div>

        <style>
          {`
            @media (max-width: 860px) {
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

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(2, 6, 23, 0.82)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '18px',
    overflow: 'hidden',
  },
  bgGlowOne: {
    position: 'absolute',
    top: '8%',
    left: '8%',
    width: '260px',
    height: '260px',
    borderRadius: '50%',
    background: 'rgba(34,197,94,0.18)',
    filter: 'blur(90px)',
    pointerEvents: 'none',
  },
  bgGlowTwo: {
    position: 'absolute',
    right: '8%',
    bottom: '8%',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'rgba(59,130,246,0.18)',
    filter: 'blur(95px)',
    pointerEvents: 'none',
  },
  modal: {
    position: 'relative',
    width: '100%',
    maxWidth: '980px',
    maxHeight: '92vh',
    overflowY: 'auto',
    background:
      'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(2,6,23,0.98))',
    color: '#fff',
    borderRadius: '28px',
    boxShadow: '0 30px 100px rgba(0,0,0,0.65)',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  header: {
    padding: '22px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.10)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px',
    background:
      'linear-gradient(135deg, rgba(34,197,94,0.22), rgba(59,130,246,0.16), rgba(139,92,246,0.12))',
  },
  headerBadge: {
    width: 'fit-content',
    padding: '7px 12px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.14)',
    color: '#bbf7d0',
    fontSize: '12px',
    fontWeight: 900,
    marginBottom: '10px',
  },
  heading: {
    margin: 0,
    fontSize: '26px',
    fontWeight: 950,
    lineHeight: 1.15,
  },
  courseTitle: {
    margin: '7px 0 0',
    color: '#cbd5e1',
    fontWeight: 700,
    lineHeight: 1.45,
  },
  closeBtn: {
    minWidth: '42px',
    height: '42px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.18)',
    background: 'rgba(255,255,255,0.10)',
    color: 'white',
    fontSize: '18px',
    fontWeight: 900,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
  },
  leftPanel: {
    padding: '28px',
    borderRight: '1px solid rgba(255,255,255,0.10)',
    background:
      'radial-gradient(circle at top left, rgba(34,197,94,0.16), transparent 42%)',
  },
  rightPanel: {
    padding: '28px',
    background:
      'radial-gradient(circle at top right, rgba(59,130,246,0.14), transparent 45%)',
  },
  sectionTop: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '13px',
    marginBottom: '18px',
  },
  sectionTopSmall: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '13px',
    marginBottom: '14px',
  },
  sectionIcon: {
    width: '46px',
    height: '46px',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    display: 'grid',
    placeItems: 'center',
    fontSize: '22px',
    flex: '0 0 auto',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '21px',
    fontWeight: 950,
  },
  sectionText: {
    margin: '6px 0 0',
    color: '#94a3b8',
    lineHeight: 1.65,
    fontWeight: 700,
    fontSize: '14px',
  },
  qrOuter: {
    marginTop: '18px',
  },
  qrCard: {
    background: '#fff',
    borderRadius: '24px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 18px 45px rgba(0,0,0,0.35)',
  },
  qrImage: {
    width: '270px',
    maxWidth: '100%',
    borderRadius: '18px',
    display: 'block',
  },
  qrNote: {
    marginTop: '12px',
    padding: '12px 14px',
    borderRadius: '16px',
    background: 'rgba(251,191,36,0.12)',
    border: '1px solid rgba(251,191,36,0.22)',
    color: '#fbbf24',
    display: 'flex',
    gap: '8px',
    fontWeight: 800,
    lineHeight: 1.5,
    fontSize: '13px',
  },
  freeBox: {
    marginTop: '20px',
    minHeight: '270px',
    borderRadius: '24px',
    padding: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    background: 'rgba(34,197,94,0.12)',
    border: '1px solid rgba(34,197,94,0.30)',
  },
  priceBox: {
    marginTop: '22px',
    padding: '18px',
    borderRadius: '20px',
    background: 'rgba(255,255,255,0.065)',
    border: '1px solid rgba(255,255,255,0.10)',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '14px',
    marginBottom: '10px',
    color: '#cbd5e1',
    fontWeight: 800,
  },
  line: {
    height: '1px',
    background: 'rgba(255,255,255,0.12)',
    margin: '14px 0',
  },
  finalPriceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#fff',
    gap: '14px',
  },
  infoStrip: {
    marginTop: '16px',
    color: '#94a3b8',
    fontSize: '13px',
    lineHeight: 1.6,
    display: 'flex',
    gap: '8px',
    fontWeight: 800,
  },
  couponRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '16px',
  },
  input: {
    flex: 1,
    minWidth: 0,
    padding: '14px',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.16)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    outline: 'none',
    fontWeight: 800,
    letterSpacing: '0.5px',
  },
  applyBtn: {
    padding: '14px 18px',
    borderRadius: '16px',
    border: 'none',
    background: '#22c55e',
    color: '#fff',
    fontWeight: 950,
  },
  messageBox: {
    marginTop: '14px',
    padding: '12px 14px',
    borderRadius: '16px',
    fontWeight: 800,
    lineHeight: 1.5,
  },
  freeEnrollCard: {
    marginTop: '26px',
    padding: '22px',
    borderRadius: '22px',
    background: 'rgba(34,197,94,0.12)',
    border: '1px solid rgba(34,197,94,0.32)',
  },
  freeMiniIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '18px',
    background: 'rgba(34,197,94,0.14)',
    display: 'grid',
    placeItems: 'center',
    fontSize: '26px',
    marginBottom: '12px',
  },
  freeTitle: {
    marginTop: 0,
    marginBottom: '10px',
    color: '#22c55e',
    fontSize: '22px',
    fontWeight: 950,
  },
  freeText: {
    color: '#cbd5e1',
    lineHeight: 1.65,
    margin: 0,
    fontWeight: 700,
  },
  freeEnrollBtn: {
    width: '100%',
    marginTop: '16px',
    padding: '15px',
    borderRadius: '17px',
    border: 'none',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#fff',
    fontWeight: 950,
    fontSize: '16px',
  },
  uploadCard: {
    marginTop: '26px',
    padding: '22px',
    borderRadius: '22px',
    background: 'rgba(255,255,255,0.055)',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  uploadTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 950,
  },
  uploadText: {
    color: '#94a3b8',
    lineHeight: 1.6,
    margin: '6px 0 0',
    fontWeight: 700,
  },
  fileBox: {
    width: '100%',
    marginTop: '14px',
    padding: '18px',
    borderRadius: '18px',
    background: 'rgba(255,255,255,0.075)',
    border: '1px dashed rgba(255,255,255,0.24)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    textAlign: 'center',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  fileIcon: {
    fontSize: '30px',
  },
  fileText: {
    fontWeight: 950,
    wordBreak: 'break-word',
  },
  fileSubText: {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: 700,
  },
  selectedFile: {
    marginTop: '10px',
    color: '#22c55e',
    fontWeight: 800,
    fontSize: '14px',
    lineHeight: 1.5,
    wordBreak: 'break-word',
  },
  submitBtn: {
    width: '100%',
    marginTop: '16px',
    padding: '15px',
    borderRadius: '17px',
    border: 'none',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff',
    fontWeight: 950,
    fontSize: '16px',
  },
  bottomWarning: {
    marginTop: '16px',
    padding: '13px 14px',
    borderRadius: '16px',
    background: 'rgba(251,191,36,0.10)',
    border: '1px solid rgba(251,191,36,0.20)',
    color: '#fbbf24',
    display: 'flex',
    gap: '8px',
    fontWeight: 800,
    lineHeight: 1.5,
    fontSize: '13px',
  },
};

export default CheckoutModal;