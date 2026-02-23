import React, { useState } from "react";

export interface ChatMessage {
  sender: string;
  text: string;
  timestamp: number;
}

export const ChatBox = ({ currentUser }: { currentUser: string }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { sender: currentUser, text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
  };

  return (
    <div className="chatbox flex flex-col h-64 border p-4">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((m, i) => (
           <div key={i} className="mb-2"><strong>{m.sender}:</strong> {m.text}</div>
        ))}
      </div>
      <div className="flex">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 border p-2" />
        <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white p-2">Send</button>
      </div>
    </div>
  );
};
