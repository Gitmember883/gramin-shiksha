import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { getUserPreferences, saveUserPreferences } from '../services/storage';

type FontSize = 'small' | 'medium' | 'large';

export const AccessibilitySettings: React.FC = () => {
  const [preferences, setPreferences] = useState({
    fontSize: 'medium' as FontSize,
    highContrast: false,
    reducedMotion: false,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const prefs = await getUserPreferences();
    setPreferences({
      fontSize: prefs.fontSize,
      highContrast: prefs.highContrast,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
  };

  const updatePrefs = async (key: string, value: string | boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated as typeof preferences);

    const existing = await getUserPreferences();
    await saveUserPreferences({ ...existing, ...updated });

    if (key === 'highContrast') {
      document.documentElement.classList.toggle('high-contrast', value as boolean);
    }
    if (key === 'fontSize') {
      document.documentElement.setAttribute('data-font-size', value as string);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-xl font-black text-orange-900">Accessibility Settings</h3>

      <div>
        <label className="block text-sm font-bold text-orange-800 mb-3">Font Size</label>
        <div className="flex gap-2">
          {(['small', 'medium', 'large'] as const).map((size) => (
            <button
              key={size}
              onClick={() => updatePrefs('fontSize', size)}
              className={`flex-1 py-3 rounded-xl font-bold ${
                preferences.fontSize === size
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-100 text-orange-800'
              }`}
            >
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
        <div>
          <span className="font-bold text-orange-800">High Contrast Mode</span>
          <p className="text-sm text-orange-600">Increases color contrast for better visibility</p>
        </div>
        <button
          onClick={() => updatePrefs('highContrast', !preferences.highContrast)}
          className={`w-12 h-6 rounded-full ${preferences.highContrast ? 'bg-orange-500' : 'bg-gray-300'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${preferences.highContrast ? 'translate-x-6' : ''}`} />
        </button>
      </div>

      <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
        <div>
          <span className="font-bold text-orange-800">Reduced Motion</span>
          <p className="text-sm text-orange-600">Minimizes animations for comfort</p>
        </div>
        <button
          onClick={() => updatePrefs('reducedMotion', !preferences.reducedMotion)}
          className={`w-12 h-6 rounded-full ${preferences.reducedMotion ? 'bg-orange-500' : 'bg-gray-300'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${preferences.reducedMotion ? 'translate-x-6' : ''}`} />
        </button>
      </div>

      <div className="p-4 bg-orange-50/50 rounded-xl">
        <h4 className="font-bold text-orange-800 mb-2">Screen Reader Support</h4>
        <p className="text-sm text-orange-600 mb-3">Content is optimized for screen readers</p>
        <div className="text-xs text-orange-500">
          Navigation shortcuts: Tab to move, Enter to select, Esc to close
        </div>
      </div>
    </div>
  );
};