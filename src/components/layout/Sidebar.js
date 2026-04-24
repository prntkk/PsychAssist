"use client";
import { BrainCircuit, Activity, Heart, ShieldAlert, Volume2, VolumeX, Plus, Camera, CameraOff, Monitor, MonitorOff } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import { useCompanionStore } from "../../store/useCompanionStore";

export default function Sidebar() {
  const { therapyMode, setTherapyMode, moodTracker, handleMoodSelect, voiceEnabled, setVoiceEnabled, clearChat } = useChat();
  const { showNeuralCore, setShowNeuralCore, showWebcam, setShowWebcam } = useCompanionStore();

  return (
    // Change ONLY the top wrapper tag in Sidebar.js to this:
    <aside className="hidden md:flex flex-col w-80 h-full shrink-0 bg-[#0B0F19]/60 border-r border-white/5 p-6 backdrop-blur-2xl z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)] overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-3 mb-8 shrink-0">
        <BrainCircuit className="text-teal-400" size={32} />
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 drop-shadow-[0_0_10px_rgba(45,212,191,0.4)] tracking-wide">
          PsychAssist
        </h1>
      </div>

      <button 
        onClick={clearChat}
        className="shrink-0 w-full mb-8 group relative flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 hover:from-teal-500/20 hover:to-cyan-500/20 border border-teal-500/30 text-teal-300 rounded-xl p-3 transition-all duration-300 shadow-[0_0_15px_rgba(20,184,166,0.1)] hover:shadow-[0_0_25px_rgba(20,184,166,0.3)] overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> 
        <span className="font-semibold tracking-wide">New Session</span>
      </button>

      <div className="mb-8 shrink-0">
        <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2 font-semibold">
          <Activity size={14} className="text-cyan-400" /> Active Framework
        </h3>
        <select 
          value={therapyMode}
          onChange={(e) => setTherapyMode(e.target.value)}
          className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl p-3 text-sm text-gray-300 focus:ring-1 focus:ring-teal-500 outline-none transition-all shadow-inner hover:bg-[#0f172a]/80 cursor-pointer appearance-none"
        >
          <option value="cbt">Cognitive Behavioral (CBT)</option>
          <option value="act">Acceptance & Commitment</option>
          <option value="stoic">Stoic Philosophy</option>
          <option value="mindfulness">Mindfulness Coach</option>
          <option value="vent">Empathetic Listening</option>
        </select>
      </div>

      <div className="mb-8 shrink-0">
        <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2 font-semibold">
          <Heart size={14} className="text-pink-400" /> Daily Check-in
        </h3>
        <div className="flex justify-between bg-[#0f172a]/50 p-3 rounded-xl border border-white/10 shadow-inner">
          {['😔', '😐', '🙂', '😊', '🤩'].map((emoji, idx) => (
            <button 
              key={idx}
              onClick={() => handleMoodSelect(emoji)}
              className={`text-2xl hover:scale-125 transition-transform duration-200 ${moodTracker === emoji ? 'bg-white/10 rounded-lg scale-110 shadow-md ring-1 ring-white/20' : 'opacity-40 grayscale hover:grayscale-0'}`}
            >
              {emoji}
            </button>
          ))}
        </div>

      <div className="mb-8 shrink-0 flex flex-col gap-2">
        <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2 font-semibold">
          <Monitor size={14} className="text-indigo-400" /> Neural Link Controls
        </h3>
        
        <button 
          onClick={() => setShowNeuralCore(!showNeuralCore)}
          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${showNeuralCore ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-[#0f172a]/50 border-white/10 text-gray-500 hover:text-gray-300'}`}
        >
          <span className="text-sm font-medium">Neural Core HUD</span>
          {showNeuralCore ? <Monitor size={18} /> : <MonitorOff size={18} />}
        </button>

        <button 
          onClick={() => setShowWebcam(!showWebcam)}
          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${showWebcam ? 'bg-teal-500/10 border-teal-500/50 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.2)]' : 'bg-[#0f172a]/50 border-white/10 text-gray-500 hover:text-gray-300'}`}
        >
          <span className="text-sm font-medium">Local Vision Node</span>
          {showWebcam ? <Camera size={18} /> : <CameraOff size={18} />}
        </button>
      </div>
      </div>

      <div className="mb-8 shrink-0">
        <button 
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300 ${voiceEnabled ? 'bg-teal-500/10 border-teal-500/50 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.2)]' : 'bg-[#0f172a]/50 border-white/10 text-gray-500 hover:text-gray-300'}`}
        >
          {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          <span className="text-sm font-medium">{voiceEnabled ? "Voice Output Active" : "Enable Voice Output"}</span>
        </button>
      </div>

      <div className="mt-auto shrink-0 bg-teal-900/20 border border-teal-500/20 p-4 rounded-xl backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-teal-500/50"></div>
        <p className="text-xs text-teal-200/60 flex items-start gap-2 leading-relaxed pl-2">
          <ShieldAlert size={16} className="shrink-0 text-teal-500/80" />
          Not a medical professional. AI generated insights for educational use only. Completely local and private.
        </p>
      </div>
    </aside>
  );
}