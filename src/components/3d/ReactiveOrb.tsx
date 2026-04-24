"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface ReactiveOrbProps {
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful';
  isProcessing?: boolean;
  isSpeaking?: boolean;
}

export default function ReactiveOrb({
  emotion = 'neutral',
  isProcessing = false,
  isSpeaking = false
}: ReactiveOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  // Calming, therapeutic color mapping
  const colorMap: Record<string, string> = {
    neutral: '#2dd4bf', // Teal (Calm/Grounding)
    happy: '#fbbf24',   // Warm Yellow (Encouragement)
    sad: '#60a5fa',     // Soft Blue (Empathy/Cooling)
    angry: '#94a3b8',   // Slate (De-escalation/Neutrality instead of red)
    fearful: '#a78bfa', // Soft Purple (Soothing)
  };

  const targetColor = useMemo(() => new THREE.Color(colorMap[emotion] || colorMap.neutral), [emotion]);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    // Smoothly transition the orb's color
    materialRef.current.color.lerp(targetColor, 0.05);

    // Dynamic animation behaviors based on user/AI state
    if (isProcessing) {
      // AI is "thinking" - fluid liquid distortion
      materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, 0.8, 0.05);
      materialRef.current.speed = 4;
      meshRef.current.rotation.y += delta * 2;
    } else if (isSpeaking) {
      // User is speaking - active visual feedback
      materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, 0.4, 0.1);
      const scale = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.05;
      meshRef.current.scale.set(scale, scale, scale);
      materialRef.current.speed = 2;
    } else {
      // Idle rhythm - subtle 4-7-8 breathing proxy to subliminally calm the user
      materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, 0.2, 0.05);
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03; 
      meshRef.current.scale.set(scale, scale, scale);
      materialRef.current.speed = 0.5;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]}>
      <MeshDistortMaterial
        ref={materialRef}
        color={colorMap.neutral}
        roughness={0.2}
        metalness={0.8}
        distort={0.3}
        speed={1.5}
        envMapIntensity={1}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </Sphere>
  );
}
