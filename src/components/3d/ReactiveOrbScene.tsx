"use client";

import React from "react";
import { useCompanionStore } from "../../store/useCompanionStore";

type Mode = "idle" | "listening" | "ai" | "thinking" | "excited";

// Per-mode colour pairs [inner1, inner2] and animation speeds
const MODE_CONFIG: Record<Mode, {
  color1: string;
  color2: string;
  glow1: string;
  glow2: string;
  speed1: string;
  speed2: string;
  scale: string;
}> = {
  idle: {
    color1: "#1a7a5e",
    color2: "#0d5c8a",
    glow1: "#1a7a5e88",
    glow2: "#0d5c8a88",
    speed1: "10s",
    speed2: "14s",
    scale: "1",
  },
  listening: {
    color1: "#00b4d8",
    color2: "#0070cc",
    glow1: "#00b4d888",
    glow2: "#0070cc88",
    speed1: "4s",
    speed2: "6s",
    scale: "1.06",
  },
  ai: {
    color1: "#d63aff",
    color2: "#7b2fff",
    glow1: "#d63aff88",
    glow2: "#7b2fff88",
    speed1: "3s",
    speed2: "4.5s",
    scale: "1.1",
  },
  thinking: {
    color1: "#ff9500",
    color2: "#cc5500",
    glow1: "#ff950088",
    glow2: "#cc550088",
    speed1: "7s",
    speed2: "10s",
    scale: "1.03",
  },
  excited: {
    color1: "#ff2bd6",
    color2: "#ff7a00",
    glow1: "#ff2bd688",
    glow2: "#ff7a0088",
    speed1: "2s",
    speed2: "3s",
    scale: "1.14",
  },
};

export default function ReactiveOrbScene() {
  const { isListening, aiIsSpeaking, systemStatus, userEmotion } = useCompanionStore();

  let mode: Mode = "idle";
  if (aiIsSpeaking) mode = "ai";
  else if (systemStatus?.includes("Processing")) mode = "thinking";
  else if (isListening) mode = "listening";
  else if (userEmotion === "happy") mode = "excited";

  const cfg = MODE_CONFIG[mode];

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="orb-container"
        style={{
          // Inject mode-specific CSS variables
          ["--color1" as any]: cfg.color1,
          ["--color2" as any]: cfg.color2,
          ["--glow1"  as any]: cfg.glow1,
          ["--glow2"  as any]: cfg.glow2,
          ["--speed1" as any]: cfg.speed1,
          ["--speed2" as any]: cfg.speed2,
          ["--orb-scale" as any]: cfg.scale,
        } as React.CSSProperties}
      >
        <div className="orb">
          <div className="orb-inner orb-inner-1" />
          <div className="orb-inner orb-inner-2" />
        </div>
      </div>

      <style>{`
        .orb-container {
          position: relative;
          width: clamp(160px, 28vmin, 300px);
          height: clamp(160px, 28vmin, 300px);
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          border-radius: 50%;
          rotate: 90deg;
          cursor: pointer;
          filter:
            drop-shadow(0 0 12px var(--glow1))
            drop-shadow(0 0 24px var(--glow2))
            drop-shadow(0 0 48px var(--glow1));
          transform: scale(var(--orb-scale));
          transition:
            transform 1.4s cubic-bezier(0.22, 1, 0.36, 1),
            filter    1.4s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .orb {
          position: absolute;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 50%;
          background: #04060f;
          filter: blur(28px);
          transition: width 0.6s ease;
        }

        .orb-inner {
          position: absolute;
          border-radius: 50%;
          transition:
            background 1.2s ease,
            width      0.6s ease,
            animation-duration 0.8s ease;
        }

        /* ── Red / first blob ───────────────────────────────────── */
        .orb-inner-1 {
          left: -120%;
          top: -25%;
          width: 160%;
          aspect-ratio: 1;
          background: var(--color1);
          clip-path: polygon(
            50% 0%, 61% 35%, 98% 35%, 68% 57%,
            79% 91%, 50% 70%, 21% 91%, 32% 57%,
            2% 35%,  39% 35%
          );
          animation: orb-spin var(--speed1) linear infinite;
        }

        /* ── Blue / second blob ─────────────────────────────────── */
        .orb-inner-2 {
          left: auto;
          right: -120%;
          top: auto;
          bottom: -25%;
          width: 160%;
          aspect-ratio: 1;
          background: var(--color2);
          clip-path: polygon(
            20% 0%, 0% 20%, 30% 50%, 0% 80%,
            20% 100%, 50% 70%, 80% 100%, 100% 80%,
            70% 50%, 100% 20%, 80% 0%, 50% 30%
          );
          animation: orb-spin var(--speed2) linear infinite;
        }

        @keyframes orb-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
