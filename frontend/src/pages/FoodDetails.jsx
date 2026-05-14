import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, Heart, ShoppingCart, Star, Zap } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/api";
import EmptyState from "../components/EmptyState";
import FoodCard from "../components/FoodCard";
import { currency, fallbackFood, getUser, messageFromError } from "../utils/app";

export default function FoodDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  const [food, setFood] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarFoods, setSimilarFoods] = useState([]);
  const [average, setAverage] = useState({ averageRating: 0, totalReviews: 0 });
  const [review, setReview] = useState({ rating: 5, comment: "" });

  const loadReviews = useCallback(async () => {
    const { data } = await api.get(`/api/reviews/food/${id}`);
    setReviews(data.reviews || []);
    setAverage(data.average || { averageRating: 0, totalReviews: 0 });
  }, [id]);

  useEffect(() => {
    api.get(`/api/foods/${id}`)
      .then(async ({ data }) => {
        setFood(data.food);
        const allFoods = await api.get("/api/foods");
        const response = await api.post("/api/recommendations/similar-foods", {
          currentFood: {
            ...data.food,
            foodId: data.food._id,
          },
          foods: (allFoods.data.foods || []).map((item) => ({
            ...item,
            foodId: item._id,
          })),
          limit: 6,
        });
        setSimilarFoods(response.data.foods || []);
      })
      .catch((error) => toast.error(messageFromError(error, "Food not found")));
    loadReviews().catch(() => {});
  }, [id, loadReviews]);

  const addToCart = async (selectedFood = food) => {
    try {
      await api.post("/api/cart/add", {
        foodId: selectedFood._id || selectedFood.foodId,
        hotelId: selectedFood.hotelId,
        foodName: selectedFood.name,
        hotelName: selectedFood.hotelName,
        image: selectedFood.image,
        price: selectedFood.price,
        quantity: 1,
      });
      toast.success("Added to cart");
    } catch (error) {
      toast.error(messageFromError(error, "Login as customer to add cart items"));
    }
  };

  const orderNow = (selectedFood = food) => {
    localStorage.setItem("buyNowItem", JSON.stringify({ ...selectedFood, _id: selectedFood._id || selectedFood.foodId }));
    navigate("/checkout?mode=buy-now");
  };

  const addFavorite = async () => {
    try {
      await api.post("/api/users/favorites/food", { foodId: food._id });
      toast.success("Added to favorite foods");
    } catch (error) {
      toast.error(messageFromError(error, "Could not add favorite"));
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    try {
      await api.post("/api/reviews", {
        userName: user?.name || "GoEat user",
        targetType: "FOOD",
        foodId: food._id,
        hotelId: food.hotelId,
        rating: Number(review.rating),
        comment: review.comment,
      });
      toast.success("Review added");
      setReview({ rating: 5, comment: "" });
      loadReviews();
    } catch (error) {
      toast.error(messageFromError(error, "Could not submit review"));
    }
  };

  if (!food) {
    return <main className="page"><p className="muted">Loading food...</p></main>;
  }

  return (
    <main className="page">
      <section className="detailHero">
        <img src={food.image || fallbackFood} alt={food.name} />
        <div>
          <span className="badge">{food.category}</span>
          <h1>{food.name}</h1>
          <p className="muted">{food.description || `Freshly prepared by ${food.hotelName}.`}</p>
          <div className="detailMeta">
            <span className="rating"><Star size={17} fill="currentColor" /> {average.averageRating || food.rating || "New"} ({average.totalReviews || 0})</span>
            <span className="meta"><Clock size={16} /> {food.preparationTime || 20} min</span>
            <strong className="price">{currency(food.price)}</strong>
          </div>
          <div className="row wrap mt">
            <button className="btn" onClick={addToCart}><ShoppingCart size={18} /> Add to cart</button>
            <button className="btn ghost" onClick={orderNow}><Zap size={18} /> Order now</button>
            <button className="btn ghost" onClick={addFavorite}><Heart size={18} /> Favorite</button>
          </div>
        </div>
      </section>

      <section className="detailGrid">
        <form className="panel" onSubmit={submitReview}>
          <h2>Write a review</h2>
          <div className="grid2">
            <select value={review.rating} onChange={(event) => setReview({ ...review, rating: event.target.value })}>
              {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} star</option>)}
            </select>
            <input placeholder="Your name" value={user?.name || ""} readOnly />
            <textarea className="span2" placeholder="How was it?" value={review.comment} onChange={(event) => setReview({ ...review, comment: event.target.value })} required />
          </div>
          <button className="btn full">Submit review</button>
        </form>
        <section className="panel">
          <h2>People reviews</h2>
          {reviews.length ? (
            <div className="stack">
              {reviews.map((item) => (
                <article className="reviewItem" key={item._id}>
                  <strong>{item.userName || "GoEat user"}</strong>
                  <span className="rating"><Star size={14} fill="currentColor" /> {item.rating}</span>
                  <p>{item.comment}</p>
                </article>
              ))}
            </div>
          ) : <EmptyState title="No reviews yet" text="Be the first person to review this food." />}
        </section>
      </section>

      <div className="pageHead mt">
        <span className="badge">Recommendation service</span>
        <h1>Similar foods</h1>
        <p className="muted">Recommended using category, price, veg preference, and score from the recommendation microservice.</p>
      </div>
      {similarFoods.length ? (
        <section className="cards">
          {similarFoods.map((item) => (
            <div key={item._id || item.foodId}>
              <FoodCard food={{ ...item, _id: item._id || item.foodId }} onAdd={addToCart} />
              <div className="cardActions">
                <button className="btn small" onClick={() => addToCart(item)}><ShoppingCart size={15} /> Add cart</button>
                <button className="btn ghost small" onClick={() => orderNow(item)}><Zap size={15} /> Order now</button>
              </div>
            </div>
          ))}
        </section>
      ) : <EmptyState title="No similar foods yet" text="Similar food recommendations will appear when more foods exist." />}
    </main>
  );
}
