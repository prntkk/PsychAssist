"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useCompanionStore, Message } from '../store/useCompanionStore';
import { useVisionAwareness } from '../hooks/useVisionAwareness';
import { useContinuousVoice } from '../hooks/useContinuousVoice';
import { ChatService } from '../services/ChatService';

export default function CompanionAgent() {
  const {
    userEmotion,
    systemStatus,
    addMessage,
    conversationHistory,
    isListening,
    aiIsSpeaking,
    showNeuralCore,
    showWebcam
  } = useCompanionStore();

  // 1. Initialize Vision (Camera)
  const { videoRef } = useVisionAwareness();

  // 2. Initialize Voice (Microphone & AI Speech)
  const handleUserSpoke = async (text: string) => {
    // Save user message to history
    const userMsg: Message = { role: 'user', content: text };
    addMessage(userMsg);

    // Get updated history to send to Ollama
    const currentHistory = useCompanionStore.getState().conversationHistory;

    // Call Ollama (fallback to 'neutral' if emotion is undefined)
    const aiResponseText = await ChatService.generateResponse(currentHistory, userEmotion || 'neutral');

    // Save AI message to history
    addMessage({ role: 'assistant', content: aiResponseText });

    // Speak the response aloud
    speakText(aiResponseText);
  };

  const { speakText } = useContinuousVoice(handleUserSpoke);

  // Auto-scroll chat window
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  const shouldRenderHUD = showNeuralCore;
  const shouldRenderCamera = showWebcam;

  if (!shouldRenderHUD && !shouldRenderCamera) return null;

  return (
    <>
      {/* ── Neural Core HUD — bottom-left ── */}
      {shouldRenderHUD && (
        <motion.div
          drag
          dragMomentum={false}
          whileDrag={{ scale: 1.04, cursor: 'grabbing' }}
          className="absolute bottom-8 left-8 w-[280px] z-50 drop-shadow-2xl pointer-events-auto cursor-grab"
        >
          <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0A0F1A]/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.6)] relative overflow-hidden">
            <div className={`absolute -inset-10 opacity-30 blur-[80px] transition-colors duration-1000 pointer-events-none
              ${isListening ? 'bg-teal-500' : aiIsSpeaking ? 'bg-indigo-500' : 'bg-transparent'}`} />

            <div className="relative z-10 flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                Neural Core
              </h2>
              <span className="flex h-2.5 w-2.5 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${systemStatus?.includes('Error') ? 'bg-red-400' : 'bg-teal-400'}`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${systemStatus?.includes('Error') ? 'bg-red-500' : 'bg-teal-500'}`} />
              </span>
            </div>

            <div className="relative z-10 mt-3 flex items-center gap-2 text-xs text-gray-300 font-mono bg-black/30 p-2 rounded-lg border border-white/5">
              <div className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`} />
              {systemStatus || 'System Initializing...'}
            </div>

            <div className="relative z-10 mt-3 inline-flex items-center justify-between w-full text-[10px] uppercase tracking-widest text-gray-400">
              <span>Detected State:</span>
              <span className={`font-bold px-2 py-0.5 rounded
                ${userEmotion === 'neutral' ? 'bg-gray-800 text-gray-300' :
                  userEmotion === 'happy' ? 'bg-teal-900/50 text-teal-300 border border-teal-500/30' :
                  userEmotion === 'sad' ? 'bg-blue-900/50 text-blue-300 border border-blue-500/30' :
                  'bg-indigo-900/50 text-indigo-300 border border-indigo-500/30'}`}>
                {userEmotion || 'Detecting...'}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Camera PIP — top-right corner by default ── */}
      {shouldRenderCamera && (
        <motion.div
          drag
          dragMomentum={false}
          dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
          dragElastic={0}
          whileDrag={{ scale: 1.04, cursor: 'grabbing' }}
          initial={{ x: 0, y: 0 }}
          className="absolute z-50 pointer-events-auto cursor-grab"
          style={{ top: '16px', right: '16px', left: 'auto' }}
        >
          <div
            className="rounded-2xl border border-white/10 bg-black overflow-hidden shadow-2xl relative flex items-center justify-center isolate"
            style={{ width: '220px', height: '220px', resize: 'both', overflow: 'hidden', minWidth: '140px', minHeight: '140px' }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
              muted
              playsInline
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
            <p className="absolute bottom-2 left-3 text-[9px] font-mono text-teal-400 tracking-widest uppercase drop-shadow-md pointer-events-none">Conversation Mode</p>
            {isListening && (
              <div className="absolute inset-0 border-2 border-teal-500/30 animate-pulse rounded-2xl pointer-events-none" />
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}