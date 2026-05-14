import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/api";
import EmptyState from "../components/EmptyState";
import { currency, messageFromError } from "../utils/app";

export default function Payments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    api.get("/api/payments/my-payments")
      .then(({ data }) => setPayments(data.payments || []))
      .catch((error) => toast.error(messageFromError(error, "Could not load payments")));
  }, []);

  return (
    <main className="page">
      <div className="pageHead"><span className="badge">Payments</span><h1>Your payments</h1></div>
      {payments.length ? (
        <section className="stack">
          {payments.map((payment) => (
            <article className="panel" key={payment._id}>
              <div className="between wrap">
                <h2>Order #{String(payment.orderId).slice(-6)}</h2>
                <span className="pill orange">{payment.status}</span>
                <strong>{currency(payment.amount)}</strong>
              </div>
              <p className="muted">Razorpay order: {payment.razorpayOrderId || "Not created"}</p>
            </article>
          ))}
        </section>
      ) : <EmptyState title="No payments yet" text="Online payment records will appear here." />}
    </main>
  );
}
