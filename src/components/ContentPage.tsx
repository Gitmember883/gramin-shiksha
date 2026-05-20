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

// Quiz questions for Modern Farming - Beginner (Drip Irrigation)
const QUIZ_QUESTIONS: QuizQuestion[] = [
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
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(new Array(QUIZ_QUESTIONS.length).fill(null));
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);

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

  const handleGenerateVideo = async () => {
    if (videoStatus === 'generating' || videoStatus === 'starting') return;
    
    setVideoStatus('starting');
    setVideoError(null);
    
    // For beginner level in farming, use YouTube video with fallback options
    if (difficulty === 'beginner' && category.id === 'farming') {
      try {
        // Use standard YouTube embed which has better compatibility
        const youtubeEmbedUrl = 'https://www.youtube.com/embed/dk0SOTkJ8Mo?modestbranding=1&rel=0&controls=1&fs=1';
        setVideoUrl(youtubeEmbedUrl);
        setVideoStatus('ready');
        
        // Set a timeout to check if video loaded - if not, show alternative content
        setTimeout(() => {
          if (videoStatus === 'ready') {
            // Video loaded, proceed normally
          }
        }, 3000);
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

  const handleQuizStart = () => {
    setShowQuiz(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(QUIZ_QUESTIONS.length).fill(null));
    setQuizCompleted(false);
    setQuizScore(0);
    setAnsweredCorrectly(false);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (quizCompleted) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);

    const isCorrect = optionIndex === QUIZ_QUESTIONS[currentQuestionIndex].correctAnswer;
    
    if (isCorrect) {
      setShowConfetti(true);
      setAnsweredCorrectly(true);
      setTimeout(() => {
        setShowConfetti(false);
        setAnsweredCorrectly(false);
      }, 1500);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnsweredCorrectly(false);
    } else {
      const score = selectedAnswers.filter((answer, idx) => answer === QUIZ_QUESTIONS[idx].correctAnswer).length;
      setQuizScore(score);
      setQuizCompleted(true);
      if (score === QUIZ_QUESTIONS.length) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }
  };

  const handleQuizClose = () => {
    setShowQuiz(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(QUIZ_QUESTIONS.length).fill(null));
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
            {videoStatus === 'ready' && (
              <button
                onClick={handleQuizStart}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl font-bold text-sm shadow-[0_4px_0_#6d28d9] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer hover:bg-purple-600"
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
                 videoUrl.includes('youtube') || videoUrl.includes('vimeo') ? (
                   <>
                     <iframe
                       src={videoUrl}
                       className="w-full h-auto aspect-video"
                       frameBorder="0"
                       allowFullScreen
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     />
                     <div className="p-4 bg-orange-50 rounded-xl mt-4">
                       <p className="text-sm text-orange-700">
                         If video doesn't play, your network may be blocking YouTube content. 
                         Continue reading below for the text guide.
                       </p>
                     </div>
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
            <div className="fixed inset-0 pointer-events-none z-50">
              {Array.from({ length: 50 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 1, 
                    y: -10, 
                    x: Math.random() * 100 - 50,
                    rotate: 0 
                  }}
                  animate={{ 
                    opacity: 0, 
                    y: window.innerHeight, 
                    x: Math.random() * 200 - 100,
                    rotate: 360 
                  }}
                  transition={{ duration: 2, ease: "easeIn" }}
                  className={`absolute w-2 h-2 rounded-full`}
                  style={{
                    left: `${50 + Math.random() * 20 - 10}%`,
                    top: `${30 + Math.random() * 20}%`,
                    backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'][Math.floor(Math.random() * 5)]
                  }}
                />
              ))}
            </div>
          )}

          {/* Quiz Modal */}
          {showQuiz && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="card-vibrant max-w-2xl w-full p-8 md:p-12 max-h-[90vh] overflow-y-auto"
              >
                {!quizCompleted ? (
                  <>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-3xl font-black text-orange-950 mb-2">Test Your Knowledge</h2>
                        <p className="text-orange-700 font-bold">Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}</p>
                      </div>
                      <button
                        onClick={handleQuizClose}
                        className="text-orange-900/40 hover:text-orange-900 transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="w-full bg-orange-100 rounded-full h-2 mb-8">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                      />
                    </div>

                    <div className="mb-8">
                      <h3 className="text-xl font-black text-orange-950 mb-6">
                        {QUIZ_QUESTIONS[currentQuestionIndex].question}
                      </h3>

                      <div className="space-y-3">
                        {QUIZ_QUESTIONS[currentQuestionIndex].options.map((option, idx) => {
                          const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                          const isCorrect = idx === QUIZ_QUESTIONS[currentQuestionIndex].correctAnswer;
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
                            selectedAnswers[currentQuestionIndex] === QUIZ_QUESTIONS[currentQuestionIndex].correctAnswer
                              ? 'bg-green-100 text-green-900 border-2 border-green-300'
                              : 'bg-orange-100 text-orange-900 border-2 border-orange-300'
                          }`}
                        >
                          {selectedAnswers[currentQuestionIndex] === QUIZ_QUESTIONS[currentQuestionIndex].correctAnswer
                            ? '🎉 Correct! ' + QUIZ_QUESTIONS[currentQuestionIndex].explanation
                            : '📚 ' + QUIZ_QUESTIONS[currentQuestionIndex].explanation}
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
                        {currentQuestionIndex === QUIZ_QUESTIONS.length - 1 ? 'See Results' : 'Next Question'}
                      </motion.button>
                    )}
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="mb-6 flex justify-center">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white">
                          <Award size={60} />
                        </div>
                      </div>
                    </div>

                    <h3 className="text-4xl font-black text-orange-950 mb-4">Quiz Complete!</h3>
                    <div className="text-6xl font-black text-blue-500 mb-2">{quizScore}/{QUIZ_QUESTIONS.length}</div>
                    <p className="text-2xl font-bold text-orange-900 mb-8">
                      {quizScore === QUIZ_QUESTIONS.length 
                        ? '🌟 Perfect Score! You\'re a master!' 
                        : quizScore >= 4 
                        ? '👏 Great Job! Well done!' 
                        : quizScore >= 3 
                        ? '💪 Good Effort! Keep learning!' 
                        : '📖 Keep practicing to improve!'}
                    </p>
                    <button
                      onClick={handleQuizClose}
                      className="bg-blue-500 text-white font-black py-3 px-8 rounded-xl hover:bg-blue-600 transition-all"
                    >
                      Close Quiz
                    </button>
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
