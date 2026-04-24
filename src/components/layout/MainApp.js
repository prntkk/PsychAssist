"use client";
import { useChat } from "../../context/ChatContext";
import Sidebar from "./Sidebar";
import TopNavigation from "./TopNavigation";
import ChatFeed from "../chat/ChatFeed";
import ChatInput from "../chat/ChatInput";
import CrisisAlert from "../CrisisAlert";
import CompanionAgent from "../CompanionAgent";
import dynamic from "next/dynamic";
import { useCompanionStore } from "../../store/useCompanionStore";

const DynamicOrbScene = dynamic(() => import("../3d/ReactiveOrbScene"), { ssr: false });

export default function MainApp() {
  const { isClient, showCrisisAlert, sentiment } = useChat();
  const { aiIsSpeaking, userEmotion } = useCompanionStore();

  if (!isClient) return null;

  const glowColors = {
    neutral: "from-teal-500/20 to-cyan-500/20",
    stressed: "from-red-500/20 to-orange-500/20",
    sad: "from-blue-500/20 to-indigo-500/20",
    calm: "from-emerald-500/20 to-teal-500/20"
  };

  return (
    <div className="flex h-[100dvh] w-screen bg-[#050810] text-gray-200 font-sans overflow-hidden relative">
      
      {/* Ambient Backgrounds */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br ${glowColors[sentiment]} rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-breathe transition-colors duration-1000`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-gradient-to-tl from-blue-600/10 to-purple-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-breathe transition-colors duration-1000`} style={{ animationDelay: '5s' }}></div>
      <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

      {/* 3D Visualizer Background (Client-Side Only) */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-60 mix-blend-screen">
        <DynamicOrbScene emotion={userEmotion} isProcessing={false} isSpeaking={aiIsSpeaking} />
      </div>

      <CompanionAgent />

      {showCrisisAlert && <CrisisAlert onClose={() => setShowCrisisAlert(false)} />}
      
      <Sidebar />

      {/* Main Column - Forced to stay inside the screen */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative z-10">
        <TopNavigation />
        <ChatFeed />
        <ChatInput />
      </main>
    </div>
  );
}