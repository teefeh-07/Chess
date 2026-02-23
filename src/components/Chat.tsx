import React, { useState } from "react";

export interface ChatMessage {
  sender: string;
  text: string;
  timestamp: number;
}
