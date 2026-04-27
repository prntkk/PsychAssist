"use client";

import { useEffect, useRef, useState } from 'react';
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

  const speakText = async (text: string) => {
    try {
      setAiIsSpeaking(true);
      setSystemStatus('AI Speaking...');

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "ElevenLabs TTS failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      audio.onended = () => {
        setAiIsSpeaking(false);
        setSystemStatus('Idle');
      };
      
      await audio.play();
    } catch (e) {
      console.warn("ElevenLabs TTS unavailable, using local fallback.", e);
      
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Use the voices state we maintained
        const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
        
        const bestVoice = currentVoices.find(v => 
          (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online')) && 
          (v.name.includes('Female') || v.name.includes('Aria') || v.name.includes('Sonia') || v.name.includes('Jenny'))
        ) 
        || currentVoices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Samantha') || v.name.includes('Google US English'))
        || currentVoices.find(v => v.name.includes('Female'));

        if (bestVoice) utterance.voice = bestVoice;
        utterance.rate = 1.0;
        
        utterance.onstart = () => {
          setAiIsSpeaking(true);
          setSystemStatus('AI Speaking (Local)...');
        };
        utterance.onend = () => {
          setAiIsSpeaking(false);
          setSystemStatus('Idle');
        };
        
        window.speechSynthesis.speak(utterance);
      } else {
        setAiIsSpeaking(false);
        setSystemStatus('Idle');
      }
    }
  };

  useEffect(() => {
    (window as any)._speakText = speakText;
  }, [speakText]);

  return { speakText };
}