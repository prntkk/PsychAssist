"use client";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles } from "lucide-react";
import { useCompanionStore } from "../../store/useCompanionStore";

export default function ChatFeed() {
  const messages = useCompanionStore((state) => state.conversationHistory);
  const systemStatus = useCompanionStore((state) => state.systemStatus);
  const isLoading = systemStatus?.includes("Processing") || systemStatus?.includes("Generating");
  
  // 1. Change the ref to target the scrollable container, not the bottom
  const containerRef = useRef(null);

  // 2. Use precise localized scrolling instead of scrollIntoView
  useEffect(() => {
    if (containerRef.current) {
      const scrollHeight = containerRef.current.scrollHeight;
      containerRef.current.scrollTo({
        top: scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isLoading]);

  return (
    // 3. Attach the ref to this container
    <div 
      ref={containerRef} 
      className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar z-10"
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in duration-1000">
          <div className="relative">
            <Sparkles className="w-16 h-16 text-teal-400 mb-6 drop-shadow-[0_0_25px_rgba(20,184,166,0.8)] animate-pulse" />
            <div className="absolute inset-0 bg-teal-400/20 blur-xl rounded-full"></div>
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-3 tracking-wide">Secure Neural Link Established</h2>
          <p className="text-gray-400 max-w-md text-sm leading-relaxed border border-white/5 bg-white/5 p-4 rounded-xl backdrop-blur-sm">
            All processing is done locally on your device. Zero data leaves this machine. Select a therapeutic framework to begin.
          </p>
        </div>
      ) : (
        messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-3 duration-500`}>
            {/* HOLOGRAPHIC BUBBLES */}
            <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-2xl leading-relaxed relative overflow-hidden ${ msg.role === "user"  ? "bg-[#0f172a]/80 backdrop-blur-xl border border-teal-500/30 text-teal-50 rounded-br-sm shadow-[0_0_30px_rgba(20,184,166,0.15)]"  : "bg-[#1e293b]/40 backdrop-blur-2xl border border-white/10 text-gray-200 rounded-bl-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)] prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50" }`}>
              {/* Internal Glass Reflection line */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              {msg.role === "user" ? msg.content : <ReactMarkdown>{msg.content}</ReactMarkdown>}
            </div>
          </div>
        ))
      )}
      
      {isLoading && (
        <div className="flex justify-start items-center gap-3 p-5 bg-[#1e293b]/40 backdrop-blur-2xl border border-white/5 rounded-2xl rounded-bl-sm w-max shadow-lg">
          <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce shadow-[0_0_10px_rgba(20,184,166,0.8)]"></div>
          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce shadow-[0_0_10px_rgba(6,182,212,0.8)]" style={{ animationDelay: '0.15s' }}></div>
          <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce shadow-[0_0_10px_rgba(59,130,246,0.8)]" style={{ animationDelay: '0.3s' }}></div>
        </div>
      )}
      {/* 4. Removed the messagesEndRef div entirely */}
    </div>
  );
}