import { Clock, Plus, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { currency, fallbackFood } from "../utils/app";

export default function FoodCard({ food, onAdd }) {
  return (
    <article className="foodCard">
      <Link to={`/foods/${food._id}`} className="cardLink">
        <div className="mediaWrap">
          <img src={food.image || fallbackFood} alt={food.name} />
          <span className={food.isVeg ? "vegMark" : "nonVegMark"} />
        </div>
        <div className="cardBody">
          <div className="between">
            <p className="eyebrow">{food.category || "Popular"}</p>
            <span className="rating">
              <Star size={14} fill="currentColor" /> {food.rating || "4.5"}
            </span>
          </div>
          <h2>{food.name}</h2>
          <p className="muted clamp">{food.description || food.hotelName}</p>
          <div className="between cardFoot">
            <div>
              <strong className="price">{currency(food.price)}</strong>
              <span className="meta">
                <Clock size={14} /> {food.preparationTime || 20} min
              </span>
            </div>
          </div>
        </div>
      </Link>
      {onAdd && (
        <div className="quickCardAction">
          {onAdd && (
            <button className="roundBtn" onClick={() => onAdd(food)} title="Add to cart">
              <Plus size={18} />
            </button>
          )}
        </div>
      )}
    </article>
  );
}
