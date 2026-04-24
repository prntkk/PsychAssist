"use client";
import { useState, useRef } from "react";
import { Send, Trash2, Mic, X } from "lucide-react";
import { useCompanionStore } from "../../store/useCompanionStore";
import { ChatService } from "../../services/ChatService";

export default function ChatInput() {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  
  const { addMessage, clearHistory, systemStatus, setSystemStatus, userEmotion } = useCompanionStore();
  const isLoading = systemStatus?.includes("Processing") || systemStatus?.includes("Generating") || systemStatus?.includes("Speaking");
  const recognitionRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userText = input.trim();
    setInput("");
    
    // V2 Neural execution path
    addMessage({ role: 'user', content: userText });
    setSystemStatus("Processing Text...");
    
    try {
      // Pull absolute synchronous state natively inside the async loop
      const currentHistory = useCompanionStore.getState().conversationHistory;
      const aiResponseText = await ChatService.generateResponse(currentHistory, userEmotion || 'neutral');
      
      addMessage({ role: 'assistant', content: aiResponseText });
      setSystemStatus("Idle");
    } catch(err) {
      setSystemStatus("Ollama Connection Error");
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser does not support speech recognition.");

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      setInput((prev) => prev + " " + e.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="shrink-0 p-4 md:p-6 bg-[#0B0F19]/70 backdrop-blur-2xl border-t border-white/5 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
      <form onSubmit={handleSubmit} className="flex gap-3 max-w-5xl mx-auto relative">
        
        {/* Mobile Clear Chat */}
        <button 
          type="button" 
          onClick={clearHistory}
          className="md:hidden p-3 rounded-xl bg-red-500/5 text-red-400/80 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center"
        >
          <Trash2 size={20} />
        </button>

        <div className="flex-1 relative flex items-center group">
          
          {/* Futuristic Listening Overlay */}
          {isListening && (
            <div className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-md rounded-xl flex items-center justify-between px-6 z-20 border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 animate-pulse"></div>
              
              <div className="flex items-center gap-4 relative z-30">
                <Mic className="text-cyan-400 animate-pulse" size={20} />
                <span className="text-cyan-300 font-medium tracking-[0.2em] text-sm animate-pulse">NEURAL LINK ACTIVE...</span>
              </div>
              
              {/* Audio Wave Animation */}
              <div className="flex items-center gap-1.5 relative z-30">
                <span className="w-1 h-4 bg-cyan-400 rounded-full animate-[bounce_0.8s_infinite] delay-75"></span>
                <span className="w-1 h-8 bg-teal-400 rounded-full animate-[bounce_1s_infinite] delay-150"></span>
                <span className="w-1 h-5 bg-cyan-400 rounded-full animate-[bounce_0.9s_infinite] delay-300"></span>
                <span className="w-1 h-7 bg-teal-400 rounded-full animate-[bounce_1.2s_infinite] delay-75"></span>
                <span className="w-1 h-3 bg-cyan-400 rounded-full animate-[bounce_0.7s_infinite] delay-200"></span>
                <button 
                  type="button" 
                  onClick={stopListening} 
                  className="ml-4 p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message AI locally...`}
            className="w-full bg-[#0f172a]/60 backdrop-blur-md border border-white/10 rounded-xl pl-5 pr-14 py-4 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500 text-gray-200 placeholder-gray-500 shadow-inner transition-all group-hover:border-white/20"
            disabled={isLoading || isListening}
          />
          
          <button 
            type="button"
            onClick={handleVoiceInput}
            disabled={isListening}
            className="absolute right-3 p-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors"
          >
            <Mic size={20} />
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-4 rounded-xl hover:from-teal-500 hover:to-cyan-500 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] flex items-center justify-center gap-2"
        >
          <span className="hidden md:inline font-bold tracking-wide">Send</span>
          <Send size={18} className={`${input.trim() && !isLoading ? 'animate-bounce-x' : ''}`} />
        </button>
      </form>
    </div>
  );
}