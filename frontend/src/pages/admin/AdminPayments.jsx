import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/api";
import EmptyState from "../../components/EmptyState";
import { currency, messageFromError } from "../../utils/app";

export default function AdminPayments() {
  const [orderId, setOrderId] = useState("");
  const [payment, setPayment] = useState(null);
  const [refund, setRefund] = useState({ amount: "", reason: "" });

  const findPayment = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.get(`/api/admin/payments/order/${orderId}`);
      setPayment(data.payment || data);
    } catch (error) {
      setPayment(null);
      toast.error(messageFromError(error, "Payment not found"));
    }
  };

  const refundPayment = async () => {
    try {
      await api.post("/api/payments/refund", { orderId, ...refund });
      toast.success("Refund requested");
      setRefund({ amount: "", reason: "" });
    } catch (error) {
      toast.error(messageFromError(error, "Refund failed"));
    }
  };

  return (
    <main className="page narrow">
      <div className="pageHead"><span className="badge">Admin payments</span><h1>Payment section</h1></div>
      <form className="filterBar compact" onSubmit={findPayment}>
        <input placeholder="Order id" value={orderId} onChange={(event) => setOrderId(event.target.value)} required />
        <button className="btn">Find payment</button>
      </form>
      {payment ? (
        <section className="panel">
          <div className="between wrap">
            <h2>Order #{String(payment.orderId).slice(-6)}</h2>
            <span className="pill orange">{payment.status}</span>
            <strong>{currency(payment.amount)}</strong>
          </div>
          <div className="grid2 mt">
            <input placeholder="Refund amount optional" value={refund.amount} onChange={(event) => setRefund({ ...refund, amount: event.target.value })} />
            <input placeholder="Refund reason" value={refund.reason} onChange={(event) => setRefund({ ...refund, reason: event.target.value })} />
          </div>
          <button className="dangerBtn" onClick={refundPayment}>Refund payment</button>
        </section>
      ) : <EmptyState title="Search payment" text="Enter an order id to inspect its payment." />}
    </main>
  );
}
