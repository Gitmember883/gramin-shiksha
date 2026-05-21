import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Loader2, RefreshCcw, MessageCircle, Download, CheckCircle, Trash2, Video, PlayCircle, Clock, BookOpen, Award } from 'lucide-react';
import { SkillCategory, Language, Difficulty } from '../types';
import { getOfflineCourse, saveCourseOffline, deleteOfflineCourse, markAsCompleted } from '../services/storage';
import { getTranslatedContentPageLabels } from '../translations';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Props {
  category: SkillCategory;
  language: Language;
  difficulty: Difficulty;
  onBack: () => void;
}

const REASSURING_MESSAGES = [
  "Painting the frames...",
  "Our director is thinking...",
  "Adding educational elements...",
  "Finalizing the scene...",
  "Almost there! Quality takes a moment...",
  "The AI is carefully crafting your video..."
];

// Quiz questions for Modern Farming
const FARMING_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the main advantage of drip irrigation compared to traditional irrigation?",
    options: [
      "It requires more water",
      "It conserves up to 50% water by directing it straight to plant roots",
      "It is cheaper to install",
      "It works during rainy season only"
    ],
    correctAnswer: 1,
    explanation: "Drip irrigation is highly efficient because it delivers water directly to the roots, reducing water wastage and conserving up to 50% of water compared to traditional methods."
  },
  {
    id: 2,
    question: "Which fertilizer type is recommended for sustainable modern farming?",
    options: [
      "Only chemical fertilizers",
      "Natural organic fertilizers like compost and vermicompost",
      "No fertilizers at all",
      "Mixed chemical and animal waste"
    ],
    correctAnswer: 1,
    explanation: "Natural organic fertilizers like compost, vermicompost, and green manure are recommended because they keep soil healthy and improve long-term soil quality."
  },
  {
    id: 3,
    question: "What is the purpose of crop rotation in modern farming?",
    options: [
      "To make farming more interesting",
      "To use the same land multiple times per year",
      "To replenish nitrogen naturally by alternating different crop varieties",
      "To reduce the number of crops grown"
    ],
    correctAnswer: 2,
    explanation: "Crop rotation, such as following grains with legumes, naturally replenishes soil nitrogen and prevents soil depletion, maintaining soil health over time."
  },
  {
    id: 4,
    question: "How often should soil quality be tested in modern farming?",
    options: [
      "Once every 10 years",
      "Never, it's not necessary",
      "Regularly through nearby government agricultural offices",
      "Only when crops fail"
    ],
    correctAnswer: 2,
    explanation: "Regular soil testing through government agricultural offices helps farmers understand soil composition, nutrient levels, and make informed decisions about fertilizer use."
  },
  {
    id: 5,
    question: "What is a practical way to improve water management on a small farm?",
    options: [
      "Use more water",
      "Install rain-harvesting setups to secure water during low-rain cycles",
      "Depend only on government water",
      "Avoid using water for crops"
    ],
    correctAnswer: 1,
    explanation: "Rain-harvesting setups around fields provide a practical way for farmers to secure water for low-rain cycles, ensuring sustainable water management."
  }
];

// Quiz questions for Basic Finance (Beginner)
const FINANCE_BEGINNER_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the main benefit of keeping your savings in a bank account?",
    options: [
      "It keeps your money safe from theft and earns interest over time",
      "It makes it harder to access your money",
      "It gives you free shopping vouchers every month",
      "It does not have any benefit compared to keeping cash at home"
    ],
    correctAnswer: 0,
    explanation: "Banks keep your money secure from theft or damage, and they pay you interest, which helps your savings grow over time."
  },
  {
    id: 2,
    question: "What should you do if someone calls asking for your UPI PIN or OTP, claiming to be a bank official?",
    options: [
      "Share it immediately to prevent your account from being blocked",
      "Share it only if they know your correct name and date of birth",
      "Never share it with anyone, as banks will never ask for your PIN or OTP",
      "Ask them to call back after 10 minutes"
    ],
    correctAnswer: 2,
    explanation: "Your UPI PIN, OTP, and passwords are highly confidential. Banks and genuine officials will never ask for them. Sharing them can lead to money being stolen."
  },
  {
    id: 3,
    question: "What is the key feature of a Prime Minister Jan Dhan Yojana (PMJDY) account?",
    options: [
      "It requires a high minimum balance of Rs. 10,000",
      "It is a zero-balance savings account with benefits like accident insurance",
      "It can only be used for online shopping",
      "It is only for children below 10 years"
    ],
    correctAnswer: 1,
    explanation: "PMJDY accounts are zero-balance savings accounts designed to bring banking services to everyone, offering features like a Rupay debit card and free accident insurance."
  },
  {
    id: 4,
    question: "If you are a victim of a cyber fraud or digital payment scam in India, which helpline should you call?",
    options: [
      "100",
      "1930",
      "1098",
      "102"
    ],
    correctAnswer: 1,
    explanation: "1930 is the National Cyber Crime Helpline number in India. You should call it immediately to report financial fraud so the bank can try to freeze the transaction."
  },
  {
    id: 5,
    question: "What does 'Inflation' mean in simple terms?",
    options: [
      "The decrease in the prices of goods over time",
      "The increase in the interest rates of banks",
      "The general rise in prices, which reduces the purchasing power of your money",
      "The process of printing more currency notes"
    ],
    correctAnswer: 2,
    explanation: "Inflation is the rate at which the cost of goods and services rises, meaning a rupee today buys less than it did in the past. Saving and investing helps beat inflation."
  }
];

// Quiz questions for Health & Hygiene (Beginner)
const HEALTH_BEGINNER_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the most effective way to prevent the spread of germs and infections?",
    options: [
      "Washing hands with soap and clean running water for at least 20 seconds",
      "Wiping hands on a dry cloth without washing",
      "Rinsing hands with water only for 2 seconds",
      "Wearing gloves all day without washing them"
    ],
    correctAnswer: 0,
    explanation: "Washing hands thoroughly with soap and water removes germs effectively, preventing common diseases like diarrhea and respiratory infections."
  },
  {
    id: 2,
    question: "Why is it important to boil or filter drinking water?",
    options: [
      "To improve the color of the water",
      "To kill harmful germs and bacteria that cause waterborne diseases",
      "To make the water cool down faster",
      "To reduce the amount of water"
    ],
    correctAnswer: 1,
    explanation: "Boiling or filtering water kills pathogens, making it safe to drink and preventing waterborne illnesses like cholera and typhoid."
  },
  {
    id: 3,
    question: "How should household food be stored to keep it safe from contamination?",
    options: [
      "Left uncovered on the floor",
      "Stored in clean, covered containers away from flies and pests",
      "Placed in direct hot sunlight for several hours",
      "Kept open near waste disposal areas"
    ],
    correctAnswer: 1,
    explanation: "Keeping food covered and clean prevents flies and pests from carrying bacteria to the food, avoiding food poisoning."
  },
  {
    id: 4,
    question: "Which of the following is a key habit for personal hygiene?",
    options: [
      "Bathing regularly with soap and brushing teeth twice a day",
      "Brushing teeth only once a week",
      "Keeping nails long and dirty",
      "Sharing personal towels and toothbrushes with everyone"
    ],
    correctAnswer: 0,
    explanation: "Regular bathing and brushing teeth twice a day prevent infections, dental cavities, and maintain overall body health."
  },
  {
    id: 5,
    question: "What is the best way to dispose of dry and wet household waste?",
    options: [
      "Throwing it into open drains or streets",
      "Dumping it near drinking water sources",
      "Separating wet and dry waste and disposing of it in covered bins",
      "Burning all plastic waste inside the home"
    ],
    correctAnswer: 2,
    explanation: "Separating waste and using covered bins keeps the surroundings clean and prevents the breeding of mosquitoes and disease-carrying pests."
  }
];

// Quiz questions for Mobile Skills (Beginner)
const DIGITAL_BEGINNER_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the safest way to download new apps on your Android mobile phone?",
    options: [
      "Clicking on links sent in SMS or WhatsApp from unknown numbers",
      "Using the official Google Play Store",
      "Downloading them from random websites on the internet",
      "Asking a stranger to transfer them using Bluetooth"
    ],
    correctAnswer: 1,
    explanation: "Downloading apps from the official Google Play Store is the safest way because Google scans apps for viruses and security issues before allowing them."
  },
  {
    id: 2,
    question: "Which of the following should you NEVER share with anyone to protect your money and mobile accounts?",
    options: [
      "Your UPI PIN, bank OTP, or passwords",
      "Your phone model name",
      "Your favorite mobile game",
      "Your profile picture"
    ],
    correctAnswer: 0,
    explanation: "UPI PINs, bank OTPs, and passwords are highly confidential. Sharing them gives scammers access to transfer money from your account."
  },
  {
    id: 3,
    question: "If you receive a message on WhatsApp saying you have won a lottery of Rs. 25 Lakhs, what should you do?",
    options: [
      "Send them a small processing fee to claim the money",
      "Share the message with all your friends and family",
      "Ignore, block the number, and delete the message as it is a common scam",
      "Send them your bank account details and ID card immediately"
    ],
    correctAnswer: 2,
    explanation: "Government and authentic organizations never run lotteries on WhatsApp. These are phishing scams designed to steal your money or identity."
  },
  {
    id: 4,
    question: "What is a good practice to secure your phone if it is lost or stolen?",
    options: [
      "Keeping the phone without any lock screen password",
      "Storing your screen lock PIN on a sticker pasted on the back of the phone",
      "Setting up a strong screen lock (PIN, pattern, or fingerprint)",
      "Disabling internet connection on the phone permanently"
    ],
    correctAnswer: 2,
    explanation: "Setting a screen lock prevents unauthorized people from accessing your personal photos, messages, and banking apps."
  },
  {
    id: 5,
    question: "What does the 'Delete for Everyone' option on WhatsApp do?",
    options: [
      "Deletes the message from your phone only",
      "Deletes the message from both your phone and the recipient's phone (if done within the time limit)",
      "Deletes all messages in the chat history",
      "Formats the other person's phone completely"
    ],
    correctAnswer: 1,
    explanation: "'Delete for Everyone' allows you to delete a message you sent by mistake from both your phone and the recipient's chat."
  }
];

// Quiz questions for Handicrafts (Beginner)
const HANDICRAFTS_BEGINNER_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the most important factor when choosing raw materials for making handicrafts to sell?",
    options: [
      "Buying the most expensive materials available",
      "Choosing locally available, durable, and cost-effective materials",
      "Using materials that break easily",
      "Only buying imported materials"
    ],
    correctAnswer: 1,
    explanation: "Using high-quality, durable, and locally sourced materials keeps production costs reasonable while ensuring the products last long and attract buyers."
  },
  {
    id: 2,
    question: "How should you price your finished handicraft item to ensure you make a profit?",
    options: [
      "Price it randomly based on what you feel like",
      "Add the cost of materials and labor time, plus a small profit margin",
      "Sell it below the cost of materials to attract customers",
      "Price it at Rs. 10 Lakhs regardless of the item"
    ],
    correctAnswer: 1,
    explanation: "Proper pricing must cover the cost of all materials and pay you for the time you spent making the item, plus a profit to grow your business."
  },
  {
    id: 3,
    question: "Why is good lighting important when taking pictures of your handicrafts to sell online?",
    options: [
      "It makes the phone battery last longer",
      "It clearly shows the colors, textures, and details of your work to online buyers",
      "It changes the actual color of the product to something else",
      "It is not important; blurry photos are better"
    ],
    correctAnswer: 1,
    explanation: "Clear, well-lit photos help online customers see the quality and true details of your handicraft, making them much more likely to buy."
  },
  {
    id: 4,
    question: "Which local platform is great for selling handicrafts directly to community members?",
    options: [
      "Weekly village markets (Haats), local festivals, and community fairs",
      "Only international websites",
      "Secret clubs",
      "Standard television channels"
    ],
    correctAnswer: 0,
    explanation: "Local markets, community fairs, and village Haats are excellent places to start selling directly to customers nearby and get immediate feedback."
  },
  {
    id: 5,
    question: "What is a key step to make your handicraft items stand out from competitors?",
    options: [
      "Copying someone else's work exactly and calling it yours",
      "Adding a unique design, neat finishing, and good packaging",
      "Lowering the quality to make it faster",
      "Hiding the product from customers"
    ],
    correctAnswer: 1,
    explanation: "High-quality finishing, unique touch, and clean packaging make your product attractive, professional, and distinct from others."
  }
];

const getQuizQuestions = (categoryId: string, diff: Difficulty): QuizQuestion[] => {
  if (categoryId === 'finance' && diff === 'beginner') {
    return FINANCE_BEGINNER_QUIZ_QUESTIONS;
  }
  if (categoryId === 'health' && diff === 'beginner') {
    return HEALTH_BEGINNER_QUIZ_QUESTIONS;
  }
  if (categoryId === 'digital' && diff === 'beginner') {
    return DIGITAL_BEGINNER_QUIZ_QUESTIONS;
  }
  if (categoryId === 'handicrafts' && diff === 'beginner') {
    return HANDICRAFTS_BEGINNER_QUIZ_QUESTIONS;
  }
  return FARMING_QUIZ_QUESTIONS;
};


export const ContentPage: React.FC<Props> = ({ category, language, difficulty, onBack }) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTranslatingUI, setIsTranslatingUI] = useState(false);
  const [uiLabels, setUiLabels] = useState({
    backToSkills: "Back to Skills",
    preparingGuide: "Preparing Your Guide",
    aiWriting: "Knowledge AI is writing...",
    wrong: "Something went wrong",
    tryAgain: "Try Again",
    generateVideo: "Generate Video",
    videoReady: "Video Ready",
    starting: "Starting...",
    generating: "Generating...",
    saveOffline: "Save Offline",
    saved: "Saved",
    saving: "Saving...",
    markComplete: "Mark as Complete",
    generatingVideoGuide: "Generating Video Guide",
    videoWaitMsg: "Please wait while our AI creates a custom visual guide for this skill. This usually takes 1-2 minutes.",
    videoPaused: "Video Generation Paused"
  });
  
  // Video related state
  const [videoStatus, setVideoStatus] = useState<'idle' | 'starting' | 'generating' | 'ready' | 'error'>('idle');
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoOperationName, setVideoOperationName] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoadingMsg, setVideoLoadingMsg] = useState(REASSURING_MESSAGES[0]);

  // Quiz related state
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(new Array(5).fill(null));
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);
  const [quizUnlocked, setQuizUnlocked] = useState(false);
  const [quizUnlockCountdown, setQuizUnlockCountdown] = useState(15);

  const autoAdvanceTimeoutRef = React.useRef<any>(null);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

  const activeQuizQuestions = getQuizQuestions(category.id, difficulty);

  const keySuffix = `${difficulty}_${language.code}`;

  useEffect(() => {
    const translateUI = async () => {
      // 1. Instantly use curated local dictionary translations as baseline/offline backup
      const staticLabels = getTranslatedContentPageLabels(language.code, uiLabels);
      setUiLabels(staticLabels);

      if (language.code === 'en') return;

      const cacheKey = `content_page_strings_${language.code}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setUiLabels(JSON.parse(cached));
        return;
      }

      setIsTranslatingUI(true);
      try {
        const response = await fetch('/api/translate-ui', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: uiLabels, language: language.nativeName }),
        });
        const data = await response.json();
        if (data.translatedTexts) {
          setUiLabels(data.translatedTexts);
          localStorage.setItem(cacheKey, JSON.stringify(data.translatedTexts));
        }
      } catch (err) {
        console.error("UI translation failed", err);
        // Fall back gracefully to the preloaded local high-quality translations
      } finally {
        setIsTranslatingUI(false);
      }
    };

    translateUI();
  }, [language]);

  useEffect(() => {
    let interval: any;
    if (videoStatus === 'generating') {
      let msgIndex = 0;
      interval = setInterval(() => {
        msgIndex = (msgIndex + 1) % REASSURING_MESSAGES.length;
        setVideoLoadingMsg(REASSURING_MESSAGES[msgIndex]);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [videoStatus]);

  // Effect to handle the quiz countdown timer
  useEffect(() => {
    let timer: any;
    const isSpecialVideo = (category.id === 'finance' || category.id === 'health' || category.id === 'digital' || category.id === 'handicrafts') && difficulty === 'beginner';
    if (videoStatus === 'ready' && isSpecialVideo && !quizUnlocked && quizUnlockCountdown > 0) {
      timer = setInterval(() => {
        setQuizUnlockCountdown(prev => {
          if (prev <= 1) {
            setQuizUnlocked(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isSpecialVideo) {
      setQuizUnlocked(true);
    }
    return () => clearInterval(timer);
  }, [videoStatus, category.id, difficulty, quizUnlocked, quizUnlockCountdown]);

  const handleGenerateVideo = async () => {
    if (videoStatus === 'generating' || videoStatus === 'starting' || videoStatus === 'ready' || videoStatus === 'error') return;
    
    setVideoStatus('starting');
    setVideoError(null);
    
    // For beginner level in basic finance, load the Pictory preview video
    if (difficulty === 'beginner' && category.id === 'finance') {
      try {
        const pictoryUrl = 'https://video.pictory.ai/v2/preview/8d983fc0-b5f2-4689-8397-86c161c85f6a?mode=player';
        setVideoUrl(pictoryUrl);
        setVideoStatus('ready');
        setQuizUnlocked(false);
        setQuizUnlockCountdown(15);
        return;
      } catch (err: any) {
        console.error(err);
        setVideoStatus('error');
        setVideoError('Failed to load video. Please try again.');
        return;
      }
    }

    // For beginner level in health and hygiene, load the Pictory preview video
    if (difficulty === 'beginner' && category.id === 'health') {
      try {
        const pictoryUrl = 'https://video.pictory.ai/v2/preview/b0224046-efba-4dab-bba9-51f93b6c34e9?mode=player';
        setVideoUrl(pictoryUrl);
        setVideoStatus('ready');
        setQuizUnlocked(false);
        setQuizUnlockCountdown(15);
        return;
      } catch (err: any) {
        console.error(err);
        setVideoStatus('error');
        setVideoError('Failed to load video. Please try again.');
        return;
      }
    }

    // For beginner level in mobile skills, load the Pictory preview video
    if (difficulty === 'beginner' && category.id === 'digital') {
      try {
        const pictoryUrl = 'https://video.pictory.ai/v2/preview/bdb77ea9-6b7f-499e-be9c-a8a51ae5e545?mode=player';
        setVideoUrl(pictoryUrl);
        setVideoStatus('ready');
        setQuizUnlocked(false);
        setQuizUnlockCountdown(15);
        return;
      } catch (err: any) {
        console.error(err);
        setVideoStatus('error');
        setVideoError('Failed to load video. Please try again.');
        return;
      }
    }

    // For beginner level in handicrafts, load the Pictory preview video
    if (difficulty === 'beginner' && category.id === 'handicrafts') {
      try {
        const pictoryUrl = 'https://video.pictory.ai/202605210637272572dfe468eebc445e388f53591a6dc4881/20260521064127272nyHXTwjqSRthCmj';
        setVideoUrl(pictoryUrl);
        setVideoStatus('ready');
        setQuizUnlocked(false);
        setQuizUnlockCountdown(15);
        return;
      } catch (err: any) {
        console.error(err);
        setVideoStatus('error');
        setVideoError('Failed to load video. Please try again.');
        return;
      }
    }

    // For beginner level in farming, use YouTube video with fallback options
    if (difficulty === 'beginner' && category.id === 'farming') {
      try {
        // Use standard YouTube embed which has better compatibility
        const youtubeEmbedUrl = 'https://www.youtube.com/embed/dk0SOTkJ8Mo?modestbranding=1&rel=0&controls=1&fs=1';
        setVideoUrl(youtubeEmbedUrl);
        setVideoStatus('ready');
        setQuizUnlocked(true);
        return;
      } catch (err: any) {
        console.error(err);
        setVideoStatus('error');
        setVideoError('Failed to load video. Please try again.');
        return;
      }
    }
    
    // For other levels, use the AI video generation API
    try {
      const prompt = `Educational video showing how to ${category.title} for ${difficulty} level in a simple rural setting. Clear focus on practical steps. Action oriented.`;
      const response = await fetch('/api/video-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to start video generation');
      
      setVideoOperationName(data.operationName);
      setVideoStatus('generating');
      startPolling(data.operationName);
    } catch (err: any) {
      console.error(err);
      setVideoStatus('error');
      setVideoError(err.message || 'The video studio is temporarily unavailable. Please try again later.');
    }
  };

  const startPolling = async (opName: string) => {
    const poll = async () => {
      try {
        const response = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName }),
        });
        const data = await response.json();
        
        if (data.done) {
          downloadVideo(opName);
        } else {
          setTimeout(poll, 10000); // Poll every 10 seconds
        }
      } catch (err) {
        console.error(err);
        setVideoStatus('error');
      }
    };
    poll();
  };

  const downloadVideo = async (opName: string) => {
    try {
      const response = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: opName }),
      });
      
      if (!response.ok) throw new Error('Video download failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setVideoStatus('ready');
    } catch (err) {
      console.error(err);
      setVideoStatus('error');
    }
  };

  const checkOfflineStatus = async () => {
    const offline = await getOfflineCourse(category.id, keySuffix);
    if (offline) {
      setIsDownloaded(true);
      if (!content) setContent(offline.content);
    }
  };

  const fetchContent = async () => {
    // Check offline first
    const offline = await getOfflineCourse(category.id, keySuffix);
    if (offline) {
      setContent(offline.content);
      setIsDownloaded(true);
      setIsLoading(false);
      return;
    }

    if (!navigator.onLine) {
      setError('You are offline and this course is not downloaded.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: category.title,
          language: language.nativeName,
          level: difficulty,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setContent(data.content);
    } catch (err: any) {
      setError(err.message || 'Could not load course. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (isDownloaded) {
      await deleteOfflineCourse(category.id, keySuffix);
      setIsDownloaded(false);
    } else {
      setIsSyncing(true);
      await saveCourseOffline({
        id: category.id,
        topic: category.title,
        languageCode: keySuffix,
        content: content,
        downloadedAt: Date.now(),
      });
      setIsDownloaded(true);
      setIsSyncing(false);
    }
  };

  const handleComplete = async () => {
    await markAsCompleted(category.id);
    // You could add a toast here
  };

  const advanceQuiz = (currentAnswers: (number | null)[]) => {
    if (currentQuestionIndex < activeQuizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAnsweredCorrectly(false);
    } else {
      const score = currentAnswers.filter((answer, idx) => answer === activeQuizQuestions[idx].correctAnswer).length;
      setQuizScore(score);
      setQuizCompleted(true);
      if (score === activeQuizQuestions.length) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    }
  };

  const handleQuizStart = () => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
    }
    setShowQuiz(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(activeQuizQuestions.length).fill(null));
    setQuizCompleted(false);
    setQuizScore(0);
    setAnsweredCorrectly(false);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (quizCompleted || selectedAnswers[currentQuestionIndex] !== null) return;
    
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
    }

    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);

    const isCorrect = optionIndex === activeQuizQuestions[currentQuestionIndex].correctAnswer;
    
    if (isCorrect) {
      setShowConfetti(true);
      setAnsweredCorrectly(true);
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        setShowConfetti(false);
        setAnsweredCorrectly(false);
        advanceQuiz(newAnswers);
      }, 1500);
    } else {
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        advanceQuiz(newAnswers);
      }, 3500);
    }
  };

  const handleNextQuestion = () => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
    }
    advanceQuiz(selectedAnswers);
  };

  const handleQuizClose = () => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
    }
    setShowQuiz(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(activeQuizQuestions.length).fill(null));
    setQuizCompleted(false);
    setQuizScore(0);
  };

  useEffect(() => {
    fetchContent();
    checkOfflineStatus();
  }, [category, language, difficulty]);

  return (
    <div id="content-page" className="max-w-4xl mx-auto px-6 py-12">
      <button 
        onClick={onBack}
        className="flex items-center text-orange-600 mb-10 hover:translate-x-[-4px] transition-transform font-black uppercase text-sm tracking-widest"
      >
        <ArrowLeft size={18} className="mr-2" />
        {uiLabels.backToSkills}
      </button>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="relative">
            <Loader2 size={64} className="animate-spin text-orange-500 mb-6 opacity-40" />
            <div className="absolute inset-0 flex items-center justify-center font-black text-orange-500 text-xl">ग</div>
          </div>
          <h3 className="text-3xl font-black text-orange-900">{uiLabels.preparingGuide}</h3>
          <p className="text-orange-700/50 mt-2 font-bold select-none animate-pulse">{uiLabels.aiWriting}</p>
        </div>
      ) : error ? (
        <div className="card-vibrant p-12 text-center border-red-200 bg-red-50/30">
          <h3 className="text-3xl text-red-900 mb-4 font-black">{uiLabels.wrong}</h3>
          <p className="text-red-800/70 mb-10 font-bold">{error}</p>
          <button onClick={fetchContent} className="btn-vibrant bg-red-600 shadow-[0_6px_0_#991b1b] mx-auto flex items-center cursor-pointer">
            <RefreshCcw size={20} className="mr-2" /> {uiLabels.tryAgain}
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-vibrant p-8 md:p-16 shadow-xl relative"
        >
          {/* Action Bar */}
          <div className="flex flex-wrap justify-end gap-3 mb-8 border-b-2 border-orange-50 pb-6 relative z-20">
            <button
              onClick={handleGenerateVideo}
              disabled={videoStatus !== 'idle' && videoStatus !== 'error'}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all cursor-pointer ${
                videoStatus === 'ready' 
                ? 'bg-blue-100 border-blue-200 text-blue-700' 
                : 'bg-white border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {videoStatus === 'starting' || videoStatus === 'generating' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : videoStatus === 'ready' ? (
                <PlayCircle size={18} />
              ) : (
                <Video size={18} />
              )}
              {videoStatus === 'starting' ? uiLabels.starting : 
               videoStatus === 'generating' ? uiLabels.generating : 
               videoStatus === 'ready' ? uiLabels.videoReady : uiLabels.generateVideo}
            </button>
            <button
              onClick={handleDownload}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all cursor-pointer ${
                isDownloaded 
                ? 'bg-orange-100 border-orange-200 text-orange-700' 
                : 'bg-white border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white'
              }`}
            >
              {isSyncing ? <Loader2 size={18} className="animate-spin" /> : isDownloaded ? <Trash2 size={18} /> : <Download size={18} />}
              {isDownloaded ? uiLabels.saved : uiLabels.saveOffline}
            </button>
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-bold text-sm shadow-[0_4px_0_#166534] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
            >
              <CheckCircle size={18} />
              {uiLabels.markComplete}
            </button>
            {videoStatus === 'ready' && quizUnlocked && (
              <button
                onClick={handleQuizStart}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl font-bold text-sm shadow-[0_4px_0_#6d28d9] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer hover:bg-purple-600 animate-pulse"
              >
                <BookOpen size={18} />
                Quiz Me
              </button>
            )}
          </div>

          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/50 rounded-bl-[100px] -z-1 pointer-events-none"></div>
          
          {/* Video Section */}
          {(videoStatus === 'generating' || videoStatus === 'starting' || videoStatus === 'ready' || videoStatus === 'error') && (
            <div className={`mb-10 overflow-hidden rounded-[32px] border-4 bg-orange-50/30 ${videoStatus === 'error' ? 'border-red-100' : 'border-orange-100'}`}>
              {videoStatus === 'ready' && videoUrl ? (
                 videoUrl.includes('youtube') || videoUrl.includes('vimeo') || videoUrl.includes('pictory.ai') ? (
                    <>
                      <iframe
                        src={videoUrl}
                        className="w-full h-auto aspect-video rounded-[24px]"
                        frameBorder="0"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                      {videoUrl.includes('pictory.ai') && (
                        <div className="p-6 bg-purple-50 border-2 border-dashed border-purple-200 rounded-2xl mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">📺</span>
                            <div>
                              <h5 className="font-black text-purple-950 text-base md:text-lg">
                                {!quizUnlocked ? "Watch the video to unlock the quiz!" : "Video completed!"}
                              </h5>
                              <p className="text-sm text-purple-700 font-bold">
                                {!quizUnlocked 
                                  ? `Unlocking quiz in ${quizUnlockCountdown} seconds...` 
                                  : "Great job! You can now start the quiz."}
                              </p>
                            </div>
                          </div>
                          {!quizUnlocked ? (
                            <button
                              onClick={() => setQuizUnlocked(true)}
                              className="text-purple-600 font-black text-xs uppercase tracking-wider hover:underline px-4 py-2 border-2 border-purple-300 rounded-xl hover:bg-purple-100 transition-all cursor-pointer"
                            >
                              Skip Timer ⚡
                            </button>
                          ) : (
                            <motion.button
                              initial={{ scale: 0.95 }}
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              onClick={handleQuizStart}
                              className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-black shadow-[0_4px_0_#6d28d9] active:translate-y-[2px] active:shadow-none hover:bg-purple-600 transition-all cursor-pointer"
                            >
                              <BookOpen size={18} />
                              Quiz Me!
                            </motion.button>
                          )}
                        </div>
                      )}
                      {!videoUrl.includes('pictory.ai') && (
                        <div className="p-4 bg-orange-50 rounded-xl mt-4">
                          <p className="text-sm text-orange-700">
                            If video doesn't play, your network may be blocking YouTube content. 
                            Continue reading below for the text guide.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <video 
                      src={videoUrl} 
                      controls 
                      className="w-full h-auto aspect-video object-cover"
                      onError={() => {
                        console.error('Video playback failed');
                        setVideoStatus('error');
                        setVideoError('Video playback failed. Please try again.');
                      }}
                    />
                  )
              ) : videoStatus === 'error' ? (
                <div className="aspect-video flex flex-col items-center justify-center p-8 text-center bg-red-50/20">
                  <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white mb-6">
                    <RefreshCcw size={40} />
                  </div>
                  <h4 className="text-2xl font-black text-red-950 mb-2">{uiLabels.videoPaused}</h4>
                  <p className="text-red-900/60 font-bold max-w-sm mb-6">
                    {videoError}
                  </p>
                  <button 
                    onClick={handleGenerateVideo}
                    className="text-red-600 font-black uppercase text-sm tracking-widest hover:underline cursor-pointer"
                  >
                    {uiLabels.tryAgain}
                  </button>
                </div>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center p-8 text-center bg-orange-50/50">
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white mb-6 animate-pulse">
                    <Video size={40} />
                  </div>
                  <h4 className="text-2xl font-black text-orange-950 mb-2">{uiLabels.generatingVideoGuide}</h4>
                  <p className="text-orange-900/60 font-bold max-w-sm mb-4">
                    {uiLabels.videoWaitMsg}
                  </p>
                  <div className="flex items-center gap-2 text-blue-600 font-black">
                    <Clock size={18} className="animate-spin" />
                    <span>{videoLoadingMsg}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="markdown-body relative z-10">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
          
          <div className="mt-16 pt-10 border-t-4 border-orange-50 text-center relative z-10">
            <div className="bg-orange-100/50 p-8 rounded-[32px] border-2 border-dashed border-orange-200">
              <h4 className="text-2xl font-black text-orange-950 mb-3">Still have questions?</h4>
              <p className="text-orange-900/60 mb-8 font-bold">Your AI Mentor is ready to help you understand this topic better.</p>
              <button 
                onClick={() => (window as any).toggleAiMentor?.()}
                className="btn-vibrant mx-auto flex items-center"
              >
                <MessageCircle size={24} className="mr-3" />
                Talk to My Mentor
              </button>
            </div>
          </div>

          {/* Confetti Animation */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
              {Array.from({ length: 80 }).map((_, i) => {
                const isLeft = i % 2 === 0;
                // Shoot upwards and towards the center
                const targetX = isLeft 
                  ? window.innerWidth * 0.2 + Math.random() * (window.innerWidth * 0.4)
                  : window.innerWidth * 0.4 + Math.random() * (window.innerWidth * 0.4);
                const targetY = window.innerHeight * 0.1 + Math.random() * (window.innerHeight * 0.4);

                return (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 1, 
                      x: isLeft ? 0 : window.innerWidth,
                      y: window.innerHeight * 0.8,
                      scale: 0.5 + Math.random() * 0.8,
                      rotate: 0 
                    }}
                    animate={{ 
                      opacity: [1, 1, 0.8, 0],
                      x: [isLeft ? 0 : window.innerWidth, targetX, targetX + (Math.random() * 100 - 50)],
                      y: [window.innerHeight * 0.8, targetY, window.innerHeight + 50],
                      rotate: 720 
                    }}
                    transition={{ 
                      duration: 2.5 + Math.random() * 1.5, 
                      ease: [0.1, 0.8, 0.3, 1], // Custom cubic-bezier for physics throw
                    }}
                    className="absolute w-3 h-3 rounded-sm"
                    style={{
                      left: '0px',
                      backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#ff8a5c', '#10b981'][Math.floor(Math.random() * 7)],
                      transformOrigin: 'center'
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Quiz Modal */}
          {showQuiz && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="card-vibrant max-w-2xl w-full p-8 md:p-12 max-h-[90vh] overflow-y-auto relative"
              >
                <button
                  onClick={handleQuizClose}
                  className="absolute top-4 right-4 md:top-6 md:right-6 text-orange-900/40 hover:text-orange-900 transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-orange-100/50 font-bold z-10 cursor-pointer text-xl"
                  aria-label="Close Quiz"
                >
                  ✕
                </button>

                {!quizCompleted ? (
                  <>
                    <div className="flex items-center justify-between mb-8 pr-8">
                      <div>
                        <h2 className="text-3xl font-black text-orange-950 mb-2">Test Your Knowledge</h2>
                        <p className="text-orange-700 font-bold">Question {currentQuestionIndex + 1} of {activeQuizQuestions.length}</p>
                      </div>
                    </div>

                    <div className="w-full bg-orange-100 rounded-full h-2 mb-8">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / activeQuizQuestions.length) * 100}%` }}
                      />
                    </div>

                    <div className="mb-8">
                      <h3 className="text-xl font-black text-orange-950 mb-6">
                        {activeQuizQuestions[currentQuestionIndex].question}
                      </h3>

                      <div className="space-y-3">
                        {activeQuizQuestions[currentQuestionIndex].options.map((option, idx) => {
                          const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                          const isCorrect = idx === activeQuizQuestions[currentQuestionIndex].correctAnswer;
                          const isAnswered = selectedAnswers[currentQuestionIndex] !== null;
                          const showCorrect = isAnswered && isCorrect;
                          const showWrong = isAnswered && isSelected && !isCorrect;

                          return (
                            <motion.button
                              key={idx}
                              onClick={() => handleAnswerSelect(idx)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              disabled={isAnswered}
                              className={`w-full p-4 text-left rounded-xl border-2 font-bold transition-all cursor-pointer ${
                                showCorrect
                                  ? 'bg-green-100 border-green-500 text-green-900'
                                  : showWrong
                                  ? 'bg-red-100 border-red-500 text-red-900'
                                  : isSelected && !isAnswered
                                  ? 'bg-blue-100 border-blue-500 text-blue-900'
                                  : 'bg-white border-orange-200 text-orange-950 hover:border-orange-400'
                              }`}
                            >
                              <div className="flex items-center">
                                <span className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center font-black text-sm ${
                                  showCorrect
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : showWrong
                                    ? 'bg-red-500 border-red-500 text-white'
                                    : isSelected && !isAnswered
                                    ? 'bg-blue-500 border-blue-500 text-white'
                                    : 'border-orange-300'
                                }`}>
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                {option}
                                {showCorrect && <span className="ml-auto text-lg">✓</span>}
                                {showWrong && <span className="ml-auto text-lg">✗</span>}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>

                      {selectedAnswers[currentQuestionIndex] !== null && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`mt-6 p-4 rounded-xl font-bold ${
                            selectedAnswers[currentQuestionIndex] === activeQuizQuestions[currentQuestionIndex].correctAnswer
                              ? 'bg-green-100 text-green-900 border-2 border-green-300'
                              : 'bg-orange-100 text-orange-900 border-2 border-orange-300'
                          }`}
                        >
                          {selectedAnswers[currentQuestionIndex] === activeQuizQuestions[currentQuestionIndex].correctAnswer
                            ? '🎉 Correct! ' + activeQuizQuestions[currentQuestionIndex].explanation
                            : '📚 ' + activeQuizQuestions[currentQuestionIndex].explanation}
                        </motion.div>
                      )}
                    </div>

                    {selectedAnswers[currentQuestionIndex] !== null && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={handleNextQuestion}
                        className="w-full bg-blue-500 text-white font-black py-3 rounded-xl hover:bg-blue-600 transition-all"
                      >
                        {currentQuestionIndex === activeQuizQuestions.length - 1 ? 'See Results' : 'Next Question'}
                      </motion.button>
                    )}
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="mb-6 flex justify-center">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-150" />
                        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-white shadow-lg relative z-10">
                          <Award size={56} className="animate-bounce" />
                        </div>
                      </div>
                    </div>

                    <h3 className="text-4xl font-black text-orange-950 mb-6">Quiz Complete!</h3>

                    <div className="inline-flex flex-col items-center justify-center p-8 bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-[32px] border-4 border-purple-400/30 shadow-xl mb-8 w-full max-w-sm mx-auto">
                      <span className="text-xs uppercase tracking-widest text-purple-300 font-black mb-2">Accuracy Score</span>
                      <div className="text-6xl font-black text-yellow-300 mb-2">
                        {quizScore === activeQuizQuestions.length ? "💯" : `${Math.round((quizScore / activeQuizQuestions.length) * 100)}%`}
                      </div>
                      <div className="text-xl font-bold text-white mb-1">{quizScore} correct out of {activeQuizQuestions.length}</div>
                      <div className="text-xs font-medium text-purple-200 text-center">
                        {quizScore === activeQuizQuestions.length 
                          ? `👑 Flawless! Master of ${category.title}!` 
                          : quizScore >= 4 
                          ? '🌟 Excellent job! Almost perfect!' 
                          : quizScore >= 3 
                          ? '👍 Good score! Keep practicing!' 
                          : '📖 Keep studying to improve!'}
                      </div>
                    </div>

                    <div className="text-left mb-8 max-h-[30vh] overflow-y-auto pr-2 space-y-3">
                      <h4 className="font-black text-orange-950 text-lg mb-2">Question Breakdown:</h4>
                      {activeQuizQuestions.map((q, idx) => {
                        const selectedOptionIdx = selectedAnswers[idx];
                        const isCorrect = selectedOptionIdx === q.correctAnswer;
                        return (
                          <div 
                            key={q.id}
                            className={`p-4 rounded-2xl border-2 flex items-start gap-4 transition-all ${
                              isCorrect 
                                ? 'bg-green-50/50 border-green-200' 
                                : 'bg-red-50/50 border-red-200'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-sm shrink-0 ${
                              isCorrect ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                              {idx + 1}
                            </div>
                            <div className="grow">
                              <p className="font-bold text-orange-950 text-sm leading-snug mb-1">{q.question}</p>
                              {isCorrect ? (
                                <p className="text-xs text-green-700 font-bold flex items-center gap-1">
                                  <span>✓ Correct:</span> 
                                  <span className="font-normal">{q.options[q.correctAnswer]}</span>
                                </p>
                              ) : (
                                <div className="space-y-1">
                                  <p className="text-xs text-red-700 font-bold flex items-center gap-1">
                                    <span>✗ Your answer:</span> 
                                    <span className="font-normal">{selectedOptionIdx !== null ? q.options[selectedOptionIdx] : 'Skipped'}</span>
                                  </p>
                                  <p className="text-xs text-green-700 font-bold flex items-center gap-1">
                                    <span>✓ Correct:</span> 
                                    <span className="font-normal">{q.options[q.correctAnswer]}</span>
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={handleQuizStart}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-black py-4 px-6 rounded-2xl shadow-[0_6px_0_#4c1d95] hover:translate-y-[2px] hover:shadow-[0_4px_0_#4c1d95] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer text-base"
                      >
                        Try Again 🔄
                      </button>
                      <button
                        onClick={handleQuizClose}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-black py-4 px-6 rounded-2xl shadow-[0_6px_0_#1d4ed8] hover:translate-y-[2px] hover:shadow-[0_4px_0_#1d4ed8] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer text-base"
                      >
                        Close Results ✕
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
