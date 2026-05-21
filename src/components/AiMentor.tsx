import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Bot, Loader2, MessageSquare, Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react';
import { Language } from '../types';
import { getUserProfile, getProgress } from '../services/storage';

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

interface Props {
  selectedLanguage: Language;
}

const getSpeechLocale = (langCode: string): string => {
  const code = (langCode || "").toLowerCase();
  
  const mapping: { [key: string]: string } = {
    hi: 'hi-IN',
    bn: 'bn-IN',
    te: 'te-IN',
    mr: 'mr-IN',
    ta: 'ta-IN',
    gu: 'gu-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    pa: 'pa-IN',
    ur: 'ur-IN',
    or: 'or-IN',
    en: 'en-IN'
  };
  
  if (mapping[code]) {
    return mapping[code];
  }
  
  // Script / Geographic fallbacks to ensure unsupported regional languages still function beautifully
  if (['brx', 'doi', 'ks', 'gom', 'mai', 'ne', 'sa', 'sat'].includes(code)) {
    return 'hi-IN'; // Devnagari script languages fall back to Hindi
  }
  if (['as', 'mni'].includes(code)) {
    return 'bn-IN'; // Assamese and Manipuri fall back to Bengali script
  }
  if (['sd'].includes(code)) {
    return 'ur-IN'; // Sindhi falls back to Urdu (Arabic script)
  }
  
  return `${code}-IN`;
};

const safeGetLocalStorage = (key: string, defaultValue: string): string => {
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const safeSetLocalStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // Ignore iframe sandbox exceptions
  }
};

interface WaveProps {
  color?: string;
  count?: number;
}

const SoundWave: React.FC<WaveProps> = ({ color = 'bg-orange-500', count = 5 }) => {
  const bars = Array.from({ length: count });
  return (
    <div className="flex items-center gap-0.5 h-5 justify-center shrink-0">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${color}`}
          animate={{
            height: [4, 18, 4],
          }}
          transition={{
            duration: 0.5 + Math.random() * 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};

export const AiMentor: React.FC<Props> = ({ selectedLanguage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = safeGetLocalStorage('ai_mentor_chat_history', '[]');
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice states
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  // Voice modulation state
  const [voiceRate, setVoiceRate] = useState(() => {
    return parseFloat(safeGetLocalStorage('ai_mentor_voice_rate', '1.0'));
  });
  const [voicePitch, setVoicePitch] = useState(() => {
    return parseFloat(safeGetLocalStorage('ai_mentor_voice_pitch', '1.0'));
  });
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(() => {
    const val = safeGetLocalStorage('ai_mentor_voice_uri', '');
    return val || null;
  });
  const [autoSubmitVoice, setAutoSubmitVoice] = useState(() => {
    return safeGetLocalStorage('ai_mentor_auto_submit_voice', 'false') === 'true';
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isInitialMount = useRef(true);

  const isSpeechRecognitionSupported = typeof window !== 'undefined' && 
    (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition);
  const isSpeechSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Persist Voice Settings safely
  useEffect(() => {
    safeSetLocalStorage('ai_mentor_voice_rate', voiceRate.toString());
  }, [voiceRate]);

  useEffect(() => {
    safeSetLocalStorage('ai_mentor_voice_pitch', voicePitch.toString());
  }, [voicePitch]);

  useEffect(() => {
    if (selectedVoiceURI) {
      safeSetLocalStorage('ai_mentor_voice_uri', selectedVoiceURI);
    }
  }, [selectedVoiceURI]);

  useEffect(() => {
    safeSetLocalStorage('ai_mentor_auto_submit_voice', autoSubmitVoice.toString());
  }, [autoSubmitVoice]);

  // Persist Chat History
  useEffect(() => {
    safeSetLocalStorage('ai_mentor_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Load and filter available voices based on selected language
  useEffect(() => {
    if (!isSpeechSynthesisSupported) return;

    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const resolvedLocale = getSpeechLocale(selectedLanguage.code);
      const locale = resolvedLocale.toLowerCase().replace('_', '-');
      const langPrefix = resolvedLocale.split('-')[0].toLowerCase();
      
      let filtered = allVoices.filter(v => {
        const voiceLang = v.lang.toLowerCase().replace('_', '-');
        return voiceLang.startsWith(langPrefix) || voiceLang === locale;
      });

      // If no voices match the selected language, fall back to all available voices on the system
      if (filtered.length === 0) {
        filtered = allVoices;
      }

      setAvailableVoices(filtered);
      
      // Auto select first voice if URI is empty or not in filtered voices
      if (filtered.length > 0) {
        setSelectedVoiceURI(prev => {
          if (prev && filtered.some(v => v.voiceURI === prev)) return prev;
          return filtered[0].voiceURI;
        });
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedLanguage, isSpeechSynthesisSupported]);

  // Expose toggle to window for dashboard button
  useEffect(() => {
    (window as any).toggleAiMentor = () => setIsOpen(prev => !prev);
    return () => { delete (window as any).toggleAiMentor; };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Handle auto-speak on new model response
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (messages.length > 0 && isTtsEnabled) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'model') {
        speakText(lastMessage.parts[0].text, messages.length - 1);
      }
    }
  }, [messages]);

  const primeSpeech = () => {
    if (!isSpeechSynthesisSupported) return;
    try {
      const utterance = new SpeechSynthesisUtterance(' ');
      utterance.volume = 0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Failed to prime speech synthesis:", e);
    }
  };

  const speakText = (text: string, index: number) => {
    if (!isSpeechSynthesisSupported) return;

    try {
      if (speakingMessageIndex === index) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {
          // ignore
        }
        setSpeakingMessageIndex(null);
        return;
      }

      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }

      // Remove markdown symbols for speech synthesis
      const plainText = text
        .replace(/\*\*+/g, '')
        .replace(/\*+/g, '')
        .replace(/#+/g, '')
        .replace(/`+/g, '')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .trim();

      const utterance = new SpeechSynthesisUtterance(plainText);
      const locale = getSpeechLocale(selectedLanguage.code);
      utterance.rate = voiceRate;
      utterance.pitch = voicePitch;

      const voices = window.speechSynthesis.getVoices();
      let voice = null;
      if (selectedVoiceURI) {
        voice = voices.find(v => v.voiceURI === selectedVoiceURI);
      }
      if (!voice) {
        voice = voices.find(v => v.lang.toLowerCase().replace('_', '-') === locale.toLowerCase());
      }
      
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang; // Match voice language to prevent playback errors
      } else {
        utterance.lang = locale;
      }

      utterance.onstart = () => setSpeakingMessageIndex(index);
      utterance.onend = () => setSpeakingMessageIndex(null);
      utterance.onerror = () => setSpeakingMessageIndex(null);

      // Add a small delay for iOS Safari stability
      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.error("SpeechSynthesis speak call error:", e);
          setSpeakingMessageIndex(null);
        }
      }, 50);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setSpeakingMessageIndex(null);
    }
  };

  const startListening = () => {
    if (!isSpeechRecognitionSupported) return;

    try {
      // Prime speech synthesis on user click gesture so we can speak responses later
      primeSpeech();

      // Stop speaking if currently speaking
      if (isSpeechSynthesisSupported) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {
          // ignore
        }
        setSpeakingMessageIndex(null);
      }

      if (isListening) {
        try {
          recognitionRef.current?.stop();
        } catch (e) {
          // ignore
        }
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getSpeechLocale(selectedLanguage.code);

      let finalTranscript = '';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Speak to answer auto-submit trigger
        if (autoSubmitVoice && finalTranscript.trim()) {
          handleSend(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        finalTranscript = transcript;
        setInput(prev => (prev ? prev + ' ' : '') + transcript);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
    }
  };

  const handleClose = () => {
    if (isSpeechSynthesisSupported) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageIndex(null);
    setIsOpen(false);
  };

  const handleSend = async (customInput?: string) => {
    const textToSend = (customInput || input).trim();
    if (!textToSend || isLoading) return;
    
    // Prime speech synthesis on user click gesture so we can speak responses later
    primeSpeech();

    // Stop any ongoing speech when user submits a message
    if (isSpeechSynthesisSupported) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
      setSpeakingMessageIndex(null);
    }
    
    setInput('');
    setIsLoading(true);

    if (!navigator.onLine) {
      const errorMsg: Message = { 
        role: 'model', 
        parts: [{ text: "I'm sorry, I need an internet connection to think. Please save your question for when you're back online!" }] 
      };
      setMessages(prev => [...prev, { role: 'user', parts: [{ text: textToSend }] }, errorMsg]);
      setIsLoading(false);
      return;
    }

    const userMessage: Message = { role: 'user', parts: [{ text: textToSend }] };
    setMessages(prev => [...prev, userMessage]);

    try {
      const profile = await getUserProfile();
      const progress = await getProgress();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages,
          language: selectedLanguage.nativeName,
          userProfile: profile,
          userProgress: progress
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        const modelMessage: Message = { role: 'model', parts: [{ text: data.error || "I'm having a little trouble connecting. Please try again in a moment." }] };
        setMessages(prev => [...prev, modelMessage]);
        return;
      }
      const modelMessage: Message = { role: 'model', parts: [{ text: data.response }] };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const modelMessage: Message = { 
        role: 'model', 
        parts: [{ text: "I'm having a little trouble connecting. Please check your internet connection and try again." }] 
      };
      setMessages(prev => [...prev, modelMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => {
            primeSpeech();
            setIsOpen(true);
          }}
          className="fixed bottom-8 right-8 w-16 h-16 bg-orange-500 text-white rounded-[24px] shadow-xl flex items-center justify-center z-40 hover:scale-110 active:scale-95 transition-transform border-b-4 border-r-4 border-orange-700"
        >
          <MessageSquare size={32} />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed bottom-0 right-0 w-full md:bottom-8 md:right-8 md:w-[420px] md:h-[650px] h-[85vh] bg-white md:rounded-[40px] rounded-t-[40px] shadow-2xl z-50 flex flex-col overflow-hidden border-b-8 border-r-8 border-orange-200"
          >
            {/* Header */}
            <div className="bg-orange-500 p-8 text-white flex items-center justify-between border-b-4 border-orange-600">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 relative">
                  <Bot size={28} />
                  {speakingMessageIndex !== null && (
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-black text-2xl tracking-tight flex items-center gap-2">
                    AI Mentor
                    {speakingMessageIndex !== null && (
                      <span className="inline-flex items-center h-4 ml-1">
                        <SoundWave color="bg-white" count={4} />
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-orange-100 font-bold uppercase tracking-wider">Online in {selectedLanguage.nativeName}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isSpeechSynthesisSupported && (
                  <button 
                    onClick={() => {
                      const nextVal = !isTtsEnabled;
                      setIsTtsEnabled(nextVal);
                      if (!nextVal) {
                        window.speechSynthesis.cancel();
                        setSpeakingMessageIndex(null);
                      }
                    }}
                    className="p-3 hover:bg-white/10 rounded-2xl transition-colors cursor-pointer"
                    title={isTtsEnabled ? "Mute responses" : "Unmute responses"}
                  >
                    {isTtsEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                  </button>
                )}
                {/* Voice Settings Button */}
                <button
                  onClick={() => setShowVoiceSettings(prev => !prev)}
                  className={`p-3 rounded-2xl transition-colors cursor-pointer ${showVoiceSettings ? 'bg-white/20' : 'hover:bg-white/10'}`}
                  title="Voice Settings"
                >
                  <Settings size={24} />
                </button>
                <button 
                  onClick={handleClose}
                  className="p-3 hover:bg-white/10 rounded-2xl transition-colors cursor-pointer"
                >
                  <X size={28} />
                </button>
              </div>
            </div>

            {/* Voice Settings Panel */}
            <AnimatePresence>
              {showVoiceSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-orange-50/95 border-b-2 border-orange-100 p-6 overflow-hidden space-y-4 shrink-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-orange-950 text-base">Voice Modulation Settings</span>
                    <button 
                      onClick={() => setShowVoiceSettings(false)}
                      className="text-orange-900/60 hover:text-orange-900 cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Pitch Selector */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-orange-900 uppercase tracking-wider">Voice Pitch</label>
                      <select
                        value={voicePitch}
                        onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                        className="w-full bg-white border-2 border-orange-200 rounded-xl p-2.5 text-sm font-bold text-orange-950 focus:outline-none focus:border-orange-500 transition-colors"
                      >
                        <option value="0.6">Deep Accent</option>
                        <option value="0.8">Low Pitch</option>
                        <option value="1.0">Normal / Medium</option>
                        <option value="1.25">High Accent</option>
                        <option value="1.5">Squeaky Pitch</option>
                      </select>
                    </div>

                    {/* Rate/Speed Selector */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-orange-900 uppercase tracking-wider">Speaking Speed</label>
                      <select
                        value={voiceRate}
                        onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                        className="w-full bg-white border-2 border-orange-200 rounded-xl p-2.5 text-sm font-bold text-orange-950 focus:outline-none focus:border-orange-500 transition-colors"
                      >
                        <option value="0.75">Slow Speed</option>
                        <option value="1.0">Normal Speed</option>
                        <option value="1.25">Fast Speed</option>
                        <option value="1.5">Very Fast Speed</option>
                      </select>
                    </div>
                  </div>

                  {/* Accent Voice Selector */}
                  {availableVoices.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-orange-900 uppercase tracking-wider">Voice Tone Accent</label>
                      <select
                        value={selectedVoiceURI || ''}
                        onChange={(e) => setSelectedVoiceURI(e.target.value)}
                        className="w-full bg-white border-2 border-orange-200 rounded-xl p-2.5 text-sm font-bold text-orange-950 focus:outline-none focus:border-orange-500 transition-colors"
                      >
                        {availableVoices.map((v) => (
                          <option key={v.voiceURI} value={v.voiceURI}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Auto-Submit / Speak to Answer Toggle */}
                  <div className="flex items-center justify-between p-4 bg-white border-2 border-orange-100 rounded-2xl shadow-sm">
                    <div>
                      <span className="text-sm font-black text-orange-950">Speak to Answer</span>
                      <p className="text-[10px] text-orange-900/60 font-bold">Auto-send when you stop speaking</p>
                    </div>
                    <button
                      onClick={() => setAutoSubmitVoice(prev => !prev)}
                      className={`w-12 h-6 rounded-full transition-colors cursor-pointer flex items-center p-0.5 ${autoSubmitVoice ? 'bg-orange-500 justify-end' : 'bg-gray-300 justify-start'}`}
                    >
                      <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-md" />
                    </button>
                  </div>

                  {/* Clear Chat History Button */}
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to clear your chat history?")) {
                        setMessages([]);
                        if (isSpeechSynthesisSupported) {
                          try {
                            window.speechSynthesis.cancel();
                          } catch (e) {
                            // ignore
                          }
                        }
                        setSpeakingMessageIndex(null);
                      }
                    }}
                    className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-2xl border-2 border-red-200 transition-colors text-sm shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>🗑️</span> Clear Chat History
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto space-y-6 bg-orange-50/20">
              {messages.length === 0 && (
                <div className="text-center py-12 px-8">
                  <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
                    <MessageSquare size={40} />
                  </div>
                  <h4 className="text-2xl font-black text-orange-950 mb-2">नमस्ते!</h4>
                  <p className="text-orange-900/60 font-bold text-base leading-relaxed">
                    I am your personal skill mentor. Ask me anything about farming, finance, or health!
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-center gap-2`}>
                  <div className={`max-w-[78%] p-5 rounded-[24px] ${
                    msg.role === 'user' 
                      ? 'bg-orange-500 text-white rounded-tr-none shadow-md font-bold' 
                      : 'bg-white text-orange-950 shadow-sm rounded-tl-none border-2 border-orange-100 font-bold'
                  }`}>
                    {msg.parts[0].text}
                  </div>
                  {msg.role === 'model' && isSpeechSynthesisSupported && (
                    <button
                      onClick={() => speakText(msg.parts[0].text, i)}
                      className={`p-3 rounded-xl border-2 transition-all shrink-0 cursor-pointer flex items-center justify-center min-w-[42px] min-h-[42px] ${
                        speakingMessageIndex === i 
                          ? 'bg-orange-500 border-orange-500 text-white scale-110 shadow-md' 
                          : 'bg-white border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300'
                      }`}
                      title={speakingMessageIndex === i ? "Stop playing" : "Read aloud"}
                    >
                      {speakingMessageIndex === i ? (
                        <SoundWave color="bg-white" count={3} />
                      ) : (
                        <Volume2 size={18} />
                      )}
                    </button>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-5 rounded-[24px] rounded-tl-none border-2 border-orange-100 flex items-center gap-3 text-orange-900/40 font-bold shadow-sm">
                    <Loader2 size={20} className="animate-spin text-orange-500" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Listening Soundwave indicator */}
            {isListening && (
              <div className="bg-red-50 border-t-2 border-red-100 py-3 px-6 flex items-center justify-between text-red-600 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                  <span className="text-xs font-black uppercase tracking-wider">Listening to you...</span>
                </div>
                <SoundWave color="bg-red-500" count={6} />
                <span className="text-[10px] text-red-500/70 font-black uppercase tracking-wide">
                  Auto-submit: {autoSubmitVoice ? "ON" : "OFF"}
                </span>
              </div>
            )}

            {/* Input */}
            <div className="p-6 bg-white border-t-2 border-orange-50 shrink-0">
              <div className="relative flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question..."
                  className="w-full bg-orange-50/50 border-2 border-orange-100 rounded-[24px] py-4 pl-6 pr-28 focus:outline-none focus:border-orange-500 focus:ring-0 transition-all font-bold text-orange-950 placeholder:text-orange-900/30"
                />
                <div className="absolute right-2 flex items-center gap-2">
                  {isSpeechRecognitionSupported && (
                    <button
                      onClick={startListening}
                      className={`p-3 rounded-[20px] transition-all cursor-pointer ${
                        isListening 
                          ? 'bg-red-500 text-white animate-pulse shadow-md scale-110' 
                          : 'bg-orange-100 text-orange-600 hover:bg-orange-200 hover:scale-105 active:scale-95'
                      }`}
                      title={isListening ? "Listening... click to stop" : "Speak to type"}
                    >
                      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                  )}
                  <button
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    className="p-3 bg-orange-500 text-white rounded-[20px] shadow-lg disabled:opacity-50 hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
