import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
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
  }, [courseId]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API}/api/reviews/${courseId}`);
      setReviews(res.data);
    } catch (err) {
      console.log(err);
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
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  return (
    <div style={{ marginTop: '32px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <h3 style={{ color: theme.text, margin: 0 }}>⭐ Reviews</h3>

        {reviews.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                color: theme.warning,
                fontSize: '18px',
                fontWeight: '700',
              }}
            >
              {avgRating}
            </span>
            <span style={{ color: theme.muted, fontSize: '13px' }}>
              ({reviews.length} reviews)
            </span>
          </div>
        )}
      </div>

      {token && (
        <div
          style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: theme.radius,
            padding: '20px',
            marginBottom: '24px',
            boxShadow: theme.shadow,
            backdropFilter: theme.glass,
          }}
        >
          <p
            style={{
              color: theme.text,
              fontWeight: '600',
              marginBottom: '12px',
            }}
          >
            ✍️ Apni Review Do
          </p>

          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                style={{
                  fontSize: '28px',
                  cursor: 'pointer',
                  transition: 'transform 0.12s ease',
                  transform: (hover || rating) >= star ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                {(hover || rating) >= star ? '⭐' : '☆'}
              </span>
            ))}

            <span
              style={{
                color: theme.muted,
                fontSize: '13px',
                alignSelf: 'center',
                marginLeft: '8px',
              }}
            >
              {rating === 1
                ? 'Bahut Bura'
                : rating === 2
                ? 'Bura'
                : rating === 3
                ? 'Theek Hai'
                : rating === 4
                ? 'Accha'
                : 'Excellent!'}
            </span>
          </div>

          <textarea
            placeholder="Course ke baare mein kuch likho..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '14px',
              outline: 'none',
              resize: 'vertical',
              height: '90px',
              background: theme.bgSecondary,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              boxSizing: 'border-box',
            }}
          />

          {msg && (
            <p
              style={{
                color: msg.includes('✅') ? theme.success : theme.danger,
                fontSize: '13px',
                margin: '10px 0 0',
              }}
            >
              {msg}
            </p>
          )}

          <button
            onClick={submitReview}
            style={{
              marginTop: '12px',
              padding: '10px 24px',
              background: theme.primary,
              color: theme.buttonText,
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: theme.shadow,
            }}
          >
            Submit Review
          </button>
        </div>
      )}

      {reviews.length === 0 ? (
        <p
          style={{
            color: theme.muted,
            fontSize: '14px',
            textAlign: 'center',
            padding: '20px',
          }}
        >
          Abhi koi review nahi — pehle review do! 😊
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reviews.map((review) => (
            <div
              key={review._id}
              style={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
                borderRadius: theme.radius,
                padding: '16px',
                boxShadow: theme.shadow,
                backdropFilter: theme.glass,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '8px',
                }}
              >
                {review.user?.photo ? (
                  <img
                    src={review.user.photo}
                    alt=""
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: `2px solid ${theme.borderStrong}`,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: theme.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.buttonText,
                      fontWeight: '700',
                      fontSize: '14px',
                    }}
                  >
                    {review.user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      color: theme.text,
                      fontWeight: '600',
                      margin: 0,
                      fontSize: '14px',
                    }}
                  >
                    {review.user?.name}
                  </p>
                  <p
                    style={{
                      color: theme.muted,
                      margin: 0,
                      fontSize: '11px',
                    }}
                  >
                    {new Date(review.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} style={{ fontSize: '14px' }}>
                      {review.rating >= s ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
              </div>

              <p
                style={{
                  color: theme.textSecondary,
                  fontSize: '14px',
                  margin: 0,
                  lineHeight: '1.6',
                }}
              >
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Reviews;