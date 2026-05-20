import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { CATEGORIES, SkillCategory, Language } from '../types';
import { getAllOfflineCourseIds, getProgress } from '../services/storage';
import { getTranslatedCategories, getTranslatedUiLabels } from '../translations';

interface Props {
  selectedLanguage: Language;
  onSelectCategory: (cat: SkillCategory) => void;
}

export const SkillDashboard: React.FC<Props> = ({ selectedLanguage, onSelectCategory }) => {
  const [offlineIds, setOfflineIds] = useState<string[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [searchQuery, setSearchQuery] = useState('');
  const [translatedCategories, setTranslatedCategories] = useState<SkillCategory[]>(CATEGORIES);
  const [isTranslating, setIsTranslating] = useState(false);
  const [uiLabels, setUiLabels] = useState({
    availableSkills: "Available Skills",
    learnNewSkills: "Learn New Skills",
    connectingTo: "Connecting you to knowledge in",
    searchPlaceholder: "Search skills...",
    browsingOffline: "You are browsing offline. Only saved courses are available.",
    offlineMode: "Offline Mode",
    noSkillsFound: "No skills found",
    trySearchingElse: "Try searching for something else like \"farming\" or \"mobile\".",
    clearSearch: "Clear Search",
    needHelp: "Need Help with Skills?",
    talkToMentorDesc: "Talk to your AI Mentor in ",
    talkToMentorBtn: "Talk to Mentor",
    translatingLabels: "Translating labels...",
    startLearning: "Start Learning",
    exploreMore: "Explore More"
  });

  useEffect(() => {
    const loadStats = async () => {
      const ids = await getAllOfflineCourseIds(selectedLanguage.code);
      const progress = await getProgress();
      setOfflineIds(ids);
      setCompletedIds(progress.completedIds);
    };

    const translateDashboard = async () => {
      // 1. Initialise with our robust, curated multilingual translation library
      const staticCategories = getTranslatedCategories(selectedLanguage.code);
      const staticLabels = getTranslatedUiLabels(selectedLanguage.code, uiLabels);

      setTranslatedCategories(staticCategories);
      setUiLabels(staticLabels);

      if (selectedLanguage.code === 'en') {
        return;
      }

      const cacheKey = `translated_dashboard_extended_${selectedLanguage.code}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { categories, labels } = JSON.parse(cached);
        setTranslatedCategories(categories);
        setUiLabels(labels);
        return;
      }

      setIsTranslating(true);
      try {
        // Parallel translation of categories and UI labels as a premium dynamic enhancement
        const [catRes, labelRes] = await Promise.all([
          fetch('/api/translate-categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categories: CATEGORIES, language: selectedLanguage.nativeName }),
          }),
          fetch('/api/translate-ui', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texts: uiLabels, language: selectedLanguage.nativeName }),
          })
        ]);

        const catData = await catRes.json();
        const labelData = await labelRes.json();

        let merged = staticCategories;
        if (catData.translatedCategories) {
          merged = CATEGORIES.map(cat => {
            const trans = catData.translatedCategories.find((t: any) => t.id === cat.id);
            return trans ? { ...cat, title: trans.title, description: trans.description } : cat;
          });
          setTranslatedCategories(merged);
        }

        let mergedLabels = staticLabels;
        if (labelData.translatedTexts) {
          mergedLabels = labelData.translatedTexts;
          setUiLabels(mergedLabels);
        }

        localStorage.setItem(cacheKey, JSON.stringify({ 
          categories: merged, 
          labels: mergedLabels 
        }));
      } catch (err: any) {
        console.error("Dashboard translation failed", err);
        // Fall back gracefully to the pre-loaded high-quality local cache/dictionary
      } finally {
        setIsTranslating(false);
      }
    };

    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    loadStats();
    translateDashboard();
    
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, [selectedLanguage]);

  const filteredCategories = translatedCategories.filter(cat => 
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="skill-dashboard" className="max-w-5xl mx-auto px-6 py-12">
      {!isOnline && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-orange-800 text-white p-4 rounded-2xl mb-8 flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <Icons.WifiOff size={24} />
            <span className="font-bold">{uiLabels.browsingOffline}</span>
          </div>
          <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">{uiLabels.offlineMode}</span>
        </motion.div>
      )}

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-orange-100 text-orange-700 px-4 py-1 rounded-full font-bold text-xs uppercase tracking-wider w-fit block">{uiLabels.availableSkills}</span>
            {isTranslating && (
              <span className="flex items-center gap-1 text-orange-400 text-xs font-bold animate-pulse">
                <Icons.Languages size={14} />
                {uiLabels.translatingLabels}
              </span>
            )}
          </div>
          <h2 className="text-4xl md:text-5xl text-orange-900 font-black">{uiLabels.learnNewSkills}</h2>
          <p className="text-orange-700/70 text-lg font-bold mt-2">{uiLabels.connectingTo} {selectedLanguage.nativeName}</p>
        </div>

        <div className="relative w-full md:w-72 shrink-0">
          <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none" size={20} />
          <input 
            type="text"
            placeholder={uiLabels.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-b-4 border-r-4 border-orange-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-orange-500 font-bold text-orange-950 shadow-sm transition-all text-sm"
          />
        </div>
      </header>

      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.map((cat, index) => {
            const Icon = (Icons as any)[cat.icon];
            const isDownloaded = offlineIds.includes(cat.id);
            const isCompleted = completedIds.includes(cat.id);
            
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                onClick={() => onSelectCategory(cat)}
                className={`card-vibrant p-8 text-left flex flex-col h-full hover:bg-orange-50/30 transition-colors cursor-pointer group relative ${!isOnline && !isDownloaded ? 'opacity-50 grayscale pointer-events-none' : ''}`}
              >
                {isCompleted && (
                  <div className="absolute top-4 right-4 text-green-600 bg-green-50 p-1 rounded-full shadow-sm">
                    <Icons.CheckCircle size={24} />
                  </div>
                )}
                
                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-6 ${cat.color} shadow-sm border-2 border-white/50`}>
                  <Icon size={32} />
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-black text-orange-900 leading-tight">{cat.title}</h3>
                  {isDownloaded && (
                    <Icons.CloudDownload size={18} className="text-orange-500" />
                  )}
                </div>
                
                <p className="text-orange-800/70 font-medium leading-relaxed mb-6 flex-grow">{cat.description}</p>
                
                <div className="flex items-center text-orange-600 font-black uppercase text-sm tracking-wider">
                  <span className="mr-2">{isCompleted ? uiLabels.exploreMore : uiLabels.startLearning}</span>
                  <Icons.ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center card-vibrant bg-orange-50/50 border-dashed">
          <div className="w-20 h-20 bg-orange-100 text-orange-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icons.SearchX size={40} />
          </div>
          <h3 className="text-2xl font-black text-orange-950 mb-2">{uiLabels.noSkillsFound}</h3>
          <p className="text-orange-800/60 font-medium">{uiLabels.trySearchingElse}</p>
          <button 
            onClick={() => setSearchQuery('')}
            className="mt-6 text-orange-600 font-black uppercase text-sm tracking-widest hover:underline cursor-pointer"
          >
            {uiLabels.clearSearch}
          </button>
        </div>
      )}


      <div className="mt-16 bg-green-600 rounded-[40px] p-8 md:p-12 text-white border-b-8 border-r-8 border-green-800 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-xl">
        <div className="absolute top-0 right-0 opacity-10 text-[180px] pointer-events-none -translate-y-1/4 translate-x-1/4">
          🌱
        </div>
        
        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[32px] flex items-center justify-center shrink-0 border-2 border-white/30">
          <Icons.MessageSquare size={48} className="text-white" />
        </div>
        
        <div className="text-center md:text-left z-10">
          <h3 className="text-3xl font-black mb-2 leading-tight">{uiLabels.needHelp}</h3>
          <p className="text-green-100 text-lg font-medium max-w-md">{uiLabels.talkToMentorDesc}{selectedLanguage.nativeName} ...</p>
        </div>
        
        <button 
          onClick={() => (window as any).toggleAiMentor?.()}
          className="bg-white text-green-800 px-10 py-5 rounded-[24px] font-black text-xl shadow-[0_6px_0_#166534] active:translate-y-[2px] active:shadow-[0_4px_0_#166534] transition-all md:ml-auto"
        >
          {uiLabels.talkToMentorBtn}
        </button>
      </div>
    </div>
  );
};
