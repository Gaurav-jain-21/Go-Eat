import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/api";
import EmptyState from "../components/EmptyState";
import { currency, messageFromError } from "../utils/app";

const statusClass = (status) =>
  status === "SUCCESS" ? "pill green" : status === "REFUNDED" ? "pill red" : "pill orange";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/api/payments/my-payments");
        const items = data.payments || [];
        setPayments(items);

        const orderResults = await Promise.allSettled(
          items.map((payment) => api.get(`/api/orders/${payment.orderId}`).then((res) => [payment.orderId, res.data.order])),
        );
        setOrders(Object.fromEntries(
          orderResults.filter((result) => result.status === "fulfilled").map((result) => result.value),
        ));
      } catch (error) {
        toast.error(messageFromError(error, "Could not load payments"));
      }
    };
    load();
  }, []);

  const totals = payments.reduce((acc, payment) => {
    acc.total += Number(payment.amount || 0);
    acc[payment.status] = (acc[payment.status] || 0) + 1;
    return acc;
  }, { total: 0 });

  return (
    <main className="page">
      <div className="pageHead">
        <span className="badge">Payment service</span>
        <h1>Your payments</h1>
        <p className="muted">Razorpay payments, status, refund details, and linked order information.</p>
      </div>

      <section className="dashGrid">
        <div className="dashCard">Total paid <strong>{currency(totals.total)}</strong></div>
        <div className="dashCard">Success <strong>{totals.SUCCESS || 0}</strong></div>
        <div className="dashCard">Created <strong>{totals.CREATED || 0}</strong></div>
        <div className="dashCard">Refunded <strong>{totals.REFUNDED || 0}</strong></div>
      </section>

      {payments.length ? (
        <section className="stack mt">
          {payments.map((payment) => {
            const order = orders[payment.orderId];
            return (
              <article className="panel" key={payment._id}>
                <div className="between wrap">
                  <div>
                    <h2>Order #{String(payment.orderId).slice(-6)}</h2>
                    <p className="muted">{new Date(payment.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={statusClass(payment.status)}>{payment.status}</span>
                  <strong>{currency(payment.amount)}</strong>
                </div>
                <div className="miniList">
                  <span>{payment.currency}</span>
                  <span>Razorpay order: {payment.razorpayOrderId || "-"}</span>
                  <span>Payment id: {payment.razorpayPaymentId || "Pending"}</span>
                  {order && <span>Order status: {order.orderStatus}</span>}
                  {order && <span>Method: {order.paymentMethod}</span>}
                </div>
                {payment.status === "REFUNDED" && (
                  <div className="panel mt">
                    <h2>Refund details</h2>
                    <p className="between"><span>Refund ID</span><strong>{payment.refundId || "-"}</strong></p>
                    <p className="between"><span>Refund amount</span><strong>{currency(payment.refundAmount)}</strong></p>
                    <p className="muted">{payment.refundReason || "No refund reason added."}</p>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      ) : <EmptyState title="No online payments yet" text="Razorpay payment records will appear here after checkout." />}
    </main>
  );
}
