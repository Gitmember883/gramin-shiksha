import { get, set, del, keys } from 'idb-keyval';
import { OfflineCourse, UserProgress, UserProfile, UserPreferences, NotificationSettings, DEFAULT_USER_PREFERENCES, DEFAULT_NOTIFICATION_SETTINGS } from '../types';

export type { UserProfile, UserPreferences, NotificationSettings };
export { DEFAULT_USER_PREFERENCES, DEFAULT_NOTIFICATION_SETTINGS };

const DOWNLOADS_KEY_PREFIX = 'course_';
const PROGRESS_KEY = 'user_progress';
const PROFILE_KEY = 'user_profile';
const PREFERENCES_KEY = 'user_preferences';
const BACKUP_KEY = 'app_backup';
const REFERRAL_KEY = 'referral_data';

export const saveCourseOffline = async (course: OfflineCourse) => {
  await set(`${DOWNLOADS_KEY_PREFIX}${course.id}_${course.languageCode}`, course);
};

export const getOfflineCourse = async (id: string, langCode: string): Promise<OfflineCourse | undefined> => {
  return await get(`${DOWNLOADS_KEY_PREFIX}${id}_${langCode}`);
};

export const getAllOfflineCourseIds = async (langCode: string): Promise<string[]> => {
  const allKeys = await keys();
  return allKeys
    .filter((k) => typeof k === 'string' && k.startsWith(DOWNLOADS_KEY_PREFIX) && k.endsWith(`_${langCode}`))
    .map((k) => (k as string).replace(DOWNLOADS_KEY_PREFIX, '').replace(`_${langCode}`, ''));
};

export const deleteOfflineCourse = async (id: string, langCode: string) => {
  await del(`${DOWNLOADS_KEY_PREFIX}${id}_${langCode}`);
};

export const getProgress = async (): Promise<UserProgress> => {
  const progress = await get(PROGRESS_KEY);
  return progress || { completedIds: [], lastSyncedAt: Date.now() };
};

export const saveProgress = async (progress: UserProgress) => {
  await set(PROGRESS_KEY, progress);
};

export const markAsCompleted = async (id: string) => {
  const progress = await getProgress();
  if (!progress.completedIds.includes(id)) {
    progress.completedIds.push(id);
    progress.lastSyncedAt = Date.now();
    await saveProgress(progress);
  }
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  return await get(PROFILE_KEY);
};

export const saveUserProfile = async (profile: UserProfile) => {
  await set(PROFILE_KEY, profile);
};

export const createUserProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  const profile: UserProfile = {
    id: data.id || `user_${Date.now()}`,
    name: data.name || 'Guest User',
    email: data.email || '',
    phone: data.phone || '',
    age: data.age,
    gender: data.gender || '',
    bio: data.bio || '',
    interests: data.interests || [],
    avatar: data.avatar || '',
    emailVerified: false,
    phoneVerified: false,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  };
  await saveUserProfile(profile);
  return profile;
};

export const getUserPreferences = async (): Promise<UserPreferences> => {
  const prefs = await get(PREFERENCES_KEY);
  return prefs || DEFAULT_USER_PREFERENCES;
};

export const applyPreferences = (prefs: UserPreferences) => {
  if (typeof window === 'undefined') return;

  // 1. Theme
  const isDark = prefs.theme === 'dark' || 
    (prefs.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);

  // 2. Font Size
  if (prefs.fontSize === 'small') {
    document.documentElement.style.fontSize = '14px';
  } else if (prefs.fontSize === 'large') {
    document.documentElement.style.fontSize = '20px';
  } else {
    document.documentElement.style.fontSize = '16px';
  }

  // 3. High Contrast
  document.documentElement.classList.toggle('high-contrast', prefs.highContrast);
};

export const saveUserPreferences = async (prefs: UserPreferences) => {
  await set(PREFERENCES_KEY, prefs);
  applyPreferences(prefs);
};

export const exportUserData = async (): Promise<string> => {
  const profile = await getUserProfile();
  const progress = await getProgress();
  const preferences = await getUserPreferences();
  const allKeys = await keys();
  const offlineCourses: OfflineCourse[] = [];
  
  for (const key of allKeys) {
    if (typeof key === 'string' && key.startsWith(DOWNLOADS_KEY_PREFIX)) {
      const course = await get<OfflineCourse>(key);
      if (course) offlineCourses.push(course);
    }
  }

  const exportData = {
    profile,
    progress,
    preferences,
    offlineCourses,
    exportDate: new Date().toISOString(),
  };
  
  return JSON.stringify(exportData, null, 2);
};

export const importUserData = async (jsonData: string): Promise<boolean> => {
  try {
    const data = JSON.parse(jsonData);
    if (data.profile) await saveUserProfile(data.profile);
    if (data.progress) await saveProgress(data.progress);
    if (data.preferences) await saveUserPreferences(data.preferences);
    if (data.offlineCourses) {
      for (const course of data.offlineCourses) {
        await saveCourseOffline(course);
      }
    }
    return true;
  } catch {
    return false;
  }
};

export const createBackup = async () => {
  const backup = await exportUserData();
  await set(BACKUP_KEY, { data: backup, timestamp: Date.now() });
};

export const restoreFromBackup = async (): Promise<boolean> => {
  const backup = await get<{ data: string; timestamp: number }>(BACKUP_KEY);
  if (backup) {
    return importUserData(backup.data);
  }
  return false;
};

export const getReferralCode = async (): Promise<string | null> => {
  const data = await get<{ code: string; used: boolean }>(REFERRAL_KEY);
  return data?.code || null;
};

export const generateReferralCode = async (): Promise<string> => {
  const code = `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  await set(REFERRAL_KEY, { code, used: false });
  return code;
};
