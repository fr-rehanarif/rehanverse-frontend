import { useState } from "react";

function PaymentBox({ courseId }) {
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmitProof = async () => {
  if (!screenshot) {
    alert("Screenshot upload kar");
    return;
  }

  try {
    setLoading(true);

    const formData = new FormData();
    formData.append("courseId", courseId);
    formData.append("screenshot", screenshot);

    const res = await fetch("https://rehanverse.onrender.com/api/payment/request", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    const data = await res.json();
    console.log("UPLOAD RESPONSE:", data);

    if (!res.ok) {
      alert(data.message || "Request failed");
      return;
    }

    alert(data.message || "Payment proof submitted successfully");
    setScreenshot(null);
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    alert("Server error");
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "20px",
        borderRadius: "16px",
        background: "#111",
        color: "#fff",
        border: "1px solid #333",
      }}
    >
      <h3 style={{ marginBottom: "10px" }}>Pay via QR</h3>

      <img
        src="/qr.jpg"
        alt="Payment QR"
        style={{
          width: "260px",
          maxWidth: "100%",
          borderRadius: "12px",
          marginBottom: "15px",
        }}
      />

      <p style={{ marginBottom: "12px" }}>
        QR scan karke payment karo, fir screenshot upload karo.
      </p>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setScreenshot(e.target.files[0])}
        style={{ marginBottom: "12px" }}
      />

      <br />

      <button
        onClick={handleSubmitProof}
        disabled={loading}
        style={{
          padding: "10px 18px",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          background: "#00c853",
          color: "#fff",
          fontWeight: "bold",
        }}
      >
        {loading ? "Submitting..." : "Submit Payment Proof"}
      </button>
    </div>
  );
}

export default PaymentBox;