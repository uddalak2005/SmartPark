import {useRazorpay} from "react-razorpay";


 export const handlePayment = async (bookingToken, amount) => {
    const Razorpay = useRazorpay();
    try {
      const res = await fetch(`${import.meta.env.VITE_LOCAL_BACKEND_URL}/payment/generateUTR`, 
        { method: "POST" ,
            body : JSON.stringify({
                bookingToken : bookingToken
            })
        });
        if(res.ok){
            const data = await res.json();
            const order = {
                id: data.order.id, // example Razorpay order ID from backend
                amount: amount, // in paise => ₹500
                currency: "INR",
            };

      const options = {
        key: "rzp_test_YourKeyHere", // Replace with your Razorpay key
        amount: order.amount,
        currency: order.currency,
        name: "FarmLoan AI", // Your app or company name
        description: "Test Transaction",
        order_id: order.id,
        // image: "https://your-logo-url.com/logo.png"
        handler: (response) => {
          console.log("Payment success:", response);
          alert(`Payment ID: ${response.razorpay_payment_id}`);
          // You can verify the payment at your backend here
        },
        prefill: {
          name: "Test user",
          email: "test@example.com",
          contact: "8910169299",
        },
        notes: {
          address: "React Developer Address",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp1 = new Razorpay(options);

      rzp1.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
      });

      rzp1.open();
    }
    } catch (err) {
      console.error("Error in Razorpay:", err);
    }
  };