import { useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const getCart = async () => {
    try {
      const { data } = await api.get("/api/cart");
      setCart(data.cart);
    } catch (error) {
      toast.error("Failed to fetch cart");
    }
  };

  useEffect(() => {
    getCart();
  }, []);

  const placeOrder = async () => {
    try {
      if (!address || !phone) {
        return toast.error("Please fill all fields");
      }

      const payload = {
        items: cart.items,
        totalAmount: cart.totalAmount,
        address,
        phone,
        paymentMethod,
      };

      const { data } = await api.post("/api/orders/create", payload);

      toast.success("Order placed successfully");

      await api.delete("/api/cart/clear");

      navigate("/orders");
    } catch (error) {
      console.log(error.response?.data);

      toast.error(error.response?.data?.message || "Failed to place order");
    }
  };

  if (!cart) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-orange-50 p-8">
      <h1 className="text-4xl font-bold text-orange-500 mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow">
          <h2 className="text-2xl font-bold mb-6">Delivery Details</h2>

          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Delivery Address"
            className="border p-4 rounded-xl w-full mb-4"
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
            className="border p-4 rounded-xl w-full mb-4"
          />

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="border p-4 rounded-xl w-full"
          >
            <option value="COD">Cash On Delivery</option>
            <option value="ONLINE">Online Payment</option>
          </select>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow h-fit">
          <h2 className="text-2xl font-bold mb-5">Order Summary</h2>

          {cart.items.map((item) => (
            <div key={item._id} className="flex justify-between mb-3">
              <span>
                {item.foodName} x {item.quantity}
              </span>

              <span>₹{item.itemTotal}</span>
            </div>
          ))}

          <hr className="my-4" />

          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span className="text-orange-500">₹{cart.totalAmount}</span>
          </div>

          <button
            onClick={placeOrder}
            className="mt-6 bg-orange-500 text-white w-full p-4 rounded-xl"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}
