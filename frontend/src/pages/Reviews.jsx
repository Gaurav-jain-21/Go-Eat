import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/api";
import EmptyState from "../components/EmptyState";
import { messageFromError } from "../utils/app";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    api.get("/api/reviews").then(({ data }) => setReviews(data.reviews || [])).catch((error) => toast.error(messageFromError(error, "Could not load reviews")));
  }, []);
  return (
    <main className="page">
      <div className="pageHead"><span className="badge">Reviews</span><h1>Customer feedback</h1></div>
      {reviews.length ? <section className="cards">{reviews.map((review) => <article className="panel" key={review._id}><h2>{review.rating || 5}/5</h2><p>{review.comment}</p><p className="muted">{review.userName || review.foodName || review.hotelName}</p></article>)}</section> : <EmptyState title="No reviews yet" text="Reviews will appear after customers post them." />}
    </main>
  );
}
