import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Zap } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/api";
import FoodCard from "../components/FoodCard";
import HotelCard from "../components/HotelCard";
import EmptyState from "../components/EmptyState";
import { getDeviceLocation, messageFromError, toCartItem } from "../utils/app";

export default function Recommendations() {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [profile, setProfile] = useState(null);
  const [budget, setBudget] = useState("");
  const [mode, setMode] = useState("personalized");
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState("");

  useEffect(() => {
    api.get("/api/users/profile").then(({ data }) => setProfile(data.profile)).catch(() => {});
  }, []);

  const load = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const normalizeFood = (food) => ({
    ...food,
    _id: food._id || food.foodId,
    name: food.name || food.foodName,
  });

  const addToCart = async (food) => {
    const item = normalizeFood(food);
    if (!item._id || !item.hotelId || !item.name || !item.hotelName || !item.price) {
      toast.error("Food details are incomplete");
      return;
    }

    setAddingId(item._id);
    try {
      await api.post("/api/cart/add", toCartItem(item));
      toast.success("Added to cart");
    } catch (error) {
      toast.error(messageFromError(error, "Login as customer to add cart items"));
    } finally {
      setAddingId("");
    }
  };

  const orderNow = (food) => {
    const item = normalizeFood(food);
    if (!item._id || !item.hotelId || !item.name || !item.hotelName || !item.price) {
      toast.error("Food details are incomplete");
      return;
    }

    localStorage.setItem("buyNowItem", JSON.stringify(item));
    navigate("/checkout?mode=buy-now");
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
        <button className="btn" onClick={load} disabled={loading}>{loading ? "Loading..." : "Recommend"}</button>
      </div>
      {foods.length ? (
        <section className="cards">
          {foods.map((food) => {
            const item = normalizeFood(food);
            return (
              <div key={item._id || item.name}>
                <FoodCard food={item} onAdd={addToCart} />
                <div className="cardActions">
                  <button className="btn small" onClick={() => addToCart(item)} disabled={addingId === item._id}>
                    <ShoppingCart size={15} /> {addingId === item._id ? "Adding..." : "Add cart"}
                  </button>
                  <button className="btn ghost small" onClick={() => orderNow(item)}>
                    <Zap size={15} /> Order now
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      ) : null}
      {hotels.length ? <section className="cards">{hotels.map((hotel) => <HotelCard key={hotel._id || hotel.hotelName} hotel={hotel} />)}</section> : null}
      {!foods.length && !hotels.length ? <EmptyState title="Pick a mode" text="Choose a recommendation type and run it." /> : null}
    </main>
  );
}
