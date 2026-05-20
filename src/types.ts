
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳" },
  { code: "brx", name: "Bodo", nativeName: "बर'", flag: "🇮🇳" },
  { code: "doi", name: "Dogri", nativeName: "डोगरी", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ks", name: "Kashmiri", nativeName: "कॉशुर", flag: "🇮🇳" },
  { code: "gom", name: "Konkani", nativeName: "कोंकणी", flag: "🇮🇳" },
  { code: "mai", name: "Maithili", nativeName: "मैथिली", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
  { code: "mni", name: "Manipuri", nativeName: "মৈতৈলোন", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली", flag: "🇮🇳" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्", flag: "🇮🇳" },
  { code: "sat", name: "Santali", nativeName: "संताली", flag: "🇮🇳" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇮🇳" },
  { code: "en", name: "English", nativeName: "English", flag: "🌐" },
];

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface SkillCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
}

export interface OfflineCourse {
  id: string;
  topic: string;
  languageCode: string;
  content: string;
  downloadedAt: number;
}

export interface UserProgress {
  completedIds: string[];
  lastSyncedAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: string;
  bio?: string;
  interests: string[];
  avatar?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: number;
  lastActiveAt: number;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  dailyReminder: boolean;
  streakAlerts: boolean;
  achievementAlerts: boolean;
  communityUpdates: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  language: string;
  notifications: NotificationSettings;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  dailyReminder: true,
  streakAlerts: true,
  achievementAlerts: true,
  communityUpdates: false,
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  fontSize: 'medium',
  highContrast: false,
  language: 'en',
  notifications: DEFAULT_NOTIFICATION_SETTINGS,
};

export const CATEGORIES: SkillCategory[] = [
  {
    id: "farming",
    title: "Modern Farming",
    icon: "Sprout",
    color: "bg-emerald-100 text-emerald-900 border-emerald-200",
    description: "Learn about natural fertilizers, crop cycles, and water saving.",
  },
  {
    id: "finance",
    title: "Basic Finance",
    icon: "Wallet",
    color: "bg-amber-100 text-amber-900 border-amber-200",
    description: "Understanding bank accounts, savings, and government schemes.",
  },
  {
    id: "health",
    title: "Health & Hygiene",
    icon: "HeartPulse",
    color: "bg-rose-100 text-rose-900 border-rose-200",
    description: "Hand washing, clean drinking water, and child nutrition.",
  },
  {
    id: "digital",
    title: "Mobile Skills",
    icon: "Smartphone",
    color: "bg-blue-100 text-blue-900 border-blue-200",
    description: "How to use WhatsApp, payments, and online forms safely.",
  },
  {
    id: "handicrafts",
    title: "Handicrafts",
    icon: "Palette",
    color: "bg-purple-100 text-purple-900 border-purple-200",
    description: "Making and selling items in local markets or online.",
  },
];
