import { Link } from "react-router-dom";
import HotelCard from "../../components/HotelCard";
import EmptyState from "../../components/EmptyState";
import api from "../../api/api";
import { getUser } from "../../utils/app";
import { useEffect, useState } from "react";

export default function HotelProfile() {
  const user = getUser();
  const ownerId = user?.userId || user?._id;
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    api.get("/api/hotels").then(({ data }) => {
      setHotels((data.hotels || []).filter((hotel) => hotel.ownerId === ownerId));
    }).catch(() => {});
  }, [ownerId]);

  return (
    <main className="page">
      <div className="pageHead"><span className="badge">Hotel profile</span><h1>Your hotel profile</h1></div>
      {hotels.length ? <section className="cards">{hotels.map((hotel) => <HotelCard key={hotel._id} hotel={hotel} />)}</section> : <EmptyState title="No hotel profile" text="Create your hotel profile first." />}
      <Link className="btn mt" to="/hotel/create">Create or update hotel</Link>
    </main>
  );
}
