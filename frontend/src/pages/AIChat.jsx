import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/api";
import { messageFromError } from "../utils/app";

export default function AIChat() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [mode, setMode] = useState("chat");

  const submit = async (event) => {
    event.preventDefault();
    setReply("");
    try {
      const { data } = await api.post(`/api/ai/${mode}`, { message });
      setReply(data.aiReply || "No reply returned.");
    } catch (error) {
      toast.error(messageFromError(error, "AI service is not available"));
    }
  };

  return (
    <main className="page">
      <section className="chatPanel">
        <span className="badge">GoEat AI</span>
        <h1>Ask about food, orders, or support</h1>
        <form className="chatForm" onSubmit={submit}>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="chat">General</option>
            <option value="rag-chat">Support RAG</option>
          </select>
          <input placeholder="What should I eat under Rs 300?" value={message} onChange={(e) => setMessage(e.target.value)} required />
          <button className="btn">Ask</button>
        </form>
        {reply && <div className="aiReply">{reply}</div>}
      </section>
    </main>
  );
}
