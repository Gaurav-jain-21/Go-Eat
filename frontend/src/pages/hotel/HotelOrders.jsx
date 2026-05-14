import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/api";
import EmptyState from "../../components/EmptyState";
import { currency, getUser, messageFromError } from "../../utils/app";
import { notifyUserOrderStatus } from "../../utils/notifications";

const statuses = ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export default function HotelOrders() {
  const user = getUser();
  const ownerId = user?.userId || user?._id;
  const [hotels, setHotels] = useState([]);
  const [hotelId, setHotelId] = useState("");
  const [orders, setOrders] = useState([]);
  const [trackingForm, setTrackingForm] = useState({
    deliveryPartnerId: "",
    deliveryPartnerName: "",
    deliveryPartnerPhone: "",
    estimatedMinutes: 30,
    lat: "",
    lng: "",
    status: "ON_THE_WAY",
  });

  useEffect(() => {
    api.get("/api/hotels").then(({ data }) => {
      const mine = (data.hotels || []).filter((hotel) => hotel.ownerId === ownerId);
      setHotels(mine);
      if (mine[0]?._id) setHotelId(mine[0]._id);
    }).catch(() => {});
  }, [ownerId]);

  useEffect(() => {
    if (!hotelId) return;
    api.get(`/api/orders/hotel/${hotelId}`).then(({ data }) => setOrders(data.orders || [])).catch((error) => toast.error(messageFromError(error, "Could not load hotel orders")));
  }, [hotelId]);

  const update = async (order, orderStatus) => {
    try {
      const { data } = await api.patch(`/api/orders/${order._id}/status`, { orderStatus });
      const updatedOrder = data.order || { ...order, orderStatus };
      await notifyUserOrderStatus(updatedOrder, orderStatus);
      setOrders((prev) => prev.map((item) => item._id === order._id ? updatedOrder : item));
      toast.success("User notified about order status");
    } catch (error) {
      toast.error(messageFromError(error, "Could not update order"));
    }
  };

  const selectedHotel = hotels.find((hotel) => hotel._id === hotelId);

  const createTracking = async (order) => {
    const pickup = {
      lat: selectedHotel?.location?.coordinates?.[1] || 0,
      lng: selectedHotel?.location?.coordinates?.[0] || 0,
    };
    const drop = {
      lat: Number(order.deliveryAddress?.lat) || pickup.lat,
      lng: Number(order.deliveryAddress?.lng) || pickup.lng,
    };

    try {
      await api.post("/api/delivery/create", {
        orderId: order._id,
        userId: order.userId,
        hotelId,
        deliveryPartnerId: trackingForm.deliveryPartnerId,
        deliveryPartnerName: trackingForm.deliveryPartnerName,
        deliveryPartnerPhone: trackingForm.deliveryPartnerPhone,
        pickupLocation: pickup,
        dropLocation: drop,
        estimatedMinutes: Number(trackingForm.estimatedMinutes) || 30,
      });
      toast.success("Delivery tracking created");
    } catch (error) {
      toast.error(messageFromError(error, "Could not create tracking"));
    }
  };

  const updateDelivery = async (order, action) => {
    try {
      if (action === "location") {
        await api.patch(`/api/delivery/order/${order._id}/location`, {
          lat: trackingForm.lat,
          lng: trackingForm.lng,
          estimatedMinutes: trackingForm.estimatedMinutes,
        });
        toast.success("Live location updated");
        return;
      }

      await api.patch(`/api/delivery/order/${order._id}/status`, {
        status: trackingForm.status,
      });
      toast.success("Delivery status updated");
    } catch (error) {
      toast.error(messageFromError(error, "Could not update delivery"));
    }
  };

  return (
    <main className="page">
      <div className="pageHead"><span className="badge">Kitchen orders</span><h1>Hotel orders</h1></div>
      <div className="filterBar compact"><select value={hotelId} onChange={(e) => setHotelId(e.target.value)}>{hotels.map((hotel) => <option key={hotel._id} value={hotel._id}>{hotel.hotelName}</option>)}</select></div>
      <section className="panel mt">
        <h2>Delivery controls</h2>
        <div className="grid2">
          <input placeholder="Partner id" value={trackingForm.deliveryPartnerId} onChange={(e) => setTrackingForm({ ...trackingForm, deliveryPartnerId: e.target.value })} />
          <input placeholder="Partner name" value={trackingForm.deliveryPartnerName} onChange={(e) => setTrackingForm({ ...trackingForm, deliveryPartnerName: e.target.value })} />
          <input placeholder="Partner phone" value={trackingForm.deliveryPartnerPhone} onChange={(e) => setTrackingForm({ ...trackingForm, deliveryPartnerPhone: e.target.value })} />
          <input placeholder="ETA minutes" value={trackingForm.estimatedMinutes} onChange={(e) => setTrackingForm({ ...trackingForm, estimatedMinutes: e.target.value })} />
          <input placeholder="Current latitude" value={trackingForm.lat} onChange={(e) => setTrackingForm({ ...trackingForm, lat: e.target.value })} />
          <input placeholder="Current longitude" value={trackingForm.lng} onChange={(e) => setTrackingForm({ ...trackingForm, lng: e.target.value })} />
          <select value={trackingForm.status} onChange={(e) => setTrackingForm({ ...trackingForm, status: e.target.value })}>
            {["ASSIGNED", "PICKED_UP", "ON_THE_WAY", "NEAR_USER", "DELIVERED", "CANCELLED"].map((status) => <option key={status}>{status}</option>)}
          </select>
        </div>
      </section>
      {orders.length ? <section className="stack">{orders.map((order) => <article className="panel" key={order._id}><div className="between wrap"><h2>Order #{order._id.slice(-6)}</h2><strong>{currency(order.finalAmount)}</strong></div><div className="miniList">{order.items.filter((item) => item.hotelId === hotelId).map((item) => <span key={item._id}>{item.foodName} x {item.quantity}</span>)}</div><select value={order.orderStatus} onChange={(e) => update(order, e.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select><div className="row wrap mt"><button className="btn small" onClick={() => createTracking(order)}>Create tracking</button><button className="btn ghost small" onClick={() => updateDelivery(order, "location")}>Update location</button><button className="btn ghost small" onClick={() => updateDelivery(order, "status")}>Update delivery status</button></div></article>)}</section> : <EmptyState title="No hotel orders" text="Orders for the selected hotel appear here." />}
    </main>
  );
}
