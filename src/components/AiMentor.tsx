import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Bot, User, Loader2, MessageSquare } from 'lucide-react';
import { Language } from '../types';
import { getUserProfile, getProgress } from '../services/storage';

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

interface Props {
  selectedLanguage: Language;
}

export const AiMentor: React.FC<Props> = ({ selectedLanguage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    if (!navigator.onLine) {
      const errorMsg: Message = { 
        role: 'model', 
        parts: [{ text: "I'm sorry, I need an internet connection to think. Please save your question for when you're back online!" }] 
      };
      setMessages(prev => [...prev, { role: 'user', parts: [{ text: input }] }, errorMsg]);
      setInput('');
      return;
    }

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const profile = await getUserProfile();
      const progress = await getProgress();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
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
          onClick={() => setIsOpen(true)}
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
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                  <Bot size={28} />
                </div>
                <div>
                  <h3 className="font-black text-2xl tracking-tight">AI Mentor</h3>
                  <p className="text-xs text-orange-100 font-bold uppercase tracking-wider">Online in {selectedLanguage.nativeName}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-3 hover:bg-white/10 rounded-2xl transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto space-y-6 bg-orange-50/20">
              {messages.length === 0 && (
                <div className="text-center py-12 px-8">
                  <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <MessageSquare size={40} />
                  </div>
                  <h4 className="text-2xl font-black text-orange-950 mb-2">नमस्ते!</h4>
                  <p className="text-orange-900/60 font-bold">
                    I am your personal skill mentor. Ask me anything about farming, finance, or health!
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-[24px] ${
                    msg.role === 'user' 
                      ? 'bg-orange-500 text-white rounded-tr-none shadow-md' 
                      : 'bg-white text-orange-950 shadow-sm rounded-tl-none border-2 border-orange-100 font-medium'
                  }`}>
                    {msg.parts[0].text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-5 rounded-[24px] rounded-tl-none border-2 border-orange-100 flex items-center gap-3 text-orange-900/40 font-bold">
                    <Loader2 size={20} className="animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t-2 border-orange-50">
              <div className="relative flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question..."
                  className="w-full bg-orange-50/50 border-2 border-orange-100 rounded-[24px] py-4 pl-6 pr-16 focus:outline-none focus:border-orange-500 focus:ring-0 transition-all font-bold text-orange-950 placeholder:text-orange-900/30"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 p-3 bg-orange-500 text-white rounded-[20px] shadow-lg disabled:opacity-50 hover:bg-orange-600 transition-colors"
                >
                  <Send size={24} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
