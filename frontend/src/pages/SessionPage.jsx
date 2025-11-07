import { Html5Qrcode } from "html5-qrcode";
import { useEffect } from "react";
import { useState } from "react";
import BookingStatusCard from "../components/bookingModals/bookingStatusCard";
import { useNavigate } from "react-router-dom";

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
            const response = await fetch(`${decodedText}/booking/startSession`, { method: "POST" ,
              body:JSON.stringify({bookingToken: localStorage.getItem("bookingToken")})
            });
            const data = await response.json();
            console.log("Booking confirmation:", data);
            alert("Booking confirmed!");
            setbookingData(data.data);
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

const endSession = () => {
  console.log("Session ended, razorpay to be integrated");
   navigate("/dashboard"); 
}

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
        <BookingStatusCard bookingData={bookingData} onEndSession={()=>endSession()}/>
      }
    </div>
)
}