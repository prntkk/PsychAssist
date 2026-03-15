"use client";
import { ChatProvider } from "../context/ChatContext";
import MainApp from "../components/layout/MainApp";

export default function Home() {
  return (
    <ChatProvider>
      <MainApp />
    </ChatProvider>
  );
}