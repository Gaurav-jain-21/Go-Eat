import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/api";
import FoodCard from "../../components/FoodCard";
import EmptyState from "../../components/EmptyState";
import { messageFromError } from "../../utils/app";

export default function HotelFoods() {
  const [foods, setFoods] = useState([]);
  const load = async () => {
    try {
      const { data } = await api.get("/api/foods/my-foods");
      setFoods(data.foods || []);
    } catch (error) {
      toast.error(messageFromError(error, "Could not load your foods"));
    }
  };
  useEffect(() => { load(); }, []);

  const toggle = async (food) => {
    try {
      await api.patch(`/api/foods/${food._id}/availability`);
      load();
    } catch (error) {
      toast.error(messageFromError(error, "Could not update availability"));
    }
  };

  const remove = async (food) => {
    try {
      await api.delete(`/api/foods/${food._id}`);
      toast.success("Food removed");
      load();
    } catch (error) {
      toast.error(messageFromError(error, "Could not delete food"));
    }
  };

  return (
    <main className="page">
      <div className="pageHead"><span className="badge">My menu</span><h1>Hotel foods</h1></div>
      {foods.length ? <section className="cards">{foods.map((food) => <div key={food._id}><FoodCard food={food} /><div className="cardActions"><button className="btn small" onClick={() => toggle(food)}>{food.isAvailable ? "Mark unavailable" : "Mark available"}</button><button className="dangerBtn small" onClick={() => remove(food)}>Delete</button></div></div>)}</section> : <EmptyState title="No foods yet" text="Add dishes from the menu builder." />}
    </main>
  );
}
