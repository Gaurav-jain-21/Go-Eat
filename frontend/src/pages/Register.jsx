import { useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const register = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      lat: 22.3039,
      lng: 70.8022,
    };

    console.log("Sending register payload:", payload);

    try {
      const { data } = await api.post("/api/auth/register", payload);

      console.log("Register response:", data);

      toast.success(data.message || "Registration successful");

      localStorage.setItem("verifyEmail", form.email);

      navigate("/verify-email");
    } catch (error) {
      console.log("Register error full:", error);
      console.log("Backend error:", error.response?.data);

      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Register failed",
      );
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-orange-50">
      <form
        onSubmit={register}
        className="bg-white p-8 rounded-2xl shadow w-96"
      >
        <h1 className="text-3xl font-bold text-orange-500 mb-6">Register</h1>

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="border p-3 w-full mb-3 rounded"
          required
        />

        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="border p-3 w-full mb-3 rounded"
          required
        />

        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="border p-3 w-full mb-3 rounded"
          required
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="border p-3 w-full mb-3 rounded"
        >
          <option value="USER">USER</option>
          <option value="HOTEL">HOTEL</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <button className="bg-orange-500 text-white p-3 w-full rounded">
          Register
        </button>
      </form>
    </div>
  );
}
