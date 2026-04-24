import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';

export function useFacialEmotion() {
  const [emotion, setEmotion] = useState<string>('neutral');
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  // We use a hidden video element to process the local stream securely
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.width = 300;
    video.height = 300;
    videoRef.current = video;

    const loadModels = async () => {
      // Models retrieved locally from /public/models
      const MODEL_URL = '/models';
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setIsModelLoaded(true);
      } catch (err) {
        console.error("Failed to load face-api models. Ensure local weights exist in /public/models.", err);
      }
    };

    if (typeof window !== 'undefined') {
      loadModels();
    }

    return () => {
      // Clean up stream to respect privacy when not in use
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startDetection = async () => {
    if (!isModelLoaded || !videoRef.current) return;

    try {
      // Requests local webcam access. Video never leaves the browser.
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;

      videoRef.current.addEventListener('play', () => {
        // Run detection every second to optimize browser performance
        setInterval(async () => {
          if (!videoRef.current) return;
          
          const detections = await faceapi.detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          ).withFaceExpressions();

          if (detections) {
            const expressions = detections.expressions;
            // Determine primary emotion
            const primaryEmotion = Object.keys(expressions).reduce((a, b) => 
               expressions[a as keyof typeof expressions] > expressions[b as keyof typeof expressions] ? a : b
            );
            setEmotion(primaryEmotion);
          }
        }, 1000); 
      });
    } catch (err) {
      console.warn('Webcam permission denied or unavailable.', err);
    }
  };

  return { emotion, isModelLoaded, startDetection };
}
