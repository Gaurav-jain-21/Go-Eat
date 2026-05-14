import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/api";
import FoodCard from "../../components/FoodCard";
import EmptyState from "../../components/EmptyState";
import { messageFromError } from "../../utils/app";

export default function AdminFoods() {
  const [foods, setFoods] = useState([]);
  const load = async () => {
    try {
      const { data } = await api.get("/api/admin/foods");
      setFoods(data.foods || []);
    } catch (error) {
      toast.error(messageFromError(error, "Could not load foods"));
    }
  };
  useEffect(() => { load(); }, []);
  const remove = async (food) => {
    try {
      await api.delete(`/api/admin/foods/${food._id}`);
      toast.success("Food deleted");
      load();
    } catch (error) {
      toast.error(messageFromError(error, "Could not delete food"));
    }
  };
  return (
    <main className="page">
      <div className="pageHead"><span className="badge">Admin</span><h1>Food catalog</h1></div>
      {foods.length ? <section className="cards">{foods.map((food) => <div key={food._id}><FoodCard food={food} /><div className="cardActions"><button className="dangerBtn small" onClick={() => remove(food)}>Delete</button></div></div>)}</section> : <EmptyState title="No foods" />}
    </main>
  );
}
