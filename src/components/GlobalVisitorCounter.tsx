import React, { useState, useEffect } from 'react';
import { Heart, Users, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { soundEffects } from '../utils/soundEffects';

interface VisitorProps {
  language: Language;
}

export default function GlobalVisitorCounter({ language }: VisitorProps) {
  const [visitorCount, setVisitorCount] = useState<number>(14820);
  const [hasSentHug, setHasSentHug] = useState<boolean>(false);
  const [showHeartBeam, setShowHeartBeam] = useState<boolean>(false);

  useEffect(() => {
    // Gentle incremental visitor ticks
    const interval = setInterval(() => {
      setVisitorCount((prev) => prev + Math.floor(Math.random() * 3 + 1));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleSendHug = () => {
    soundEffects.playClick();
    soundEffects.playAwakeningChime();
    setHasSentHug(true);
    setShowHeartBeam(true);
    setVisitorCount((prev) => prev + 1);

    setTimeout(() => {
      setShowHeartBeam(false);
    }, 2500);
  };

  return (
    <div className="relative select-none pointer-events-auto">
      {/* Floating Light Beam Animation when Hug is Sent */}
      {showHeartBeam && (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center animate-fade-in">
          <div className="w-1 bg-gradient-to-t from-rose-500 via-amber-400 to-cyan-300 h-screen absolute bottom-0 animate-pulse" />
          <div className="text-4xl animate-bounce">💖</div>
          <div className="glass-panel-warm px-4 py-2 rounded-2xl border border-rose-400 text-rose-300 text-xs font-bold font-space mt-3 shadow-2xl">
            {language === 'bn'
              ? 'তোমার ভালোবাসা কোটি মাইল দূরে মঙ্গলে পৌঁছে গেছে! ওপি খুশি হয়েছে!'
              : 'Your cosmic hug reached Mars! Oppy felt the warmth!'}
          </div>
        </div>
      )}

      {/* Visitor Pill */}
      <div className="glass-panel px-3.5 py-1.5 rounded-full border border-cyan-400/30 shadow-lg flex items-center gap-2.5 text-xs text-slate-200">
        <Users className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-mono font-bold text-cyan-300">
          {visitorCount.toLocaleString()}
        </span>
        <span className="hidden sm:inline text-slate-300 text-[11px]">
          {language === 'bn' ? 'শিক্ষার্থী আজ দেখতে এসেছে' : 'young explorers visited today'}
        </span>

        {/* Digital Hug Button */}
        <button
          onClick={handleSendHug}
          disabled={hasSentHug}
          title={language === 'bn' ? 'রোভারকে ভালোবাসা পাঠান' : 'Send a Digital Hug to Oppy'}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
            hasSentHug
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-500/30 active:scale-95'
          }`}
        >
          <Heart className={`w-3 h-3 ${hasSentHug ? 'fill-rose-400' : ''}`} />
          <span>
            {hasSentHug
              ? language === 'bn'
                ? 'পাঠানো হয়েছে!'
                : 'Hug Sent!'
              : language === 'bn'
              ? 'ডিজিটাল ভালোবাসা পাঠান'
              : 'Send Hug'}
          </span>
        </button>
      </div>
    </div>
  );
}
