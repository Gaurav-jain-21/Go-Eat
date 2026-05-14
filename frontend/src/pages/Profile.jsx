import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/api";
import EmptyState from "../components/EmptyState";
import { getDeviceLocation, getUser, messageFromError, saveSession } from "../utils/app";

const emptyAddress = {
  label: "",
  fullAddress: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  lat: "",
  lng: "",
  isDefault: false,
};

export default function Profile() {
  const [user, setUser] = useState(getUser());
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "", profileImage: "" });
  const [address, setAddress] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState("");
  const [preferences, setPreferences] = useState({ vegOnly: false, favoriteCuisines: "", spiceLevel: "Medium" });

  const load = async () => {
    try {
      const [{ data: authData }, { data: profileData }] = await Promise.all([
        api.get("/api/auth/me"),
        api.get("/api/users/profile"),
      ]);
      setUser(authData.user);
      saveSession(localStorage.getItem("token"), authData.user);
      setProfile(profileData.profile);
      setProfileForm({
        name: profileData.profile?.name || authData.user?.name || "",
        email: profileData.profile?.email || authData.user?.email || "",
        phone: profileData.profile?.phone || "",
        profileImage: profileData.profile?.profileImage || "",
      });
      setPreferences({
        vegOnly: profileData.profile?.preferences?.vegOnly || false,
        favoriteCuisines: (profileData.profile?.preferences?.favoriteCuisines || []).join(", "),
        spiceLevel: profileData.profile?.preferences?.spiceLevel || "Medium",
      });

    } catch (error) {
      toast.error(messageFromError(error, "Could not load profile"));
    }
  };

  useEffect(() => { load(); }, []);

  const updateProfile = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.put("/api/users/profile", profileForm);
      setProfile(data.profile);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(messageFromError(error, "Could not update profile"));
    }
  };

  const useCurrentLocation = async () => {
    try {
      const location = await getDeviceLocation();
      setAddress((current) => ({ ...current, ...location }));
      await api.put("/api/auth/location", location);
      toast.success("Location captured");
    } catch {
      toast.error("Location permission was not allowed");
    }
  };

  const saveAddress = async (event) => {
    event.preventDefault();
    try {
      const { data } = editingAddressId
        ? await api.put(`/api/users/address/${editingAddressId}`, address)
        : await api.post("/api/users/address", address);
      setProfile(data.profile);
      setAddress(emptyAddress);
      setEditingAddressId("");
      toast.success(editingAddressId ? "Address updated" : "Address added");
    } catch (error) {
      toast.error(messageFromError(error, editingAddressId ? "Could not update address" : "Could not add address"));
    }
  };

  const editAddress = (item) => {
    setEditingAddressId(item._id);
    setAddress({
      label: item.label || "",
      fullAddress: item.fullAddress || "",
      city: item.city || "",
      state: item.state || "",
      pincode: item.pincode || "",
      phone: item.phone || "",
      lat: item.location?.coordinates?.[1] || "",
      lng: item.location?.coordinates?.[0] || "",
      isDefault: Boolean(item.isDefault),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelAddressEdit = () => {
    setEditingAddressId("");
    setAddress(emptyAddress);
  };

  const setDefaultAddress = async (addressId) => {
    try {
      const { data } = await api.patch(`/api/users/address/${addressId}/default`);
      setProfile(data.profile);
      toast.success("Default address updated");
    } catch (error) {
      toast.error(messageFromError(error, "Could not set default address"));
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      const { data } = await api.delete(`/api/users/address/${addressId}`);
      setProfile(data.profile);
      toast.success("Address deleted");
    } catch (error) {
      toast.error(messageFromError(error, "Could not delete address"));
    }
  };

  const updatePreferences = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.put("/api/users/preferences", {
        vegOnly: preferences.vegOnly,
        favoriteCuisines: preferences.favoriteCuisines.split(",").map((item) => item.trim()).filter(Boolean),
        spiceLevel: preferences.spiceLevel,
      });
      setProfile(data.profile);
      toast.success("Preferences saved");
    } catch (error) {
      toast.error(messageFromError(error, "Could not save preferences"));
    }
  };

  return (
    <main className="page">
      <div className="pageHead">
        <span className="badge">Profile</span>
        <h1>{user?.name || "Your profile"}</h1>
        <p className="muted">{user?.email} · {user?.role}</p>
      </div>

      <div className="checkoutGrid">
        <section className="stack">
          <form className="panel" onSubmit={updateProfile}>
            <h2>Profile settings</h2>
            <div className="grid2">
              <input placeholder="Name" value={profileForm.name} onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} />
              <input placeholder="Email" value={profileForm.email} onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })} />
              <input placeholder="Phone" value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} />
              <input placeholder="Profile image URL/data" value={profileForm.profileImage} onChange={(event) => setProfileForm({ ...profileForm, profileImage: event.target.value })} />
            </div>
            <button className="btn full">Save profile</button>
          </form>

          <form className="panel" onSubmit={saveAddress}>
            <div className="between wrap">
              <h2>{editingAddressId ? "Edit delivery address" : "Add delivery address"}</h2>
              <div className="row wrap">
                <button type="button" className="btn ghost small" onClick={useCurrentLocation}>Use device location</button>
                {editingAddressId && <button type="button" className="dangerBtn small" onClick={cancelAddressEdit}>Cancel edit</button>}
              </div>
            </div>
            <div className="grid2">
              <input placeholder="Label, e.g. Home" value={address.label} onChange={(event) => setAddress({ ...address, label: event.target.value })} />
              <input placeholder="Phone" value={address.phone} onChange={(event) => setAddress({ ...address, phone: event.target.value })} />
              <input className="span2" placeholder="Full address" value={address.fullAddress} onChange={(event) => setAddress({ ...address, fullAddress: event.target.value })} required />
              <input placeholder="City" value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} />
              <input placeholder="State" value={address.state} onChange={(event) => setAddress({ ...address, state: event.target.value })} />
              <input placeholder="Pincode" value={address.pincode} onChange={(event) => setAddress({ ...address, pincode: event.target.value })} />
              <select value={address.isDefault ? "yes" : "no"} onChange={(event) => setAddress({ ...address, isDefault: event.target.value === "yes" })}>
                <option value="no">Normal address</option>
                <option value="yes">Make default</option>
              </select>
            </div>
            <button className="btn full">{editingAddressId ? "Update address" : "Add address"}</button>
          </form>
        </section>

        <aside className="stack">
          <form className="panel" onSubmit={updatePreferences}>
            <h2>Food preferences</h2>
            <select value={preferences.vegOnly ? "yes" : "no"} onChange={(event) => setPreferences({ ...preferences, vegOnly: event.target.value === "yes" })}>
              <option value="no">All foods</option>
              <option value="yes">Veg only</option>
            </select>
            <input className="mt" placeholder="Favorite cuisines, comma separated" value={preferences.favoriteCuisines} onChange={(event) => setPreferences({ ...preferences, favoriteCuisines: event.target.value })} />
            <select className="mt" value={preferences.spiceLevel} onChange={(event) => setPreferences({ ...preferences, spiceLevel: event.target.value })}>
              <option>Mild</option>
              <option>Medium</option>
              <option>Hot</option>
            </select>
            <button className="btn full">Save preferences</button>
          </form>

          <section className="panel">
            <h2>Saved addresses</h2>
            {profile?.addresses?.length ? (
              <div className="stack">
                {profile.addresses.map((item) => (
                  <article className="reviewItem" key={item._id}>
                    <div className="between wrap">
                      <strong>{item.label || "Address"}</strong>
                      {item.isDefault && <span className="pill green">Default</span>}
                    </div>
                    <p>{item.fullAddress}</p>
                    <p className="muted">{item.city} {item.pincode}</p>
                    <div className="row wrap mt">
                      <button className="btn small" onClick={() => editAddress(item)}>Edit</button>
                      <button className="btn ghost small" onClick={() => setDefaultAddress(item._id)}>Set default</button>
                      <button className="dangerBtn small" onClick={() => deleteAddress(item._id)}>Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            ) : <EmptyState title="No addresses" text="Add an address to speed up checkout." />}
          </section>

        </aside>
      </div>
    </main>
  );
}
