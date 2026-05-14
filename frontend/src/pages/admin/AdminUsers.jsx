import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/api";
import { messageFromError } from "../../utils/app";

export default function AdminUsers() {
  const [userId, setUserId] = useState("");

  const updateUser = async (action) => {
    if (!userId) return toast.error("Enter a user id first");
    try {
      await api.patch(`/api/admin/users/${userId}/${action}`);
      toast.success(`User ${action}ed`);
    } catch (error) {
      toast.error(messageFromError(error, `Could not ${action} user`));
    }
  };

  return (
    <main className="page narrow">
      <div className="pageHead"><span className="badge">Admin users</span><h1>Users</h1><p className="muted">The current admin service exposes block and unblock actions by user id.</p></div>
      <section className="panel">
        <input placeholder="User id" value={userId} onChange={(event) => setUserId(event.target.value)} />
        <div className="row wrap mt">
          <button className="dangerBtn" onClick={() => updateUser("block")}>Block user</button>
          <button className="btn ghost" onClick={() => updateUser("unblock")}>Unblock user</button>
        </div>
      </section>
    </main>
  );
}
