import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { getProgress, getUserProfile, getUserPreferences } from '../services/storage';
import { Language } from '../types';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress?: number;
  total?: number;
}

interface Props {
  selectedLanguage: Language | null;
}

export const AchievementBadges: React.FC<Props> = ({ selectedLanguage }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const progress = await getProgress();
    const profile = await getUserProfile();

    const earned = progress.completedIds.length;
    const allAchievements: Achievement[] = [
      {
        id: 'first_steps',
        title: 'First Steps',
        description: 'Started your learning journey',
        icon: 'Sprout',
        unlockedAt: earned > 0 ? Date.now() - 86400000 : undefined,
      },
      {
        id: 'five_courses',
        title: 'Quick Learner',
        description: 'Completed 5 courses',
        icon: 'Zap',
        unlockedAt: earned >= 5 ? Date.now() - 43200000 : undefined,
        progress: Math.min(earned, 5),
        total: 5,
      },
      {
        id: 'all_categories',
        title: 'Explorer',
        description: 'Learned in all categories',
        icon: 'Compass',
        unlockedAt: earned >= 5 ? Date.now() - 3600000 : undefined,
      },
      {
        id: 'streak_3',
        title: 'Consistent',
        description: '3 day learning streak',
        icon: 'Flame',
        unlockedAt: streak >= 3 ? Date.now() : undefined,
      },
    ];

    setAchievements(allAchievements);
    calculateStreak();
  };

  const calculateStreak = () => {
    const lastActive = localStorage.getItem('last_active_date');
    const today = new Date().toISOString().split('T')[0];
    
    if (lastActive) {
      const dates = JSON.parse(localStorage.getItem('active_dates') || '[]');
      let currentStreak = 0;
      const dateSet = new Set(dates);
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        if (dateSet.has(dateStr)) {
          currentStreak++;
        } else {
          break;
        }
      }
      setStreak(currentStreak);
    }
  };

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;

  return (
    <div className="bg-white rounded-3xl p-6 border-2 border-orange-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-black text-orange-900">Achievements</h3>
        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-bold text-sm">
          {unlockedCount}/{achievements.length}
        </span>
      </div>

      <div className="mb-4 p-4 bg-orange-50 rounded-2xl">
        <div className="flex items-center gap-3">
          <Icons.Flame className="text-orange-500" size={24} />
          <div>
            <p className="font-bold text-orange-900">{streak} Day Streak</p>
            <p className="text-xs text-orange-600">Keep learning daily!</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {achievements.map((achievement) => {
          const Icon = (Icons as any)[achievement.icon];
          const unlocked = !!achievement.unlockedAt;
          
          return (
            <motion.div
              key={achievement.id}
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-2xl text-center border-2 ${
                unlocked ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200 opacity-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                unlocked ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                <Icon size={24} />
              </div>
              <h4 className={`font-bold text-xs mb-1 ${unlocked ? 'text-orange-900' : 'text-gray-500'}`}>
                {achievement.title}
              </h4>
              {achievement.progress !== undefined && achievement.total && (
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-orange-500 h-1.5 rounded-full"
                    style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};