import { useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";

export default function AIChat() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post("/api/ai/chat", {
        message,
      });

      console.log("AI Response:", data);

      setReply(
        data.aiReply ||
          data.response ||
          data.answer ||
          "No AI response received",
      );
    } catch (error) {
      console.log(error);
      toast.error("AI service error");
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="bg-white p-8 rounded-2xl shadow max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-500 mb-6">
          GoEat AI Chat
        </h1>

        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about food, orders, refunds..."
            className="border p-3 rounded flex-1"
          />

          <button className="bg-orange-500 text-white px-6 rounded">
            Send
          </button>
        </form>

        {reply && (
          <div className="mt-6 bg-orange-50 p-5 rounded-xl">
            <p>{reply}</p>
          </div>
        )}
      </div>
    </div>
  );
}
