import { AlertTriangle, Phone } from "lucide-react";

export default function CrisisAlert({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1e1b4b] border border-red-500/50 rounded-2xl max-w-md w-full p-6 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
        <div className="flex items-center gap-3 text-red-400 mb-4">
          <AlertTriangle size={28} />
          <h2 className="text-xl font-bold">Safety Protocol Activated</h2>
        </div>
        <p className="text-gray-300 mb-6 leading-relaxed">
          It sounds like you are going through an incredibly difficult time right now. Please know that you are not alone, and there is support available immediately.
        </p>
        <div className="space-y-3 mb-6">
          <a href="tel:988" className="flex items-center justify-center gap-2 w-full bg-red-600/20 text-red-400 border border-red-500/50 py-3 rounded-xl hover:bg-red-600/30 transition">
            <Phone size={18} /> Call Kiran Mental Health Helpline: 1800-599-0019
          </a>
          <a href="tel:112" className="flex items-center justify-center gap-2 w-full bg-slate-800 text-gray-300 border border-slate-700 py-3 rounded-xl hover:bg-slate-700 transition">
            <Phone size={18} /> Emergency Services: 112
          </a>
        </div>
        <button onClick={onClose} className="w-full text-sm text-gray-500 hover:text-gray-300 transition">
          Acknowledge & Close
        </button>
      </div>
    </div>
  );
}