import { useEffect, useState } from "react";

function PaymentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const res = await fetch("https://rehanverse.onrender.com/api/payment/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Requests fetch failed");
        return;
      }

      setRequests(data);
    } catch (error) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id, action) => {
    try {
      const res = await fetch(`https://rehanverse.onrender.com/api/payment/${action}/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Action failed");
        return;
      }

      alert(data.message || `Payment ${action}d`);
      fetchRequests();
    } catch (error) {
      alert("Server error");
    }
  };

  if (loading) return <p>Loading payment requests...</p>;

  return (
    <div style={{ marginTop: "30px" }}>
      <h2 style={{ marginBottom: "20px" }}>Payment Requests</h2>

      {requests.length === 0 ? (
        <p>No payment requests found.</p>
      ) : (
        requests.map((item) => (
          <div
            key={item._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "14px",
              padding: "16px",
              marginBottom: "16px",
              background: "#fff",
              color: "#000",
            }}
          >
            <p><strong>User:</strong> {item.user?.name}</p>
            <p><strong>Email:</strong> {item.user?.email}</p>
            <p><strong>Course:</strong> {item.course?.title}</p>
            <p><strong>Status:</strong> {item.status}</p>

            <img
              src={`https://rehanverse.onrender.com/${item.screenshot}`}
              alt="payment proof"
              style={{
                width: "220px",
                maxWidth: "100%",
                borderRadius: "10px",
                marginTop: "10px",
                marginBottom: "12px",
                border: "1px solid #ccc",
              }}
            />

            <div>
              <button
                onClick={() => updateStatus(item._id, "approve")}
                style={{
                  padding: "8px 14px",
                  marginRight: "10px",
                  border: "none",
                  borderRadius: "8px",
                  background: "green",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Approve
              </button>

              <button
                onClick={() => updateStatus(item._id, "reject")}
                style={{
                  padding: "8px 14px",
                  border: "none",
                  borderRadius: "8px",
                  background: "red",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default PaymentRequests;