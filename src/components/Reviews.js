import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import API from '../api';

function Reviews({ courseId }) {
  const theme = useTheme();
  const token = localStorage.getItem('token');

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState('');
  const [hover, setHover] = useState(0);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, [courseId]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API}/api/reviews/${courseId}`);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
    }
  };

  const getRatingText = (value) => {
    switch (Number(value)) {
      case 1:
        return 'Bahut Bura';
      case 2:
        return 'Bura';
      case 3:
        return 'Theek Hai';
      case 4:
        return 'Accha';
      case 5:
        return 'Excellent!';
      default:
        return 'Excellent!';
    }
  };

  const submitReview = async () => {
    if (!comment.trim()) {
      setMsg('❌ Comment zaroori hai!');
      setTimeout(() => setMsg(''), 3000);
      return;
    }

    try {
      await axios.post(
        `${API}/api/reviews/${courseId}`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg('✅ Review submitted!');
      setComment('');
      setRating(5);
      fetchReviews();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Error!'));
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : 0;

  return (
    <div style={styles.wrap}>
      <div
        style={{
          ...styles.headerCard,
          background: theme.card,
          border: `1px solid ${theme.border}`,
          boxShadow: theme.shadow,
          backdropFilter: theme.glass,
          WebkitBackdropFilter: theme.glass,
        }}
      >
        <div>
          <p style={{ ...styles.kicker, color: theme.primary }}>⭐ STUDENT FEEDBACK</p>

          <h3 style={{ ...styles.title, color: theme.text }}>Reviews</h3>

          <p style={{ ...styles.subtitle, color: theme.muted }}>
            Students ka real feedback yahan dikhega.
          </p>
        </div>

        <div
          style={{
            ...styles.ratingBox,
            background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
            border: `1px solid ${theme.border}`,
          }}
        >
          <strong style={{ color: theme.warning }}>{reviews.length > 0 ? avgRating : '0.0'}</strong>
          <span style={styles.starsMini}>⭐⭐⭐⭐⭐</span>
          <p style={{ color: theme.muted }}>
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {token && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          style={{
            ...styles.formCard,
            background: theme.card,
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadow,
            backdropFilter: theme.glass,
            WebkitBackdropFilter: theme.glass,
          }}
        >
          <div style={styles.formTop}>
            <div>
              <h3 style={{ color: theme.text, margin: 0 }}>✍️ Apni Review Do</h3>
              <p style={{ color: theme.muted, margin: '6px 0 0', fontSize: '14px' }}>
                Rating select karo aur honest feedback likho.
              </p>
            </div>

            <span
              style={{
                ...styles.ratingTextBadge,
                color: theme.primary,
                background: theme.isDark
                  ? 'rgba(167,139,250,0.10)'
                  : 'rgba(124,58,237,0.08)',
                border: `1px solid ${theme.border}`,
              }}
            >
              {getRatingText(hover || rating)}
            </span>
          </div>

          <div style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.span
                key={star}
                whileHover={{ scale: 1.12, y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.12 }}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                style={{
                  fontSize: '31px',
                  cursor: 'pointer',
                  opacity: (hover || rating) >= star ? 1 : 0.55,
                }}
              >
                {(hover || rating) >= star ? '⭐' : '☆'}
              </motion.span>
            ))}
          </div>

          <textarea
            placeholder="Course ke baare mein kuch likho..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{
              ...styles.textarea,
              background: theme.isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.82)',
              color: theme.text,
              border: `1px solid ${theme.border}`,
            }}
          />

          {msg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                ...styles.msgBox,
                background: msg.includes('✅')
                  ? theme.isDark
                    ? 'rgba(34,197,94,0.13)'
                    : '#dcfce7'
                  : theme.isDark
                  ? 'rgba(239,68,68,0.13)'
                  : '#fee2e2',
                color: msg.includes('✅')
                  ? theme.isDark
                    ? '#86efac'
                    : '#166534'
                  : theme.isDark
                  ? '#fca5a5'
                  : '#991b1b',
                border: msg.includes('✅')
                  ? theme.isDark
                    ? '1px solid rgba(34,197,94,0.25)'
                    : '1px solid #bbf7d0'
                  : theme.isDark
                  ? '1px solid rgba(239,68,68,0.25)'
                  : '1px solid #fecaca',
              }}
            >
              {msg}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.018, y: -1 }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.16 }}
            onClick={submitReview}
            style={{
              ...styles.submitBtn,
              background: theme.primary,
              color: theme.buttonText,
              boxShadow: `0 0 20px ${theme.primary}35`,
            }}
          >
            Submit Review 🚀
          </motion.button>
        </motion.div>
      )}

      {reviews.length === 0 ? (
        <div
          style={{
            ...styles.emptyBox,
            background: theme.card,
            border: `1px solid ${theme.border}`,
            color: theme.muted,
          }}
        >
          <div style={styles.emptyIcon}>😊</div>
          <h3 style={{ color: theme.text, margin: '0 0 8px' }}>
            Abhi koi review nahi
          </h3>
          <p style={{ margin: 0 }}>Pehle review do aur course feedback start karo.</p>
        </div>
      ) : (
        <div style={styles.reviewList}>
          {reviews.map((review) => (
            <motion.div
              key={review._id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{
                ...styles.reviewCard,
                background: theme.card,
                border: `1px solid ${theme.border}`,
                boxShadow: theme.shadow,
                backdropFilter: theme.glass,
                WebkitBackdropFilter: theme.glass,
              }}
            >
              <div style={styles.reviewTop}>
                <div style={styles.userRow}>
                  {review.user?.photo ? (
                    <img
                      src={review.user.photo}
                      alt=""
                      style={{
                        ...styles.avatar,
                        border: `2px solid ${theme.borderStrong || theme.primary}`,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        ...styles.avatarFallback,
                        background: theme.primary,
                        color: theme.buttonText,
                      }}
                    >
                      {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}

                  <div>
                    <p style={{ ...styles.userName, color: theme.text }}>
                      {review.user?.name || 'Student'}
                    </p>

                    <p style={{ ...styles.date, color: theme.muted }}>
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString('en-IN')
                        : 'Recently'}
                    </p>
                  </div>
                </div>

                <div style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} style={{ fontSize: '15px' }}>
                      {Number(review.rating) >= s ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
              </div>

              <p style={{ ...styles.comment, color: theme.textSecondary }}>
                {review.comment}
              </p>

              <div
                style={{
                  ...styles.reviewBadge,
                  color: theme.primary,
                  background: theme.isDark
                    ? 'rgba(167,139,250,0.10)'
                    : 'rgba(124,58,237,0.08)',
                  border: `1px solid ${theme.border}`,
                }}
              >
                {getRatingText(review.rating)}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    marginTop: '32px',
  },
  headerCard: {
    padding: '22px',
    borderRadius: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '18px',
  },
  kicker: {
    margin: '0 0 6px',
    fontSize: '12px',
    fontWeight: 950,
    letterSpacing: '0.5px',
  },
  title: {
    margin: 0,
    fontSize: '26px',
    fontWeight: 950,
  },
  subtitle: {
    margin: '6px 0 0',
    fontSize: '14px',
    lineHeight: 1.6,
    fontWeight: 750,
  },
  ratingBox: {
    minWidth: '150px',
    padding: '14px',
    borderRadius: '18px',
    textAlign: 'center',
  },
  starsMini: {
    display: 'block',
    fontSize: '12px',
    marginTop: '4px',
  },
  formCard: {
    padding: '22px',
    borderRadius: '24px',
    marginBottom: '20px',
  },
  formTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '14px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: '14px',
  },
  ratingTextBadge: {
    padding: '8px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 950,
  },
  starRow: {
    display: 'flex',
    gap: '7px',
    marginBottom: '14px',
    flexWrap: 'wrap',
  },
  textarea: {
    width: '100%',
    padding: '14px',
    borderRadius: '16px',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    height: '100px',
    boxSizing: 'border-box',
    fontWeight: 750,
  },
  msgBox: {
    marginTop: '12px',
    padding: '12px 14px',
    borderRadius: '16px',
    fontWeight: 850,
    lineHeight: 1.5,
  },
  submitBtn: {
    marginTop: '14px',
    padding: '12px 22px',
    border: 'none',
    borderRadius: '15px',
    cursor: 'pointer',
    fontWeight: 950,
    fontSize: '14px',
  },
  emptyBox: {
    padding: '30px 18px',
    borderRadius: '24px',
    textAlign: 'center',
    fontWeight: 800,
  },
  emptyIcon: {
    fontSize: '42px',
    marginBottom: '8px',
  },
  reviewList: {
    display: 'grid',
    gap: '14px',
  },
  reviewCard: {
    padding: '18px',
    borderRadius: '22px',
  },
  reviewTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '12px',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
  },
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  avatarFallback: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 950,
    fontSize: '15px',
  },
  userName: {
    margin: 0,
    fontWeight: 950,
    fontSize: '14px',
  },
  date: {
    margin: '3px 0 0',
    fontSize: '12px',
    fontWeight: 750,
  },
  reviewStars: {
    display: 'flex',
    gap: '2px',
  },
  comment: {
    fontSize: '14px',
    margin: '0 0 12px',
    lineHeight: 1.7,
    fontWeight: 750,
  },
  reviewBadge: {
    width: 'fit-content',
    padding: '7px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 950,
  },
};

export default Reviews;