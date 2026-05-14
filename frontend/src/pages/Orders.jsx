import { useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  const getOrders = async () => {
    try {
      const { data } = await api.get("/api/orders/my-orders");

      setOrders(data.orders || []);
    } catch (error) {
      toast.error("Failed to fetch orders");
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  return (
    <div className="min-h-screen bg-orange-50 p-8">
      <h1 className="text-4xl font-bold text-orange-500 mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white p-6 rounded-2xl shadow">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">
                  Order #{order._id.slice(-6)}
                </h2>

                <p className="text-gray-500">{order.paymentMethod}</p>
              </div>

              <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full">
                {order.orderStatus}
              </span>
            </div>

            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item._id} className="flex justify-between">
                  <span>
                    {item.foodName} x {item.quantity}
                  </span>

                  <span>₹{item.itemTotal}</span>
                </div>
              ))}
            </div>

            <hr className="my-4" />

            <div className="flex justify-between font-bold text-xl">
              <span>Total</span>
              <span className="text-orange-500">₹{order.totalAmount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
