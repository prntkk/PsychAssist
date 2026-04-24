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
    <motion.div 
      drag 
      dragMomentum={false}
      whileHover={{ scale: 1.02 }}
      whileDrag={{ scale: 1.05, cursor: "grabbing" }}
      className="absolute bottom-8 left-8 w-[340px] z-50 flex flex-col gap-4 drop-shadow-2xl pointer-events-auto cursor-grab"
    >
      
      {/* Status Panel (Neural Link) */}
      {shouldRenderHUD && (
        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0A0F1A]/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.6)] relative overflow-hidden group">
          
          {/* Animated glow based on status */}
          <div className={`absolute -inset-10 opacity-30 blur-[80px] transition-colors duration-1000 pointer-events-none
            ${isListening ? 'bg-teal-500' : aiIsSpeaking ? 'bg-indigo-500' : 'bg-transparent'}`} />

          <div className="relative z-10 flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
              Neural Core
            </h2>
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${systemStatus?.includes('Error') ? 'bg-red-400' : 'bg-teal-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${systemStatus?.includes('Error') ? 'bg-red-500' : 'bg-teal-500'}`}></span>
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
      )}

      {/* Camera Feed Context Node */}
      {shouldRenderCamera && (
        <div className="glass-panel h-36 rounded-2xl border border-white/10 bg-black backdrop-blur-md overflow-hidden shadow-2xl relative flex items-center justify-center isolate">
          <video
            ref={videoRef}
            className="absolute w-full h-full object-cover opacity-[0.35] scale-x-[-1] contrast-125 saturate-50 mix-blend-screen"
            muted
            playsInline
          />
          {/* CRT Scanline overlay effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
          <p className="absolute bottom-3 left-4 text-[10px] font-mono text-teal-400 tracking-widest uppercase drop-shadow-md">Local Vision Tensor Active</p>
          {isListening && (
              <div className="absolute inset-0 border-2 border-teal-500/20 animate-pulse rounded-2xl pointer-events-none"></div>
          )}
        </div>
      )}

    </motion.div>
  );
}