import { useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";

export default function Hotels() {
  const [hotels, setHotels] = useState([]);

  const getHotels = async () => {
    try {
      const { data } = await api.get("/api/hotels");
      setHotels(data.hotels || []);
    } catch (error) {
      toast.error("Failed to fetch hotels");
    }
  };

  useEffect(() => {
    getHotels();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-orange-500 mb-8">Hotels</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <div key={hotel._id} className="bg-white rounded-2xl shadow p-5">
            <img
              src={hotel.image}
              className="h-48 w-full object-cover rounded-xl"
            />
            <h2 className="text-2xl font-bold mt-4">{hotel.hotelName}</h2>
            <p className="text-gray-600">{hotel.address}</p>
            <p className="text-orange-500 font-bold">
              {hotel.cuisines?.join(", ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
