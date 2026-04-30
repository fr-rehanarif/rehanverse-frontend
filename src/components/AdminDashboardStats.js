function AdminDashboardStats({ theme, users = [], courses = [], payments = [] }) {
  const totalUsers = users.length;
  const totalCourses = courses.length;

  const pendingPayments = payments.filter((p) => p.status === 'pending').length;
  const approvedPayments = payments.filter((p) => p.status === 'approved').length;
  const rejectedPayments = payments.filter((p) => p.status === 'rejected').length;

  const totalRevenue = payments
    .filter((p) => p.status === 'approved')
    .reduce((sum, p) => sum + Number(p.amount || p.course?.price || 0), 0);

  const stats = [
    {
      label: 'Total Users',
      value: totalUsers,
      icon: '👥',
      note: 'Registered students/admins',
    },
    {
      label: 'Total Courses',
      value: totalCourses,
      icon: '📚',
      note: 'Published courses',
    },
    {
      label: 'Pending Payments',
      value: pendingPayments,
      icon: '💸',
      note: 'Need approval',
    },
    {
      label: 'Approved Payments',
      value: approvedPayments,
      icon: '✅',
      note: 'Unlocked courses',
    },
    {
      label: 'Rejected Payments',
      value: rejectedPayments,
      icon: '❌',
      note: 'Rejected proofs',
    },
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue}`,
      icon: '💰',
      note: 'From approved payments',
    },
  ];

  const formatDate = (date) => {
    if (!date) return 'Recently';

    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const recentPaymentActivities = payments
    .slice()
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, 5)
    .map((payment) => {
      const status = payment.status || 'pending';

      return {
        id: `payment-${payment._id}`,
        icon:
          status === 'approved'
            ? '✅'
            : status === 'rejected'
            ? '❌'
            : '💸',
        title:
          status === 'approved'
            ? 'Payment approved'
            : status === 'rejected'
            ? 'Payment rejected'
            : 'New payment request',
        detail: `${payment.user?.name || 'Unknown user'} • ${
          payment.course?.title || 'Course deleted'
        }`,
        time: formatDate(payment.updatedAt || payment.createdAt),
        accent:
          status === 'approved'
            ? theme.success
            : status === 'rejected'
            ? theme.danger
            : theme.warning,
      };
    });

  const recentCourseActivities = courses
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3)
    .map((course) => ({
      id: `course-${course._id}`,
      icon: '🚀',
      title: 'Course published',
      detail: `${course.title || 'Untitled Course'} • ${
        course.isFree ? 'Free' : `₹${course.price || 0}`
      }`,
      time: formatDate(course.createdAt),
      accent: theme.primary,
    }));

  const recentUserActivities = users
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3)
    .map((user) => ({
      id: `user-${user._id}`,
      icon: user.role === 'admin' ? '👑' : '👤',
      title: user.role === 'admin' ? 'Admin account' : 'New user joined',
      detail: `${user.name || 'Unknown'} • ${user.email || 'No email'}`,
      time: formatDate(user.createdAt),
      accent: user.role === 'admin' ? theme.warning : theme.primary,
    }));

  const recentActivities = [
    ...recentPaymentActivities,
    ...recentCourseActivities,
    ...recentUserActivities,
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 8);

  return (
    <div
      style={{
        marginBottom: '28px',
        padding: '22px',
        borderRadius: '24px',
        background: theme.card,
        border: `1px solid ${theme.border}`,
        boxShadow: theme.shadow,
        backdropFilter: theme.glass,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '14px',
          flexWrap: 'wrap',
          marginBottom: '18px',
        }}
      >
        <div>
          <h3
            style={{
              color: theme.primary,
              margin: 0,
              fontSize: '24px',
              fontWeight: '900',
            }}
          >
            📊 Admin Overview
          </h3>

          <p
            style={{
              color: theme.muted,
              margin: '6px 0 0',
              fontSize: '13px',
            }}
          >
            Quick platform performance summary
          </p>
        </div>

        <div
          style={{
            padding: '8px 12px',
            borderRadius: '999px',
            background:
              theme.mode === 'dark'
                ? 'rgba(34,197,94,0.12)'
                : '#dcfce7',
            color: theme.success || '#22c55e',
            fontSize: '12px',
            fontWeight: '800',
            border: `1px solid ${theme.border}`,
          }}
        >
          Live Dashboard
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))',
          gap: '14px',
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: '18px',
              borderRadius: '20px',
              background: theme.bgSecondary,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.mode === 'dark'
                ? '0 10px 25px rgba(0,0,0,0.22)'
                : '0 10px 25px rgba(0,0,0,0.08)',
            }}
          >
            <div
              style={{
                fontSize: '26px',
                marginBottom: '10px',
              }}
            >
              {stat.icon}
            </div>

            <h2
              style={{
                margin: 0,
                color: theme.text,
                fontSize: '26px',
                fontWeight: '900',
              }}
            >
              {stat.value}
            </h2>

            <p
              style={{
                margin: '5px 0 0',
                color: theme.primary,
                fontSize: '13px',
                fontWeight: '800',
              }}
            >
              {stat.label}
            </p>

            <p
              style={{
                margin: '6px 0 0',
                color: theme.muted,
                fontSize: '12px',
                lineHeight: '1.4',
              }}
            >
              {stat.note}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '22px',
          padding: '18px',
          borderRadius: '22px',
          background: theme.bgSecondary,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '14px',
          }}
        >
          <div>
            <h3
              style={{
                color: theme.text,
                margin: 0,
                fontSize: '18px',
                fontWeight: '900',
              }}
            >
              🕒 Recent Activity
            </h3>

            <p
              style={{
                color: theme.muted,
                margin: '5px 0 0',
                fontSize: '12px',
              }}
            >
              Latest platform updates from payments, users and courses
            </p>
          </div>

          <span
            style={{
              padding: '6px 10px',
              borderRadius: '999px',
              background:
                theme.mode === 'dark'
                  ? 'rgba(59,130,246,0.12)'
                  : '#dbeafe',
              color: theme.primary,
              fontSize: '12px',
              fontWeight: '800',
              border: `1px solid ${theme.border}`,
            }}
          >
            Last {recentActivities.length} updates
          </span>
        </div>

        {recentActivities.length === 0 ? (
          <div
            style={{
              padding: '18px',
              borderRadius: '16px',
              background: theme.card,
              border: `1px solid ${theme.border}`,
              color: theme.muted,
              textAlign: 'center',
              fontSize: '14px',
            }}
          >
            Abhi koi recent activity nahi hai.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '16px',
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      theme.mode === 'dark'
                        ? 'rgba(255,255,255,0.06)'
                        : 'rgba(0,0,0,0.04)',
                    border: `1px solid ${activity.accent || theme.border}`,
                    fontSize: '20px',
                    flexShrink: 0,
                  }}
                >
                  {activity.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4
                    style={{
                      margin: 0,
                      color: theme.text,
                      fontSize: '14px',
                      fontWeight: '900',
                    }}
                  >
                    {activity.title}
                  </h4>

                  <p
                    style={{
                      margin: '4px 0 0',
                      color: theme.muted,
                      fontSize: '12px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {activity.detail}
                  </p>
                </div>

                <small
                  style={{
                    color: theme.muted,
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {activity.time}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboardStats;