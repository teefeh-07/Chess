import React, { useState } from "react";

export interface ChatMessage {
  sender: string;
  text: string;
  timestamp: number;
}

export const ChatBox = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  return <div className="chatbox"></div>;
};
