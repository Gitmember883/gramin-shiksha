import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Difficulty, Language } from '../types';
import { GraduationCap, Zap, Trophy, X, Languages } from 'lucide-react';
import { getTranslatedDifficulty } from '../translations';

interface Props {
  onSelect: (diff: Difficulty) => void;
  onClose: () => void;
  language: Language;
}

export const DifficultySelector: React.FC<Props> = ({ onSelect, onClose, language }) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [localizedStrings, setLocalizedStrings] = useState({
    title: "Select Your Level",
    subtitle: "Choose how detailed you want the guide to be.",
    beginnerLabel: "Beginner",
    beginnerDesc: "Basic concepts and simple steps.",
    intermediateLabel: "Intermediate",
    intermediateDesc: "Detailed guides for those with basic knowledge.",
    advancedLabel: "Advanced",
    advancedDesc: "Expert tips and advanced techniques."
  });

  useEffect(() => {
    const translateUI = async () => {
      // 1. Load from local translation dictionary as our core/offline benchmark
      const staticLabels = getTranslatedDifficulty(language.code, localizedStrings);
      setLocalizedStrings(staticLabels);

      if (language.code === 'en') return;

      const cacheKey = `difficulty_strings_${language.code}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setLocalizedStrings(JSON.parse(cached));
        return;
      }

      setIsTranslating(true);
      try {
        const response = await fetch('/api/translate-ui', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: localizedStrings, language: language.nativeName }),
        });
        const data = await response.json();
        if (data.translatedTexts) {
          setLocalizedStrings(data.translatedTexts);
          localStorage.setItem(cacheKey, JSON.stringify(data.translatedTexts));
        }
      } catch (err) {
        console.error("UI translation failed", err);
        // Fall back gracefully to the preloaded static translations
      } finally {
        setIsTranslating(false);
      }
    };

    translateUI();
  }, [language]);

  const levels: { id: Difficulty, icon: any, label: string, desc: string, color: string }[] = [
    { 
      id: "beginner", 
      icon: GraduationCap, 
      label: localizedStrings.beginnerLabel, 
      desc: localizedStrings.beginnerDesc,
      color: "border-blue-200 bg-blue-50 text-blue-900"
    },
    { 
      id: "intermediate", 
      icon: Zap, 
      label: localizedStrings.intermediateLabel, 
      desc: localizedStrings.intermediateDesc,
      color: "border-amber-200 bg-amber-50 text-amber-900"
    },
    { 
      id: "advanced", 
      icon: Trophy, 
      label: localizedStrings.advancedLabel, 
      desc: localizedStrings.advancedDesc,
      color: "border-purple-200 bg-purple-50 text-purple-900"
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-brand-ink/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="card-vibrant max-w-lg w-full p-8 md:p-12 relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-orange-100 rounded-full transition-colors text-orange-900/40"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-3xl font-black text-orange-950">{localizedStrings.title}</h3>
          {isTranslating && <Languages className="text-orange-400 animate-spin" size={20} />}
        </div>
        <p className="text-orange-900/60 font-bold mb-8">{localizedStrings.subtitle}</p>

        <div className="space-y-4">
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => onSelect(level.id)}
              className={`w-full p-6 rounded-[24px] border-2 flex items-center gap-6 text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group ${level.color}`}
            >
              <div className="w-14 h-14 bg-white/50 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:bg-white transition-colors">
                <level.icon size={28} />
              </div>
              <div>
                <h4 className="text-xl font-black">{level.label}</h4>
                <p className="text-sm font-medium opacity-70 leading-tight mt-1">{level.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
