/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import InteractiveStarfield from './components/InteractiveStarfield';
import LittleNovaMascot from './components/LittleNovaMascot';
import SolarSystemViewer from './components/SolarSystemViewer';
import PlanetarySurfaceViewer from './components/PlanetarySurfaceViewer';
import RelicExperienceModal from './components/RelicExperienceModal';
import AstroPassportModal from './components/AstroPassportModal';
import GlobalVisitorCounter from './components/GlobalVisitorCounter';
import { RELICS_DATA } from './data/relicsData';
import { PlanetId, Language, RelicData } from './types';
import { soundEffects } from './utils/soundEffects';
import {
  Rocket,
  Globe2,
  Volume2,
  VolumeX,
  Award,
  Sparkles,
  Layers,
  Bot,
  Heart,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

type AppStage = 'landing' | 'solar' | 'planet';

export default function App() {
  const [stage, setStage] = useState<AppStage>('landing');
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetId>('mars');
  const [activeRelic, setActiveRelic] = useState<RelicData | null>(null);
  const [language, setLanguage] = useState<Language>('bn'); // default Bengali as user requested in Bengali, with instant English switch!
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isWarping, setIsWarping] = useState<boolean>(false);
  const [isPassportOpen, setIsPassportOpen] = useState<boolean>(false);
  const [unlockedRelicIds, setUnlockedRelicIds] = useState<string[]>(['opportunity']);

  // Launch button clicked from landing
  const handleLaunchExploration = () => {
    soundEffects.playClick();
    soundEffects.playWarp();
    setIsWarping(true);
  };

  const handleWarpComplete = () => {
    setIsWarping(false);
    setStage('solar');
  };

  const handleSelectPlanet = (planet: PlanetId) => {
    soundEffects.playClick();
    setSelectedPlanet(planet);
    setStage('planet');
  };

  const handleSelectRelic = (relicId: string) => {
    soundEffects.playClick();
    const data = RELICS_DATA[relicId] || RELICS_DATA.opportunity;
    setActiveRelic(data);
  };

  const handleUnlockStamp = (relicId: string) => {
    if (!unlockedRelicIds.includes(relicId)) {
      setUnlockedRelicIds((prev) => [...prev, relicId]);
    }
  };

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEffects.setMuted(nextMuted);
  };

  const toggleLanguage = () => {
    soundEffects.playClick();
    setLanguage((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  return (
    <div className={`relative min-h-screen w-full bg-[#070B19] text-slate-100 overflow-x-hidden ${language === 'bn' ? 'font-bengali' : ''}`}>
      {/* Persistent Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-30 px-3 sm:px-6 py-3 flex items-center justify-between pointer-events-none">
        {/* Brand Logo & Title */}
        <div
          onClick={() => {
            soundEffects.playClick();
            setStage('landing');
          }}
          className="pointer-events-auto cursor-pointer flex items-center gap-2.5 glass-panel px-3.5 py-2 rounded-2xl border border-cyan-400/40 shadow-xl group hover:border-cyan-300 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-amber-400 flex items-center justify-center text-lg shadow-md group-hover:rotate-12 transition-transform">
            🛸
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-white font-space tracking-wider flex items-center gap-1.5">
              <span>ASTRO RELIC</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-normal">
                2026
              </span>
            </div>
            <div className="text-[9px] text-slate-300 hidden sm:block">
              NASA Space Apps • The Next Frontier
            </div>
          </div>
        </div>

        {/* Center: Live Global Visitor Counter (In Solar / Planet modes) */}
        {stage !== 'landing' && (
          <div className="hidden md:flex pointer-events-auto">
            <GlobalVisitorCounter language={language} />
          </div>
        )}

        {/* Right Action Icons: Astro Passport, Sound & Language */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Astro Passport Button */}
          <button
            onClick={() => {
              soundEffects.playClick();
              setIsPassportOpen(true);
            }}
            className="px-3 py-2 rounded-xl glass-panel-warm border border-amber-400/60 text-amber-300 hover:bg-amber-500/20 transition-all flex items-center gap-1.5 text-xs font-bold shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">
              {language === 'bn' ? 'অ্যাস্ট্রো পাসপোর্ট' : 'Passport'}
            </span>
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center font-mono">
              {unlockedRelicIds.length}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={isMuted ? 'Unmute Space Audio' : 'Mute Audio'}
            className="p-2 rounded-xl glass-panel border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-all active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Language Switch Toggle */}
          <button
            onClick={toggleLanguage}
            title="Switch Language / ভাষা পরিবর্তন করুন"
            className="px-2.5 py-1.5 rounded-xl glass-panel border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/20 transition-all font-mono font-bold text-xs active:scale-95"
          >
            {language === 'bn' ? 'EN ⇄ বাং' : 'বাং ⇄ EN'}
          </button>
        </div>
      </header>

      {/* STAGE 1: LANDING PAGE (Bare Creative Interactive Starfield Hero) */}
      {stage === 'landing' && (
        <div className="relative min-h-screen w-full flex flex-col justify-between p-4 sm:p-8 z-10 pt-20">
          {/* Bare Creative Interactive Proximity Glow Starfield Canvas */}
          <InteractiveStarfield isWarping={isWarping} onWarpComplete={handleWarpComplete} />

          {/* Main Hero Content */}
          <div className="relative z-10 max-w-4xl mx-auto my-auto text-center px-4 py-8">
            {/* NASA Space Apps Challenge 2026 Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-cyan-400/50 text-cyan-300 text-xs sm:text-sm font-space font-bold shadow-lg shadow-cyan-500/20 mb-6 animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                {language === 'bn'
                  ? 'নাসা স্পেস অ্যাপস চ্যালেঞ্জ ২০২৬ • চাইল্ড-সেন্ট্রিক ৩D স্টোরিটেলিং'
                  : 'NASA Space Apps Challenge 2026 • Child-Centric 3D Storytelling'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white font-space leading-tight drop-shadow-2xl">
              ASTRO <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300">RELIC</span>
            </h1>

            {/* Emotional Problem Statement Subtitle */}
            <p className="mt-4 text-base sm:text-xl text-slate-200 max-w-2xl mx-auto font-medium leading-relaxed">
              {language === 'bn'
                ? 'চাঁদ ও মঙ্গলের নির্জন মরুভূমিতে ঘুমিয়ে থাকা নাসার একাকী বীর রোবটদের রূপকথা ও হারিয়ে যাওয়া স্মৃতি পুনরুদ্ধারের মহাজাগতিক অভিযান।'
                : 'Abandoned but Not Forgotten: Bringing humanity\'s silent robotic monuments on the Moon and Mars back to life through interactive WebGL & Conversational AI.'}
            </p>

            {/* Launch Button (Warp trigger) */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleLaunchExploration}
                disabled={isWarping}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-base sm:text-lg shadow-2xl shadow-cyan-400/50 hover:shadow-cyan-400/80 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 font-space cursor-pointer"
              >
                <Rocket className="w-5 h-5 animate-bounce" />
                <span>
                  {isWarping
                    ? language === 'bn'
                      ? 'হাইপারড্রাইভ স্টার্ট হচ্ছে...'
                      : 'Warping to Orbit...'
                    : language === 'bn'
                    ? 'মহাকাশ অভিযান শুরু করুন 🚀'
                    : 'Launch Exploration 🚀'}
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setIsPassportOpen(true);
                }}
                className="px-6 py-4 rounded-2xl glass-panel hover:bg-slate-800/80 border border-slate-700 hover:border-amber-400 text-amber-300 text-sm sm:text-base font-bold transition-all flex items-center gap-2"
              >
                <Award className="w-5 h-5 text-amber-400" />
                <span>{language === 'bn' ? 'অ্যাস্ট্রো পাসপোর্ট দেখুন' : 'View Astro Passport'}</span>
              </button>
            </div>

            {/* Bare Creative hint */}
            <div className="mt-6 text-xs font-mono text-cyan-400/80 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>
                {language === 'bn'
                  ? 'টিপস: স্ক্রিনের ওপর মাউস নাড়ালে নক্ষত্ররা আলো ছড়াবে ও তারামণ্ডল গড়বে!'
                  : 'Pro Tip: Move your cursor across the starfield to illuminate celestial constellations!'}
              </span>
            </div>

            {/* 4 Breakthrough Pillars Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-12 text-left">
              <div className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-cyan-400/60 transition-all">
                <div className="text-2xl mb-1.5">🪐</div>
                <div className="font-extrabold text-sm text-white font-space">
                  {language === 'bn' ? '৩D সোলার ক্যামেরা ডাইভ' : '3D Camera Dive'}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  {language === 'bn'
                    ? 'মহাশূন্য থেকে সরাসরি মঙ্গলের বুকে রোভারের অবতরণক্ষেত্রে ল্যান্ডিং।'
                    : 'Dive seamlessly from the interplanetary orbit down into the landing sites.'}
                </div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-amber-400/60 transition-all">
                <div className="text-2xl mb-1.5">🧹</div>
                <div className="font-extrabold text-sm text-white font-space">
                  {language === 'bn' ? 'ধুলো মুছে রোভার জাগানো' : 'Dust to Life'}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  {language === 'bn'
                    ? 'আঙুল দিয়ে মঙ্গলের লাল ধুলো মুছে সোলার প্যানেল জাগিয়ে তোলার স্পর্শ।'
                    : 'Tactile dusting mechanism to clean solar panels and awaken dormant robots.'}
                </div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-sky-400/60 transition-all">
                <div className="text-2xl mb-1.5">🔬</div>
                <div className="font-extrabold text-sm text-white font-space">
                  {language === 'bn' ? 'এক্স-রে হার্ডওয়্যার ডিকোডার' : 'X-Ray Component Scanner'}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  {language === 'bn'
                    ? 'রোভারকে স্বচ্ছ করে ভেতরের ব্রেন, ব্যাটারি ও স্পেক্ট্রোমিটার দেখা।'
                    : 'Peel back the metal chassis into glowing wireframes to decode instruments.'}
                </div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-rose-400/60 transition-all">
                <div className="text-2xl mb-1.5">💬</div>
                <div className="font-extrabold text-sm text-white font-space">
                  {language === 'bn' ? 'জেমিনাই এআই চ্যাট' : 'Gemini AI Archaeologist'}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  {language === 'bn'
                    ? 'অপরচুনিটি বা অ্যাপোলো ল্যান্ডারের সাথে সরাসরি আবেগঘন কথোপকথন।'
                    : 'Converse in real-time in first person with Oppy, InSight, and Apollo 11.'}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Landing Footer */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-300 border-t border-slate-800/80 pt-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>NASA Planetary Data System (PDS) & Google Gen AI Powered</span>
            </div>
            <div className="flex items-center gap-3">
              <span>NASA Space Apps 2026</span>
              <span>•</span>
              <GlobalVisitorCounter language={language} />
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: 3D SOLAR SYSTEM ORBIT */}
      {stage === 'solar' && (
        <SolarSystemViewer
          onSelectPlanet={handleSelectPlanet}
          language={language}
        />
      )}

      {/* STAGE 3: PLANETARY SURFACE ARCHAEOLOGICAL SITE */}
      {stage === 'planet' && (
        <PlanetarySurfaceViewer
          planet={selectedPlanet}
          onBackToOrbit={() => setStage('solar')}
          onSelectRelic={handleSelectRelic}
          language={language}
        />
      )}

      {/* RELIC DEEP ARCHEOLOGICAL EXPERIENCE MODAL */}
      {activeRelic && (
        <RelicExperienceModal
          relic={activeRelic}
          onClose={() => setActiveRelic(null)}
          onUnlockStamp={handleUnlockStamp}
          hasUnlockedStamp={unlockedRelicIds.includes(activeRelic.id)}
          language={language}
        />
      )}

      {/* ASTRO PASSPORT & CERTIFICATE MODAL */}
      {isPassportOpen && (
        <AstroPassportModal
          unlockedRelicIds={unlockedRelicIds}
          onClose={() => setIsPassportOpen(false)}
          language={language}
        />
      )}

      {/* LITTLE NOVA: ADORABLE WAVING KID-ASTRONAUT MASCOT */}
      <LittleNovaMascot
        currentStage={
          activeRelic
            ? 'relic'
            : isPassportOpen
            ? 'passport'
            : stage === 'landing'
            ? 'landing'
            : stage === 'solar'
            ? 'solar'
            : 'planet'
        }
        language={language}
      />
    </div>
  );
}
