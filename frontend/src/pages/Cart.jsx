import { useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const navigate = useNavigate();

  const getCart = async () => {
    try {
      const { data } = await api.get("/api/cart");
      setCart(data.cart);
    } catch (error) {
      toast.error("Failed to fetch cart");
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;

    try {
      const { data } = await api.put(`/api/cart/update/${itemId}`, {
        quantity,
      });

      setCart(data.cart);
      toast.success("Cart updated");
    } catch (error) {
      toast.error("Failed to update cart");
    }
  };

  const removeItem = async (itemId) => {
    try {
      const { data } = await api.delete(`/api/cart/remove/${itemId}`);
      setCart(data.cart);
      toast.success("Item removed");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const clearCart = async () => {
    try {
      const { data } = await api.delete("/api/cart/clear");
      setCart(data.cart);
      toast.success("Cart cleared");
    } catch (error) {
      toast.error("Failed to clear cart");
    }
  };

  useEffect(() => {
    getCart();
  }, []);

  return (
    <div className="min-h-screen bg-orange-50 p-8">
      <h1 className="text-4xl font-bold text-orange-500 mb-8">Your Cart</h1>

      {!cart || cart.items.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl shadow">
          <p>Your cart is empty.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item._id}
                className="bg-white p-5 rounded-2xl shadow flex gap-5"
              >
                <img
                  src={item.image}
                  alt={item.foodName}
                  className="w-32 h-32 object-cover rounded-xl"
                />

                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{item.foodName}</h2>
                  <p className="text-gray-600">{item.hotelName}</p>
                  <p className="font-bold text-orange-500">₹{item.price}</p>

                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity - 1)
                      }
                      className="px-3 py-1 bg-gray-200 rounded"
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity + 1)
                      }
                      className="px-3 py-1 bg-gray-200 rounded"
                    >
                      +
                    </button>

                    <button
                      onClick={() => removeItem(item._id)}
                      className="ml-5 text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="font-bold text-xl">₹{item.itemTotal}</div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow h-fit">
            <h2 className="text-2xl font-bold mb-5">Summary</h2>

            <div className="flex justify-between mb-3">
              <span>Total Items</span>
              <span>{cart.totalItems}</span>
            </div>

            <div className="flex justify-between mb-5">
              <span>Total Amount</span>
              <span className="font-bold text-orange-500">
                ₹{cart.totalAmount}
              </span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="bg-orange-500 text-white w-full p-3 rounded-xl"
            >
              Checkout
            </button>

            <button
              onClick={clearCart}
              className="mt-3 border border-red-500 text-red-500 w-full p-3 rounded-xl"
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
