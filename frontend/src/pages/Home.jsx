import { Bike, Clock, Sparkles, Utensils } from "lucide-react";
import { getUser } from "../utils/app";
import HotelDashboard from "./hotel/HotelDashboard";

export default function Home() {
  const user = getUser();

  if (user?.role === "HOTEL") {
    return <HotelDashboard />;
  }

  return (
    <>
      <section className="hero">
        <div className="heroText">
          <span className="badge">
            {user?.role === "USER"
              ? `Welcome, ${user.name}`
              : "Hot meals, clean checkout, live ordering"}
          </span>
          <h1>Food delivery that feels fast before the first bite.</h1>
          <p>
            Browse restaurants, build a cart, place orders, manage hotel menus,
            and track the complete flow from one polished GoEat interface.
          </p>
        </div>
        <div className="heroVisual">
          <img
            src="https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=1100&q=80"
            alt="Fresh food spread"
          />
          <div className="floatCard">
            <Sparkles size={20} /> 20 min average prep
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <Utensils size={30} />
          <h3>Curated menus</h3>
          <p>Search foods by dish, category, veg preference, and hotel.</p>
        </div>
        <div className="feature">
          <Bike size={30} />
          <h3>Order flow</h3>
          <p>
            Cart, checkout, orders, status updates, and delivery views are
            wired.
          </p>
        </div>
        <div className="feature">
          <Clock size={30} />
          <h3>Hotel tools</h3>
          <p>
            Owners can create hotels, add dishes, and manage menu availability.
          </p>
        </div>
      </section>
    </>
  );
}
