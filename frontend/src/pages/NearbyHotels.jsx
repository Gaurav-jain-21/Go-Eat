import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/api";
import HotelCard from "../components/HotelCard";
import EmptyState from "../components/EmptyState";
import { messageFromError } from "../utils/app";

export default function NearbyHotels() {
  const [form, setForm] = useState({ lat: "", lng: "", radius: 20 });
  const [hotels, setHotels] = useState([]);

  const find = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.get("/api/hotels/nearby", { params: form });
      setHotels(data.hotels || []);
    } catch (error) {
      toast.error(messageFromError(error, "Nearby search failed"));
    }
  };

  return (
    <main className="page">
      <div className="pageHead"><span className="badge">Nearby</span><h1>Find hotels around you</h1></div>
      <form className="filterBar compact" onSubmit={find}>
        <input placeholder="Latitude" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} required />
        <input placeholder="Longitude" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} required />
        <input placeholder="Radius km" value={form.radius} onChange={(e) => setForm({ ...form, radius: e.target.value })} />
        <button className="btn">Find</button>
      </form>
      {hotels.length ? <section className="cards">{hotels.map((hotel) => <HotelCard key={hotel._id} hotel={hotel} />)}</section> : <EmptyState title="Search your area" text="Enter coordinates to use the location endpoint." />}
    </main>
  );
}
