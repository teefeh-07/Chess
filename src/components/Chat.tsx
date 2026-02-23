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

  return <div className="chatbox"></div>;
};
