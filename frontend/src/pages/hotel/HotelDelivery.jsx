import { useCallback, useEffect, useState } from "react";
import { Truck } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/api";
import EmptyState from "../../components/EmptyState";
import { getUser, messageFromError } from "../../utils/app";

const blankAssign = {
  orderId: "",
  deliveryPartnerId: "",
  deliveryPartnerName: "",
  deliveryPartnerPhone: "",
};

export default function HotelDelivery() {
  const user = getUser();
  const ownerId = user?.userId || user?._id;
  const [hotels, setHotels] = useState([]);
  const [hotelId, setHotelId] = useState("");
  const [trackings, setTrackings] = useState([]);
  const [partners, setPartners] = useState([]);
  const [assign, setAssign] = useState(blankAssign);

  useEffect(() => {
    api.get("/api/hotels").then(({ data }) => {
      const mine = (data.hotels || []).filter((hotel) => hotel.ownerId === ownerId);
      setHotels(mine);
      if (mine[0]?._id) setHotelId(mine[0]._id);
    }).catch(() => {});
  }, [ownerId]);

  useEffect(() => {
    api.get("/api/auth/delivery-partners")
      .then(({ data }) => setPartners(data.partners || []))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    if (!hotelId) return;
    try {
      const { data } = await api.get(`/api/delivery/hotel/${hotelId}`);
      setTrackings(data.trackings || []);
    } catch (error) {
      toast.error(messageFromError(error, "Could not load hotel delivery tracking"));
    }
  }, [hotelId]);

  useEffect(() => { load(); }, [load]);

  const assignPartner = async (event) => {
    event.preventDefault();
    try {
      await api.patch(`/api/delivery/order/${assign.orderId}/assign`, {
        deliveryPartnerId: assign.deliveryPartnerId,
        deliveryPartnerName: assign.deliveryPartnerName,
        deliveryPartnerPhone: assign.deliveryPartnerPhone,
      });
      toast.success("Delivery partner assigned");
      setAssign(blankAssign);
      load();
    } catch (error) {
      toast.error(messageFromError(error, "Could not assign delivery partner"));
    }
  };

  const pickTracking = (tracking) => {
    setAssign({
      orderId: tracking.orderId,
      deliveryPartnerId: tracking.deliveryPartnerId || "",
      deliveryPartnerName: tracking.deliveryPartnerName || "",
      deliveryPartnerPhone: tracking.deliveryPartnerPhone || "",
    });
  };

  const pickPartner = (partner) => {
    setAssign({
      ...assign,
      deliveryPartnerId: partner._id,
      deliveryPartnerName: partner.name,
      deliveryPartnerPhone: partner.phone || "",
    });
  };

  return (
    <main className="page">
      <div className="pageHead">
        <span className="badge">Delivery service</span>
        <h1>Hotel delivery tracking</h1>
        <p className="muted">View all tracking records for your hotel and assign delivery partners.</p>
      </div>

      <div className="filterBar compact">
        <select value={hotelId} onChange={(event) => setHotelId(event.target.value)}>
          {hotels.map((hotel) => <option key={hotel._id} value={hotel._id}>{hotel.hotelName}</option>)}
        </select>
        <button className="btn" onClick={load}>Refresh</button>
      </div>

      <form className="panel" onSubmit={assignPartner}>
        <h2>Assign delivery partner</h2>
        <div className="grid2">
          <input placeholder="Order id" value={assign.orderId} onChange={(event) => setAssign({ ...assign, orderId: event.target.value })} required />
          <select value={assign.deliveryPartnerId} onChange={(event) => {
            const partner = partners.find((item) => item._id === event.target.value);
            if (partner) pickPartner(partner);
            else setAssign({ ...assign, deliveryPartnerId: "" });
          }} required>
            <option value="">Select delivery partner</option>
            {partners.map((partner) => <option key={partner._id} value={partner._id}>{partner.name} - {partner.email}</option>)}
          </select>
          <input placeholder="Partner name" value={assign.deliveryPartnerName} onChange={(event) => setAssign({ ...assign, deliveryPartnerName: event.target.value })} />
          <input placeholder="Partner phone" value={assign.deliveryPartnerPhone} onChange={(event) => setAssign({ ...assign, deliveryPartnerPhone: event.target.value })} />
        </div>
        <button className="btn full">Assign partner</button>
      </form>

      {partners.length ? (
        <section className="cards mt">
          {partners.map((partner) => (
            <article className="panel" key={partner._id}>
              <div className="between wrap">
                <h2>{partner.name}</h2>
                <span className="pill green">DELIVERY</span>
              </div>
              <p className="muted">{partner.email}</p>
              <div className="miniList">
                <span>ID {partner._id}</span>
                <span>{partner.isEmailVerified ? "Verified" : "Not verified"}</span>
              </div>
              <button className="btn ghost small" onClick={() => pickPartner(partner)}>Select partner</button>
            </article>
          ))}
        </section>
      ) : null}

      <div className="pageHead mt"><span className="badge">Tracking</span><h1>{trackings.length} records</h1></div>
      {trackings.length ? (
        <section className="stack">
          {trackings.map((item) => (
            <article className="panel" key={item._id}>
              <div className="between wrap">
                <h2><Truck size={20} /> Order #{String(item.orderId).slice(-6)}</h2>
                <span className="pill orange">{item.status}</span>
              </div>
              <p className="muted">Partner: {item.deliveryPartnerName || "Not assigned"} {item.deliveryPartnerPhone ? `· ${item.deliveryPartnerPhone}` : ""}</p>
              <div className="miniList">
                <span>ETA {item.estimatedMinutes ?? "-"} min</span>
                <span>{item.distanceToUserKm ?? "-"} km away</span>
                <span>Current {item.currentLocation?.lat ?? "-"}, {item.currentLocation?.lng ?? "-"}</span>
                <span>Pickup {item.pickupLocation?.lat}, {item.pickupLocation?.lng}</span>
                <span>Drop {item.dropLocation?.lat}, {item.dropLocation?.lng}</span>
              </div>
              <button className="btn ghost small" onClick={() => pickTracking(item)}>Use for assignment</button>
            </article>
          ))}
        </section>
      ) : <EmptyState title="No delivery tracking" text="Create tracking from Hotel Orders first." />}
    </main>
  );
}
