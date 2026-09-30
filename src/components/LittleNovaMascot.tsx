import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, X, ChevronUp, MessageCircle } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { Language } from '../types';

interface MascotProps {
  currentStage: 'landing' | 'solar' | 'planet' | 'relic' | 'passport';
  customMessage?: string;
  language: Language;
}

export default function LittleNovaMascot({ currentStage, customMessage, language }: MascotProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [speechBubbleText, setSpeechBubbleText] = useState('');

  // Default stage messages
  const defaultMessages: Record<string, { en: string; bn: string }> = {
    landing: {
      en: "Hi little explorer! I'm Nova! Space robots are sleeping on the Moon & Mars. Move your mouse to light up the stars, then tap Launch to find them! ✨",
      bn: 'হ্যালো ছোট্ট বিজ্ঞানী! আমি নোভা! চাঁদ আর মঙ্গলে আমাদের কিছু রোবট বন্ধু একা ঘুমিয়ে আছে। মাউস ঘুরিয়ে তারা জ্বালাও, আর যাত্রা শুরু করো! ✨',
    },
    solar: {
      en: 'Look at the glowing Sun and dancing planets! Click the Moon or Mars to zoom into their ancient landing zones! 🚀',
      bn: 'দেখো কী সুন্দর পৃথিবী, চাঁদ আর লাল মঙ্গল গ্রহ ঘুরছে! চাঁদে বা মঙ্গলে ক্লিক করো, আমরা স্পেসশিপ নিয়ে সেখানে নামব! 🚀',
    },
    planet: {
      en: "We've arrived! Spot the glowing radio beacons where the legendary rovers rest. Click on any beacon to explore! 🛰️",
      bn: 'আমরা পৌঁছে গেছি! দেখো জমিনের ওপর যেখানে সিগন্যাল জ্বলছে, সেখানেই রোভারগুলো বিশ্রাম নিচ্ছে। একটা ক্লিক করে কাছে যাও! 🛰️',
    },
    relic: {
      en: "Look how much cosmic dust covers this hero! Wipe your finger or mouse across the screen to clean the dust and wake them up! 🧹✨",
      bn: 'উফ! কত লাল ধুলো জমেছে ওর সোলার প্যানেলে! আঙুল বা মাউস দিয়ে ঘষে ধুলো মুছে দাও, ও আবার জেগে উঠবে! 🧹✨',
    },
    passport: {
      en: 'Hooray! You explored cosmic relics and unlocked new stamps in your Astro Passport! Print your official certificate! 🏆',
      bn: 'সাবাশ! তুমি মহাকাশের হারানো রোভারদের খুঁজে পেয়েছ এবং তোমার অ্যাস্ট্রো পাসপোর্টে নতুন স্ট্যাম্প জমা হয়েছে! সার্টিফিকেটটি দেখে নাও! 🏆',
    },
  };

  useEffect(() => {
    const text = customMessage || defaultMessages[currentStage]?.[language] || '';
    setSpeechBubbleText(text);
  }, [currentStage, customMessage, language]);

  const handleSpeak = () => {
    soundEffects.playClick();
    if (isSpeaking) {
      soundEffects.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      soundEffects.speakText(
        speechBubbleText,
        language,
        1.25, // youthful friendly pitch
        0.95
      );
      // Auto reset speaking state
      setTimeout(() => {
        setIsSpeaking(false);
      }, Math.max(3000, speechBubbleText.length * 75));
    }
  };

  const handleMascotClick = () => {
    soundEffects.playClick();
    setIsCelebrating(true);
    setTimeout(() => setIsCelebrating(false), 1200);
  };

  return (
    <div className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end pointer-events-none select-none">
      {/* Speech Bubble */}
      {!isMinimized && speechBubbleText && (
        <div className="relative mb-3 max-w-[280px] sm:max-w-sm pointer-events-auto transition-all duration-300 transform origin-bottom-right">
          <div className="glass-panel p-3.5 sm:p-4 rounded-2xl shadow-2xl border-2 border-cyan-400/60 text-slate-100 relative group">
            {/* Header info */}
            <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-cyan-500/20">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold tracking-wider text-cyan-300 uppercase font-space">
                  Little Nova • Flight Guide
                </span>
              </div>
              <div className="flex items-center gap-1">
                {/* Voice Readout button */}
                <button
                  onClick={handleSpeak}
                  title={language === 'bn' ? 'নোভার মুখে শুনুন' : 'Listen to Nova'}
                  className={`p-1 rounded-lg transition-all ${
                    isSpeaking
                      ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/40'
                      : 'hover:bg-cyan-500/20 text-cyan-300'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                {/* Minimize */}
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Content text */}
            <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-200">
              {speechBubbleText}
            </p>

            {/* Bubble Tail */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-slate-900/90 border-r-2 border-b-2 border-cyan-400/60 transform rotate-45" />
          </div>
        </div>
      )}

      {/* Minimized Pill */}
      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="mb-2 pointer-events-auto px-3 py-1.5 rounded-full glass-panel border border-cyan-400 text-xs font-bold text-cyan-300 flex items-center gap-1.5 shadow-lg hover:bg-cyan-500/20 transition-all"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'নোভাকে ডাকুন' : 'Talk with Nova'}</span>
          <ChevronUp className="w-3 h-3" />
        </button>
      )}

      {/* Cute Waving Kid-Astronaut Mascot Container */}
      <div
        onClick={handleMascotClick}
        title="Tap Nova for a cosmic high-five!"
        className={`pointer-events-auto cursor-pointer relative group transition-transform duration-300 ${
          isCelebrating ? 'scale-115 rotate-6' : 'hover:scale-105'
        }`}
      >
        {/* Floating Thruster Sparkles */}
        <div className="absolute -bottom-1 left-4 w-3 h-3 rounded-full bg-cyan-400 blur-[2px] opacity-75 animate-ping" />
        <div className="absolute -bottom-2 left-6 w-2 h-2 rounded-full bg-amber-400 blur-[1px] opacity-60 animate-pulse" />

        {/* Mascot SVG Vector - Kid Astronaut Waving */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 relative animate-float filter drop-shadow-[0_10px_20px_rgba(0,245,212,0.35)]">
          <svg viewBox="0 0 120 120" className="w-full h-full">
            {/* Backpack Thruster */}
            <rect x="22" y="42" width="16" height="34" rx="8" fill="#1E293B" stroke="#00F5D4" strokeWidth="2" />
            <ellipse cx="30" cy="78" rx="5" ry="3" fill="#00F5D4" opacity="0.8" />

            {/* Astronaut Body / Spacesuit */}
            <path
              d="M38 52 C38 40 82 40 82 52 L86 86 C86 92 80 96 74 96 L46 96 C40 96 34 92 34 86 Z"
              fill="#F8FAFC"
              stroke="#0EA5E9"
              strokeWidth="2.5"
            />

            {/* Spacesuit Chest Patch / NASA Vector Emblem */}
            <rect x="50" y="56" width="20" height="14" rx="3" fill="#0F172A" />
            <circle cx="56" cy="63" r="2.5" fill="#EF4444" />
            <path d="M54 65 L66 61" stroke="#38BDF8" strokeWidth="1.5" />
            <circle cx="64" cy="63" r="2" fill="#EAB308" />

            {/* Feet / Boots */}
            <ellipse cx="46" cy="98" rx="8" ry="5" fill="#334155" stroke="#00F5D4" strokeWidth="1.5" />
            <ellipse cx="74" cy="98" rx="8" ry="5" fill="#334155" stroke="#00F5D4" strokeWidth="1.5" />

            {/* Left Arm (Resting on hip or floating) */}
            <path
              d="M36 54 C26 60 25 72 32 78"
              fill="none"
              stroke="#F8FAFC"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <circle cx="32" cy="79" r="4.5" fill="#38BDF8" />

            {/* Big Round Helmet */}
            <circle cx="60" cy="38" r="26" fill="#F8FAFC" stroke="#0EA5E9" strokeWidth="3" />
            {/* Helmet Visor with Golden/Cyan Mirror Sheen */}
            <ellipse cx="60" cy="38" rx="20" ry="16" fill="#0F172A" stroke="#00F5D4" strokeWidth="2" />
            <path
              d="M45 32 Q60 22 75 32 Q60 48 45 32"
              fill="url(#visorGradient)"
              opacity="0.9"
            />
            {/* Visor Cute Eye Glows */}
            <circle cx="53" cy="37" r="2.5" fill="#38BDF8" className="animate-pulse" />
            <circle cx="67" cy="37" r="2.5" fill="#38BDF8" className="animate-pulse" />

            {/* Right Arm (WAVING HAND!) */}
            <g className="animate-wave origin-[78px_50px]">
              <path
                d="M78 50 C92 42 98 28 92 18"
                fill="none"
                stroke="#F8FAFC"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* Glove / Palm */}
              <circle cx="92" cy="16" r="6" fill="#38BDF8" />
              {/* Fingers */}
              <circle cx="96" cy="13" r="2.5" fill="#00F5D4" />
              <circle cx="93" cy="10" r="2.5" fill="#00F5D4" />
              <circle cx="89" cy="11" r="2.5" fill="#00F5D4" />
            </g>

            {/* Gradients */}
            <defs>
              <linearGradient id="visorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00F5D4" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#3A86FF" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#FFB703" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Tap trigger hint badge */}
        <div className="absolute -top-1 -left-2 bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-md opacity-90 animate-bounce flex items-center gap-0.5">
          <Sparkles className="w-2.5 h-2.5" />
          <span>NOVA</span>
        </div>
      </div>
    </div>
  );
}
