import { useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const email = localStorage.getItem("verifyEmail");

  const verify = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post("/api/auth/verify-email", {
        email,
        otp,
      });

      toast.success(data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center">
      <form onSubmit={verify} className="bg-white p-8 rounded-2xl shadow w-96">
        <h1 className="text-3xl font-bold text-orange-500 mb-6">
          Verify Email
        </h1>

        <p className="mb-4 text-gray-600">{email}</p>

        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="border p-3 w-full mb-3 rounded"
        />

        <button className="bg-orange-500 text-white p-3 w-full rounded">
          Verify
        </button>
      </form>
    </div>
  );
}
