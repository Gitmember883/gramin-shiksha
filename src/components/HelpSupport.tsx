import React, { useState } from 'react';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { Language } from '../types';

interface Props {
  selectedLanguage: Language | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSupport: React.FC<Props> = ({ selectedLanguage, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'feedback'>('faq');
  const [feedback, setFeedback] = useState('');

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b-2 border-orange-100">
          <h2 className="text-2xl font-black text-orange-900">Help & Support</h2>
          <button onClick={onClose} className="p-2 hover:bg-orange-100 rounded-xl">
            <Icons.X size={24} />
          </button>
        </div>

        <div className="flex border-b-2 border-orange-100">
          {[
            { id: 'faq', label: 'FAQ', icon: Icons.HelpCircle },
            { id: 'contact', label: 'Contact', icon: Icons.Mail },
            { id: 'feedback', label: 'Feedback', icon: Icons.MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 p-4 font-bold transition-colors ${
                activeTab === tab.id
                  ? 'text-orange-600 border-b-4 border-orange-500'
                  : 'text-orange-800 hover:bg-orange-50'
              }`}
            >
              <tab.icon size={20} className="inline mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'faq' && (
            <div className="space-y-4">
              {[
                {
                  q: 'How do I download courses for offline learning?',
                  a: 'Open a course and click the "Save Offline" button. It will be available in your offline library.',
                },
                {
                  q: 'How do I change the app language?',
                  a: 'Click the language button in the top bar to switch between available languages.',
                },
                {
                  q: 'Is my data safe?',
                  a: 'All your data is stored locally on your device. Use the backup feature to export your progress.',
                },
                {
                  q: 'How do I report inappropriate content?',
                  a: 'Use the report feature in the course view or contact support through the Contact tab.',
                },
              ].map((faq, i) => (
                <details key={i} className="group">
                  <summary className="cursor-pointer font-bold text-orange-900 p-4 bg-orange-50 rounded-xl group-open:bg-orange-100">
                    {faq.q}
                  </summary>
                  <p className="p-4 text-orange-600">{faq.a}</p>
                </details>
              ))}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-xl">
                <h4 className="font-bold text-orange-900 mb-2">Contact Us</h4>
                <p className="text-sm text-orange-600 mb-3">
                  Email: support@digitalvidya.org
                </p>
                <p className="text-sm text-orange-600">
                  Available: Mon-Fri, 9AM-6PM IST
                </p>
              </div>

              <button className="w-full p-4 bg-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                <Icons.Mail size={20} />
                Send Email
              </button>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-orange-800 mb-2">
                  Your Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us how we can improve..."
                  className="w-full p-4 border-2 border-orange-200 rounded-xl font-bold"
                  rows={4}
                />
              </div>

              <button
                onClick={() => {
                  alert('Thank you for your feedback!');
                  setFeedback('');
                  onClose();
                }}
                disabled={!feedback.trim()}
                className="w-full p-4 bg-orange-500 text-white rounded-xl font-bold disabled:opacity-50"
              >
                Submit Feedback
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};