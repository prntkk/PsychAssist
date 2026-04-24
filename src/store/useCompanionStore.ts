import { create } from 'zustand';

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

interface CompanionState {
  // Voice & AI Status
  isListening: boolean;
  aiIsSpeaking: boolean;
  systemStatus: string;

  // Vision Status
  userEmotion: string;
  isCameraActive: boolean;

  // Memory
  conversationHistory: Message[];

  // UI Toggles
  showNeuralCore: boolean;
  showWebcam: boolean;

  // Actions
  setIsListening: (status: boolean) => void;
  setAiIsSpeaking: (status: boolean) => void;
  setSystemStatus: (status: string) => void;
  setUserEmotion: (emotion: string) => void;
  setIsCameraActive: (status: boolean) => void;
  setShowNeuralCore: (show: boolean) => void;
  setShowWebcam: (show: boolean) => void;
  addMessage: (message: Message) => void;
  clearHistory: () => void;
}

export const useCompanionStore = create<CompanionState>((set) => ({
  isListening: false,
  aiIsSpeaking: false,
  systemStatus: 'System Initializing...',
  userEmotion: 'neutral',
  isCameraActive: false,
  showNeuralCore: true,
  showWebcam: true,
  conversationHistory: [],

  setIsListening: (status) => set({ isListening: status }),
  setAiIsSpeaking: (status) => set({ aiIsSpeaking: status }),
  setSystemStatus: (status) => set({ systemStatus: status }),
  setUserEmotion: (emotion) => set({ userEmotion: emotion }),
  setIsCameraActive: (status) => set({ isCameraActive: status }),
  setShowNeuralCore: (show) => set({ showNeuralCore: show }),
  setShowWebcam: (show) => set({ showWebcam: show }),

  addMessage: (message) => set((state) => ({
    conversationHistory: [...state.conversationHistory, message]
  })),

  // The completed line:
  clearHistory: () => set({ conversationHistory: [] }),
}));