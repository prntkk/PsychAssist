"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompanionStore } from '../../store/useCompanionStore';
import { Mic, MicOff, PhoneOff } from 'lucide-react';
import { ChatService } from '../../services/ChatService';

// ── Orb config per mode ───────────────────────────────────────────────────────
type OrbMode = "idle" | "listening" | "ai" | "thinking";

const ORB_MODE: Record<OrbMode, {
  color1: string; color2: string;
  glow1: string;  glow2: string;
  speed1: string; speed2: string;
  scale: string;
}> = {
  idle: {
    color1:"#1a6e8a", color2:"#0d4d7a",
    glow1:"#1a6e8a55", glow2:"#0d4d7a55",
    speed1:"12s", speed2:"18s", scale:"1",
  },
  listening: {
    color1:"#00b4d8", color2:"#0077ff",
    glow1:"#00b4d877", glow2:"#0077ff77",
    speed1:"3.5s", speed2:"5s", scale:"1.08",
  },
  ai: {
    color1:"#cc44ff", color2:"#7722ff",
    glow1:"#cc44ff77", glow2:"#7722ff77",
    speed1:"2.5s", speed2:"3.8s", scale:"1.12",
  },
  thinking: {
    color1:"#ff9500", color2:"#cc4400",
    glow1:"#ff950077", glow2:"#cc440077",
    speed1:"6s", speed2:"9s", scale:"1.04",
  },
};

function VoiceOrb({ mode }: { mode: OrbMode }) {
  const cfg = ORB_MODE[mode];
  return (
    <>
      <div
        className="voice-orb-container"
        style={{
          ["--c1" as any]:  cfg.color1,
          ["--c2" as any]:  cfg.color2,
          ["--g1" as any]:  cfg.glow1,
          ["--g2" as any]:  cfg.glow2,
          ["--s1" as any]:  cfg.speed1,
          ["--s2" as any]:  cfg.speed2,
          ["--sc" as any]:  cfg.scale,
        } as React.CSSProperties}
      >
        <div className="voice-orb">
          <div className="voice-orb-inner v1" />
          <div className="voice-orb-inner v2" />
        </div>
      </div>

      <style>{`
        .voice-orb-container {
          width: min(52vmin, 480px);
          height: min(52vmin, 480px);
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          border-radius: 50%;
          rotate: 90deg;
          filter:
            drop-shadow(0 0 18px var(--g1))
            drop-shadow(0 0 40px var(--g2))
            drop-shadow(0 0 80px var(--g1));
          transform: scale(var(--sc));
          transition:
            transform  1.8s cubic-bezier(0.16, 1, 0.3, 1),
            filter     1.8s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, filter;
        }
        .voice-orb {
          position: absolute;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 50%;
          background: #03050d;
          filter: blur(30px);
        }
        .voice-orb-inner {
          position: absolute;
          border-radius: 50%;
          transition:
            background 2s ease,
            animation-duration 1s ease;
          will-change: transform;
        }
        .v1 {
          left: -120%; top: -25%;
          width: 160%; aspect-ratio: 1;
          background: var(--c1);
          clip-path: polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);
          animation: orb-spin var(--s1) cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }
        .v2 {
          right: -120%; bottom: -25%;
          left: auto; top: auto;
          width: 160%; aspect-ratio: 1;
          background: var(--c2);
          clip-path: polygon(20% 0%,0% 20%,30% 50%,0% 80%,20% 100%,50% 70%,80% 100%,100% 80%,70% 50%,100% 20%,80% 0%,50% 30%);
          animation: orb-spin var(--s2) cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite reverse;
        }
        @keyframes orb-spin {
          0%   { transform: rotate(0deg) scale(1); }
          25%  { transform: rotate(90deg) scale(1.04); }
          50%  { transform: rotate(180deg) scale(0.97); }
          75%  { transform: rotate(270deg) scale(1.03); }
          100% { transform: rotate(360deg) scale(1); }
        }
      `}</style>
    </>
  );
}

// ── Main Overlay ──────────────────────────────────────────────────────────────
export default function VoiceModeOverlay() {
  const {
    isListening, setIsListening, setSystemStatus,
    aiIsSpeaking, conversationHistory, setShowWebcam,
    userEmotion, addMessage,
  } = useCompanionStore();

  const [interimText, setInterimText] = useState("");
  const [micActive, setMicActive] = useState(false);

  const recognitionRef      = useRef<any>(null);
  const micActiveRef        = useRef(false);
  const isManuallyStoppedRef = useRef(false);

  useEffect(() => { micActiveRef.current = micActive; }, [micActive]);

  const lastUserMsg = [...conversationHistory].reverse().find(m => m.role === 'user')?.content;
  const lastAiMsg   = [...conversationHistory].reverse().find(m => m.role === 'assistant')?.content;

  // Orb mode
  let orbMode: OrbMode = "idle";
  if (aiIsSpeaking) orbMode = "ai";
  else if (isListening) orbMode = "listening";
  else if (useCompanionStore.getState().systemStatus?.includes("Processing")) orbMode = "thinking";

  const submitToAI = useCallback(async (text: string) => {
    if (!text.trim()) return;
    addMessage({ role: 'user', content: text.trim() });
    setSystemStatus("Processing Voice...");
    try {
      const history  = useCompanionStore.getState().conversationHistory;
      const emotion  = useCompanionStore.getState().userEmotion || 'neutral';
      const response = await ChatService.generateResponse(history, emotion);
      addMessage({ role: 'assistant', content: response });
      setSystemStatus("Idle");
      if ((window as any)._speakText) (window as any)._speakText(response);
    } catch {
      setSystemStatus("Ollama Connection Error");
    }
  }, [addMessage, setSystemStatus]);

  const startListening = useCallback(() => {
    if (useCompanionStore.getState().aiIsSpeaking) return;
    try { recognitionRef.current?.abort(); } catch {}

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Browser doesn't support speech recognition."); setMicActive(false); return; }

    const r = new SR();
    recognitionRef.current = r;
    r.continuous     = true;
    r.interimResults = true;
    r.lang           = 'en-US';

    r.onstart = () => { setIsListening(true); setInterimText(""); };

    r.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) { submitToAI(e.results[i][0].transcript); setInterimText(""); }
        else interim += e.results[i][0].transcript;
      }
      if (interim) setInterimText(interim);
    };

    r.onerror = (e: any) => {
      if (e.error === 'no-speech') return;
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        isManuallyStoppedRef.current = true;
        setMicActive(false);
        alert("Microphone access denied.");
      }
      setIsListening(false);
    };

    r.onend = () => {
      setIsListening(false);
      if (micActiveRef.current && !isManuallyStoppedRef.current && !useCompanionStore.getState().aiIsSpeaking) {
        setTimeout(startListening, 350);
      }
    };

    try { r.start(); } catch (e) { console.error("Recognition start:", e); }
  }, [submitToAI, setIsListening]);

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    try { recognitionRef.current?.stop(); } catch {}
    setIsListening(false);
  }, [setIsListening]);

  const handleVoiceToggle = () => {
    if (micActive) { setMicActive(false); stopListening(); }
    else { isManuallyStoppedRef.current = false; setMicActive(true); startListening(); }
  };

  useEffect(() => {
    if (aiIsSpeaking) { try { recognitionRef.current?.abort(); } catch {} setIsListening(false); }
    else if (micActiveRef.current && !isManuallyStoppedRef.current) startListening();
  }, [aiIsSpeaking, startListening, setIsListening]);

  useEffect(() => () => {
    isManuallyStoppedRef.current = true;
    try { recognitionRef.current?.abort(); } catch {}
    setIsListening(false);
  }, [setIsListening]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-between pointer-events-auto overflow-hidden"
      style={{ background: 'transparent' }}
    >
      {/* Status pill */}
      <div className="flex flex-col items-center gap-2 mt-8 z-10">
        <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-teal-300 font-mono tracking-widest uppercase flex items-center gap-2 backdrop-blur-md">
          <div className={`w-2 h-2 rounded-full ${
            aiIsSpeaking ? 'bg-violet-400 animate-pulse' :
            micActive     ? 'bg-cyan-400 animate-pulse' : 'bg-gray-500'
          }`} />
          {aiIsSpeaking ? 'AI Speaking' : micActive ? 'Listening' : 'Mic Off'}
        </div>
        <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">
          Emotion: <span className="text-white">{userEmotion}</span>
        </p>
      </div>

      {/* ── Big centered orb ── */}
      <div className="flex-1 flex items-center justify-center w-full">
        <VoiceOrb mode={orbMode} />
      </div>

      {/* Subtitle */}
      <div className="w-full max-w-2xl text-center px-8 mb-4 min-h-[4rem] flex items-center justify-center z-10">
        <AnimatePresence mode="wait">
          {aiIsSpeaking ? (
            <motion.p key="ai" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
              className="text-2xl font-light text-white/90 leading-relaxed">
              {lastAiMsg || "…"}
            </motion.p>
          ) : micActive ? (
            <motion.p key="mic" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
              className="text-xl font-medium text-cyan-300/80">
              {interimText || "Listening…"}
            </motion.p>
          ) : (
            <motion.p key="idle" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
              className="text-xl font-light text-white/40">
              {lastUserMsg ? `"${lastUserMsg}"` : "Tap the mic to speak"}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-8 mb-10 z-10" style={{ pointerEvents: 'auto' }}>
        <button
          type="button"
          onClick={handleVoiceToggle}
          style={{ zIndex: 99999, pointerEvents: 'auto' }}
          className={`w-16 h-16 flex items-center justify-center rounded-full border-2 transition-all duration-300 cursor-pointer backdrop-blur-md ${
            micActive
              ? 'bg-cyan-500/20 border-cyan-400/70 shadow-[0_0_24px_rgba(0,180,216,0.45)]'
              : 'bg-white/8 border-white/20 hover:bg-white/15 hover:border-white/40'
          }`}
        >
          {micActive
            ? <Mic size={26} className="text-cyan-300 animate-pulse" />
            : <MicOff size={26} className="text-white/70" />}
        </button>

        <button
          type="button"
          onClick={() => { stopListening(); setShowWebcam(false); }}
          style={{ zIndex: 99999, pointerEvents: 'auto' }}
          className="w-20 h-20 flex items-center justify-center rounded-full bg-red-600/80 hover:bg-red-500 border-2 border-red-400/60 text-white shadow-[0_0_32px_rgba(220,40,40,0.5)] hover:shadow-[0_0_50px_rgba(220,40,40,0.7)] transition-all hover:scale-105 cursor-pointer"
        >
          <PhoneOff size={32} />
        </button>
      </div>
    </motion.div>
  );
}
