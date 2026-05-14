import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/api";
import FoodCard from "../components/FoodCard";
import HotelCard from "../components/HotelCard";
import EmptyState from "../components/EmptyState";
import { getDeviceLocation, messageFromError } from "../utils/app";

export default function Recommendations() {
  const [foods, setFoods] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [profile, setProfile] = useState(null);
  const [budget, setBudget] = useState("");
  const [mode, setMode] = useState("personalized");

  useEffect(() => {
    api.get("/api/users/profile").then(({ data }) => setProfile(data.profile)).catch(() => {});
  }, []);

  const load = async () => {
    try {
      const [foodRes, hotelRes] = await Promise.all([
        api.get("/api/foods"),
        api.get("/api/hotels"),
      ]);
      const allFoods = foodRes.data.foods || [];
      const allHotels = hotelRes.data.hotels || [];

      if (mode === "trending") {
        const { data } = await api.post("/api/recommendations/trending-foods", { foods: allFoods, limit: 12 });
        setFoods(data.foods || []);
        setHotels([]);
        return;
      }

      if (mode === "hotels") {
        const { data } = await api.post("/api/recommendations/top-hotels", { hotels: allHotels, limit: 12 });
        setHotels(data.hotels || []);
        setFoods([]);
        return;
      }

      if (mode === "nearby") {
        const location = await getDeviceLocation();
        const hotelPayload = allHotels.map((hotel) => ({
          ...hotel,
          lat: hotel.location?.coordinates?.[1] || 0,
          lng: hotel.location?.coordinates?.[0] || 0,
        }));
        const { data } = await api.post("/api/recommendations/nearby-hotels", {
          hotels: hotelPayload,
          userLocation: location,
          radiusKm: 20,
          limit: 12,
        });
        setHotels(data.hotels || []);
        setFoods([]);
        return;
      }

      const { data } = await api.post("/api/recommendations/personalized-foods", {
        foods: allFoods,
        userPreferences: profile?.preferences || {},
        budget: budget ? Number(budget) : undefined,
        limit: 12,
      });
      setFoods(data.foods || []);
      setHotels([]);
    } catch (error) {
      toast.error(messageFromError(error, "Could not load recommendations"));
    }
  };

  return (
    <main className="page">
      <div className="pageHead">
        <span className="badge">Recommendation service</span>
        <h1>Smart recommendations</h1>
        <p className="muted">Trending foods, top hotels, nearby hotels, and personalized picks use the recommendation microservice.</p>
      </div>
      <div className="filterBar compact">
        <select value={mode} onChange={(event) => setMode(event.target.value)}>
          <option value="personalized">Personalized foods</option>
          <option value="trending">Trending foods</option>
          <option value="hotels">Top hotels</option>
          <option value="nearby">Nearby hotels</option>
        </select>
        <input placeholder="Budget for personalized foods" value={budget} onChange={(event) => setBudget(event.target.value)} />
        <button className="btn" onClick={load}>Recommend</button>
      </div>
      {foods.length ? <section className="cards">{foods.map((food) => <FoodCard key={food._id || food.name} food={food} />)}</section> : null}
      {hotels.length ? <section className="cards">{hotels.map((hotel) => <HotelCard key={hotel._id || hotel.hotelName} hotel={hotel} />)}</section> : null}
      {!foods.length && !hotels.length ? <EmptyState title="Pick a mode" text="Choose a recommendation type and run it." /> : null}
    </main>
  );
}
