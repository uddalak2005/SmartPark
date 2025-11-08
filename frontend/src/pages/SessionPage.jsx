import { Html5Qrcode } from "html5-qrcode";
import { useEffect } from "react";
import { useState } from "react";
import BookingStatusCard from "../components/bookingModals/bookingStatusCard";
import { useNavigate } from "react-router-dom";
import { useRazorpay } from "react-razorpay";

export const ManageSession = () => {
    const [scanning, setScanning] = useState(false);
    const [decodedResult, setDecodedResult] = useState(null);
    const [bookingConfirmed,setbookingConfirmed] = useState(false);
    const [bookingData,setbookingData] = useState(null);
    const navigate = useNavigate();

useEffect(() => 
  {
  const handleScanQR = async () => {
    const html5QrCode = new Html5Qrcode("qr-reader");

    try {
      setScanning(true); // show the camera container

      await html5QrCode.start(
        { facingMode: "environment" }, // rear camera on phones
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }, // scanning box
        },
        async (decodedText) => {
          console.log("QR Code detected:", decodedText);
          setDecodedResult(decodedText);

          // stop the camera once QR is found
          await html5QrCode.stop();
          setScanning(false);
          // hit your backend route
          try {
            console.log(localStorage.getItem("bookingToken"));
            const response = await fetch(`${decodedText}/booking/startSession`, { 
              method: "POST" ,
              headers : {
                "Content-Type": "application/json",
              },
              body:JSON.stringify({bookingToken: localStorage.getItem("bookingToken")})
            });
            const data = await response.json();
            console.log("Booking confirmation:", data);
            alert("Booking confirmed!");
            setbookingData(data.data);
            console.log("Parking Token: ", data.data.parkingToken);
            localStorage.setItem("parkingToken",data.data.parkingToken);
            setbookingConfirmed(!bookingConfirmed);
          } catch (err) {
            console.error("Error confirming booking:", err);
            alert("Error confirming booking.");
          }
        },
        (errorMessage) => {
          // optionally log scanning errors here
        }
      );
    } catch (err) {
      console.error("Camera initialization failed:", err);
      setScanning(false);
    }
  };

handleScanQR();
},[])

  const clearParking = async(parkingToken) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_LOCAL_BACKEND_URL}/booking/complete`,{
          method: 'POST',
          headers : {
                "Content-Type": "application/json",
              },
          body:JSON.stringify({parkingToken})
        })
        if(res.ok){
          const data = await res.json();
          console.log("Slot clearing done");
        }
    } catch (error) {
        console.log(error);
    }
  };
  
  const Razorpay = useRazorpay(); // ✅ hook used correctly inside component
  
  const handlePayment = async (bookingToken,amount) => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_LOCAL_BACKEND_URL}/payments/generateUTR`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingToken, amount }),
          }
        );
  
        if (!res.ok) throw new Error("Failed to generate order");
        const data = await res.json();
  
        const options = {
          key: "rzp_test_RdMEvDYXf39CSj", // Replace with your key
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
  
        const rzp1 = new window.Razorpay(options);
  
        rzp1.on("payment.failed", (response) => {
          console.error("❌ Payment failed:", response.error);
          alert(`Payment failed: ${response.error.description}`);
        });
  
        rzp1.open(); // 💸 Opens the payment modal
      } catch (err) {
        console.error("Error in Razorpay:", err);
      }
  };
  
  const endSession = (elapsedSeconds) => {
  console.log("Session ended");
  const bookingToken = localStorage.getItem("bookingToken");
  console.log("Booking token: ", bookingToken);
  console.log("Amount: ", Math.ceil(elapsedSeconds*0.011));
  const parkingToken = localStorage.getItem("parkingToken");
  console.log("Parking token: ", parkingToken);
  handlePayment(bookingToken,Math.ceil(elapsedSeconds*0.011));
  localStorage.removeItem("bookingToken");
  localStorage.removeItem("journeyDetails");
  clearParking(parkingToken);
  navigate("/dashboard"); 
  };

return(
  <div id="qr-reader" className="flex flex-col items-center justify-center px-4">
      {/* Camera preview container */}
      {scanning && (
        <div
          id="qr-reader"
          className="mt-4 w-64 h-24 border-2 border-gray-400 rounded-lg"
        ></div>
      )}

      {bookingConfirmed &&
        <BookingStatusCard bookingData={bookingData} onEndSession={(elapsedSeconds)=>endSession(elapsedSeconds)}/>
      }
    </div>
)
};