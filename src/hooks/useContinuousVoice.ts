"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { useCompanionStore } from '../store/useCompanionStore';

export function useContinuousVoice(onUserSpoke: (text: string) => void) {
  const { setIsListening, setAiIsSpeaking, setSystemStatus } = useCompanionStore();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const speakText = useCallback(async (text: string) => {
    if (!window.speechSynthesis) {
      console.warn("Speech synthesis not supported in this browser.");
      setAiIsSpeaking(false);
      setSystemStatus('Idle');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Use the voices state we maintained
    const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    
    // Prioritize high-quality local/neural voices
    const bestVoice = currentVoices.find(v => 
      (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online')) && 
      (v.name.includes('Female') || v.name.includes('Aria') || v.name.includes('Sonia') || v.name.includes('Jenny'))
    ) 
    || currentVoices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Samantha') || v.name.includes('Google US English'))
    || currentVoices.find(v => v.name.includes('Female'))
    || currentVoices[0];

    if (bestVoice) utterance.voice = bestVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => {
      setAiIsSpeaking(true);
      setSystemStatus('AI Speaking...');
    };
    
    utterance.onend = () => {
      setAiIsSpeaking(false);
      setSystemStatus('Idle');
    };

    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      setAiIsSpeaking(false);
      setSystemStatus('Idle');
    };
    
    window.speechSynthesis.speak(utterance);
  }, [voices, setAiIsSpeaking, setSystemStatus]);

  useEffect(() => {
    (window as any)._speakText = speakText;
  }, [speakText]);

  return { speakText };
}