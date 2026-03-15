"use client";
import { createContext, useContext, useState, useEffect } from "react";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const[therapyMode, setTherapyMode] = useState("cbt");
  const [moodTracker, setMoodTracker] = useState(null);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  
  // Advanced Features
  const [sentiment, setSentiment] = useState("neutral");
  const[voiceEnabled, setVoiceEnabled] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedChat = localStorage.getItem("psychAssistHistory");
    const savedMood = localStorage.getItem("dailyMood");
    if (savedChat) setMessages(JSON.parse(savedChat));
    if (savedMood) setMoodTracker(savedMood);
  },[]);

  useEffect(() => {
    if (isClient && messages.length > 0) {
      localStorage.setItem("psychAssistHistory", JSON.stringify(messages));
    }
  }, [messages, isClient]);

  // Dictionary-based sentiment analyzer
  const analyzeSentiment = (text) => {
    const lower = text.toLowerCase();
    if (/(stress|overwhelmed|panic|anxious|worry)/.test(lower)) return "stressed";
    if (/(sad|depressed|down|cry|hopeless)/.test(lower)) return "sad";
    if (/(calm|peace|okay|good|happy)/.test(lower)) return "calm";
    return "neutral";
  };

  const handleMoodSelect = (mood) => {
    setMoodTracker(mood);
    localStorage.setItem("dailyMood", mood);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("psychAssistHistory");
    setSentiment("neutral");
  };

  const sendMessage = async (input) => {
    if (!input.trim()) return;

    // Update dynamic background sentiment based on user input
    setSentiment(analyzeSentiment(input));

    const newMessages =[...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, mode: therapyMode }),
      });

      const data = await res.json();

      if (data.isCrisis) {
        setShowCrisisAlert(true);
      } else if (data.message) {
        setMessages([...newMessages, data.message]);
        
        // Text-to-Speech (Accessibility)
        if (voiceEnabled && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(data.message.content);
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider value={{
      messages, isLoading, isClient, therapyMode, setTherapyMode,
      moodTracker, handleMoodSelect, showCrisisAlert, setShowCrisisAlert,
      sentiment, voiceEnabled, setVoiceEnabled, clearChat, sendMessage
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);