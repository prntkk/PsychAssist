"use client";

import { Canvas } from "@react-three/fiber";
import ReactiveOrb from "./ReactiveOrb";

interface SceneProps {
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | string;
  isProcessing?: boolean;
  isSpeaking?: boolean;
}

export default function ReactiveOrbScene({ emotion, isProcessing, isSpeaking }: SceneProps) {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <ReactiveOrb 
        emotion={emotion as any} // map from Zustand string successfully
        isProcessing={isProcessing} 
        isSpeaking={isSpeaking} 
      />
    </Canvas>
  );
}
