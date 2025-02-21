/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api/api";

const PaymentSuccessPage: React.FC = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const sessionId = new URLSearchParams(search).get("session_id");

  const [paymentStatus, setPaymentStatus] = useState<string>("Processing your payment...");
  const [apiCalled, setApiCalled] = useState<boolean>(false); // Track API call

  useLayoutEffect(() => {
    const handlePaymentSuccess = async () => {
      if (!sessionId || apiCalled) return; // Prevent multiple calls

      try {
        setApiCalled(true); // Mark API as called
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

    handlePaymentSuccess();
  }, [sessionId, apiCalled]);

  return (
    <div className="flex justify-center items-center bg-gray-100 min-h-screen">
      <div className="bg-white shadow-lg p-8 rounded-lg w-96 text-center">
        <h1 className="mb-4 font-bold text-gray-800 text-2xl">Donation Status</h1>
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
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white transition"
          onClick={() => navigate("/")}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
