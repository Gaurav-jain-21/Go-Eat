import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import FloatingAI from "./components/FloatingAI";
import Home from "./pages/Home";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Foods from "./pages/Foods";
import FoodDetails from "./pages/FoodDetails";
import Hotels from "./pages/Hotels";
import HotelDetails from "./pages/HotelDetails";
import NearbyHotels from "./pages/NearbyHotels";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import AIChat from "./pages/AIChat";
import Notifications from "./pages/Notifications";
import Reviews from "./pages/Reviews";
import DeliveryTracking from "./pages/DeliveryTracking";
import Recommendations from "./pages/Recommendations";
import HotelDashboard from "./pages/hotel/HotelDashboard";
import CreateHotel from "./pages/hotel/CreateHotel";
import AddFood from "./pages/hotel/AddFood";
import HotelFoods from "./pages/hotel/HotelFoods";
import HotelOrders from "./pages/hotel/HotelOrders";
import HotelPayments from "./pages/hotel/HotelPayments";
import HotelProfile from "./pages/hotel/HotelProfile";
import HotelPastOrders from "./pages/hotel/HotelPastOrders";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminHotels from "./pages/admin/AdminHotels";
import AdminFoods from "./pages/admin/AdminFoods";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminLogs from "./pages/admin/AdminLogs";

export default function App() {
  return <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/foods" element={<Foods />} />
      <Route path="/foods/:id" element={<FoodDetails />} />
      <Route path="/hotels" element={<Hotels />} />
      <Route path="/hotels/:id" element={<HotelDetails />} />
      <Route path="/nearby-hotels" element={<NearbyHotels />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/payments" element={<Payments />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/ai" element={<AIChat />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/reviews" element={<Reviews />} />
      <Route path="/delivery" element={<DeliveryTracking />} />
      <Route path="/recommendations" element={<Recommendations />} />
      <Route path="/hotel/dashboard" element={<HotelDashboard />} />
      <Route path="/hotel/create" element={<CreateHotel />} />
      <Route path="/hotel/add-food" element={<AddFood />} />
      <Route path="/hotel/foods" element={<HotelFoods />} />
      <Route path="/hotel/orders" element={<HotelOrders />} />
      <Route path="/hotel/payments" element={<HotelPayments />} />
      <Route path="/hotel/profile" element={<HotelProfile />} />
      <Route path="/hotel/past-orders" element={<HotelPastOrders />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/hotels" element={<AdminHotels />} />
      <Route path="/admin/foods" element={<AdminFoods />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route path="/admin/payments" element={<AdminPayments />} />
      <Route path="/admin/logs" element={<AdminLogs />} />
    </Routes>
    <FloatingAI />
  </>;
}
