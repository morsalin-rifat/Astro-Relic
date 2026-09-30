import React, { useState } from 'react';
import { X, Award, CheckCircle, Printer, Download, Sparkles, User } from 'lucide-react';
import { RELICS_DATA } from '../data/relicsData';
import { Language } from '../types';
import { soundEffects } from '../utils/soundEffects';

interface AstroPassportModalProps {
  unlockedRelicIds: string[];
  onClose: () => void;
  language: Language;
}

export default function AstroPassportModal({
  unlockedRelicIds,
  onClose,
  language,
}: AstroPassportModalProps) {
  const [explorerName, setExplorerName] = useState<string>('Young Cosmic Explorer');
  const [showCertificate, setShowCertificate] = useState<boolean>(false);

  const allRelics = Object.values(RELICS_DATA);
  const totalStamps = allRelics.length;
  const unlockedCount = unlockedRelicIds.length;

  const handlePrintCertificate = () => {
    soundEffects.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel border-2 border-amber-400/50 shadow-2xl p-5 sm:p-8 text-slate-100 flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/20 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-2xl bg-amber-500/20 border border-amber-400/40">
              🛂
            </span>
            <div>
              <div className="text-[10px] font-mono text-amber-300 font-bold tracking-widest uppercase">
                NASA Space Apps Challenge 2026
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white font-space">
                {language === 'bn' ? 'অ্যাস্ট্রো পাসপোর্ট ও আর্কিওলজিস্ট সার্টিফিকেট' : 'Official Astro Passport & Badge'}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-all border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explorer Name Personalization */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-700 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-bold text-slate-300">
              {language === 'bn' ? 'অভিযাত্রীর নাম লিখুন:' : 'Explorer Name:'}
            </span>
          </div>
          <input
            type="text"
            value={explorerName}
            onChange={(e) => setExplorerName(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-cyan-400/50 text-white text-xs sm:text-sm font-bold focus:outline-none focus:border-cyan-400 min-w-[200px]"
            placeholder="Type your name here..."
          />
        </div>

        {/* Collectible Stamps Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-bold font-mono uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                {language === 'bn'
                  ? `সংগৃহীত হলোগ্রাফিক স্ট্যাম্প (${unlockedCount}/${totalStamps})`
                  : `Holographic Relic Stamps (${unlockedCount}/${totalStamps})`}
              </span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {unlockedCount === totalStamps
                ? language === 'bn'
                  ? 'সবগুলো স্ট্যাম্প আনলকড! 🎉'
                  : 'All Stamps Completed! 🎉'
                : language === 'bn'
                ? 'রোভারের ধুলো মুছে স্ট্যাম্প পান'
                : 'Clean relics to earn stamps'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {allRelics.map((relic) => {
              const isUnlocked = unlockedRelicIds.includes(relic.id);
              return (
                <div
                  key={relic.id}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${
                    isUnlocked
                      ? 'glass-panel-warm border-amber-400 shadow-lg shadow-amber-500/20'
                      : 'glass-card border-slate-800 opacity-50 grayscale'
                  }`}
                >
                  <div className="text-3xl mb-2">{relic.badgeIcon}</div>
                  <div className="font-bold text-xs text-white mb-1 line-clamp-1">
                    {language === 'bn' ? relic.badgeTitleBn : relic.badgeTitle}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {isUnlocked
                      ? language === 'bn'
                        ? 'অর্জিত ✓'
                        : 'Collected ✓'
                      : language === 'bn'
                      ? 'লকড'
                      : 'Locked'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificate Section or Trigger Button */}
        {!showCertificate ? (
          <div className="glass-panel p-5 rounded-3xl border-2 border-dashed border-cyan-400/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h4 className="font-black text-base text-white font-space">
                {language === 'bn'
                  ? 'নাসা জুনিয়র স্পেস আর্কিওলজিস্ট সার্টিফিকেট'
                  : 'NASA Junior Space Archaeologist Certificate'}
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                {language === 'bn'
                  ? 'তোমার নামে অফিসিয়াল ডিজিটাল সার্টিফিকেট তৈরি ও প্রিন্ট করো!'
                  : 'Generate and print your official certificate with your name and stamps!'}
              </p>
            </div>
            <button
              onClick={() => {
                soundEffects.playClick();
                setShowCertificate(true);
              }}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-400/30 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
            >
              <Award className="w-4 h-4" />
              <span>{language === 'bn' ? 'সার্টিফিকেট দেখুন' : 'View Certificate'}</span>
            </button>
          </div>
        ) : (
          /* Printable Certificate Card */
          <div className="p-6 rounded-3xl bg-slate-900 border-4 border-amber-400/80 shadow-2xl relative space-y-4">
            <div className="text-center space-y-2 border-b-2 border-amber-400/30 pb-4">
              <div className="text-2xl">🌌 🦅 🫐 🚀</div>
              <div className="text-xs font-mono tracking-widest text-amber-300 uppercase font-bold">
                NASA SPACE APPS CHALLENGE 2026 • OFFICIAL DIPLOMA
              </div>
              <h3 className="text-xl sm:text-3xl font-black text-white font-space tracking-wide">
                JUNIOR SPACE ARCHAEOLOGIST
              </h3>
              <p className="text-xs text-slate-300 italic">
                {language === 'bn'
                  ? 'মহাকাশের একাকী রোবটদের স্মৃতি ও বৈজ্ঞানিক ঐতিহ্য সংরক্ষণের স্বীকৃতিস্বরূপ'
                  : 'In recognition of rediscovering and preserving humanity\'s robotic legacy across the Moon and Mars'}
              </p>
            </div>

            <div className="text-center py-2">
              <div className="text-xs text-slate-400 uppercase tracking-widest">
                {language === 'bn' ? 'প্রদান করা হলো' : 'PROUDLY PRESENTED TO'}
              </div>
              <div className="text-xl sm:text-2xl font-black text-cyan-300 mt-1 font-space underline decoration-amber-400 decoration-2 underline-offset-4">
                {explorerName}
              </div>
            </div>

            {/* Badges Earned Ribbon */}
            <div className="flex items-center justify-center gap-4 py-2 border-t border-b border-slate-800">
              {allRelics.map((r) => (
                <span
                  key={r.id}
                  title={r.name}
                  className={`text-2xl ${unlockedRelicIds.includes(r.id) ? '' : 'opacity-25'}`}
                >
                  {r.badgeIcon}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2">
              <div>
                <div>Issued: September 2026</div>
                <div>Status: Space Relic Custodian</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-amber-300">Certified by: Little Nova</div>
                <div>Astro Relic Global Sanctuary</div>
              </div>
            </div>

            {/* Print Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCertificate(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-medium text-slate-400 hover:text-white"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Back'}
              </button>
              <button
                onClick={handlePrintCertificate}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/30"
              >
                <Printer className="w-4 h-4" />
                <span>{language === 'bn' ? 'প্রিন্ট / সেভ করুন' : 'Print / Save'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
