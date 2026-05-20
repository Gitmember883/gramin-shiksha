import { SkillCategory, CATEGORIES } from "./types";

export interface DashboardUiLabels {
  availableSkills: string;
  learnNewSkills: string;
  connectingTo: string;
  searchPlaceholder: string;
  browsingOffline: string;
  offlineMode: string;
  noSkillsFound: string;
  trySearchingElse: string;
  clearSearch: string;
  needHelp: string;
  talkToMentorDesc: string;
  talkToMentorBtn: string;
  translatingLabels: string;
  startLearning: string;
  exploreMore: string;
}

export interface ContentPageUiLabels {
  backToSkills: string;
  preparingGuide: string;
  aiWriting: string;
  wrong: string;
  tryAgain: string;
  generateVideo: string;
  videoReady: string;
  starting: string;
  generating: string;
  saveOffline: string;
  saved: string;
  saving: string;
  markComplete: string;
  generatingVideoGuide: string;
  videoWaitMsg: string;
  videoPaused: string;
}

export interface DifficultySelectorUiLabels {
  title: string;
  subtitle: string;
  beginnerLabel: string;
  beginnerDesc: string;
  intermediateLabel: string;
  intermediateDesc: string;
  advancedLabel: string;
  advancedDesc: string;
}

const DASHBOARD_LABELS: Record<string, DashboardUiLabels> = {
  en: {
    availableSkills: "Available Skills",
    learnNewSkills: "Learn New Skills",
    connectingTo: "Connecting you to knowledge in",
    searchPlaceholder: "Search skills...",
    browsingOffline: "You are browsing offline. Only saved courses are available.",
    offlineMode: "Offline Mode",
    noSkillsFound: "No skills found",
    trySearchingElse: "Try searching for something else like \"farming\" or \"mobile\".",
    clearSearch: "Clear Search",
    needHelp: "Need Help with Skills?",
    talkToMentorDesc: "Talk to your AI Mentor in ",
    talkToMentorBtn: "Talk to Mentor",
    translatingLabels: "Translating labels...",
    startLearning: "Start Learning",
    exploreMore: "Explore More"
  },
  hi: {
    availableSkills: "उपलब्ध कौशल",
    learnNewSkills: "नए कौशल सीखें",
    connectingTo: "आपको ज्ञान से जोड़ना - ",
    searchPlaceholder: "कौशल खोजें...",
    browsingOffline: "आप ऑफलाइन हैं। केवल सहेजे गए पाठ्यक्रम उपलब्ध हैं।",
    offlineMode: "ऑफलाइन मोड",
    noSkillsFound: "कोई कौशल नहीं मिला",
    trySearchingElse: "कुछ और खोजने का प्रयास करें जैसे \"खेती\" या \"मोबाइल\"।",
    clearSearch: "खोज साफ करें",
    needHelp: "कौशल में मदद चाहिए?",
    talkToMentorDesc: "अपने एआई मेंटर से बात करें - ",
    talkToMentorBtn: "मेंटर से बात करें",
    translatingLabels: "अनुवाद हो रहा है...",
    startLearning: "सीखना शुरू करें",
    exploreMore: "और जानें"
  },
  bn: {
    availableSkills: "উপলব্ধ দক্ষতা",
    learnNewSkills: "নতুন দক্ষতা শিখুন",
    connectingTo: "আপনাকে যুক্ত করা হচ্ছে",
    searchPlaceholder: "দক্ষতা খুঁজুন...",
    browsingOffline: "আপনি অফলাইনে আছেন। কেবল সংরক্ষিত কোর্স উপলব্ধ আছে।",
    offlineMode: "অফলাইন মোড",
    noSkillsFound: "কোনো দক্ষতা পাওয়া যায়নি",
    trySearchingElse: "অন্য কিছু খোঁজার চেষ্টা করুন যেমন \"চাষ\" বা \"মোবাইল\"।",
    clearSearch: "অনুসন্ধান মুছুন",
    needHelp: "সাহায্য প্রয়োজন?",
    talkToMentorDesc: "আপনার এআই মেন্টরের সাথে কথা বলুন",
    talkToMentorBtn: "মেন্টরের সাথে কথা বলুন",
    translatingLabels: "অনুবাদ করা হচ্ছে...",
    startLearning: "শিখতে শুরু করুন",
    exploreMore: "আরো জানুন"
  },
  as: {
    availableSkills: "উপলব্ধ দক্ষতা",
    learnNewSkills: "নতুন দক্ষতা শিকক",
    connectingTo: "আপোনাক জ্ঞানৰ সৈতে সংযোগ কৰা হৈছে",
    searchPlaceholder: "দক্ষতা সন্ধান কৰক...",
    browsingOffline: "আপুনি অফলাইনত আছে। কেৱল সংৰক্ষিত পাঠ্যক্ৰম উপলব্ধ।",
    offlineMode: "অফলাইন মোড",
    noSkillsFound: "কোনো দক্ষতা পোৱা নগল",
    trySearchingElse: "খেতি বা ম’বাইলৰ দৰে অন্য কিছু বিচাৰি চাওক।",
    clearSearch: "সন্ধান পৰিষ্কাৰ কৰক",
    needHelp: "সহায়ৰ প্ৰয়োজন আছে নেকি?",
    talkToMentorDesc: "আপোনাৰ এআই মেণ্টৰৰ সৈতে কথা পাতক",
    talkToMentorBtn: "মেণ্টৰৰ সৈতে কথা পাতক",
    translatingLabels: "অনুবাদ হৈ আছে...",
    startLearning: "শিকিবলৈ আৰম্ভ কৰক",
    exploreMore: "অধিক জানক"
  },
  gu: {
    availableSkills: "ઉપલબ્ધ કૌશલ્યો",
    learnNewSkills: "નવા કૌશલ્યો શીખો",
    connectingTo: "તમને જ્ઞાન સાથે જોડે છે - ",
    searchPlaceholder: "કૌશલ્ય શોધો...",
    browsingOffline: "તમે ઑફલાઇન છો. માત્ર સાચવેલા અભ્યાસક્રમો ઉપલબ્ધ છે.",
    offlineMode: "ઑફલાઇન મોડ",
    noSkillsFound: "કોઈ કૌશલ્ય મળ્યું નથી",
    trySearchingElse: "ખેતી અથવા મોબાઈલ જેવું કંઈક શોધવાનો પ્રયાસ કરો.",
    clearSearch: "શોધ સાફ કરો",
    needHelp: "મદદની જરૂર છે?",
    talkToMentorDesc: "તમારા એઆઈ મેન્ટર સાથે વાત કરો - ",
    talkToMentorBtn: "મેન્ટર સાથે વાત કરો",
    translatingLabels: "અનુવાદ થઈ રહ્યો છે...",
    startLearning: "શીખવાનું શરૂ કરો",
    exploreMore: "વધુ જાણો"
  },
  mr: {
    availableSkills: "उपलब्ध कौशल्ये",
    learnNewSkills: "नवीन कौशल्ये शिका",
    connectingTo: "तुम्हाला ज्ञानाशी जोडत आहे - ",
    searchPlaceholder: "कौशल्ये शोधा...",
    browsingOffline: "तुम्ही ऑफलाइन आहात. फक्त सेव्ह केलेले कोर्स उपलब्ध आहेत.",
    offlineMode: "ऑफलाइन मोड",
    noSkillsFound: "कोणतेही कौशल्य सापडले नाही",
    trySearchingElse: "शेती किंवा मोबाईल यांसारखे काहीतरी शोधण्याचा प्रयत्न करा.",
    clearSearch: "शोध पुसा",
    needHelp: "मदतीची गरज आहे का?",
    talkToMentorDesc: "तुमच्या एआय मेंटॉरशी बोला - ",
    talkToMentorBtn: "मेंटॉरशी बोला",
    translatingLabels: "भाषांतर होत आहे...",
    startLearning: "शिकण्यास सुरवात करा",
    exploreMore: "अधिक जाणून घ्या"
  },
  ta: {
    availableSkills: "கிடைக்கக்கூடிய திறன்கள்",
    learnNewSkills: "புதிய திறன்களைக் கற்றுக் கொள்ளுங்கள்",
    connectingTo: "உங்களை அறிவோடு இணைக்கிறது - ",
    searchPlaceholder: "திறன்களைத் தேடுங்கள்...",
    browsingOffline: "நீங்கள் ஆஃப்லைனில் இருக்கிறீர்கள். சேமித்த படிப்புகள் மட்டுமே கிடைக்கும்.",
    offlineMode: "ஆஃப்லைன் பயன்முறை",
    noSkillsFound: "திறன்கள் எதுவும் இல்லை",
    trySearchingElse: "விவசாயம் அல்லது மொபைல் போன்றவற்றைத் தேடவும்.",
    clearSearch: "தேடலை அழி",
    needHelp: "உதவி தேவையா?",
    talkToMentorDesc: "உங்கள் AI வழிகாட்டியுடன் பேசுங்கள்- ",
    talkToMentorBtn: "Mentor உடன் பேசுங்கள்",
    translatingLabels: "மொழிபெயர்க்கப்படுகிறது...",
    startLearning: "கற்றலைத் தொடங்குங்கள்",
    exploreMore: "மேலும் அறிய"
  },
  te: {
    availableSkills: "అందుబాటులో ఉన్న నైపుణ్యాలు",
    learnNewSkills: "కొత్త నైపుణ్యాలు నేర్చుకోండి",
    connectingTo: "మిమ్మల్ని జ్ఞానంతో అనుసంధానిస్తోంది - ",
    searchPlaceholder: "నైపుణ్యాల కోసం వెతకండి...",
    browsingOffline: "మీరు ఆఫ్లైన్ లో ఉన్నారు. సేవ్ చేసిన కోర్సులు మాత్రమే అందుబాటులో ఉన్నాయి.",
    offlineMode: "ఆఫ్లైన్ మోడ్",
    noSkillsFound: "నైపుణ్యాలు ఏవీ కనుగొనబడలేదు",
    trySearchingElse: "వ్యవసాయం లేదా మొబైల్ వంటి వాటి కోసం వెతకండి.",
    clearSearch: "వెతుకులాట క్లియర్ చేయి",
    needHelp: "సహాయం కావాలా?",
    talkToMentorDesc: "మీ AI మెంటార్ తో మాట్లాడండి - ",
    talkToMentorBtn: "మెంటార్ తో మాట్లాడండి",
    translatingLabels: "అనువదిస్తోంది...",
    startLearning: "నేర్చుకోవడం ప్రారంభించండి",
    exploreMore: "మరింత అన్వేషించండి"
  },
  kn: {
    availableSkills: "ಲಭ್ಯವಿರುವ ಕೌಶಲ್ಯಗಳು",
    learnNewSkills: "ಹೊಸ ಕೌಶಲ್ಯಗಳನ್ನು ಕಲಿಯಿರಿ",
    connectingTo: "ನಿಮ್ಮನ್ನು ಜ್ಞಾನಕ್ಕೆ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ - ",
    searchPlaceholder: "ಕೌಶಲ್ಯಗಳಿಗಾಗಿ ಹುಡುಕಿ...",
    browsingOffline: "ನೀವು ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದೀರಿ. ಉಳಿಸಿದ ಕೋರ್ಸ್‌ಗಳು ಮಾತ್ರ ಲಭ್ಯವಿವೆ.",
    offlineMode: "ಆಫ್‌ಲೈನ್ ಮೋಡ್",
    noSkillsFound: "ಯಾವುದೇ ಕೌಶಲ್ಯಗಳು ಕಂಡುಬಂದಿಲ್ಲ",
    trySearchingElse: "ಕೃಷಿ ಅಥವಾ ಮೊಬೈಲ್‌ನಂತಹ ವಿಷಯಗಳನ್ನು ಹುಡುಕಿ.",
    clearSearch: "ಹುಡುಕಾಟ ತೆರವುಗೊಳಿಸಿ",
    needHelp: "ನೆರವು ಬೇಕೇ?",
    talkToMentorDesc: "ನಿಮ್ಮ AI ಮೆಂಟರ್ ಜೊತೆ ಮಾತನಾಡಿ - ",
    talkToMentorBtn: "ಮೆಂಟರ್ ಜೊತೆ ಮಾತನಾಡಿ",
    translatingLabels: "ಅನುವಾದಿಸಲಾಗುತ್ತಿದೆ...",
    startLearning: "ಕಲಿಯಲು ಪ್ರಾರಂಭಿಸಿ",
    exploreMore: "ಹೆಚ್ಚು ಅನ್ವೇಷಿಸಿ"
  },
  ml: {
    availableSkills: "ലഭ്യമായ കഴിവുകൾ",
    learnNewSkills: "പുതിയ കഴിവുകൾ പഠിക്കുക",
    connectingTo: "നിങ്ങളെ അറിവിലേക്ക് നയിക്കുന്നു - ",
    searchPlaceholder: "കഴിവുകൾ തിരയുക...",
    browsingOffline: "നിങ്ങൾ ഓഫ്‌ലൈനിലാണ്. സേവ് ചെയ്ത കോഴ്‌സുകൾ മാത്രമേ ലഭ്യമാകൂ.",
    offlineMode: "ഓഫ്‌ലൈൻ മോഡ്",
    noSkillsFound: "കഴിവുകളൊന്നും കണ്ടെത്തിയില്ല",
    trySearchingElse: "കൃഷി അല്ലെങ്കിൽ മൊബൈൽ എന്ന് തിരഞ്ഞു നോക്കൂ.",
    clearSearch: "തിരച്ചിൽ ഒഴിവാക്കുക",
    needHelp: "സഹായം ആവശ്യമുണ്ടോ?",
    talkToMentorDesc: "നിങ്ങളുടെ AI മെന്ററുമായി സംസാരിക്കുക - ",
    talkToMentorBtn: "മെന്ററോട് സംസാരിക്കുക",
    translatingLabels: "തർജ്ജമ ചെയ്യുന്നു...",
    startLearning: "പഠനം ആരംഭിക്കുക",
    exploreMore: "കൂടുതൽ അറിയുക"
  },
  pa: {
    availableSkills: "ਉਪਲਬਧ ਹੁਨਰ",
    learnNewSkills: "ਨਵੇਂ ਹੁਨਰ ਸਿੱਖੋ",
    connectingTo: "ਤੁਹਾਨੂੰ ਗਿਆਨ ਨਾਲ ਜੋੜ ਰਿਹਾ ਹੈ - ",
    searchPlaceholder: "ਹੁਨਰ ਖੋਜੋ...",
    browsingOffline: "ਤੁਸੀਂ ਆਫਲਾਈਨ ਹੋ। ਸਿਰਫ਼ ਬਚਾਏ ਗਏ ਕੋਰਸ ਹੀ ਉਪਲਬਧ ਹਨ।",
    offlineMode: "ਆਫਲਾਈਨ ਮੋਡ",
    noSkillsFound: "ਕੋਈ ਹੁਨਰ ਨਹੀਂ ਮਿਲਿਆ",
    trySearchingElse: "ਖੇਤੀ ਜਾਂ ਮੋਬਾਈਲ ਵਰਗਾ ਕੁਝ ਖੋਜੋ।",
    clearSearch: "ਖੋਜ ਸਾਫ਼ ਕਰੋ",
    needHelp: "ਮਦਦ ਚਾਹੀਦੀ ਹੈ?",
    talkToMentorDesc: "ਆਪਣੇ ਏਆਈ ਮੈਂਟਰ ਨਾਲ ਗੱਲ ਕਰੋ - ",
    talkToMentorBtn: "ਮੈਂਟਰ ਨਾਲ ਗੱਲ ਕਰੋ",
    translatingLabels: "ਅਨੁਵਾਦ ਹੋ ਰਿਹਾ ਹੈ...",
    startLearning: "ਸਿੱਖਣਾ ਸ਼ੁਰੂ ਕਰੋ",
    exploreMore: "ਹੋਰ ਜਾਣੋ"
  },
  ur: {
    availableSkills: "دستیاب ہنر",
    learnNewSkills: "نئے ہنر سیکھیں",
    connectingTo: "آپ کو معلومات سے جوڑ رہا ہے - ",
    searchPlaceholder: "ہنر تلاش کریں...",
    browsingOffline: "آپ آف لائن ہیں۔ صرف محفوظ کردہ کورسز دستیاب ہیں۔",
    offlineMode: "آف لائن موڈ",
    noSkillsFound: "کوئی ہنر نہیں ملا",
    trySearchingElse: "جیسے کاشتکاری یا موبائل تلاش کرنے کی کوشش کریں۔",
    clearSearch: "تلاش صاف کریں",
    needHelp: "مدد کی ضرورت ہے؟",
    talkToMentorDesc: "اپنے اے آئی مینٹر سے بات کریں - ",
    talkToMentorBtn: "مینٹر سے بات کریں",
    translatingLabels: "ترجمہ ہو رہا ہے...",
    startLearning: "سیکھنا شروع کریں",
    exploreMore: "مزید جانیں"
  },
  or: {
    availableSkills: "ଉପଲବ୍ଧ ଦକ୍ଷତା",
    learnNewSkills: "ନୂତନ ଦକ୍ଷତା ଶିଖନ୍ତୁ",
    connectingTo: "ଆପଣଙ୍କୁ ଜ୍ଞାନ ସହ ଯୋଡୁଛି - ",
    searchPlaceholder: "ଦକ୍ଷତା ସନ୍ଧାନ କରନ୍ତୁ...",
    browsingOffline: "ଆପଣ ଅଫଲାଇନରେ ଅଛନ୍ତି। କେବଳ ସେଭ୍ ହୋଇଥିବା ପାଠ୍ୟକ୍ରମ ଉପଲବ୍ଧ।",
    offlineMode: "ଅଫଲାଇନ୍ ମୋଡ୍",
    noSkillsFound: "କୌଣସି ଦକ୍ଷତା ମିଳିଲା ନାହିଁ",
    trySearchingElse: "ଚାଷ କିମ୍ବା ମୋବାଇଲ୍ ଭଳି କିଛି ସନ୍ଧାନ କରନ୍ତୁ।",
    clearSearch: "ସନ୍ଧାନ ସଫା କରନ୍ତୁ",
    needHelp: "ସାହାଯ୍ୟ ଦରକାର କି?",
    talkToMentorDesc: "ଆପଣଙ୍କ AI ମେଣ୍ଟରଙ୍କ ସହ କଥା ହୁଅନ୍ତು - ",
    talkToMentorBtn: "ମେଣ୍ଟରଙ୍କ ସହ କଥା ହୁଅନ୍ତು",
    translatingLabels: "ଅନୁବାଦ ହେଉଛି...",
    startLearning: "ଶିଖିବା ଆରମ୍ଭ କରନ୍ତು",
    exploreMore: "ଅଧିକ ଜାଣନ୍ତୁ"
  }
};

const CONTENT_LABELS: Record<string, ContentPageUiLabels> = {
  en: {
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
  },
  hi: {
    backToSkills: "कौशल पर वापस जाएं",
    preparingGuide: "आपकी गाइड तैयार की जा रही है",
    aiWriting: "ज्ञान AI लिख रहा है...",
    wrong: "कुछ गलत हो गया",
    tryAgain: "फिर से प्रयास करें",
    generateVideo: "वीडियो बनाएं",
    videoReady: "वीडियो तैयार है",
    starting: "शुरू हो रहा है...",
    generating: "बन रहा है...",
    saveOffline: "ऑफलाइन सहेजें",
    saved: "सहेजा गया",
    saving: "सहेज रहा है...",
    markComplete: "पूर्ण चिह्नित करें",
    generatingVideoGuide: "वीडियो गाइड बना रहा है",
    videoWaitMsg: "कृपया प्रतीक्षा करें जबकि हमारा AI इस कौशल के लिए एक कस्टम दृश्य मार्गदर्शिका बनाता है। इसमें आमतौर पर 1-2 मिनट लगते हैं।",
    videoPaused: "वीडियो जनरेशन रुका हुआ है"
  },
  bn: {
    backToSkills: "দক্ষতায় ফিরে যান",
    preparingGuide: "আপনার নির্দেশিকা প্রস্তুত করা হচ্ছে",
    aiWriting: "জ্ঞান এআই লিখছে...",
    wrong: "কিছু ভুল হয়েছে",
    tryAgain: "আবার চেষ্টা করুন",
    generateVideo: "ভিডিও তৈরি করুন",
    videoReady: "ভিডিও প্রস্তুত",
    starting: "শুরু হচ্ছে...",
    generating: "তৈরি হচ্ছে...",
    saveOffline: "অফলাইনে সংরক্ষণ",
    saved: "সংরক্ষিত",
    saving: "সংরক্ষণ করা হচ্ছে...",
    markComplete: "সম্পন্ন চিহ্নিত করুন",
    generatingVideoGuide: "ভিডিও নির্দেশিকা তৈরি করা হচ্ছে",
    videoWaitMsg: "দয়া করে অপেক্ষা করুন যখন আমাদের এআই এই দক্ষতার জন্য একটি কাস্টম ভিডিও নির্দেশিকা তৈরি করছে। এটি সাধারণত ১-২ মিনিট সময় নেয়।",
    videoPaused: "ভিডিও তৈরি সাময়িক স্থগিত"
  },
  as: {
    backToSkills: "দক্ষতালৈ ঘূৰি যাওক",
    preparingGuide: "আপোনাৰ গাইড প্ৰস্তুত কৰা হৈছে",
    aiWriting: "জ্ঞান এআইয়ে লিখি আছে...",
    wrong: "উত্তৰ পোৱাত ভুল হৈছে",
    tryAgain: "পুনৰ চেষ্টা কৰক",
    generateVideo: "ভিডিঅ’ প্ৰস্তুত কৰক",
    videoReady: "ভিডিঅ’ প্ৰস্তুত হ’ল",
    starting: "আৰম্ভ হৈছে...",
    generating: "প্ৰস্তুত হৈ আছে...",
    saveOffline: "অফলাইনত সংৰক্ষক",
    saved: "সংৰক্ষিত",
    saving: "সংৰক্ষণ কৰি থকা হৈছে...",
    markComplete: "সম্পূৰ্ণ বুলি চিহ্নিত কৰক",
    generatingVideoGuide: "ভিডিঅ’ গাইড প্ৰস্তুত কৰি থকা হৈছে",
    videoWaitMsg: "অনুগ্ৰহ কৰি অপেক্ষা কৰক যেতিয়ালৈকে আমাৰ এআইয়ে এই দক্ষতাৰ বাবে এটা সুন্দৰ ভিডিও প্ৰস্তুত কৰে। ইয়াৰ কাৰণে ১-২ মিনিট লাগিব পাৰে।",
    videoPaused: "ভিডিঅ’ প্ৰস্তুত কৰা বন্ধ হৈছে"
  },
  gu: {
    backToSkills: "કૌશલ્યો પર પાછા જાઓ",
    preparingGuide: "તમારી માર્ગદર્શિકા તૈયાર થઈ રહી છે",
    aiWriting: "જ્ઞાન એઆઈ લખી રહ્યું છે...",
    wrong: "કંઈક ખોટું થયું",
    tryAgain: "ફરી પ્રયત્ન કરો",
    generateVideo: "વિડિઓ બનાવો",
    videoReady: "વિડિઓ તૈયાર છે",
    starting: "શરૂ થઈ રહ્યું છે...",
    generating: "બની રહ્યું છે...",
    saveOffline: "ઑફલાઇન સાચવો",
    saved: "સાચવેલ",
    saving: "સાચવી રહ્યું છે...",
    markComplete: "પૂર્ણ તરીકે ચિહ્નિત કરો",
    generatingVideoGuide: "વિડિઓ માર્ગદર્શિકા બનાવી રહ્યા છીએ",
    videoWaitMsg: "કૃપા કરીને પ્રતીક્ષા કરો જ્યારે અમારું એઆઈ આ કૌશલ્ય માટે કસ્ટમ માર્ગદર્શિકા બનાવે છે. આમાં સામાન્ય રીતે ૧-૨ મિનિટ લાગે છે.",
    videoPaused: "વિડિઓ જનરેશન અટકી ગયું"
  },
  mr: {
    backToSkills: "कौशल्यांवर परत जा",
    preparingGuide: "तुमची मार्गदर्शिका तयार केली जात आहे",
    aiWriting: "ज्ञान एआय लिहीत आहे...",
    wrong: "काहीतरी चुकले",
    tryAgain: "पुन्हा प्रयत्न करा",
    generateVideo: "व्हिडिओ बनवा",
    videoReady: "व्हिडिओ तयार",
    starting: "सुरू होत आहे...",
    generating: "तयार होत आहे...",
    saveOffline: "ऑफलाइन साठवा",
    saved: "साठवले",
    saving: "साठवत आहे...",
    markComplete: "पूर्ण झाले म्हणून टिक करा",
    generatingVideoGuide: "व्हिडिओ मार्गदर्शिका बनवली जात आहे",
    videoWaitMsg: "कृपया प्रतीक्षा करा, आमचे एआय या कौशल्यासाठी एक खास व्हिडिओ मार्गदर्शिका तयार करत आहे. साधारणपणे १-२ मिनिटे लागतात.",
    videoPaused: "व्हिडिओ निर्मिती थांबली आहे"
  },
  ta: {
    backToSkills: "திறன்களுக்குத் திரும்பு",
    preparingGuide: "உங்கள் கையேடு தயாராகிறது",
    aiWriting: "அறிவு AI எழுதுகிறது...",
    wrong: "ஏதோ தவறு நடந்துவிட்டது",
    tryAgain: "மீண்டும் முயற்சிக்கவும்",
    generateVideo: "வீடியோவை உருவாக்கு",
    videoReady: "வீடியோ தயார்",
    starting: "தொடங்குகிறது...",
    generating: "உருவாகிறது...",
    saveOffline: "ஆஃப்லைனில் சேமிக்கவும்",
    saved: "சேமிக்கப்பட்டது",
    saving: "சேமிக்கப்படுகிறது...",
    markComplete: "முடிந்ததாகக் குறிக்கவும்",
    generatingVideoGuide: "வீடியோ கையேட்டை உருவாக்குகிறது",
    videoWaitMsg: "இந்த திறனுக்காக எங்கள் AI பிரத்யேக வீடியோவை உருவாக்கும் வரை பொறுத்திருக்கவும். இதற்கு 1-2 நிமிடங்கள் ஆகும்.",
    videoPaused: "வீடியோ உருவாக்கம் நிறுத்தப்பட்டுள்ளது"
  },
  te: {
    backToSkills: "నైపుణ్యాలకి తిరిగి వెళ్ళు",
    preparingGuide: "మీ గైడ్ సిద్ధమవుతోంది",
    aiWriting: "నాలెడ్జ్ AI రాస్తోంది...",
    wrong: "ఏదో తప్పు జరిగింది",
    tryAgain: "మళ్ళీ ప్రయత్నించండి",
    generateVideo: "వీడియో సృష్టించు",
    videoReady: "వీడియో సిద్ధంగా ఉంది",
    starting: "ప్రారంభమవుతోంది...",
    generating: "రూపొందుతోంది...",
    saveOffline: "ఆఫ్లైన్ లో దాచు",
    saved: "సేవ్ చేయబడింది",
    saving: "దాస్తోంది...",
    markComplete: "పూర్తయినట్లు గుర్తు పెట్టు",
    generatingVideoGuide: "వీడియో గైడ్ సృష్టిస్తోంది",
    videoWaitMsg: "దయచేసి మా AI ఈ నైపుణ్యం కోసం అనుకూల వీడియో గైడ్‌ని సృష్టించే వరకు వేచి ఉండండి. దీనికి 1-2 నిమిషాలు పడుతుంది.",
    videoPaused: "వీడియో సృష్టి తాత్కాలికంగా నిలిచింది"
  },
  kn: {
    backToSkills: "ಕೌಶಲ್ಯಗಳಿಗೆ ಹಿಂತಿರುಗಿ",
    preparingGuide: "ನಿಮ್ಮ ಮಾರ್ಗದರ್ಶಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ",
    aiWriting: "ಜ್ಞಾನ AI ಬರೆಯುತ್ತಿದೆ...",
    wrong: "ಏನೋ ತಪ್ಪಾಗಿದೆ",
    tryAgain: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    generateVideo: "ವಿಡಿಯೋ ತಯಾರಿಸಿ",
    videoReady: "ವಿಡಿಯೋ ಸಿದ್ಧವಿದೆ",
    starting: "ಪ್ರಾರಂಭವಾಗುತ್ತಿದೆ...",
    generating: "ತಯಾರಾಗುತ್ತಿದೆ...",
    saveOffline: "ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಉಳಿಸಿ",
    saved: "ಉಳಿಸಲಾಗಿದೆ",
    saving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ...",
    markComplete: "ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ಗುರುತಿಸಿ",
    generatingVideoGuide: "ವಿಡಿಯೋ ಮಾರ್ಗದರ್ಶಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ",
    videoWaitMsg: "ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ, ನಮ್ಮ AI ಈ ಕೌಶಲ್ಯಕ್ಕಾಗಿ ಕಸ್ಟಮ್ ವಿಡಿಯೋ ತಯಾರಿಸುತ್ತಿದೆ. ಇದು ಸಾಮಾನ್ಯವಾಗಿ ೧-೨ ನಿಮಿಷ ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ.",
    videoPaused: "ವಿಡಿಯೋ ತಯಾರಿಕೆ ಸ್ಥಗಿತಗೊಂಡಿದೆ"
  },
  ml: {
    backToSkills: "കഴിവുകളിലേക്ക് മടങ്ങുക",
    preparingGuide: "നിങ്ങൾക്കുള്ള ഗൈഡ് തയാറാകുന്നു",
    aiWriting: "നോളജ് AI എഴുതുകയാണ്...",
    wrong: "എന്തോ തകരാർ സംഭവിച്ചു",
    tryAgain: "ശ്രമിക്കുക",
    generateVideo: "വീഡിയോ തയാറാക്കുക",
    videoReady: "വീഡിയോ തയാറായി",
    starting: "ആരംഭിക്കുന്നു...",
    generating: "തയാറാക്കുന്നു...",
    saveOffline: "ഓഫ്‌ലൈനായി സൂക്ഷിക്കുക",
    saved: "സൂക്ഷിച്ചു",
    saving: "സൂക്ഷിക്കുന്നു...",
    markComplete: "പൂർത്തിയായതായി അടയാളപ്പെടുത്തുക",
    generatingVideoGuide: "വീഡിയോ ഗൈഡ് തയാറാക്കുന്നു",
    videoWaitMsg: "ഈ കഴിവിനായി ഞങ്ങളുടെ എഐ ഒരു വീഡിയോ ഗൈഡ് നിർമ്മിക്കുന്നതുവരെ ദയവായി കാത്തിരിക്കുക. ഇതിന് 1-2 മിനിറ്റ് സമയമെടുക്കും.",
    videoPaused: "വീഡിയോ നിർമ്മാണം താൽക്കാലികമായി തടസ്സപ്പെട്ടു"
  },
  pa: {
    backToSkills: "ਹੁਨਰਾਂ 'ਤੇ ਵਾਪਸ ਜਾਓ",
    preparingGuide: "ਤੁਹਾਡੀ ਗਾਈਡ ਤਿਆਰ ਹੋ ਰਹੀ ਹੈ",
    aiWriting: "ਗਿਆਨ ਏਆਈ ਲਿਖ ਰਿਹਾ ਹੈ...",
    wrong: "ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ",
    tryAgain: "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
    generateVideo: "ਵੀਡੀਓ ਬਣਾਓ",
    videoReady: "ਵੀਡੀਓ ਤਿਆਰ ਹੈ",
    starting: "ਸ਼ੁਰੂ ਹੋ ਰਿਹਾ ਹੈ...",
    generating: "ਬਣ ਰਿਹਾ ਹੈ...",
    saveOffline: "ਆਫਲਾਈਨ ਸੰਭਾਲੋ",
    saved: "ਸੰਭਾਲਿਆ ਗਿਆ",
    saving: "ਸੰਭਾਲ ਰਿਹਾ ਹੈ...",
    markComplete: "ਪੂਰਾ ਹੋਇਆ ਚਿੰਨ੍ਹਿਤ ਕਰੋ",
    generatingVideoGuide: "ਵੀਡੀਓ ਗਾਈਡ ਤਿਆਰ ਕਰ ਰਿਹਾ ਹੈ",
    videoWaitMsg: "ਕਿਰਪਾ ਕਰਕੇ ਉਡੀਕ ਕਰੋ ਜਦੋਂ ਤੱਕ ਸਾਡਾ ਏਆਈ ਇਸ ਹੁਨਰ ਲਈ ਵੀਡੀਓ ਤਿਆਰ ਕਰਦਾ ਹੈ। ਇਸ ਵਿੱਚ ਆਮ ਤੌਰ 'ਤੇ ੧-੨ ਮਿੰਟ ਲੱਗਦੇ ਹਨ।",
    videoPaused: "ਵੀਡੀਓ ਬਣਨਾ ਰੁਕਿਆ"
  },
  ur: {
    backToSkills: "ہنر پر واپس جائیں",
    preparingGuide: "آپ کا رہنما تیار کیا جا رہا ہے",
    aiWriting: "نالج اے آئی لکھ رہا ہے...",
    wrong: "کچھ غلط ہو گیا ہے",
    tryAgain: "دوبارہ کوشش کریں",
    generateVideo: "ویڈیو بنائیں",
    videoReady: "ویڈیو تیار ہے",
    starting: "شروع ہو رہا ہے...",
    generating: "بن رہا ہے...",
    saveOffline: "آف لائن محفوظ کریں",
    saved: "محفوظ ہو گیا",
    saving: "محفوظ ہو رہا ہے...",
    markComplete: "مکمل نشان زد کریں",
    generatingVideoGuide: "ویڈیو گائیڈ بنائی جا رہی ہے",
    videoWaitMsg: "براہ کرم انتظار کریں جب تک ہمارا اے آئی اس ہنر کے لیے ایک کسٹم ویڈیو گائیڈ بنائے۔ اس میں عام طور پر ۱-۲ منٹ لگتے ہیں۔",
    videoPaused: "ویڈیو بننا رک گیا"
  },
  or: {
    backToSkills: "ଦକ୍ଷତାକୁ ଫେରନ୍ତୁ",
    preparingGuide: "ଆପଣଙ୍କ ଗାଇଡ୍ ପ୍ରସ୍ତୁତ ରହିଛି",
    aiWriting: "ଜ୍ଞାନ AI ଲେଖୁଛି...",
    wrong: "କିଛି ଭୁଲ୍ ହେଲା",
    tryAgain: "ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ",
    generateVideo: "ଭିଡିଓ ପ୍ରସ୍ତୁତ କରନ୍ତୁ",
    videoReady: "ଭିଡିଓ ପ୍ରସ୍ତୁତ",
    starting: "ଆରମ୍ଭ ହେଉଛି...",
    generating: "ତିଆରି ହେଉଛି...",
    saveOffline: "ଅଫଲାଇନ୍ ସେଭ୍ କରନ୍ତୁ",
    saved: "ସେଭ୍ ହେଲା",
    saving: "ସେଭ୍ ହେଉଛି...",
    markComplete: "ପୂର୍ଣ୍ଣ ଚିହ୍ନିତ କରନ୍ତୁ",
    generatingVideoGuide: "ଭିଡିଓ ଗାଇଡ୍ ପ୍ରସ୍ତុତ ହେଉଛି",
    videoWaitMsg: "ଦୟାକରି ଅପେକ୍ଷା କରନ୍ତୁ, ଆମର ଏଆଇ ଏହି ଦକ୍ଷତା ପାଇଁ ଗୋଟିଏ ସୁନ୍ଦର ଭିଡ଼ିଓ ପ୍ରସ୍ତୁତ କରୁଛି। ଏଥିପାଇଁ ୧-୨ ମିନିଟ୍ ଲାଗିବ।",
    videoPaused: "ଭିଡ଼ିଓ ପ୍ରସ୍ତୁତି ବନ୍ଦ ହୋଇଛି"
  }
};

const DIFFICULTY_LABELS: Record<string, DifficultySelectorUiLabels> = {
  en: {
    title: "Select Your Level",
    subtitle: "Choose how detailed you want the guide to be.",
    beginnerLabel: "Beginner",
    beginnerDesc: "Basic concepts and simple steps.",
    intermediateLabel: "Intermediate",
    intermediateDesc: "Detailed guides for those with basic knowledge.",
    advancedLabel: "Advanced",
    advancedDesc: "Expert tips and advanced techniques."
  },
  hi: {
    title: "अपना स्तर चुनें",
    subtitle: "चुनें कि आप गाइड को कितना विस्तृत चाहते हैं।",
    beginnerLabel: "शुरुआती",
    beginnerDesc: "बुनियादी बातें और सरल कदम।",
    intermediateLabel: "मध्यवर्ती",
    intermediateDesc: "बुनियादी ज्ञान रखने वालों के लिए विस्तृत गाइड।",
    advancedLabel: "उन्नत",
    advancedDesc: "विशेषज्ञ युक्तियाँ और उन्नत तकनीकें।"
  },
  bn: {
    title: "আপনার স্তর নির্বাচন করুন",
    subtitle: "আপনি গাইডটি কতটা বিস্তারিত চান তা চয়ন করুন।",
    beginnerLabel: "প্রাথমিক",
    beginnerDesc: "মৌলিক ধারণা এবং সহজ পদক্ষেপ সমূহ।",
    intermediateLabel: "মধ্যবর্তী",
    intermediateDesc: "বেসিক জ্ঞানসম্পন্ন ব্যক্তিদের জন্য বিস্তারিত গাইড।",
    advancedLabel: "উন্নত",
    advancedDesc: "বিশেষজ্ঞদের পরামর্শ এবং উন্নত কৌশল সমূহ।"
  },
  as: {
    title: "আপোনাৰ স্তৰ বাছক",
    subtitle: "আপুনি গাইডখন কিমান বিতংভাৱে বিচাৰে তাক বাছক।",
    beginnerLabel: "প্ৰাথমিক",
    beginnerDesc: "সাধাৰণ ধাৰণা আৰু সহজ পদক্ষেপসমূহ।",
    intermediateLabel: "মধ্যৱৰ্তী",
    intermediateDesc: "সাধাৰণ জ্ঞান থকাসকলৰ বাবে বিতং গাইড।",
    advancedLabel: "উন্নত",
    advancedDesc: "অভিজ্ঞ ব্যক্তিসকলৰ পৰামৰ্শ আৰু উন্নত পদ্ধতি।"
  },
  gu: {
    title: "તમારી કક્ષા પસંદ કરો",
    subtitle: "નિયત કરો કે તમે માર્ગદર્શિકા કેટલી વિગતવાર ઇચ્છો છો.",
    beginnerLabel: "શરૂઆતી",
    beginnerDesc: "પાકટ ખ્યાલો અને સરળ પગલાં.",
    intermediateLabel: "મધ્યવર્તી",
    intermediateDesc: "મૂળભૂત જ્ઞાન ધરાવતા લોકો માટે વિગતવાર માર્ગદર્શિકା.",
    advancedLabel: "અદ્યતન",
    advancedDesc: "નિષ્ણાંત ટિપ્સ અને અદ્યતન તકનીકો."
  },
  mr: {
    title: "तुमची पातळी निवडा",
    subtitle: "तुम्हाला ही मार्गदर्शिका किती सविस्तर हवी आहे ते निवडा.",
    beginnerLabel: "शिकणारा",
    beginnerDesc: "मूलभूत संकल्पना आणि सोप्या पायऱ्या.",
    intermediateLabel: "मध्यम",
    intermediateDesc: "मूलभूत ज्ञान असणाऱ्यांसाठी सविस्तर मार्गदर्शिका.",
    advancedLabel: "प्रगत",
    advancedDesc: "तज्ज्ञांचे सल्ले आणि प्रगत तंत्रे."
  },
  ta: {
    title: "உங்கள் நிலையைத் தேர்வு செய்க",
    subtitle: "வழிகாட்டி எவ்வளவு விரிவாக இருக்க வேண்டும் என்பதைத் தேர்ந்தெடுக்கவும்.",
    beginnerLabel: "தொடக்க நிலை",
    beginnerDesc: "அடிப்படை கருத்துக்கள் மற்றும் எளிய வழிமுறைகள்.",
    intermediateLabel: "இடைநிலை",
    intermediateDesc: "அடிப்படை அறிவு உள்ளவர்களுக்கான விரிவான வழிகாட்டி.",
    advancedLabel: "மேம்பட்ட நிலை",
    advancedDesc: "நிபுணர் குறிப்புகள் மற்றும் மேம்பட்ட நுட்பங்கள்."
  },
  te: {
    title: "మీ స్థాయిని ఎంచుకోండి",
    subtitle: "ఈ గైడ్ ఎంత వివరంగా ఉండాలో ఎంచుకోండి.",
    beginnerLabel: "ప్రారంభ స్థాయి",
    beginnerDesc: "ప్రాథమిక భావనలు మరియు సులభమైన దశలు.",
    intermediateLabel: "మధ్యస్థ స్థాయి",
    intermediateDesc: "ప్రాథమిక అవగాహన ఉన్నవారి కోసం వివరణాత్మక గైడ్.",
    advancedLabel: "ఉన్నత స్థాయి",
    advancedDesc: "నిపుణుల చిట్కాలు మరియు అధునాతన పద్ధతులు."
  },
  kn: {
    title: "ನಿಮ್ಮ ಮಟ್ಟವನ್ನು ಆರಿಸಿ",
    subtitle: "ಮಾರ್ಗದರ್ಶಿ ಎಷ್ಟು ವಿವರವಾಗಿರಬೇಕು ಎಂಬುದನ್ನು ಆರಿಸಿ.",
    beginnerLabel: "ಪ್ರಾರಂಭಿಕ",
    beginnerDesc: "ಮೂಲ ಪರಿಕಲ್ಪನೆಗಳು ಮತ್ತು ಸರಳ ಹಂತಗಳು.",
    intermediateLabel: "ಮಧ್ಯಂತರ",
    intermediateDesc: "ಮೂಲ ಜ್ಞಾನವಿರುವವರಿಗೆ ವಿವರವಾದ ಮಾರ್ಗದರ್ಶಿ.",
    advancedLabel: "ಸುಧಾರಿತ",
    advancedDesc: "ತಜ್ಞರ ಸಲಹೆಗಳು ಮತ್ತು ಸುಧಾರಿತ ತಂತ್ರಗಳು."
  },
  ml: {
    title: "നിങ്ങളുടെ തല തിരഞ്ഞെടുക്കുക",
    subtitle: "ഗൈഡ് എത്രത്തോളം വിശദമായിരിക്കണമെന്ന് തിരഞ്ഞെടുക്കുക.",
    beginnerLabel: "തുടക്കക്കാരൻ",
    beginnerDesc: "അടിസ്ഥാന ആശയങ്ങളും ലളിതമായ ഘട്ടങ്ങളും.",
    intermediateLabel: "ഇടത്തരം",
    intermediateDesc: "അടിസ്ഥാന അറിവുള്ളവർക്കായി കൂടുതൽ വിശദമായ വിവരങ്ങൾ.",
    advancedLabel: "വിദഗ്ദ്ധൻ",
    advancedDesc: "വിദഗ്ദ്ധ നിർദ്ദേശങ്ങളും മികച്ച സാങ്കേതിക വിദ്യകളും."
  },
  pa: {
    title: "ਆਪਣਾ ਪੱਧਰ ਚੁਣੋ",
    subtitle: "ਚੁਣੋ ਕਿ ਤੁਸੀਂ ਗਾਈਡ ਕਿੰਨੀ ਵਿਸਤ੍ਰਿਤ ਚਾਹੁੰਦੇ ਹੋ।",
    beginnerLabel: "ਸ਼ੁਰੂਆਤੀ",
    beginnerDesc: "ਬੁਨਿਆਦੀ ਸੰਕਲਪ ਅਤੇ ਸਰਲ ਕਦਮ।",
    intermediateLabel: "ਦਰਮਿਆਨਾ",
    intermediateDesc: "ਬੁਨਿਆਦੀ ਗਿਆਨ ਰੱਖਣ ਵਾਲਿਆਂ ਲਈ ਵਿਸਤ੍ਰਿਤ ਗਾਈਡ।",
    advancedLabel: "ਉੱਨਤ",
    advancedDesc: "ਮਾਹਰ ਸੁਝਾਅ ਅਤੇ ਉੱਨत ਤਕਨੀਕਾਂ।"
  },
  ur: {
    title: "اپنا لیول منتخب کریں",
    subtitle: "انتخاب کریں کہ آپ کو رہنما کتنا تفصیلی چاہیے۔",
    beginnerLabel: "ابتدائی",
    beginnerDesc: "بنیادی تصورات اور آسان طریقے ۔",
    intermediateLabel: "درمیانی",
    intermediateDesc: "بنیادی معلومات کے حامل لوگوں کے لیے تفصیلی گائیڈ۔",
    advancedLabel: "اعلیٰ",
    advancedDesc: "ماہرین کے مشورے اور جدید طریقے ۔"
  },
  or: {
    title: "ଆପଣଙ୍କ ସ୍ତର ବାଛନ୍ତୁ",
    subtitle: "ଗାଇଡ୍ କେତେ ବିସ୍ତୃତ ଭାବେ ଚାହୁଁଛନ୍ତି ତାହା ବାଛନ୍ତୁ।",
    beginnerLabel: "ପ୍ରାରମ୍ଭିକ",
    beginnerDesc: "ସାଧାରଣ ଧାରଣା ଏବଂ ସହଜ ପଦକ୍ଷେପ।",
    intermediateLabel: "ମଧ୍ୟବର୍ତ୍ତୀ",
    intermediateDesc: "ଠିକ୍ ଜ୍ଞାନ ଥିବା ଲୋକଙ୍କ ପାଇଁ ବିସ୍ତୃତ ଗାଇଡ୍।",
    advancedLabel: "ଉନ୍ନତ",
    advancedDesc: "ବିଶେଷଜ୍ଞଙ୍କ ପରାମର୍ଶ ଓ ଉନ୍ନତ ପ୍ରଣାଳୀ।"
  }
};

const CATEGORIES_TRANSLATIONS: Record<string, Record<string, { title: string; description: string }>> = {
  hi: {
    farming: { title: "आधुनिक खेती", description: "प्राकृतिक उर्वरकों, फसल चक्र और पानी की बचत के बारे में जानें।" },
    finance: { title: "बुनियादी वित्त", description: "बैंक खातों, बचत और सरकारी योजनाओं को समझना।" },
    health: { title: "स्वास्थ्य और स्वच्छता", description: "हाथ धोना, स्वच्छ पेयजल और बाल पोषण।" },
    digital: { title: "मोबाइल कौशल", description: "व्हाट्सएप, भुगतान और ऑनलाइन फॉर्म का सुरक्षित रूप से उपयोग कैसे करें।" },
    handicrafts: { title: "हस्तशिल्प", description: "स्थानीय बाजारों या ऑनलाइन वस्तुओं को बनाना और बेचना।" }
  },
  bn: {
    farming: { title: "আধুনিক চাষাবাদ", description: "জৈব সার, শস্য পর্যায় ও জল সাশ্রয় এর উপায় জানুন।" },
    finance: { title: "সহজ অর্থব্যবস্থা", description: "ব্যাঙ্ক অ্যাকাউন্ট, সঞ্চয়ী যোজনা ও সরকারি স্কিম বুঝুন।" },
    health: { title: "স্বাস্থ্য ও পরিচ্ছন্নতা", description: "হাত ধোয়া, বিশুদ্ধ পানীয় জল ও শিশুর পুষ্টি সম্পর্ক জানুন।" },
    digital: { title: "মোবাইল দক্ষতা", description: "হোয়াটসঅ্যাপ চালানো, পেমেন্ট এবং অনলাইন ফর্ম ভরার সঠিক নিয়ম।" },
    handicrafts: { title: "হস্তশিল্প", description: "ঘরে বসেই হস্তশিল্প প্রস্তুত এবং মেলায় বা অনলাইনে কেনা-বেচা।" }
  },
  as: {
    farming: { title: "আধুনিক কৃষিকাৰ্য", description: "জৈৱিক সাৰ, শস্য পৰ্যায় আৰু পানী ৰাহি কৰা শিকক।" },
    finance: { title: "প্ৰাথমিক বিত্ত", description: "বেংক একাউণ্ট, সঞ্চয় আৰু চৰকাৰী আঁচনি বুজি লওক।" },
    health: { title: "স্বাস্থ্য আৰু পৰিষ্কাৰ-পৰিচ্ছন্নতা", description: "হাত ধোৱা, বিশুদ্ধ খোৱাপানী আৰু শিশুৰ পুষ্টি।" },
    digital: { title: "ম’বাইল দক্ষতা", description: "হোৱাটছএপ, ডিজিটেল পৰিশোধ আৰু অনলাইন ফর্ম সুৰক্ষিতভাৱে ব্যৱহাৰ কৰক।" },
    handicrafts: { title: "হস্তশিল্প", description: "স্থানীয় বজাৰ বা অনলাইনত হস্তশিল্প প্ৰস্তুত আৰু বিক্ৰী।" }
  },
  gu: {
    farming: { title: "આધુનિક ખેતી", description: "કુદરતી ખાતર, પાક ચક્ર અને પાણી બચાવવાની પદ્ધતિઓ વિશે શીખો." },
    finance: { title: "પાયાનું નાણાકીય આયોજન", description: "બેંક ખાતા, બચત અને સરકારી યોજનાઓને સમજવી." },
    health: { title: "આરોગ્ય અને સ્વચ્છતા", description: "હાથ ધોવાની રીત, શુદ્ધ પીવાનું પાણી અને બાળ પોષણ." },
    digital: { title: "મોબાઇલ કૌશલ્ય", description: "વોટ્સએપ, ઓનલાઈન ચુકવણી અને ફોર્મ સબમિટ કરવાનો સુરક્ષિત ઉપયોગ." },
    handicrafts: { title: "હસ્તકળા", description: "સ્થાનિક બજારો અથવા ઓનલાઈન વસ્તુઓ બનાવી વેચવી." }
  },
  mr: {
    farming: { title: "आधुनिक शेती", description: "सेंद्रिय खते, पीक चक्र आणि पाण्याचा मर्यादित वापर याबद्दल शिका." },
    finance: { title: "मूलभूत वित्त नियोजन", description: "बँक खाती, अल्पबचत आणि सरकारी कल्याणकारी योजना जाणून घ्या." },
    health: { title: "आरोग्य व स्वच्छता", description: "हात स्वच्छ धुणे, शुद्ध पिण्याचे पाणी आणि लहान मुलांचे पोषण." },
    digital: { title: "मोबाईल कौशल्ये", description: "व्हॉट्सॲप, युपीआय पेमेंट आणि सुरक्षित फॉर्म भरणे शिका." },
    handicrafts: { title: "हस्तकला व कुटीर उद्योग", description: "उत्कृष्ट हस्तकला वस्तू तयार करून स्थानिक बाजारात किंवा ऑनलाईन विक्री." }
  },
  ta: {
    farming: { title: "நவீன விவசாயம்", description: "இயற்கை உரங்கள், பயிர் சுழற்சி மற்றும் நீர் சேமிப்பு பற்றி கற்றுக்கொள்ளுங்கள்." },
    finance: { title: "அடிப்படை நிதி", description: "வங்கி கணக்குகள், சேமிப்புகள் மற்றும் அரசு திட்டங்களைப் புரிந்து கொள்ளுதல்." },
    health: { title: "சுகாதாரம் மற்றும் சுத்தம்", description: "கை கழுவுதல், சுத்தமான குடிநீர் மற்றும் குழந்தைகள் ஊட்டச்சத்து." },
    digital: { title: "மொபைல் திறன்கள்", description: "வாட்ஸ்அப், பாதுகாப்பான பணம் செலுத்துதல் மற்றும் படிவங்களை நிரப்புதல்." },
    handicrafts: { title: "கைவினைப் பொருட்கள்", description: "கைவினைப் பொருட்களை தயாரித்து உள்ளூர் சந்தைகளில் அல்லது ஆன்லைனில் விற்பது." }
  },
  te: {
    farming: { title: "ఆధునిక వ్యవసాయం", description: "సేంద్రియ ఎరువులు, పంట మార్పిడి మరియు నీటి సంరక్షణ గురించి నేర్చుకోండి." },
    finance: { title: "ప్రాథమిక ఆర్థిక అవగాహన", description: "బ్యాంకు ఖాతాలు, పొదుపు మరియు ప్రభుత్వ పథకాలను అర్థం చేసుకోవడం." },
    health: { title: "ఆరోగ్యం మరియు పరిశుభ్రత", description: "చేతులు కడుక్కోవడం, సురక్షిత త్రాగునీరు మరియు పిల్లల పోషకాహారం." },
    digital: { title: "మొబైల్ నైపుణ్యాలు", description: "వాట్సాప్, ఆన్లైన్ పేమెంట్లు మరియు ఫారమ్లను సురక్షితంగా ఉపయోగించడం." },
    handicrafts: { title: "చేతిపనులు", description: "చేతి పనులు నేర్చుకుని వాటిని స్థానిక మార్కెట్లలో లేదా ఆన్లైన్లో అమ్మడం." }
  },
  kn: {
    farming: { title: "ಆಧುನಿಕ ಕೃಷಿ", description: "ನೈಸರ್ಗಿಕ ಗೊಬ್ಬರಗಳು, ಬೆಳೆ ಚಕ್ರಗಳು ಮತ್ತು ನೀರು ಉಳಿಸುವಿಕೆಯ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ." },
    finance: { title: "ಮೂಲಭೂತ ಹಣಕಾಸು", description: "ಬ್ಯಾಂಕ್ ಖಾತೆಗಳು, ಉಳಿತಾಯ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ." },
    health: { title: "ಆರೋಗ್ಯ ಮತ್ತು ನೈರ್ಮಲ್ಯ", description: "ಕೈ ತೊಳೆಯುವುದು, ಶುದ್ಧ ಕುಡಿಯುವ ನೀರು ಮತ್ತು ಮಕ್ಕಳ ಪೌಷ್ಟಿಕತೆ." },
    digital: { title: "ಮೊಬೈಲ್ ಕೌಶಲ್ಯಗಳು", description: "ವಾಟ್ಸಾಪ್, ಹಣ ಪಾವತಿಗಳು ಮತ್ತು ಆನ್‌ಲೈನ್ ಫಾರ್ಮ್‌ಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಬಳಸುವುದು." },
    handicrafts: { title: "ಕರಕುಶಲ ಕಲೆಗಳು", description: "ವಸ್ತುಗಳನ್ನು ತಯಾರಿಸಿ ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಅಥವಾ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಮಾರಾಟ ಮಾಡಿ." }
  },
  ml: {
    farming: { title: "ആധുനിക കൃഷി", description: "ജൈവ വളങ്ങൾ, വിള പരിക്രമണം, ജലസംരക്ഷണം എന്നിവ പഠിക്കുക." },
    finance: { title: "അടിസ്ഥാന സാമ്പത്തികം", description: "ബാങ്ക് അക്കൗണ്ടുകൾ, സമ്പാദ്യം, സർക്കാർ പദ്ധതികൾ എന്നിവ മനസ്സിലാക്കുക." },
    health: { title: "ആരോഗ്യവും ശുചിത്വവും", description: "കൈ കഴുകൽ, ശുദ്ധജലം, കുട്ടികളുടെ പോഷകാഹാരം." },
    digital: { title: "മൊബൈൽ വൈദഗ്ദ്ധ്യം", description: "വാട്സാപ്പ്, പണമിടപാടുകൾ, ഓൺലൈൻ അപേക്ഷകൾ എന്നിവ സുരക്ഷിതമായി ഉപയോഗിക്കുക." },
    handicrafts: { title: "കൈவினைവസ്തുക്കൾ", description: "കൈவினை വസ്തുക്കൾ നിർമ്മിച്ച് പ്രാദേശിക വിപണിയിലോ ഓൺലൈനിലോ വിൽക്കുക." }
  },
  pa: {
    farming: { title: "ਆਧੁਨਿਕ ਖੇਤੀਬਾੜੀ", description: "ਜੈਵਿਕ ਖਾਦਾਂ, ਫਸਲੀ ਚੱਕਰ ਅਤੇ ਪਾਣੀ ਦੀ ਬਚਤ ਬਾਰੇ ਸਿੱਖੋ।" },
    finance: { title: "ਬੁਨਿਆਦੀ ਵਿੱਤ", description: "ਬੈਂਕ ਖਾਤੇ, ਬਚਤ ਅਤੇ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਬਾਰੇ ਜਾਣਕਾਰੀ ਪ੍ਰਾਪਤ ਕਰੋ।" },
    health: { title: "ਸਿਹਤ ਅਤੇ ਸਫ਼ਾਈ", description: "ਹੱਥ ਧੋਣਾ, ਸਾਫ਼ ਪੀਣ ਵਾਲਾ ਪਾਣੀ ਅਤੇ ਬੱਚਿਆਂ ਦੀ ਖ਼ੁਰਾਕ।" },
    digital: { title: "ਮੋਬਾਈਲ ਹੁਨਰ", description: "ਵਟਸਐਪ, ਪੇਮੈਂਟ ਅਤੇ ਆਨਲਾਈਨ ਫਾਰਮਾਂ ਦੀ ਸੁਰੱਖਿਅਤ ਵਰਤੋਂ।" },
    handicrafts: { title: "ਹੱਥੀਂ ਬਣਾਈਆਂ ਚੀਜ਼ਾਂ", description: "ਆਪਣੇ ਹੱਥੀਂ ਬਣਾਈਆਂ ਚੀਜ਼ਾਂ ਨੂੰ ਸਥਾਨਕ ਮੰਡੀ ਜਾਂ ਆਨਲਾਈਨ ਵੇਚਣਾ।" }
  },
  ur: {
    farming: { title: "جدید کاشتکاری", description: "قدرتی کھادوں، فصلوں کے چکر اور پانی کی بچت کے بارے میں جانیں۔" },
    finance: { title: "بنیادی فنانس", description: "بینک اکاؤنٹس، بچت اور سرکاری اسکیموں کو سمجھیں۔" },
    health: { title: "صحت اور صفائی", description: "ہاتھوں کا دھونا، پینے کا صاف پانی اور بچوں کی غذائیت۔" },
    digital: { title: "موبائل ہنر", description: "واٹس ایپ، ڈیجیٹల్ ادائیگیوں اور آن لائن فارمز کا محفوظ استعمال۔" },
    handicrafts: { title: "دستکاری", description: "دستکاری کی چیزیں بنانا اور مقامی بازاروں یا آن لائن فروخت کرنا۔" }
  },
  or: {
    farming: { title: "ଆଧୁନିକ ଚାଷ", description: "ଜୈବିକ ସାର, ଫସଲ ଚକ୍ର ଏବଂ ଜଳ ସଞ୍ଚୟ ବିଷୟରେ ଶିଖନ୍ତୁ।" },
    finance: { title: "ସାଧାରଣ ଆର୍ଥିକ ଜ୍ଞាន", description: "ବ୍ୟାଙ୍କ ଆକାଉଣ୍ଟ୍, ଜମା ଶୈଳୀ ଏବ့ ଚରକାରୀ ଯୋଜନା ବୁଝନ୍ତୁ।" },
    health: { title: "ସ୍ବାସ୍ଥ୍ୟ ଓ ପରିମଳ", description: "ହାତ ଧୋଇବା, ସ୍ୱଚ୍ଛ ପାନୀୟ ଜଳ ଏବଂ ଶିଶୁର ଉପଯୁକ୍ତ ପୋଷଣ।" },
    digital: { title: "ମୋବାଇଲ୍ ବ୍ୟବହାର ଜ୍ଞាន", description: "ହ୍ୱାଟ୍ସଆପ୍, ପେମେଣ୍ଟ ଓ ଅନଲାଇନ୍ ଫର୍ମ ପ୍ରକ୍ରିୟାର ସୁରକ୍ಷିତ ଉପଯୋଗ।" },
    handicrafts: { title: "ହସ୍ତଶିଳ୍ପ", description: "ଘରୋଇ ସ୍ତରରେ ହସ୍ତଶିଳ୍ପ ସାମଗ୍ରୀ ପ୍ରସ୍ତୁତି ଓ ସେଗୁଡ଼ିକୁ ବିକ୍ରୟ କରିବା।" }
  }
};

// Return a layout mapping or smart fallback for script/language similarity
function findNearestLanguageCode(langCode: string): string {
  const code = (langCode || "").toLowerCase();
  
  // Directly supported languages in dictionaries
  if (["en", "hi", "bn", "as", "gu", "mr", "ta", "te", "kn", "ml", "pa", "ur", "or"].includes(code)) {
    return code;
  }
  
  // Script / Geographic fallbacks to ensure every single one of the 23 languages gets a translated layout
  if (["brx", "doi", "ks", "gom", "mai", "ne", "sa", "sat"].includes(code)) {
    // Devnagari script languages find Hindi very intuitive and legible
    return "hi";
  }
  if (["mni"].includes(code)) {
    // Manipuri/Meitei uses Bengali script
    return "bn";
  }
  if (["sd"].includes(code)) {
    // Sindhi utilizes Arabic script predominantly
    return "ur";
  }
  
  return "en";
}

export function getTranslatedCategories(langCode: string): SkillCategory[] {
  const resolvedCode = findNearestLanguageCode(langCode);
  const translations = CATEGORIES_TRANSLATIONS[resolvedCode];
  
  if (!translations) {
    return CATEGORIES;
  }
  
  return CATEGORIES.map(cat => {
    const translation = translations[cat.id];
    return translation ? { ...cat, title: translation.title, description: translation.description } : cat;
  });
}

export function getTranslatedUiLabels(langCode: string, original: DashboardUiLabels): DashboardUiLabels {
  const resolvedCode = findNearestLanguageCode(langCode);
  return DASHBOARD_LABELS[resolvedCode] || original;
}

export function getTranslatedContentPageLabels(langCode: string, original: ContentPageUiLabels): ContentPageUiLabels {
  const resolvedCode = findNearestLanguageCode(langCode);
  return CONTENT_LABELS[resolvedCode] || original;
}

export function getTranslatedDifficulty(langCode: string, original: DifficultySelectorUiLabels): DifficultySelectorUiLabels {
  const resolvedCode = findNearestLanguageCode(langCode);
  return DIFFICULTY_LABELS[resolvedCode] || original;
}
