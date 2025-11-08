// PaymentSection.jsx
import React from "react";
import { useRazorpay } from "react-razorpay";

export default function PaymentSection({ bookingToken, amount }) {
  const Razorpay = useRazorpay(); // ✅ hook used correctly inside component

  const handlePayment = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/payment/generateUTR`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingToken }),
        }
      );

      if (!res.ok) throw new Error("Failed to generate order");
      const data = await res.json();

      const options = {
        key: "rzp_test_YourKeyHere", // Replace with your key
        amount,
        currency: "INR",
        name: "FarmLoan AI",
        description: "Test Transaction",
        order_id: data.order.id,
        handler: (response) => {
          console.log("✅ Payment success:", response);
          alert(`Payment ID: ${response.razorpay_payment_id}`);
        },
        prefill: {
          name: "Test User",
          email: "test@example.com",
          contact: "8910169299",
        },
        theme: { color: "#3399cc" },
      };

      const rzp1 = new Razorpay(options);

      rzp1.on("payment.failed", (response) => {
        console.error("❌ Payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
      });

      rzp1.open(); // 💸 Opens the payment modal
    } catch (err) {
      console.error("Error in Razorpay:", err);
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
    >
      Pay ₹{amount / 100}
    </button>
  );
}
