import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { UserProfile, UserPreferences, NotificationSettings, getUserProfile, saveUserProfile, createUserProfile, getUserPreferences, saveUserPreferences, createBackup, DEFAULT_USER_PREFERENCES } from '../services/storage';
import { Language } from '../types';

interface Props {
  selectedLanguage: Language | null;
  onClose: () => void;
}

export const ProfileSettings: React.FC<Props> = ({ selectedLanguage, onClose }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'privacy' | 'backup'>('profile');

  // Interactive UI states
  const [verifyingField, setVerifyingField] = useState<'email' | 'phone' | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success'>('idle');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    let userProfile = await getUserProfile();
    if (!userProfile) {
      userProfile = await createUserProfile({
        name: 'Guest User',
        email: '',
        phone: '',
        age: 25,
        bio: 'Learning new skills to empower my community.',
      });
    }
    const userPrefs = await getUserPreferences();
    setProfile(userProfile);
    setPreferences(userPrefs);
  };

  const handleSaveProfile = async () => {
    if (profile) {
      setSaveStatus('saving');
      await saveUserProfile({ ...profile, lastActiveAt: Date.now() });
      setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => {
          setSaveStatus('idle');
        }, 1500);
      }, 1000);
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    const updatedPrefs = {
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [key]: !preferences.notifications[key],
      },
    };
    setPreferences(updatedPrefs);
    saveUserPreferences(updatedPrefs);
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    const updatedPrefs = { ...preferences, theme };
    setPreferences(updatedPrefs);
    saveUserPreferences(updatedPrefs);
  };

  const startVerification = (field: 'email' | 'phone') => {
    setVerifyingField(field);
    setOtpSent(false);
    setOtpCode('');
    setOtpLoading(true);
    
    // Simulate sending OTP SMS/Email
    setTimeout(() => {
      setOtpLoading(false);
      setOtpSent(true);
    }, 1200);
  };

  const handleVerifyOtp = () => {
    if (otpCode.length === 4) {
      setOtpLoading(true);
      setTimeout(() => {
        setOtpLoading(false);
        setVerifyStatus('success');
        if (profile) {
          const updatedProfile = {
            ...profile,
            [verifyingField === 'email' ? 'emailVerified' : 'phoneVerified']: true
          };
          setProfile(updatedProfile);
          saveUserProfile(updatedProfile);
        }
        setTimeout(() => {
          setVerifyingField(null);
          setVerifyStatus('idle');
        }, 1500);
      }, 1000);
    }
  };

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
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* OTP Verification Popup */}
        {verifyingField && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full border-4 border-orange-100 shadow-xl text-center">
              <h3 className="text-xl font-black text-orange-900 mb-2">
                Verify {verifyingField === 'email' ? 'Email Address' : 'Phone Number'}
              </h3>
              <p className="text-sm text-orange-705 mb-6 leading-relaxed">
                {otpLoading 
                  ? (otpSent ? 'Confirming code...' : 'Sending secure verification code...')
                  : `We sent a 4-digit code to your ${verifyingField === 'email' ? 'email' : 'phone'}.`}
              </p>

              {otpLoading ? (
                <div className="flex justify-center my-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
                </div>
              ) : verifyStatus === 'success' ? (
                <div className="text-green-600 font-bold my-6 text-lg flex flex-col items-center gap-2">
                  <span className="text-4xl">✅</span> Verified Successfully!
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 4-digit code"
                    className="w-full text-center text-2xl tracking-widest p-3 border-2 border-orange-200 rounded-xl font-bold mb-4 focus:border-orange-500 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setVerifyingField(null)}
                      className="flex-1 py-3 bg-orange-100 text-orange-850 rounded-xl font-bold hover:bg-orange-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={otpCode.length !== 4}
                      className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-orange-600"
                    >
                      Verify
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-6 border-b-2 border-orange-100">
          <h2 className="text-2xl font-black text-orange-900">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-orange-100 rounded-xl">
            <Icons.X size={24} />
          </button>
        </div>

        <div className="flex border-b-2 border-orange-100">
          {[
            { id: 'profile', label: 'Profile', icon: Icons.User },
            { id: 'preferences', label: 'Preferences', icon: Icons.Settings },
            { id: 'privacy', label: 'Privacy', icon: Icons.Shield },
            { id: 'backup', label: 'Backup', icon: Icons.Database },
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
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-orange-800 mb-2">Name</label>
                <input
                  type="text"
                  value={profile?.name || ''}
                  onChange={(e) => setProfile({ ...profile!, name: e.target.value })}
                  className="w-full p-3 border-2 border-orange-200 rounded-xl font-bold"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-orange-800 mb-2">Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={profile?.email || ''}
                    onChange={(e) => setProfile({ ...profile!, email: e.target.value })}
                    className="flex-1 p-3 border-2 border-orange-200 rounded-xl font-bold"
                  />
                  {profile?.emailVerified ? (
                    <span className="px-3 py-2 bg-green-100 text-green-800 rounded-xl font-bold text-xs flex items-center justify-center shrink-0">✓ Verified</span>
                  ) : (
                    <button 
                      onClick={() => startVerification('email')}
                      disabled={!profile?.email}
                      className="px-3 py-2 bg-orange-500 text-white rounded-xl font-bold text-xs disabled:opacity-50 hover:bg-orange-600 cursor-pointer shrink-0"
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-orange-800 mb-2">Phone</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={profile?.phone || ''}
                    onChange={(e) => setProfile({ ...profile!, phone: e.target.value })}
                    className="flex-1 p-3 border-2 border-orange-200 rounded-xl font-bold"
                    placeholder="+91 XXXXXXXXXX"
                  />
                  {profile?.phoneVerified ? (
                    <span className="px-3 py-2 bg-green-100 text-green-800 rounded-xl font-bold text-xs flex items-center justify-center shrink-0">✓ Verified</span>
                  ) : (
                    <button 
                      onClick={() => startVerification('phone')}
                      disabled={!profile?.phone}
                      className="px-3 py-2 bg-orange-500 text-white rounded-xl font-bold text-xs disabled:opacity-50 hover:bg-orange-600 cursor-pointer shrink-0"
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-orange-800 mb-2">Age</label>
                <input
                  type="number"
                  value={profile?.age || ''}
                  onChange={(e) => setProfile({ ...profile!, age: parseInt(e.target.value) || undefined })}
                  className="w-full p-3 border-2 border-orange-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-orange-800 mb-2">Bio</label>
                <textarea
                  value={profile?.bio || ''}
                  onChange={(e) => setProfile({ ...profile!, bio: e.target.value })}
                  className="w-full p-3 border-2 border-orange-200 rounded-xl font-bold"
                  rows={3}
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saveStatus !== 'idle'}
                className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {saveStatus === 'saving' && (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                )}
                {saveStatus === 'saved' && "✅ Profile Saved!"}
                {saveStatus === 'idle' && "Save Profile"}
              </button>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-orange-800 mb-3">Theme</label>
                <div className="flex gap-2">
                  {(['light', 'dark', 'system'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => handleThemeChange(theme)}
                      className={`flex-1 py-3 rounded-xl font-bold ${
                        preferences.theme === theme
                          ? 'bg-orange-500 text-white'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-orange-800 mb-2">Font Size</label>
                <select
                  value={preferences.fontSize}
                  onChange={(e) => {
                    const updated = { ...preferences, fontSize: e.target.value as any };
                    setPreferences(updated);
                    saveUserPreferences(updated);
                  }}
                  className="w-full p-3 border-2 border-orange-200 rounded-xl font-bold"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                <span className="font-bold text-orange-800">High Contrast Mode</span>
                <button
                  onClick={() => {
                    const updated = { ...preferences, highContrast: !preferences.highContrast };
                    setPreferences(updated);
                    saveUserPreferences(updated);
                  }}
                  className={`w-12 h-6 rounded-full ${preferences.highContrast ? 'bg-orange-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${preferences.highContrast ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              {Object.entries(preferences.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                  <span className="font-bold text-orange-800 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <button
                    onClick={() => handleNotificationChange(key as keyof NotificationSettings)}
                    className={`w-12 h-6 rounded-full ${value ? 'bg-orange-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${value ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <button
                onClick={createBackup}
                className="w-full p-4 bg-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Icons.Download size={20} />
                Create Backup
              </button>
              
              <div className="p-4 bg-orange-50 rounded-xl">
                <h4 className="font-bold text-orange-800 mb-2">Export Data</h4>
                <p className="text-sm text-orange-600 mb-3">Download all your data for backup or transfer</p>
                <button className="w-full p-2 bg-orange-200 text-orange-800 rounded-xl font-bold">
                  Export as JSON
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};