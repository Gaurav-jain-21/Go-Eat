import { useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";

export default function Foods() {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [isVeg, setIsVeg] = useState("");

  const getFoods = async () => {
    try {
      let url = `/api/foods?search=${search}`;

      if (isVeg !== "") {
        url += `&isVeg=${isVeg}`;
      }

      const { data } = await api.get(url);
      setFoods(data.foods || []);
    } catch (error) {
      toast.error("Failed to fetch foods");
    }
  };

  const addToCart = async (food) => {
    try {
      const payload = {
        foodId: food._id,
        hotelId: food.hotelId,
        foodName: food.name,
        hotelName: food.hotelName,
        image: food.image,
        price: food.price,
        quantity: 1,
      };

      await api.post("/api/cart/add", payload);

      toast.success("Added to cart");
    } catch (error) {
      toast.error(error.response?.data?.message || "Add to cart failed");
    }
  };

  useEffect(() => {
    getFoods();
  }, [isVeg]);

  return (
    <div className="min-h-screen bg-orange-50 p-8">
      <h1 className="text-4xl font-bold text-orange-500 mb-6">Explore Foods</h1>

      <div className="bg-white p-5 rounded-2xl shadow mb-8 flex gap-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search food..."
          className="border p-3 rounded-xl flex-1"
        />

        <select
          value={isVeg}
          onChange={(e) => setIsVeg(e.target.value)}
          className="border p-3 rounded-xl"
        >
          <option value="">All</option>
          <option value="true">Veg</option>
          <option value="false">Non-Veg</option>
        </select>

        <button
          onClick={getFoods}
          className="bg-orange-500 text-white px-6 rounded-xl"
        >
          Search
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {foods.map((food) => (
          <div key={food._id} className="bg-white rounded-2xl shadow p-5">
            <img
              src={food.image}
              alt={food.name}
              className="h-48 w-full object-cover rounded-xl"
            />

            <h2 className="text-2xl font-bold mt-4">{food.name}</h2>
            <p className="text-gray-600">{food.hotelName}</p>
            <p className="text-sm text-gray-500">{food.category}</p>

            <div className="flex justify-between items-center mt-3">
              <p className="font-bold text-orange-500 text-xl">₹{food.price}</p>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  food.isVeg
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {food.isVeg ? "Veg" : "Non-Veg"}
              </span>
            </div>

            <button
              onClick={() => addToCart(food)}
              className="mt-5 bg-orange-500 text-white p-3 rounded-xl w-full"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
