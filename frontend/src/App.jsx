import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Foods from "./pages/Foods";
import Hotels from "./pages/Hotels";
import Cart from "./pages/Cart";
import AIChat from "./pages/AIChat";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";

function Home() {
  return (
    <div className="min-h-screen">
      <nav className="bg-white p-5 shadow flex justify-between">
        <h1 className="text-3xl font-bold text-orange-500">GoEat</h1>

        <div className="flex gap-5">
          <Link to="/foods">Foods</Link>
          <Link to="/hotels">Hotels</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/ai">AI Chat</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </nav>

      <section className="p-20">
        <h1 className="text-6xl font-bold">Delicious Food Delivered Fast</h1>
        <p className="mt-5 text-xl text-gray-600">
          GoEat connects users, hotels, admin, AI chatbot, payments and
          tracking.
        </p>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/foods" element={<Foods />} />
      <Route path="/hotels" element={<Hotels />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/ai" element={<AIChat />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<Orders />} />
    </Routes>
  );
}
