import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { getUserPreferences, saveUserPreferences, DEFAULT_NOTIFICATION_SETTINGS } from '../services/storage';
import { Language } from '../types';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'announcement' | 'achievement' | 'reminder' | 'community';
}

interface Props {
  selectedLanguage: Language | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPanel: React.FC<Props> = ({ selectedLanguage, isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    loadNotifications();
    checkPermission();
  }, []);

  const loadNotifications = () => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
    addSampleNotifications();
  };

  const addSampleNotifications = () => {
    const sample: Notification[] = [
      {
        id: '1',
        title: 'Welcome!',
        message: 'Start learning new skills today. Your daily streak awaits!',
        timestamp: Date.now() - 3600000,
        read: false,
        type: 'announcement',
      },
      {
        id: '2',
        title: 'New Course Available',
        message: 'Modern Farming techniques just got updated.',
        timestamp: Date.now() - 86400000,
        read: true,
        type: 'announcement',
      },
    ];
    setNotifications(sample);
    localStorage.setItem('notifications', JSON.stringify(sample));
  };

  const checkPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  const enableNotifications = async () => {
    let perm: NotificationPermission = 'default';
    if ('Notification' in window) {
      try {
        perm = await Notification.requestPermission();
      } catch (error) {
        console.warn("Failed to request native notification permission, falling back to mock permission:", error);
        perm = 'granted'; // Mock for sandbox / iframe preview
      }
    } else {
      perm = 'granted'; // Mock for unsupported browser
    }
    
    setPermission(perm);
    if (perm === 'granted') {
      try {
        const prefs = await getUserPreferences();
        await saveUserPreferences({
          ...prefs,
          notifications: { ...prefs.notifications, pushEnabled: true },
        });
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Digital Vidya Pro', {
            body: 'Notifications enabled! You\'ll receive learning reminders.',
            icon: '/logo.jpg',
          });
        }
      } catch (e) {
        console.log("Could not construct notification object:", e);
      }
    }
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 400 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b-2 border-orange-100">
          <h2 className="text-2xl font-black text-orange-900">Notifications</h2>
          <button onClick={onClose} className="p-2 hover:bg-orange-100 rounded-xl">
            <Icons.X size={24} />
          </button>
        </div>

        {permission !== 'granted' && (
          <div className="p-4 bg-orange-50 m-4 rounded-2xl">
            <p className="text-sm font-bold text-orange-800 mb-2">Enable Notifications</p>
            <p className="text-xs text-orange-600 mb-3">Get daily reminders and stay motivated</p>
            <button
              onClick={enableNotifications}
              className="w-full py-2 bg-orange-500 text-white rounded-xl font-bold text-sm"
            >
              Enable Push Notifications
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Icons.Bell size={48} className="text-orange-200 mx-auto mb-4" />
              <p className="text-orange-600 font-bold">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  whileHover={{ x: 5 }}
                  onClick={() => markAsRead(notification.id)}
                  className={`p-4 rounded-2xl cursor-pointer border-2 ${
                    notification.read ? 'bg-white border-orange-100' : 'bg-orange-50 border-orange-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      notification.type === 'announcement' ? 'bg-blue-100 text-blue-600' :
                      notification.type === 'achievement' ? 'bg-green-100 text-green-600' :
                      notification.type === 'reminder' ? 'bg-orange-100 text-orange-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {notification.type === 'announcement' && <Icons.Megaphone size={20} />}
                      {notification.type === 'achievement' && <Icons.Award size={20} />}
                      {notification.type === 'reminder' && <Icons.Clock size={20} />}
                      {notification.type === 'community' && <Icons.Users size={20} />}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold ${notification.read ? 'text-orange-800' : 'text-orange-900'}`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-orange-600">{notification.message}</p>
                      <p className="text-xs text-orange-400 mt-1">
                        {new Date(notification.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};