import React, { useState, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api/api";

const PaymentSuccessPage: React.FC = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const sessionId = new URLSearchParams(search).get("session_id");

  const [paymentStatus, setPaymentStatus] = useState<string>("Processing your payment...");

  useLayoutEffect(() => {
    const handlePaymentSuccess = async () => {
      if (!sessionId) return;

      try {
        const response = await api.post(`/donation/payment-success`, {
          session_id: sessionId,
        });
        console.log(response);
        setPaymentStatus("Payment successful!");
      } catch (error: any) {
        console.log(error);
        
        setPaymentStatus("Payment failed. Please try again.");
      }
    };

    if (sessionId) {
      handlePaymentSuccess();
    }
  }, [sessionId]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 text-center w-96">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Donation Status</h1>
        <p
          className={`text-lg mb-6 ${
            paymentStatus === "Payment successful!"
              ? "text-green-600"
              : paymentStatus === "Payment failed. Please try again."
              ? "text-red-600"
              : "text-gray-600"
          }`}
        >
          {paymentStatus}
        </p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={() => navigate("/")}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
