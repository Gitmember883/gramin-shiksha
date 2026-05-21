import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LANGUAGES, Language } from '../types';

interface Props {
  onSelect: (lang: Language) => void;
}

export const LanguageSelector: React.FC<Props> = ({ onSelect }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="language-selector" className="fixed inset-0 bg-orange-50 z-50 overflow-y-auto py-16 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto text-center"
      >
        <img 
          src="/logo.jpg" 
          alt="Digital Vidya Logo" 
          className="w-48 h-48 object-contain mx-auto mb-8 rounded-[32px] shadow-md border-4 border-orange-200"
        />
        <h1 className="text-5xl md:text-7xl mb-4 text-orange-950 font-black tracking-tighter">नमस्ते!</h1>
        <p className="text-xl md:text-2xl text-orange-800 mb-12 font-bold opacity-80 italic">अपनी भाषा चुनें • নিজের ভাষা নির্বাচন করুন • Choose Language</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {LANGUAGES.map((lang) => (
            <motion.button
              key={lang.code}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(lang)}
              className="bg-white rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 border-b-8 border-r-8 border-orange-200 hover:border-orange-300 transition-all cursor-pointer shadow-sm group"
            >
              <span className="text-5xl group-hover:scale-110 transition-transform" role="img" aria-label={lang.name}>{lang.flag}</span>
              <div className="flex flex-col">
                <span className="font-black text-2xl text-orange-950">{lang.nativeName}</span>
                <span className="text-xs text-orange-700 font-bold uppercase tracking-widest">{lang.name}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Separate Link Section for Digital Vidya */}
        <div className="mt-16 max-w-md mx-auto bg-white p-6 rounded-[32px] border-b-8 border-r-8 border-orange-200 text-center shadow-sm">
          <p className="text-sm font-bold text-orange-950 mb-3 flex items-center justify-center gap-2">
            <span>🔗</span> Separate Link for Digital Vidya
          </p>
          <div className="flex gap-2 items-center bg-orange-50 rounded-2xl p-2 border border-orange-100 overflow-hidden mb-3">
            <input 
              type="text" 
              readOnly 
              value={window.location.origin} 
              className="bg-transparent text-xs font-mono select-all text-orange-900 border-none outline-none flex-grow overflow-ellipsis px-2"
            />
            <button 
              onClick={handleCopy}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4 py-2 text-xs font-bold cursor-pointer transition-all active:scale-95 shrink-0"
            >
              {copied ? "✅ Copied" : "📋 Copy"}
            </button>
          </div>
          <a
            href={window.location.origin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-black text-orange-600 hover:underline transition-all"
          >
            <span>🚀</span> Open Application in New Tab
          </a>
        </div>
      </motion.div>
    </div>
  );
};
