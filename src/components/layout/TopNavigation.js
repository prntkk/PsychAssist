"use client";
import { BrainCircuit } from "lucide-react";

export default function TopNavigation() {
  return (
    <header className="md:hidden bg-[#0B0F19]/90 backdrop-blur-md border-b border-white/10 p-4 flex items-center gap-3 z-20 sticky top-0">
      <BrainCircuit className="text-teal-400" size={24} />
      <h1 className="text-lg font-bold text-gray-200">PsychAssist</h1>
    </header>
  );
}