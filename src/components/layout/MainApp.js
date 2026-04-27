"use client";
import { useChat } from "../../context/ChatContext";
import Sidebar from "./Sidebar";
import TopNavigation from "./TopNavigation";
import ChatFeed from "../chat/ChatFeed";
import ChatInput from "../chat/ChatInput";
import CrisisAlert from "../CrisisAlert";
import CompanionAgent from "../CompanionAgent";
import { useCompanionStore } from "../../store/useCompanionStore";
import VoiceModeOverlay from "../chat/VoiceModeOverlay";

export default function MainApp() {
  const { isClient, showCrisisAlert } = useChat();
  const { showWebcam } = useCompanionStore();

  if (!isClient) return null;

  return (
    <div className="flex h-[100dvh] w-screen text-gray-200 font-sans overflow-hidden relative" style={{ background: "#04060f" }}>

      {/* ── Premium Aurora Background ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(15,40,80,0.65) 0%, transparent 70%)' }} />
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 70% 55% at 85% 90%, rgba(8,20,50,0.75) 0%, transparent 70%)' }} />
        <div className="aurora-blob aurora-1" />
        <div className="aurora-blob aurora-2" />
      </div>


      <CompanionAgent />

      {showCrisisAlert && <CrisisAlert onClose={() => {}} />}

      {/* Sidebar always sits above overlay (z-50) */}
      <Sidebar />

      {/* Main chat column — overlay lives here so sidebar stays unblocked */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative z-10">
        <TopNavigation />
        {showWebcam ? (
          <VoiceModeOverlay />
        ) : (
          <>
            <ChatFeed />
            <ChatInput />
          </>
        )}
      </main>
    </div>
  );
}