import { useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const login = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post("/api/auth/login", form);

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("userId", data.user.userId);
      localStorage.setItem("name", data.user.name);

      toast.success("Login successful");

      if (data.user.role === "USER") navigate("/foods");
      if (data.user.role === "HOTEL") navigate("/hotels");
      if (data.user.role === "ADMIN") navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center">
      <form onSubmit={login} className="bg-white p-8 rounded-2xl shadow w-96">
        <h1 className="text-3xl font-bold text-orange-500 mb-6">Login</h1>

        <input
          name="email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          className="border p-3 w-full mb-3 rounded"
        />

        <input
          name="password"
          type="password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Password"
          className="border p-3 w-full mb-3 rounded"
        />

        <button className="bg-orange-500 text-white p-3 w-full rounded">
          Login
        </button>
      </form>
    </div>
  );
}
