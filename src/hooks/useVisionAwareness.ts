"use client";

import { useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { useCompanionStore } from '../store/useCompanionStore';

export function useVisionAwareness() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setUserEmotion, setIsCameraActive, setSystemStatus, showWebcam } = useCompanionStore();

  useEffect(() => {
    let stream: MediaStream | null = null;
    let detectionInterval: NodeJS.Timeout;

    if (!showWebcam) {
      setIsCameraActive(false);
      return;
    }

    const startAI = async () => {
      try {
        setSystemStatus('Loading High-Res ML Models...');
        
        // 1. Load the TensorFlow.js models from your local public folder
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);

        // 2. Start the Webcam
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 480, height: 360 } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch((e) => {
              // Ignore DOMException: The play() request was interrupted
            });
          }
          setIsCameraActive(true);
        }

        setSystemStatus('Vision ML Active');

        // 3. High-Accuracy Detection Loop
        detectionInterval = setInterval(async () => {
          if (videoRef.current) {
            // Run the detection
            const detections = await faceapi.detectSingleFace(
              videoRef.current, 
              new faceapi.TinyFaceDetectorOptions()
            ).withFaceExpressions();

            if (detections) {
              const expressions = detections.expressions;
              // face-api returns an object like { happy: 0.9, sad: 0.01, ... }
              // We need to find the one with the highest probability
              let maxEmotion = 'neutral';
              let maxValue = 0;
              
              const expObj = expressions as Record<string, number>;
              for (const [emotion, value] of Object.entries(expObj)) {
                if (value > maxValue) {
                  maxValue = value;
                  maxEmotion = emotion;
                }
              }
              
              // Only update if it's highly confident (reduces flickering)
              if (maxValue > 0.6) {
                setUserEmotion(maxEmotion);
              }
            }
          }
        }, 500); // Check twice a second

      } catch (err) {
        console.error("Camera/ML Error:", err);
        setSystemStatus('ML Vision Error');
      }
    };

    startAI();

    // 4. Cleanup to prevent memory leaks
    return () => {
      if (detectionInterval) clearInterval(detectionInterval);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setIsCameraActive(false);
    };
  }, [setIsCameraActive, setSystemStatus, setUserEmotion, showWebcam]);

  return { videoRef };
}