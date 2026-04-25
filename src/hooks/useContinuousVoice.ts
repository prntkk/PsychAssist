"use client";

import { useEffect, useRef } from 'react';
import { useCompanionStore } from '../store/useCompanionStore';

export function useContinuousVoice(onUserSpoke: (text: string) => void) {
  const { setIsListening, setAiIsSpeaking, setSystemStatus } = useCompanionStore();
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel(); // Stop talking on unmount
    };
  }, []);

  // 3. Text-to-Speech Function using ElevenLabs
  const speakText = async (text: string) => {
    try {
      setAiIsSpeaking(true);
      setSystemStatus('AI Speaking...');

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) throw new Error("ElevenLabs TTS failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      audio.onended = () => {
        setAiIsSpeaking(false);
        setSystemStatus('Idle');
      };
      
      audio.play();
    } catch (e) {
      console.error("ElevenLabs TTS Error (falling back to local):", e);
      
      // Fallback to local browser TTS
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        
        // Find the absolute best cloud/neural voice available
        const bestVoice = voices.find(v => 
          (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online')) && 
          (v.name.includes('Female') || v.name.includes('Aria') || v.name.includes('Sonia') || v.name.includes('Jenny'))
        ) 
        || voices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Samantha') || v.name.includes('Google US English'))
        || voices.find(v => v.name.includes('Female'));

        if (bestVoice) utterance.voice = bestVoice;
        utterance.rate = 0.95;
        
        utterance.onstart = () => {
          setAiIsSpeaking(true);
          setSystemStatus('AI Speaking (Fallback)...');
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