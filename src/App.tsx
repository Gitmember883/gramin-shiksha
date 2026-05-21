import { useState, useEffect } from 'react';
import { LanguageSelector } from './components/LanguageSelector';
import { SkillDashboard } from './components/SkillDashboard';
import { ContentPage } from './components/ContentPage';
import { DifficultySelector } from './components/DifficultySelector';
import { AiMentor } from './components/AiMentor';
import { ProfileSettings } from './components/ProfileSettings';
import { NotificationsPanel } from './components/NotificationsPanel';
import { Language, SkillCategory, Difficulty } from './types';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getUserPreferences, applyPreferences } from './services/storage';

export default function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  useEffect(() => {
    getUserPreferences().then(applyPreferences);
  }, []);
  const [activeCategory, setActiveCategory] = useState<SkillCategory | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [showDifficultySelector, setShowDifficultySelector] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const resetLanguage = () => {
    setSelectedLanguage(null);
    setActiveCategory(null);
    setSelectedDifficulty(null);
  };

  const handleSelectCategory = (cat: SkillCategory) => {
    setActiveCategory(cat);
    setShowDifficultySelector(true);
  };

  const handleSelectDifficulty = (diff: Difficulty) => {
    setSelectedDifficulty(diff);
    setShowDifficultySelector(false);
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {!selectedLanguage ? (
          <LanguageSelector key="selector" onSelect={setSelectedLanguage} />
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-24"
          >
            {/* Minimal Navbar */}
            <nav className="bg-white sticky top-0 z-30 border-b-4 border-orange-200">
              <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
                <button 
                  onClick={() => {
                    setActiveCategory(null);
                    setSelectedDifficulty(null);
                  }}
                  className="flex items-center gap-3 group cursor-pointer"
                >
                  <img 
                    src="/icon-192.png" 
                    alt="Digital Vidya Logo" 
                    className="w-12 h-12 object-contain rounded-xl border border-orange-100 shadow-sm"
                  />
                  <span className="text-2xl font-black text-orange-900 tracking-tight">डिजिटल विद्या <span className="text-orange-500 uppercase text-xs align-middle font-black">pro</span></span>
                </button>
                
                <div className="flex items-center gap-3">
                  <a
                    href={window.location.origin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border-2 border-orange-200 rounded-full text-orange-850 font-black text-xs uppercase tracking-wider hover:bg-orange-50 transition-colors shadow-sm"
                    title="Open Digital Vidya in a separate tab outside the iframe"
                  >
                    <span>🔗</span> Separate Link
                  </a>
                  <button 
                    onClick={resetLanguage}
                    className="flex items-center gap-2 px-6 py-2 bg-orange-100 border-2 border-orange-200 rounded-full transition-colors text-orange-800 font-bold text-sm shadow-sm hover:bg-orange-200"
                  >
                    <span>🌐</span>
                    <span>{selectedLanguage.nativeName}</span>
                  </button>
                </div>
              </div>
            </nav>

            {/* Content Area */}
            <main className="bg-orange-50/30 min-h-screen">
              {activeCategory && selectedDifficulty ? (
                <ContentPage 
                  category={activeCategory} 
                  language={selectedLanguage}
                  difficulty={selectedDifficulty}
                  onBack={() => {
                    setActiveCategory(null);
                    setSelectedDifficulty(null);
                  }} 
                />
              ) : (
                <SkillDashboard 
                  selectedLanguage={selectedLanguage} 
                  onSelectCategory={handleSelectCategory} 
                />
              )}
            </main>

            {/* Difficulty Selector Modal */}
            <AnimatePresence>
              {showDifficultySelector && selectedLanguage && (
                <DifficultySelector 
                  language={selectedLanguage}
                  onSelect={handleSelectDifficulty}
                  onClose={() => {
                    setShowDifficultySelector(false);
                    setActiveCategory(null);
                  }}
                />
              )}
            </AnimatePresence>

            {/* AI Assistant Overlay */}
            <AiMentor selectedLanguage={selectedLanguage} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      {selectedLanguage && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-orange-200 z-30">
          <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-around">
            <button
              onClick={() => {
                setActiveCategory(null);
                setSelectedDifficulty(null);
              }}
              className="flex flex-col items-center gap-1 text-orange-600 font-bold"
            >
              <Icons.Home size={24} />
              <span className="text-xs">Home</span>
            </button>
            <button
              onClick={() => setShowNotifications(true)}
              className="flex flex-col items-center gap-1 text-orange-600 font-bold relative"
            >
              <Icons.Bell size={24} />
              <span className="text-xs">Alerts</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full" />
            </button>
            <button
              onClick={() => setShowProfile(true)}
              className="flex flex-col items-center gap-1 text-orange-600 font-bold"
            >
              <Icons.Settings size={24} />
              <span className="text-xs">Settings</span>
            </button>
          </div>
        </nav>
      )}

      {/* Profile Settings Modal */}
      <AnimatePresence>
        {showProfile && selectedLanguage && (
          <ProfileSettings 
            selectedLanguage={selectedLanguage} 
            onClose={() => setShowProfile(false)} 
          />
        )}
      </AnimatePresence>

      {/* Notifications Panel */}
      <NotificationsPanel
        selectedLanguage={selectedLanguage}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Footer (Simplified for rural accessibility) */}
      <footer className="py-12 border-t border-black/5 text-center mt-auto opacity-50 flex flex-col items-center gap-2">
        <p className="font-serif italic text-brand-ink">Empowering Rural Communities through Knowledge</p>
        <p className="text-xs uppercase tracking-widest">© 2026 Digital Vidya</p>
        <a 
          href={window.location.origin} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs text-orange-700 font-black underline hover:text-orange-950 mt-2"
        >
          🔗 Open App in Separate Window / Tab
        </a>
      </footer>
    </div>
  );
}

