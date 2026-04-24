"use client";

import { useEffect, useRef } from 'react';
import { useCompanionStore } from '../store/useCompanionStore';

export function useContinuousVoice(onUserSpoke: (text: string) => void) {
  const { setIsListening, setAiIsSpeaking, setSystemStatus } = useCompanionStore();
  const recognitionRef = useRef<any>(null);
  const vadRef = useRef<any>(null);

  useEffect(() => {
    // 1. Setup Speech Recognition (Browser Native STT)
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript.trim().length > 0) {
          onUserSpoke(transcript);
        }
      };

      recognitionRef.current.onerror = (e: any) => console.log('Speech Recognition Error:', e);
    } else {
      console.warn("Speech recognition not supported in this browser. Use Chrome/Edge.");
    }

    // 2. Setup Voice Activity Detection (VAD)
    const initVAD = async () => {
      try {
        if (!(window as any).vad) {
            console.error("VAD script not loaded yet from CDN.");
            return;
        }
        vadRef.current = await (window as any).vad.MicVAD.new({
          startOnLoad: true,
          onSpeechStart: () => {
            // INTERRUPT: Stop AI speaking if user starts talking
            window.speechSynthesis.cancel();
            setIsListening(true);
            setAiIsSpeaking(false);
            setSystemStatus('Listening...');
          },
          onSpeechEnd: (audio) => {
            setIsListening(false);
            setSystemStatus('Processing Audio...');
            // Trigger text conversion
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                // Ignore if already started
              }
            }
          },
        });
      } catch (e) {
        console.error("VAD Error:", e);
      }
    };

    initVAD();

    return () => {
      if (vadRef.current) vadRef.current.pause();
      window.speechSynthesis.cancel(); // Stop talking on unmount
    };
  }, [onUserSpoke]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Text-to-Speech Function
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // clear queue
    const utterance = new SpeechSynthesisUtterance(text);

    // Pick a nice, calm voice if available
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google UK English Female'));
    if (femaleVoice) utterance.voice = femaleVoice;

    utterance.rate = 0.95; // Slightly slower, more calming
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setAiIsSpeaking(true);
      setSystemStatus('AI Speaking...');
    };
    utterance.onend = () => {
      setAiIsSpeaking(false);
      setSystemStatus('Idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  return { speakText };
}