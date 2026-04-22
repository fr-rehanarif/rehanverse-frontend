import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../api";

function Payment() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [screenshot, setScreenshot] = useState(null);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (!screenshot) {
      setMsg("❌ Screenshot select karo!");
      return;
    }

    try {
      setUploading(true);
      setMsg("");

      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("screenshot", screenshot);

      const res = await axios.post(
        `${API}/api/payment/request`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMsg("✅ " + res.data.message);
      setScreenshot(null);
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.message || "Error!"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "#0f172a",
          border: "1px solid #312e81",
          borderRadius: "22px",
          padding: "30px",
          textAlign: "center",
          color: "#fff",
          boxShadow: "0 0 30px rgba(99,102,241,0.15)",
        }}
      >
        <h2
          style={{
            color: "#8b5cf6",
            marginBottom: "10px",
            fontSize: "42px",
            fontWeight: "800",
          }}
        >
          📷 Screenshot Upload Karo
        </h2>

        <p style={{ marginBottom: "20px", fontSize: "16px", color: "#e5e7eb" }}>
          Payment ka screenshot upload karo
        </p>

        <img
          src="/qr.jpeg"
          alt="QR Code"
          style={{
            width: "100%",
            maxWidth: "500px",
            borderRadius: "18px",
            marginBottom: "20px",
            border: "2px solid #8b5cf6",
          }}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setScreenshot(e.target.files[0])}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "14px",
            border: "1px solid #312e81",
            background: "#020617",
            color: "#fff",
            marginBottom: "16px",
          }}
        />

        {msg && (
          <p
            style={{
              marginBottom: "16px",
              color: msg.includes("✅") ? "#22c55e" : "#ef4444",
              fontWeight: "600",
            }}
          >
            {msg}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={uploading}
          style={{
            width: "100%",
            padding: "16px",
            border: "none",
            borderRadius: "14px",
            background: "#10b981",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          {uploading ? "Uploading..." : "✅ Submit Payment Proof"}
        </button>

        <p
          onClick={() => navigate(-1)}
          style={{
            marginTop: "20px",
            color: "#cbd5e1",
            cursor: "pointer",
          }}
        >
          ← Wapas QR Dekho
        </p>
      </div>
    </div>
  );
}

export default Payment;