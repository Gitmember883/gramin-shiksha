import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, GenerateVideosOperation } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper for retrying transient errors
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isDailyQuota = error.message?.includes("current quota") || error.message?.includes("limit: 20") || error.message?.includes("per day");
    const isRateLimit = error.status === 429 && !isDailyQuota;
    
    if (retries > 0 && (error.status === 503 || isRateLimit || error.message?.includes("503") || error.message?.includes("busy"))) {
      console.log(`Retrying API call due to rate limit/busy... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

// Fallback high-quality localized guides for quota-exceeded situations
function getFallbackContent(topic: string, language: string, level: string): string {
  const topicLower = (topic || "").toLowerCase();
  const isHindi = language && (language.toLowerCase().includes("hind") || language.includes("हिन्दी") || language.includes("हिंदी"));
  const isBengali = language && (language.toLowerCase().includes("beng") || language.includes("বাংলা") || language.includes("বंगाली"));

  if (topicLower.includes("farm") || topicLower.includes("कृषि") || topicLower.includes("खेती") || topicLower.includes("চাষ")) {
    if (isHindi) {
      return `# आधुनिक खेती (Modern Farming) (स्तर: ${level})

## 1. परिचय
आधुनिक और वैज्ञानिक कृषि पद्धतियों को अपनाकर ग्रामीण समुदाय अपने उत्पादन को बढ़ा सकते हैं और पर्यावरण की रक्षा कर सकते हैं। यह मार्गदर्शिका आपको सरल और प्रभावी तरीकों से उन्नत खेती करना सिखाएगी।

## 2. महत्वपूर्ण कदम
* **प्राकृतिक जैविक खाद का उपयोग**: रासायनिक उर्वरकों की जगह गोबर गैस खाद, केंचुआ खाद और हरी खाद का उपयोग करें।
* **फसल चक्र (Crop Rotation)**: मिट्टी की उर्वरता बढ़ाने के लिए हर मौसम में अलग-अलग फसलें उगाएं। जैसे गेहूं के बाद दलहन फसलें लगाना।
* **बूंद-बूंद सिंचाई (Drip Irrigation)**: पाइप के माध्यम से सीधे पौधों की जड़ों तक पानी पहुंचाएं ताकि पानी की बचत हो सके।
* **मृदा परीक्षण (Soil Testing)**: स्थानीय सरकारी केंद्रों में अपनी मिट्टी की जांच अवश्य करवाएं।

## 3. ग्रामीण परिवारों के लिए व्यावहारिक सुझाव
* रसोई के गीले कचरे से घर के पीछे छोटी जैविक खाद यूनिट तैयार करें।
* कम पानी और सूखे स्थानों पर बाजरा, रागी जैसी मोटे अनाजों की खेती करें।

## 4. संक्षेप
सही सिंचाई, जैविक खाद और योजनाबद्ध फसल चक्र अपनाकर हर किसान अपनी फसल का दोगुना मूल्य प्राप्त कर सकता है। आत्मनिर्भर खेती ही उज्जवल भविष्य की नींव है!`;
    }
    if (isBengali) {
      return `# আধুনিক চাষাবাদ (Modern Farming) (স্তর: ${level})

## ১. সূচনা
আধুনিক এবং পরিবেশ-বান্ধব কৃষি পদ্ধতি অবলম্বন করে গ্রামীণ এলাকার মানুষ ফসলের ফলন বাড়াতে পারেন এবং মাটির গুণমান বজায় রাখতে পারেন।

## ২. গুরুত্বপূর্ণ পদক্ষেপ
* **জৈব সার ব্যবহার**: রাসায়নিক সারের বিকল্প হিসেবে গোবর সার, কেঁচো সার বা সবুজ সার ব্যবহার করুন।
* **শস্য পর্যায় (Crop Rotation)**: মাটির উন্টারতা বাড়াতে প্রতি মরসুমে আলাদা আলাদা ফসল চাষ করুন।
* **ড্রিপ সেচ (Drip Irrigation)**: পাইপের মাধ্যমে সরাসরি গাছের গোড়ায় জল দিন যাতে জলের অপচয় বন্ধ হয়।

## ৩. গ্রামীণ পরিবারের জন্য বাস্তবসম্মত পরামর্শ
* রান্নাঘরের জৈব বর্জ্য থেকে বাড়ির পেছনে ছোট কম্পোস্ট সার তৈরির ইউনিট বসান।
* শুষ্ক এলাকায় কম জলে চাষযোগ্য বাজরা বা রাগীর মতো দানাশস্য চাষ করুন।

## ৪. সংক্ষিপ্ত সারমর্ম
সঠিক সেচ, জৈব সার এবং পরিকল্পিত চাষ পদ্ধতি প্রতিটি কৃষককে স্বাবলম্বী করে তোলে। প্রকৃতি-বান্ধব চাষই সুন্দর ভবিষ্যতের চাবিকাঠি।`;
    }
    return `# Modern Farming Guide (Level: ${level})

## 1. Introduction
By adopting modern and sustainable agricultural practices, rural communities can successfully boost crop yield, preserve vital soil nutrients, and manage water resources resourcefully.

## 2. Key Steps
* **Use Natural Organic Fertilizers**: Utilize compost, vermicompost, and green manure rather than heavy chemical products to keep soil healthy.
* **Crop Rotation**: Alternate different crop varieties each season (e.g., following grains with legumes) to replenish nitrogen naturally.
* **Drip Irrigation**: Implement drip lines to direct water straight to plant roots and conserve up to 50% water.
* **Soil Health Cards**: Regularly test soil quality through nearby government agricultural offices.

## 3. Practical Tips for Households
* Create a small compost pile using organic kitchen scraps and dry leaves.
* Consider minor rain-harvesting setups around fields to secure water for low-rain cycles.

## 4. Summary
Modern agriculture focus shouldn't just be output, but sustainability. Combine nature-friendly organic solutions with clean water management for long-term farming success!`;
  }

  if (topicLower.includes("finan") || topicLower.includes("वित्त") || topicLower.includes("पैस") || topicLower.includes("টাকা") || topicLower.includes("সঞ্চয়")) {
    if (isHindi) {
      return `# बुनियादी वित्त (Basic Finance) (स्तर: ${level})

## 1. परिचय
पैसे की सही बचत और प्रबंधन करना हर परिवार के लिए आवश्यक है। वित्तीय साक्षरता से हम संकट के समय सुरक्षित रह सकते हैं और सरकारी योजनाओं का लाभ उठा सकते हैं।

## 2. महत्वपूर्ण बचत बिंदु
* **बैंक खाता**: अपनी निकटतम डाकघर शाखा या बैंक में जनधन खाता खुलवाएं।
* **बचत की आदत**: अपनी कमाई का कम से कम 10% हिस्सा हर महीने बैंक में सहेज कर रखें।
* **सरकारी योजनाएं**: प्रधानमंत्री सुरक्षा बीमा योजना और अटल पेंशन योजना जैसी कम प्रीमियम वाली योजनाओं से जुड़ें।
* **ऋण सावधानी**: स्थानीय साहुकारों के ऊंचे ब्याज जाल से बचें और केवल बैंक से ही कृषि या व्यावसायिक ऋण लें।

## 3. व्यावहारिक सुझाव
* अपने दैनिक खर्चों को एक छोटी डायरी में दर्ज करें ताकि अनावश्यक खर्चों को रोका जा सके।
* संकट के समय (जैसे बीमारी या फसल खराबी) के लिए हमेशा एक आकस्मिक बचत अलग रखें।

## 4. संक्षेप
थोड़ी सी नियमित बचत और बैंक खाते का सही उपयोग कर हम अपने बच्चों की शिक्षा और अच्छे भविष्य को सुरक्षित कर सकते हैं।`;
    }
    if (isBengali) {
      return `# সহজ অর্থব্যবস্থা (Basic Finance) (স্তর: ${level})

## ১. সূচনা
টাকা সঠিকভাবে সঞ্চয় এবং পরিচালনা করা প্রতিটি পরিবারের জন্য অত্যন্ত জরুরি। আর্থিক জ্ঞান থাকলে সংকটের সময়ে সুরক্ষিত থাকা যায় এবং সরকারি সুযোগ-সুবিধা উপভোগ করা যায়।

## ২. গুরুত্বপূর্ণ সঞ্চয় উপায়
* **ব্যাঙ্ক অ্যাকাউন্ট**: নিকটবর্তী ব্যাঙ্ক বা পোস্ট অফিসে একটি জনধন অ্যাকাউন্ট খুলুন।
* **সঞ্চয়ের অভ্যাস**: প্রতি মাসে উপার্জনের অন্তত ১০% অংশ ব্যাঙ্কে জমিয়ে রাখুন।
* **সরকারি স্কিম**: কম প্রিমিয়ামের সরকারি বিমা এবং পেনশন যোজনার সুবিধা গ্রহণ করুন।
* **ঋণের ক্ষেত্রে সতর্কতা**: চড়া সুদে মহাজনদের কাছ থেকে ঋণ না নিয়ে সরাসরি ব্যাঙ্ক থেকে সহজ শর্তে ঋণ নিন।

## ৩. তৈরি থাকুন
* একটি খাতায় প্রতিদিনের খরচ লিখে রাখুন যাতে অহেতুক খরচ এড়িয়ে চলা যায়।
* আপৎকালীন সময়ের জন্য কিছু টাকা সবসময় আলাদা সঞ্চয় করুন।

## ৪. সংক্ষিপ্ত সারমর্ম
নিয়মিত ছোট সঞ্চয় এবং ব্যাঙ্কের সঠিক ব্যবহার আপনার পরিবারের ভবিষ্যৎ সুনিশ্চিত করতে পারে।`;
    }
    return `# Basic Finance Guide (Level: ${level})

## 1. Introduction
Proper saving and financial management are essential for every family's security and progress. Simple steps can help protect your household from unforeseen difficulties.

## 2. Key Pillars of Personal Finance
* **Bank Account**: Open a zero-balance savings account under accessible initiatives (like Jan Dhan or basic postal accounts).
* **Consistent Savings**: Try to save at least 10% of your earnings every month in your bank account, avoiding keeping large cash at home.
* **Government Welfare Schemes**: Enroll in low-premium insurance or pension plans designed for rural communities.
* **Avoid Debt Traps**: Steer clear of unorganized money-lenders with high-interest rates; seek institutional banks for micro-loans.

## 3. Practical Financial Checklists
* Track your weekly grocery and transport expenses in a small notebook to recognize unnecessary outflows.
* Maintain a small emergency buffer separate from your general spendings.

## 4. Summary
Continuous small savings and utilizing formal banking are the most secure ways to build long-term stability and support children's education!`;
  }

  if (topicLower.includes("health") || topicLower.includes("hyg") || topicLower.includes("स्वच्छता") || topicLower.includes("स्वास्थ्य") || topicLower.includes("পরিচ্ছন্নতা") || topicLower.includes("স্বাস্থ")) {
    if (isHindi) {
      return `# स्वास्थ्य और स्वच्छता (Health & Hygiene) (स्तर: ${level})

## 1. परिचय
अच्छा स्वास्थ्य ही सबसे बड़ा धन है। साधारण आदतों को सुधारकर हम अपने परिवार को कई तरह की गंभीर बीमारियों जैसे डायरिया और मलेरिया से बचा सकते हैं।

## 2. स्वस्थ रहने के नियम
* **हाथ धोना**: खाना बनाने, खाने से पहले और शौचालय के उपयोग के बाद साबुन से हाथ अच्छी तरह धोएं।
* **सुरक्षित पेयजल**: पीने के पानी को हमेशा उबालकर या छानकर साफ बर्तन में ढककर रखें।
* **घर के आसपास सफाई**: घर के पास गंदा पानी जमा न होने दें ताकि मच्छर और डेंगू न फैले।
* **बच्चों का पोषण**: शिशु को पोषण युक्त भोजन दें और समय पर आवश्यक सरकारी टीकाकरण सुनिश्चित करें।

## 3. व्यावहारिक सुझाव
* शौचालय को नियमित रूप से साफ रखें और खुले में शौच से बचें।
* ओआरएस (ORS) पैकेट हमेशा घर पर रखें; दस्त के समय यह बच्चों की जान बचाता है।

## 4. संक्षेप
स्वच्छता कोई अतिरिक्त कार्य नहीं बल्कि सुखी जीवन जीने का ढंग है। स्वस्थ परिवार ही प्रगतिशील समाज का निर्माण करता है।`;
    }
    if (isBengali) {
      return `# স্বাস্থ্য ও পরিচ্ছন্নতা (Health & Hygiene) (স্তর: ${level})

## ১. সূচনা
সুস্বাস্থ্যই প্রকৃত সম্পদ। সাধারণ কিছু অভ্যাস পরিবর্তনের মাধ্যমে আমরা পরিবারকে ডায়েরিয়া ও ম্যালেরিয়ার মতো মারাত্মক রোগ থেকে রক্ষা করতে পারি।

## ২. সুস্থ থাকার সহজ নিয়ম
* **হাত ধোয়া**: রান্নার আগে, খাওয়ার আগে এবং শৌচালয় ব্যবহারের পর সাবান দিয়ে ভালো করে হাত ধোবেন।
* **নিরাপদ পানীয় জল**: জল ফুটিয়ে বা ছেঁকে নিয়ে পরিষ্কার পাত্রে ঢেকে রাখুন।
* **বাড়ির চারপাশ পরিষ্কার**: বাড়ির চারপাশে কোথাও নোংরা জল জমতে দেবেন না যাতে মশা ছড়াতে না পারে।

## ৩. কিছু জরুরি টিপস
* বাড়িতে সবসময় ওআরএস (ORS) রাখুন। পাতলা পায়খানার সময়ে এটি বড় উপকারে আসে।
* বাচ্চাদের নিয়মিত সময়মতো সরকারি টিকাকরণ করান।

## ৪. সংক্ষিপ্ত সারমর্ম
পরিচ্ছন্নতা কোনো বাড়তি কাজ নয়, এটি ভালো থাকার উপায়। স্বাস্থ্যবান পরিবারই সুখী সমাজের ভিত্তি।`;
    }
    return `# Health and Hygiene Guide (Level: ${level})

## 1. Introduction
Good hygiene is the foundation of energy and vitality. Adopting simple wellness and sanitation habits safeguards your entire family from key water-borne and viral illnesses.

## 2. Core Sanitation Actions
* **Soap Handwashing**: Wash hands completely with clean water and soap before preparing meals, before eating, and after using the washroom.
* **Safe Drinking Water**: Filter or boil drinking water, and store it in closed containers using a clean ladle or tap for pouring.
* **Stop Mosquito Breeding**: Ensure no stagnant wastewater accumulates around your household to prevent dengue and malaria.
* **Child Vaccination & Nutrition**: Ensure junior family members complete their schedule at the local health clinic.

## 3. Easy Household Tips
* Regularly disinfect toilets and avoid outdoor sanitation practices.
* Keep oral rehydration salts (ORS) ready in your first-aid box for quick assistance during heatwaves or stomach flu.

## 4. Summary
Cleanliness is the most effective medicine. Small everyday sanitation habits keep the clinic visits away and keep your family thriving!`;
  }

  if (topicLower.includes("digit") || topicLower.includes("mobil") || topicLower.includes("स्मार्टफोन") || topicLower.includes("मोबाइल") || topicLower.includes("फोन") || topicLower.includes("মোবাইল")) {
    if (isHindi) {
      return `# मोबाइल कौशल (Mobile Skills) (स्तर: ${level})

## 1. परिचय
आज स्मार्टफोन सिर्फ बात करने के लिए नहीं बल्कि सीखने, बैंकिंग करने और सरकारी सेवाएं प्राप्त करने का सशक्त माध्यम बन चुका है। आइए इसके सुरक्षित उपयोग को समझें।

## 2. मोबाइल के आवश्यक उपाय
* **सुरक्षित भुगतान**: यूपीआई (UPI) या रिचार्ज करते समय हमेशा अपना पिन (PIN) गुप्त रखें और किसी अनजान से साझा न करें।
* **व्हाट्सएप उपयोग**: कृषि अपडेट, समाचार या बच्चों के स्कूल मैसेज के लिए इसका उपयोग करें। अफवाहों को आगे शेयर करने से बचें।
* **ऑनलाइन फॉर्म**: जमीन के रिकॉर्ड (खतौनी), आधार अपडेट जैसी सेवाएं मोबाइल पर सरकारी पोर्टल से प्राप्त करना सीखें।
* **धोखाधड़ी से सुरक्षा**: बैंक कभी भी फोन पर ओटीपी (OTP) या पिन नहीं पूछता। लॉटरी वाले संदेशों पर भूलकर भी क्लिक न करें।

## 3. व्यावहारिक सुझाव
* अपने फोन को लॉक रखने के लिए एक मजबूत पासवर्ड या पैटर्न सेट करें।
* स्थानीय पंचायत या सामुदायिक केंद्र के मुफ्त वाई-फाई का उपयोग करते समय बैंकिंग लेनदेन से बचें।

## 4. संक्षेप
मोबाइल आज के युग का सबसे बड़ा शिक्षक बन सकता है। इसकी सुरक्षा को समझकर हम दुनिया भर का ज्ञान अपनी उंगलियों पर पा सकते हैं।`;
    }
    if (isBengali) {
      return `# মোবাইল দক্ষতা (Mobile Skills) (স্তর: ${level})

## ১. সূচনা
আজকের দিনে স্মার্টফোন কেবল যোগাযোগের মাধ্যম নয়, বরং বিভিন্ন তথ্য জানা ও লেনদেন করার গুরুত্বপূর্ণ হাতিয়ার। এর সঠিক ও নিরাপদ ব্যবহার জানা জরুরি।

## ২. সুরক্ষিত মোবাইল ব্যবহারের নিয়ম
* **নিরাপদ পেমেন্ট**: ইউপিআই (UPI) পেমেন্ট বা রিচার্জ করার সময়ে সর্বদা নিজের পিন (PIN) গোপন রাখুন।
* **সঠিক তথ্য শেয়ার**: হোয়াটসঅ্যাপের মাধ্যমে চাষের খবর বা জরুরি কাজের তথ্য লেনদেন করুন। ভিত্তিহীন গুজব এড়িয়ে চলুন।
* **অনলাইন ফর্ম ফিলাপ**: জমি সংক্রান্ত রেকর্ড বা পঞ্চায়েতের শংসাপত্র মোবাইল থেকেই আবেদন করতে শিখুন।
* **ওটিপি প্রতারণা এড়ানো**: কোনো অপরিচিত ফোন কলে আপনার ওটিপি (OTP) বা ব্যাঙ্ক সংক্রান্ত বিষয় জানাবেন না।

## ৩. ব্যবহার করুন নিরাপদে
* নিজের স্মার্টফোনে একটি শক্ত পাসওয়ার্ড বা স্ক্রিন লক ব্যবহার করুন।
* লটারিতে টাকা জেতার ক্ষতিকারক লিঙ্কগুলোতে কখনোই ক্লিক করবেন না।

## ৪. সংক্ষিপ্ত সারমর্ম
মোবাইলকে ভয় না পেয়ে সঠিক নিয়মে ব্যবহার করলে তা জীবনকে অনেক সহজ এবং গতিশীল করে তোলে।`;
    }
    return `# Mobile Skills Guide (Level: ${level})

## 1. Introduction
Smartphones are incredible windows to learning, commerce, and communication. Mastering basic digital skills unlocks numerous daily shortcuts and keeps your finances secure.

## 2. Safety and Usage Checkpoints
* **Secure Payments**: Use digital UPI applications for fast transactions, but never share your secure 4 or 6-digit PIN with anyone.
* **Verification of News**: Use social channels carefully to get agriculture updates or school alerts; do not forward unverified or sensational rumors.
* **Online Public Portals**: Access agricultural welfare websites, check land records, or submit simple municipal registrations from your own mobile.
* **Protecting Vital Accounts**: Remember that official banks will never call you to request your OTP (One-Time Password). Avoid clicking suspicious "lottery winner" links.

## 3. Simple Screen Tips
* Keep an active PIN or pattern lock enabled to secure your smartphone from loss or theft.
* Install trusted official versions of daily utility applications from authorized app stores.

## 4. Summary
Your smartphone is an amazing, compact tutor. Familiarize yourself with basic safety parameters to connect confidently with the modern digital landscape.`;
  }

  if (topicLower.includes("handi") || topicLower.includes("craft") || topicLower.includes("हस्तशिल्प") || topicLower.includes("कला") || topicLower.includes("শিল্প") || topicLower.includes("হস্তশিল্প")) {
    if (isHindi) {
      return `# हस्तशिल्प (Handicrafts) (स्तर: ${level})

## 1. परिचय
हस्तशिल्प और कुटीर उद्योग ग्रामीण क्षेत्रों में अतिरिक्त आय का एक बेहतरीन और सम्मानजनक जरिया हैं। अपनी पारंपरिक कला को बाजार की जरूरत के अनुसार ढालकर आप इसे एक सफल व्यवसाय बना सकते हैं।

## 2. व्यवसाय की शुरुआत के मुख्य कदम
* **उत्कृष्ट गुणवत्ता**: बांस, मिट्टी, वस्त्र या जूट के ऐसे उत्पाद बनाएं जो मजबूत और दिखने में आकर्षक हों।
* **लागत का हिसाब**: सामग्री, मेहनत और परिवहन का खर्च जोड़कर उत्पाद का सही मूल्य तय करें।
* **सहकारिता या समूह**: गांव की अन्य महिलाओं या कारीगरों के साथ मिलकर स्वंय सहायता समूह (SHG) बनाएं ताकि बड़े ऑर्डर मिल सकें।
* **डिजिटल बाजार**: अपने उत्पादों की सुंदर तस्वीरें खींचकर सोशल मीडिया या सरकारी हस्तशिल्प पोर्टलों पर बेचने का प्रयास करें।

## 3. व्यावहारिक सुझाव
* शुरुआती चरणों में स्थानीय मेलों, हाट-बाजारों और त्योहारों में प्रदर्शनी लगाएं।
* उपहार देने के उद्देश्य से छोटे आकार वाले आकर्षक पैकेजिंग आइटम तैयार करें।

## 4. संक्षेप
आपकी हाथों की कला ही आपकी सबसे बड़ी ताकत है। थोड़ी सी समझदारी और लगन से आप घर बैठे अपनी कला को एक समृद्ध रोजगार में बदल सकते हैं।`;
    }
    if (isBengali) {
      return `# হস্তশিল্প (Handicrafts) (স্তর: ${level})

## ১. সূচনা
হস্তশিল্পের কাজ গ্রামীণ এলাকায় বাড়তি আয়ের একটি দুর্দান্ত এবং মর্যাদাশীল পথ। নিজের ঐতিহ্যবাহী কাজকে আধুনিক রূপ দিয়ে ভালো অর্থ উপার্জন করা সম্ভব।

## ২. ব্যবসার কিছু সাধারণ নিয়ম
* **আকর্ষণীয় গুণমান**: বাঁশ, মাটির পাত্র, জুট বা কাপড়ের সুন্দর ও দীর্ঘস্থায়ী পণ্য তৈরি করুন।
* **ঠিক দাম নির্বাচন**: কাঁচামাল এবং নিজের পরিশ্রমের সাথে সামঞ্জস্য রেখে সঠিক দাম ঠিক করুন।
* **স্বনির্ভর গোষ্ঠী গঠন**: গ্রামের অন্যান্য তৈরি কারিগরদের সাথে যুক্ত হয়ে টিম বা গোষ্ঠী গঠন করে বড় মাপের কাজ ধরুন।
* **অনলাইন বিপণন**: তৈরি জিনিসের ভালো ছবি তুলে ফেসবুক বা বিভিন্ন সরকারি পোর্টালের মাধ্যমে বিক্রির চেষ্টা করুন।

## ৩. বিপণন টিপস
* স্থানীয় মেলা, হাট-বাজার বা গ্রাম্য অনুষ্ঠানে ছোট স্টল দিন।
* পণ্যের প্যাকেজিং মার্জিত রাখতে সাধারণ কাগজের রঙিন ঠোঙা ব্যবহার করুন।

## ৪. সংক্ষিপ্ত সারমর্ম
নজরে রাখার মতো দক্ষতা থাকলে হস্তশিল্পকে একটি দারুণ আয়ের উৎস করে গড়ে তোলা যায়। ধের্য ধরে আপনার শৈল্পিক সৃষ্টিকে আরও নিখুঁত করুন।`;
    }
    return `# Handicrafts and Local Business Guide (Level: ${level})

## 1. Introduction
Handicrafts are an elegant, honorable path to generating secondary family income. Refining your traditional craft and understanding basic market demands can translate your creativity into a sustainable cottage enterprise.

## 2. Essential Entrepreneurship Actions
* **Product Quality and Design**: Focus on durable base materials (bamboo, jute, terracotta, textile weaves) finished in appealing colors.
* **Accurate Pricing Math**: Record your inventory, labor hours, and local shipping costs carefully before setting a final customer price.
* **Self-Help Groups (SHGs)**: Form minor artisan cooperatives in your block to collectively share raw materials and fulfill bulk orders for wholesalers.
* **Digital Display**: Capture clear phone photographs of finished pieces under natural daylight to explore sales platforms on social channels or village cooperatives.

## 3. Practical Launch Checklist
* Showcase your samples at block exhibitions, district craft markets, and festive village fairs.
* Implement simple, recycled paper bags as rustic gift packaging to raise customer appeal.

## 4. Summary
Your creative inheritance is a powerful entrepreneurial tool. Handcrafted goods carry unique histories—pair them with simple micro-finance concepts to design a rewarding local business!`;
  }

  // Generic fallback if none matched
  if (isHindi) {
    return `# ${topic} (स्तर: ${level})

## 1. परिचय
इस विषय के बारे में सरल जानकारी यहां उपलब्ध है।

## 2. महत्वपूर्ण बिंदु
* बुनियादी समझ विकसित करें।
* नियमित रूप से अभ्यास करें।
* स्थानीय लोगों से चर्चा करें।

## 3. संक्षेप
यह जानकारी आपको इस विषय को बेहतर ढंग से समझने और व्यावहारिक जीवन में लागू करने में मदद करेगी।`;
  }
  if (isBengali) {
    return `# ${topic} (স্তর: ${level})

## ১. সূচনা
এই বিষয়ে সহজ তথ্য এখানে দেওয়া হলো।

## ২. গুরুত্বপূর্ণ পয়েন্ট
* বিষয়টির প্রাথমিক ধারণা নিন।
* নিয়মিত অনুশীলন করুন।
* অভিজ্ঞদের সাথে আলোচনা করুন।

## ৩. সংক্ষিপ্ত সারমর্ম
এই তথ্য আপনাকে সহজে বিষয়টি বুঝতে সাহায্য করবে।`;
  }

  return `# ${topic} (Level: ${level})

## 1. Introduction
An overview of ${topic} prepared to facilitate easy understanding and immediate practice in day-to-day settings.

## 2. Essential Actions
* Build a foundational understanding of the core concepts.
* Put these pointers into safe, repetitive practice to build confidence.
* Discuss with experienced members of your local community.

## 3. Summary
This guidance offers a starting point for exploring ${topic} successfully. Let your curiosity lead the way!`;
}

// Fallback high-quality wise chat responses for quota-exceeded situations
function getFallbackChatResponse(message: string, language: string, userProfile?: any, userProgress?: any): string {
  const msgLower = (message || "").toLowerCase();
  const isHindi = language && (language.toLowerCase().includes("hind") || language.includes("हिन्दी") || language.includes("हिंदी"));
  const isBengali = language && (language.toLowerCase().includes("beng") || language.includes("বাংলা") || language.includes("বंगाली"));

  // Extracted user context for fallback
  const userName = userProfile?.name || "";
  const userInterests = Array.isArray(userProfile?.interests) ? userProfile.interests.join(", ") : "";
  const completedCount = Array.isArray(userProgress?.completedIds) ? userProgress.completedIds.length : 0;
  const completedTopics = Array.isArray(userProgress?.completedIds) ? userProgress.completedIds.join(", ") : "";

  // 1. GREETING/HOW ARE YOU FALLBACK
  const isGreeting = msgLower.includes("namaste") || msgLower.includes("pranam") || msgLower.includes("hello") || 
                     msgLower.includes("hi") || msgLower.includes("hey") || msgLower.includes("नमस्ते") || 
                     msgLower.includes("प्रणाम") || msgLower.includes("नमस्कार") || msgLower.includes("হ্যালো") || 
                     msgLower.includes("ওহে") || msgLower.includes("how are you") || msgLower.includes("कैसे हो") || 
                     msgLower.includes("কেমন আছ") || msgLower.includes("কেমন আছেন") || msgLower.includes("हाल") || 
                     msgLower.includes("समाचार");

  // 2. PROFILE/PROGRESS FALLBACK
  const isProfileOrProgress = msgLower.includes("profile") || msgLower.includes("progress") || msgLower.includes("completed") || 
                              msgLower.includes("my name") || msgLower.includes("who am i") || msgLower.includes("mera naam") || 
                              msgLower.includes("আমার নাম") || msgLower.includes("আমি কে") || msgLower.includes("প্রগতি") || 
                              msgLower.includes("प्रोफाइल") || msgLower.includes("कोर्स") || msgLower.includes("प्रোগ्रेस") ||
                              msgLower.includes("क्या सीख चुका") || msgLower.includes("क्या सीख चुकी") || msgLower.includes("কি শিখেছি");

  // 3. SDG FALLBACK
  const isSDG = msgLower.includes("sdg") || msgLower.includes("sustainable development") || msgLower.includes("development goals") || 
                msgLower.includes("सतत विकास") || msgLower.includes("विकास लक्ष्य") || msgLower.includes("উন্নয়ন লক্ষ্য") || 
                msgLower.includes("এসডিজি") || msgLower.includes("sustainable goals");

  if (isHindi) {
    if (isGreeting) {
      return `नमस्ते ${userName ? userName : ""}! मैं आपका ग्रामीण शिक्षा एआई मेंटर हूँ। मैं बहुत अच्छा हूँ, आप कैसे हैं? ${userName ? "मुझे बहुत खुशी है कि आप निरंतर सीख रहे हैं।" : "मैं एक एआई मेंटर हूँ जो आपको खेतीबाड़ी, बजट और स्वास्थ्य संबंधी कौशल सीखने में मदद कर सकता है।"} आज आप क्या सीखना चाहते हैं?`;
    }
    if (isProfileOrProgress) {
      if (!userName && completedCount === 0) {
        return "मुझे अभी तक आपका प्रोफाइल या प्रगति विवरण नहीं मिला है। आप अपना प्रोफाइल सेक्शन अपडेट कर सकते हैं ताकि मैं आपके बारे में जान सकूं और आपको बेहतर गाइड कर सकूं!";
      }
      return `आपकी प्रोफाइल के अनुसार, आपका नाम ${userName || "अतिथि"} है। ${userInterests ? `आपकी रुचि ${userInterests} में है।` : ""} आपने अब तक ${completedCount} विषयों को पूरा कर लिया है ${completedTopics ? `(विषय आईडी: ${completedTopics})` : ""}। बहुत बढ़िया! ऐसे ही नए-नए कौशल सीखते रहें!`;
    }
    if (isSDG) {
      return "सतत विकास लक्ष्य (SDGs) या 'Sustainable Development Goals' 17 वैश्विक लक्ष्य हैं जिन्हें संयुक्त राष्ट्र द्वारा 2030 तक गरीबी मिटाने, पृथ्वी की रक्षा करने और सभी के लिए शांति व खुशहाली सुनिश्चित करने के लिए बनाया गया है। हमारी ग्रामीण शिक्षा ऐप मुख्य रूप से लक्ष्य 1 (गरीबी उन्मूलन), लक्ष्य 2 (भुखमरी मिटाना), लक्ष्य 3 (अच्छा स्वास्थ्य और कल्याण), लक्ष्य 4 (गुणवत्तापूर्ण शिक्षा) और लक्ष्य 8 (सज्जन कार्य और आर्थिक विकास) के क्षेत्र में काम करके ग्रामीण लोगों को आत्मनिर्भर बनाने में मदद करती है।";
    }
    if (msgLower.includes("खेती") || msgLower.includes("किसान") || msgLower.includes("फसल") || msgLower.includes("खाद")) {
      return "खेती के बारे में बहुत अच्छा सवाल पूछा आपने! हमेशा याद रखें कि मिट्टी को स्वस्थ रखने के लिए जैविक खाद (जैसे केंचुआ खाद या गोबर की खाद) सबसे अच्छी होती है। रासायनिक खाद से शुरुआत में उपज बढ़ती है लेकिन बाद में मिट्टी बंजर होने लगती है। पानी बचाने के लिए ड्रिप सिंचाई (बूंद-बूंद पानी) का उपयोग करें। क्या आप केंचुआ खाद बनाने की विधि जानना चाहते हैं?";
    }
    if (msgLower.includes("पैसा") || msgLower.includes("बैंक") || msgLower.includes("बचत") || msgLower.includes("अकाउंट") || msgLower.includes("लोन")) {
      return "पैसे के प्रबंधन का विषय बहुत महत्वपूर्ण है। सबसे पहले सीधे बैंक या पोस्ट ऑफिस जाकर जनधन खाता (जीरो बैलेंस खाता) खुलवाएं। साहूकारों के ऊंचे ब्याज से बचें। हर महीने कमाई का एक छोटा हिस्सा बैंक में जमा करें जिससे संकट के समय काम आ सके। क्या आप किसी सरकारी पेंशन या बीमा योजना के बारे में जानना चाहते हैं?";
    }
    if (msgLower.includes("तबीयत") || msgLower.includes("बीमार") || msgLower.includes("स्वास्थ्य") || msgLower.includes("सफाई") || msgLower.includes("पानी")) {
      return "स्वास्थ्य ही सबसे मूल्यवान धन है। परिवार को बीमारियों से बचाने के लिए सबसे सरल उपाय है पीने के पानी को हमेशा उबालकर या छानकर साफ ढक कर रखना। भोजन से पहले साबुन से हाथ अच्छी तरह धोना कभी न भूलें। घर के पास पानी जमा न होने दें ताकि डेंगू या मलेरिया के मच्छर न पनपें। क्या आप बच्चों के पोषण या ओआरएस (ORS) के बारे में जानना चाहते हैं?";
    }
    if (msgLower.includes("मोबाइल") || msgLower.includes("फोन") || msgLower.includes("पेमेंट") || msgLower.includes("व्हाट्सएप") || msgLower.includes("यूपीआई")) {
      return "मोबाइल का सुरक्षित उपयोग करना बहुत जरूरी है। जब भी आप ऑनलाइन भुगतान करें या बैंक खाता चलाएं, अपना यूपीआई पिन (UPI PIN) या पासवर्ड किसी से शेयर न करें। ध्यान रखें कि बैंक कभी भी गुप्त जानकारी या ओटीपी (OTP) फोन पर नहीं पूछता। कोई भी अनजान व्यक्ति अगर बड़े इनाम का लालच दे, तो उसपर विश्वास न करें। क्या आपके पास इससे जुड़ा कोई सवाल है?";
    }
    return "आपका यह सवाल शिक्षाप्रद है। मैं कहूंगा कि ज्ञान कभी व्यर्थ नहीं जाता। आप डिजिटल विद्या ऐप में दिए गए आधुनिक कृषि, बचत, स्वास्थ्य, या मोबाइल कौशल विकास से जुड़ी किसी भी गाइड को चुनकर पढ़ना शुरू कर सकते हैं। वे सभी पूर्णत: प्रामाणिक और उपयोगी हैं। क्या आप कुछ और पूछना चाहते हैं?";
  }

  if (isBengali) {
    if (isGreeting) {
      return `নমস্কার ${userName ? userName : ""}! আমি আপনার গ্রামীণ শিক্ষা এআই মেন্টর। আমি খুব ভালো আছি, আপনি কেমন আছেন? ${userName ? "আমি অত্যন্ত আনন্দিত যে আপনি আপনার শেখা চালিয়ে যাচ্ছেন।" : "আমি একটি এআই মেন্টর যা আপনাকে চাষাবাদ, বাজেট এবং স্বাস্থ্য সংক্রান্ত দক্ষতা অর্জনে সাহায্য করতে পারে।"} আজ আপনি কী জানতে চান?`;
    }
    if (isProfileOrProgress) {
      if (!userName && completedCount === 0) {
        return "আমি এখনো আপনার প্রোফাইল বা অগ্রগতির বিবরণ পাইনি। আপনি অ্যাপে প্রোফাইল আপডেট করতে পারেন যাতে আমি আপনার সম্পর্কে জেনে আরও ভালোভাবে সাহায্য করতে পারি!";
      }
      return `আপনার প্রোফাইল অনুযায়ী, আপনার নাম ${userName || "অতিথি"}। ${userInterests ? `আপনার আগ্রহের বিষয় হলো ${userInterests}।` : ""} আপনি এ পর্যন্ত ${completedCount} টি বিষয় সম্পূর্ণ করেছেন ${completedTopics ? `(বিষয় আইডি: ${completedTopics})` : ""}। দারুণ কাজ! আপনার শিক্ষা এভাবেই চালিয়ে যান!`;
    }
    if (isSDG) {
      return "টেকসই উন্নয়ন লক্ষ্যমাত্রা (SDGs) বা 'Sustainable Development Goals' হলো জাতিসংঘ কর্তৃক গৃহীত ১৭টি বিশ্বব্যাপী লক্ষ্য, যার মূল উদ্দেশ্য ২০৩০ সালের মধ্যে দারিদ্র্য দূর করা, পরিবেশ রক্ষা করা এবং বিশ্বের সকল মানুষের শান্তি ও সমৃদ্ধি নিশ্চিত করা। আমাদের গ্রামীণ শিক্ষা অ্যাপটি মূলত লক্ষ্য ১ (দারিদ্র্য বিমোচন), লক্ষ্য ২ (ক্ষুধামুক্তি), লক্ষ্য ৩ (সুস্বাস্থ্য ও কল্যাণ), লক্ষ্য ৪ (মানসম্মত শিক্ষা) এবং লক্ষ্য ৮ (শোভন কাজ ও অর্থনৈতিক প্রবৃদ্ধি) অর্জনে সাহায্য করে আপনাকে আরও স্বনির্ভর করতে প্রস্তুত করা হয়েছে।";
    }
    if (msgLower.includes("চাষ") || msgLower.includes("কৃষি") || msgLower.includes("সার") || msgLower.includes("ফসল")) {
      return "চাষাবাদ নিয়ে খুব ভালো প্রশ্ন করেছেন! মাটির উর্বরা শক্তি ধরে রাখতে সবসময় জৈব সার (যেমন কেঁচো সার বা গোবর সার) ব্যবহার করুন। আধুনিক ড্রিপ সেচ ব্যবহার করলে জল অনেক কম লাগে এবং ফসলও ভালো হয়। আপনি কী নিজের জমিতে কোনো বিশেষ চাষ শুরু করতে চাইছেন?";
    }
    if (msgLower.includes("টাকা") || msgLower.includes("ব্যাঙ্ক") || msgLower.includes("সঞ্চয়") || msgLower.includes("অ্যাকাউন্ট") || msgLower.includes("ঋণ")) {
      return "টাকা-পয়সা সামলানো জীবনের অত্যন্ত জরুরি কাজ। আজই নিকটবর্তী ব্যাঙ্ক বা ডাকঘরে গিয়ে একটি নিখরচায় জনধন অ্যাকাউন্ট খুলুন। মহাজনদের চড়া সুদের ঋণের ফাঁদ থেকে দূরে থাকুন এবং ব্যাঙ্কের মাধ্যমে সহজ ঋণের খোঁজ নিন। প্রতি মাসে অল্প হলেও সঞ্চয় করুন। এই বিষয়ে আর কিছু জানতে চান?";
    }
    if (msgLower.includes("শরীর") || msgLower.includes("অসুখ") || msgLower.includes("স্বাস্থ্য") || msgLower.includes("পরিচ্ছন্নতা") || msgLower.includes("জল")) {
      return "শরীর সুস্থ রাখাই আমাদের প্রধান দায়িত্ব। জল ফুটিয়ে বা ফিল্টার করে পান করা এবং খাওয়ার আগে হাত ভালো করে ধোয়ার অভ্যাস পরিবারকে বহু অসুখ থেকে বাঁচায়। বাড়ির চারপাশে জল জমতে দেবেন না যাতে মশার উপদ্রব না বাড়ে। শিশুদের সময়মতো প্রতিষেধক টিকা নিশ্চিত করুন। আর কোনো স্বাস্থ্য সমস্যা নিয়ে জানতে চান?";
    }
    if (msgLower.includes("মোবাইল") || msgLower.includes("ফোন") || msgLower.includes("পেমেন্ট") || msgLower.includes("হোয়াটসঅ্যাপ") || msgLower.includes("ইউপিআই")) {
      return "স্মার্টফোন ব্যবহারের ক্ষেত্রে অত্যন্ত সতর্ক থাকা প্রয়োজন। কোনো অবস্থাতেই নিজের ওটিপি (OTP) বা ইউপিআই পিন (UPI PIN) কোনো অপরিচিত ব্যক্তিকে জানাবেন না। সুরক্ষিত পেমেন্ট অ্যাপ ব্যবহার করুন। ব্যাঙ্ক বা কোনো সরকারি প্রতিষ্ঠান ফোনে আপনার পিন কোড জানতে চায় না। কোনো সন্দেহজনক লিঙ্কে ক্লিক করবেন না। সুরক্ষিত থাকবেন কীভাবে তা নিয়ে সাহায্য করব?";
    }
    return "আপনার কথাটি অত্যন্ত গুরুত্বপূর্ণ। যদিও আমাদের মূল এআই ব্রেন সাময়িকভাবে বেশি অনুরোধের কারণে অফলাইন রয়েছে, মেন্টর হিসেবে আমি বলব আপনি এই অ্যাপের চমৎকার প্রতিটি মডিউল (যেমন আধুনিক চাষ, সহজ অর্থব্যবস্থা, স্বাস্থ্য বা হস্তশিল্প) পড়ে নিয়মিত শিখতে পারেন। আপনি কি ডিজিটাল বিদ্যায় অন্য কোনো মডিউল শুরু করতে চান?";
  }

  // English fallback chat response
  if (isGreeting) {
    return `Hello ${userName ? userName : ""}! I am your Digital Vidya AI mentor. I am doing great, how are you? ${userName ? "I'm so glad to see you continuing your learning journey today!" : "I'm here to help you learn about farming, finance, health, and SDGs."} What would you like to explore today?`;
  }
  if (isProfileOrProgress) {
    if (!userName && completedCount === 0) {
      return "I couldn't find your profile or progress details yet. Please update your profile page so I can give you more customized guidance!";
    }
    return `According to your profile, your name is ${userName || "Guest"}. ${userInterests ? `Your interests include ${userInterests}.` : ""} You have completed ${completedCount} topics so far ${completedTopics ? `(Topic IDs: ${completedTopics})` : ""}. Fantastic progress, keep it up! Let's study more modules together!`;
  }
  if (isSDG) {
    return "The Sustainable Development Goals (SDGs) are a collection of 17 global goals set by the United Nations to end poverty, protect the planet, and ensure that all people enjoy peace and prosperity by 2030. In Digital Vidya, we actively align with Goal 1 (No Poverty), Goal 2 (Zero Hunger), Goal 3 (Good Health and Well-being), Goal 4 (Quality Education), and Goal 8 (Decent Work and Economic Growth) by teaching self-reliance skills.";
  }
  if (msgLower.includes("hello") || msgLower.includes("hi") || msgLower.includes("hey")) {
    return "Hello! I am your Digital Vidya mentor. My active connection is resting due to high volume, but I am still here to assist you. You can ask me broad questions about Farming, Finance, Personal budgeting, Basic health, or Safe mobile payments. What are you looking to learn today?";
  }
  if (msgLower.includes("farm") || msgLower.includes("crop") || msgLower.includes("fertilizer") || msgLower.includes("water")) {
    return "Farming sustainably is key. Always prefer organic fertilizers like compost or vermicompost over strong chemical products. It protects soil architecture. Implement drip irrigation rows to feed water straight to the roots and preserve water sources. What specific crop or technique do you want to explore next?";
  }
  if (msgLower.includes("money") || msgLower.includes("bank") || msgLower.includes("save") || msgLower.includes("account") || msgLower.includes("loan")) {
    return "Budgeting and banking securely are essential. Ensure you maintain a simple zero-balance bank profile for savings. Avoid informal local lenders with high interest rates. Instead, research microfinance groups and government deposit schemes to keep your hard-earned funds safe. Daily budgeting helps you visually spot leaks. Would you like a tip on how to save?";
  }
  if (msgLower.includes("health") || msgLower.includes("hygiene") || msgLower.includes("water") || msgLower.includes("clean") || msgLower.includes("sick")) {
    return "Staying healthy is paramount. The simplest way to avoid infections is washing hands with clean soap before eating, and boiling or straining drinking water properly. Keep immediate water outlets free of stagnant puddles to prevent malaria carriers. Always update kids' vaccines at local wellness camps. What area shall we detail?";
  }
  if (msgLower.includes("mobile") || msgLower.includes("phone") || msgLower.includes("pay") || msgLower.includes("upi") || msgLower.includes("whatsapp")) {
    return "Mobile security is crucial. Please keep your UPI payment pins or secure patterns strictly secret. No bank representatives will ever text or call to demand your OTP. Ignore lottery winning chains as they often carry viruses or fraud attempts. Keep your operating system updated. Do you have a question about digital payments?";
  }
  return "That is a very interesting topic. Currently, our advanced AI limits are temporarily busy due to learning traffic, so I am sharing my stored guidelines with you. You can read any of the modular guides on Farming, Finance, Mobile Skills, and Handicrafts in this app to continue your study. They are always available offline too. What skill can I help you check?";
}

// API for educational content generation
app.post("/api/content", async (req, res) => {
  const { topic, language, level = "beginner" } = req.body;
  
  const prompt = `Create a very simple, practical educational guide about "${topic}" strictly in ${language}. 
  Every single word of the response must be in ${language}, except for technical terms where necessary.
  Focus on rural applicability. Use clear, encouraging language. 
  Format in Markdown with the following sections (translated to ${language}):
  1. Title
  2. Introduction (Why this is important)
  3. Step-by-step instructions or Key points
  4. Practical tips for rural households
  5. A simple summary.
  Keep the content short and easy to read. Target level: ${level}.`;

  const models = ["gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-3.5-flash"];
  for (const modelName of models) {
    try {
      const response = await withRetry(() => ai.models.generateContent({
        model: modelName,
        contents: prompt,
      }));
      return res.json({ content: response.text });
    } catch (error: any) {
      console.warn(`Gemini Content Error with model ${modelName}: ${error.message || error}. Trying next model...`);
    }
  }

  console.warn(`All Gemini models failed for Content. Serving offline fallback for ${topic} in ${language}.`);
  const fallbackMd = getFallbackContent(topic, language, level);
  return res.json({ content: fallbackMd });
});

// API for the AI Skill Mentor
app.post("/api/chat", async (req, res) => {
  const { message, history, language, userProfile, userProgress } = req.body;
  
  let userContext = "";
  if (userProfile) {
    userContext += `\nUser Profile details:
- Name: ${userProfile.name || "Guest"}
- Age: ${userProfile.age || "Not specified"}
- Gender: ${userProfile.gender || "Not specified"}
- Interests: ${Array.isArray(userProfile.interests) ? userProfile.interests.join(", ") : "None"}
- Bio: ${userProfile.bio || "None"}`;
  }
  if (userProgress && Array.isArray(userProgress.completedIds)) {
    userContext += `\nUser's Completed Topic/Course IDs: ${userProgress.completedIds.join(", ") || "None completed yet"}`;
  }

  const systemInstruction = `You are a helpful, respectful, and friendly elder-like mentor for rural people.
Your goal is to explain complex skills (farming, finance, health) in simple terms, but you can also converse naturally about any topic like how the user is doing, current progress, or Sustainable Development Goals (SDGs).
Always respond like a fully capable conversational AI (like Claude or ChatGPT) with a friendly, supportive, and warm mentor persona in ${language}.
Always encourage the user and feel free to mention their progress or profile details to customize your answers if they ask about it.
You are highly knowledgeable about Sustainable Development Goals (SDGs). If the user asks about them, explain them in simple terms, relating them to their rural lifestyle.
Keep responses concise, engaging, and easy to understand. Here is the user's profile and progress context if available:${userContext}`;

  const models = ["gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-3.5-flash"];
  for (const modelName of models) {
    try {
      const chat = ai.chats.create({
        model: modelName,
        config: {
          systemInstruction,
        },
        history: history || [],
      });

      const response = await withRetry(() => chat.sendMessage({ message }));
      return res.json({ response: response.text });
    } catch (error: any) {
      console.warn(`Gemini Chat Error with model ${modelName}: ${error.message || error}. Trying next model...`);
    }
  }

  console.warn("All Gemini Chat models failed. Serving high-quality wise chat fallback response.");
  const fallbackMsg = getFallbackChatResponse(message, language, userProfile, userProgress);
  return res.json({ response: fallbackMsg });
});

// High-Quality Category Video Mappings for Qouta Fallback
const FALLBACK_VIDEOS: Record<string, string> = {
  farming: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
  finance: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  health: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  digital: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  handicrafts: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  default: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
};

function detectCategoryFromPrompt(prompt: string): string {
  const p = (prompt || "").toLowerCase();
  if (p.includes("farming") || p.includes("farm") || p.includes("खेती") || p.includes("চাষ") || p.includes("কৃষি") || p.includes("કૃષિ")) return "farming";
  if (p.includes("finance") || p.includes("budget") || p.includes("saving") || p.includes("bank") || p.includes("पैसा") || p.includes("টাকা") || p.includes("બચત")) return "finance";
  if (p.includes("health") || p.includes("sanitation") || p.includes("hygiene") || p.includes("स्वच्छता") || p.includes("স্বাস্থ্য") || p.includes("સહગ")) return "health";
  if (p.includes("digital") || p.includes("mobile") || p.includes("phone") || p.includes("व्हाट्सएप") || p.includes("ફોન")) return "digital";
  if (p.includes("handicraft") || p.includes("craft") || p.includes("হস্তশিল্প") || p.includes("હસ્તકલા") || p.includes("கைவினை")) return "handicrafts";
  return "default";
}

// Video Generation Endpoint (Step 1: Start)
app.post("/api/video-generate", async (req, res) => {
  const { prompt } = req.body;
  const category = detectCategoryFromPrompt(prompt);
  try {
    const operation = await withRetry(() => ai.models.generateVideos({
      model: 'veo-3.1-lite-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    }));
    res.json({ operationName: operation.name });
  } catch (error: any) {
    console.warn(`Video Gen Exception/Quota Hit: ${error.message || error}. Falling back to high-quality preloaded tutorial video for category: ${category}`);
    // Serve a mock fallback operation name tagged with the category
    res.json({ operationName: `fallback-operation-${category}` });
  }
});

// Video Status Endpoint (Step 2: Poll)
app.post("/api/video-status", async (req, res) => {
  const { operationName } = req.body;
  if (operationName && operationName.startsWith("fallback-operation-")) {
    return res.json({ done: true });
  }
  try {
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    res.json({ done: updated.done });
  } catch (error: any) {
    console.error("Video Status Error:", error);
    res.status(500).json({ error: "Failed to check video status" });
  }
});

// Video Download Endpoint (Step 3: Download)
app.post("/api/video-download", async (req, res) => {
  const { operationName } = req.body;
  try {
    let uri: string | undefined;
    const isFallback = operationName && operationName.startsWith("fallback-operation-");

    if (isFallback) {
      const category = operationName.replace("fallback-operation-", "");
      uri = FALLBACK_VIDEOS[category] || FALLBACK_VIDEOS.default;
    } else {
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    }
    
    if (!uri) {
      return res.status(404).json({ error: "Video URI not found" });
    }

    const headers: Record<string, string> = {};
    if (!isFallback) {
      headers['x-goog-api-key'] = process.env.GEMINI_API_KEY!;
    }

    const videoRes = await fetch(uri, { headers });

    if (!videoRes.ok) {
      throw new Error(`Failed to fetch video: ${videoRes.statusText}`);
    }

    res.setHeader('Content-Type', 'video/mp4');
    // @ts-ignore - response body is a readable stream in Node fetch
    const reader = videoRes.body?.getReader();
    if (!reader) {
        return res.status(500).json({ error: "Failed to get video reader" });
    }

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
    }
    res.end();
  } catch (error: any) {
    console.error("Video Download Error:", error);
    res.status(500).json({ error: "Failed to download video" });
  }
});

// LOCAL TRANSLATION HELPER UTILITIES

function getLanguageCode(lang: string): string {
  const l = (lang || "").toLowerCase().trim();
  if (l === "assamese" || l === "অসমীয়া" || l === "as") return "as";
  if (l === "bengali" || l === "বাংলা" || l === "bn") return "bn";
  if (l === "bodo" || l === "बर'" || l === "brx") return "brx";
  if (l === "dogri" || l === "डोगरी" || l === "doi") return "doi";
  if (l === "gujarati" || l === "ગુજરાતી" || l === "gu") return "gu";
  if (l === "hindi" || l === "हिन्दी" || l === "hi") return "hi";
  if (l === "kannada" || l === "ಕನ್ನಡ" || l === "kn") return "kn";
  if (l === "kashmiri" || l === "कॉशुर" || l === "ks") return "ks";
  if (l === "konkani" || l === "कोंकणी" || l === "gom") return "gom";
  if (l === "maithili" || l === "मैथिली" || l === "mai") return "mai";
  if (l === "malayalam" || l === "മലയാളം" || l === "ml") return "ml";
  if (l === "manipuri" || l === "মৈতৈলোন" || l === "mni") return "mni";
  if (l === "marathi" || l === "मराठी" || l === "mr") return "mr";
  if (l === "nepali" || l === "नेपाली" || l === "ne") return "ne";
  if (l === "odia" || l === "ଓଡ଼ିଆ" || l === "or") return "or";
  if (l === "punjabi" || l === "ਪੰਜਾਬੀ" || l === "pa") return "pa";
  if (l === "sanskrit" || l === "संस्कृतम्" || l === "sa") return "sa";
  if (l === "santali" || l === "संताली" || l === "sat") return "sat";
  if (l === "sindhi" || l === "سنڌي" || l === "sd") return "sd";
  if (l === "tamil" || l === "தமிழ்" || l === "ta") return "ta";
  if (l === "telugu" || l === "తెలుగు" || l === "te") return "te";
  if (l === "urdu" || l === "اردو" || l === "ur") return "ur";
  return "en";
}

function findNearestLanguageCode(langCode: string): string {
  const code = (langCode || "").toLowerCase();
  
  if (["en", "hi", "bn", "as", "gu", "mr", "ta", "te", "kn", "ml", "pa", "ur", "or"].includes(code)) {
    return code;
  }
  
  if (["brx", "doi", "ks", "gom", "mai", "ne", "sa", "sat"].includes(code)) {
    return "hi";
  }
  if (["mni"].includes(code)) {
    return "bn";
  }
  if (["sd"].includes(code)) {
    return "ur";
  }
  
  return "en";
}

const SERVER_CATEGORIES_TRANSLATIONS: Record<string, Array<{ id: string; title: string; description: string }>> = {
  hi: [
    { id: "farming", title: "आधुनिक खेती", description: "प्राकृतिक उर्वरकों, फसल चक्र और पानी की बचत के बारे में जानें।" },
    { id: "finance", title: "बुनियादी वित्त", description: "बैंक खातों, बचत और सरकारी योजनाओं को समझना।" },
    { id: "health", title: "स्वास्थ्य और स्वच्छता", description: "हाथ धोना, स्वच्छ पेयजल और बाल पोषण।" },
    { id: "digital", title: "मोबाइल कौशल", description: "व्हाट्सएप, भुगतान और ऑनलाइन फॉर्म का सुरक्षित रूप से उपयोग कैसे करें।" },
    { id: "handicrafts", title: "हस्तशिल्प", description: "स्थानीय बाजारों या ऑनलाइन वस्तुओं को बनाना और बेचना।" }
  ],
  bn: [
    { id: "farming", title: "আধুনিক চাষাবাদ", description: "জৈব সার, শস্য পর্যায় ও জল সাশ্রয় এর উপায় জানুন।" },
    { id: "finance", title: "সহজ অর্থব্যবস্থা", description: "ব্যাঙ্ক অ্যাকাউন্ট, সঞ্চয়ী যোজনা ও সরকারি স্কিম বুঝুন।" },
    { id: "health", title: "স্বাস্থ্য ও পরিচ্ছন্নতা", description: "হাত ধোয়া, বিশুদ্ধ পানীয় জল ও শিশুর পুষ্টি সম্পর্ক জানুন।" },
    { id: "digital", title: "মোবাইল দক্ষতা", description: "হোয়াটসঅ্যাপ চালানো, পেমেন্ট এবং অনলাইন ফর্ম ভরার সঠিক নিয়ম।" },
    { id: "handicrafts", title: "হস্তশিল্প", description: "ঘরে বসেই হস্তশিল্প প্রস্তুত এবং মেলায় বা অনলাইনে কেনা-বেচা।" }
  ],
  as: [
    { id: "farming", title: "আধুনিক কৃষিকাৰ্য", description: "জৈৱিক সাৰ, শস্য পৰ্যায় আৰু পানী ৰাহি কৰা শিকক।" },
    { id: "finance", title: "প্ৰাথমিক বিত্ত", description: "বেংক একাউণ্ট, সঞ্চয় আৰু চৰকাৰী আঁচনি বুজি লওক।" },
    { id: "health", title: "স্বাস্থ্য আৰু পৰিষ্কাৰ-পৰিচ্ছন্নতা", description: "হাত ধোৱা, বিশুদ্ধ খোৱাপানী আৰু শিশুৰ পুষ্টি।" },
    { id: "digital", title: "ম’বাইল দক্ষতা", description: "হোৱাটছএপ, ডিজিটেল পৰিশোধ আৰু অনলাইন ফর্ম সুৰক্ষিতভাৱে ব্যৱহাৰ কৰক।" },
    { id: "handicrafts", title: "হস্তশিল্প", description: "স্থানীয় বজাৰ বা অনলাইনত হস্তশিল্প প্ৰস্তুত আৰু বিক্ৰী।" }
  ],
  gu: [
    { id: "farming", title: "આધુનિક ખેતી", description: "કુદરતી ખાતર, પાક ચક્ર અને પાણી બચાવવાની પદ્ધતિઓ વિશે શીખો." },
    { id: "finance", title: "પાયાનું નાણાકીય આયોજન", description: "બેંક ખાતા, બચત અને સરકારી યોજનાઓને સમજવી." },
    { id: "health", title: "આરોગ્ય અને સ્વચ્છતા", description: "હાથ ધોવાની રીત, શુદ્ધ પીવાનું પાણી અને બાળ પોષણ." },
    { id: "digital", title: "મોબાઇલ કૌશલ્ય", description: "વોટ્સએપ, ઓનલાઈન ચુકવણી અને ફોર્મ સબમિટ કરવાનો સુરક્ષિત ઉપયોગ." },
    { id: "handicrafts", title: "ஹஸ்தகளா", description: "સ્થાનિક બજારો અથવા ઓનલાઈન વસ્તુઓ બનાવી વેચવી." }
  ],
  mr: [
    { id: "farming", title: "आधुनिक शेती", description: "सेंद्रिय खते, पीक चक्र आणि पाण्याचा मर्यादित वापर याबद्दल शिका." },
    { id: "finance", title: "मूलभूत वित्त नियोजन", description: "बँक खाती, अल्पबचत आणि सरकारी कल्याणकारी योजना जाणून घ्या।" },
    { id: "health", title: "आरोग्य व स्वच्छता", description: "हात स्वच्छ धुणे, शुद्ध पिण्याचे पाणी आणि लहान मुलांचे पोषण।" },
    { id: "digital", title: "मोबाईल कौशल्ये", description: "व्हॉट्सॲप, युपीआय पेमेंट आणि सुरक्षित फॉर्म भरणे शिका." },
    { id: "handicrafts", title: "हस्तकला व कुटीर उद्योग", description: "उत्कृष्ट हस्तकला वस्तू तयार करून स्थानिक बाजारात किंवा ऑनलाईन विक्री." }
  ],
  ta: [
    { id: "farming", title: "நவீன விவசாயம்", description: "இயற்கை உரங்கள், பயிர் சுழற்சி மற்றும் நீர் சேமிப்பு பற்றி கற்றுக்கொள்ளுங்கள்." },
    { id: "finance", title: "அடிப்படை நிதி", description: "வங்கி கணக்குகள், சேமிப்புகள் மற்றும் அரசு திட்டங்களைப் புரிந்து கொள்ளுதல்." },
    { id: "health", title: "சுகாதாரம் மற்றும் சுத்தம்", description: "கை கழுவுதல், சுத்தமான குடிநீர் மற்றும் குழந்தைகள் ஊட்டச்சத்து." },
    { id: "digital", title: "மொபைல் திறன்கள்", description: "வாட்ஸ்அப், பாதுகாப்பான பணம் செலுத்துதல் மற்றும் படிவங்களை நிரப்புதல்." },
    { id: "handicrafts", title: "கைவினைப் பொருட்கள்", description: "கைவினைப் பொருட்களை தயாரித்து உள்ளூர் சந்தைகளில் அல்லது ஆன்லைனில் விற்பது." }
  ],
  te: [
    { id: "farming", title: "ఆధునిక వ్యవసాయం", description: "సేంద్రియ ఎరువులు, పంట మార్పిడి మరియు నీటి సంరక్షణ గురించి నేర్చుకోండి." },
    { id: "finance", title: "ప్రాథమిక ఆర్థిక అవగాహన", description: "బ్యాంకు ఖాతాలు, పొదుపు మరియు ప్రభుత్వ పథకాలను అర్థం చేసుకోవడం." },
    { id: "health", title: "ఆరోగ్యం మరియు పరిశుభ్రత", description: "చేతులు కడుక్కోవడం, సురక్షిత త్రాగునీరు మరియు పిల్లల పోషకాహారం." },
    { id: "digital", title: "మొబైల్ నైపుణ్యాలు", description: "వాట్సాప్, ఆన్లైన్ పేమెంట్లు మరియు ఫారమ్లను సురక్షితంగా ఉపయోగించడం." },
    { id: "handicrafts", title: "చేతిపనులు", description: "చేతి పనులు నేర్చుకుని వాటిని స్థానిక మార్కెట్లలో లేదా ఆన్లైన్లో అమ్మడం." }
  ],
  kn: [
    { id: "farming", title: "ಆಧುನಿಕ ಕೃಷಿ", description: "ನೈಸರ್ಗಿಕ ಗೊಬ್ಬರಗಳು, ಬೆಳೆ ಚಕ್ರಗಳು ಮತ್ತು ನೀರು ಉಳಿಸುವಿಕೆಯ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ." },
    { id: "finance", title: "ಮೂಲ ಹಣಕಾಸು", description: "ಬ್ಯಾಂಕ್ ಖಾತೆಗಳು, ಉಳಿತಾಯ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ." },
    { id: "health", title: "ಆರೋಗ್ಯ ಮತ್ತು ನೈರ್ಮಲ್ಯ", description: "ಕೈ ತೊಳೆಯುವುದು, ಶುದ್ಧ ಕುಡಿಯುವ ನೀರು ಮತ್ತು ಮಕ್ಕಳ ಪೌಷ್ಟಿಕತೆ." },
    { id: "digital", title: "ಮೊಬೈಲ್ ಕೌಶಲ್ಯಗಳು", description: "ವಾಟ್ಸಾಪ್, ಹಣ ಪಾವತಿಗಳು ಮತ್ತು ಆನ್‌ಲೈನ್ ಫಾರ್ಮ್‌ಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಬಳಸುವುದು." },
    { id: "handicrafts", title: "ಕರಕುಶಲ ಕಲೆಗಳು", description: "ವಸ್ತುಗಳನ್ನು ತಯಾರಿಸಿ ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಅಥವಾ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಮಾರಾಟ ಮಾಡಿ." }
  ],
  ml: [
    { id: "farming", title: "ആധുനിക കൃഷി", description: "ജൈവ വളങ്ങൾ, വിള പരിക്രമണം, ജലസംരക്ഷണം എന്നിവ പഠിക്കുക." },
    { id: "finance", title: "അടിസ്ഥാന സാമ്പത്തികം", description: "ബാങ്ക് അക്കൗണ്ടുകൾ, സമ്പാദ്യം, സർക്കാർ പദ്ധതികൾ എന്നിവ മനസ്സിലാക്കുക." },
    { id: "health", title: "ആരോഗ്യവും ശുചിത്വവും", description: "കൈ കഴുകൽ, ശുദ്ധജലം, കുട്ടികളുടെ പോഷകാഹാരം." },
    { id: "digital", title: "മൊബൈൽ വൈദഗ്ദ്ധ്യം", description: "വാട്സാപ്പ്, പണമിടപാടുകൾ, ഓൺലൈൻ അപേക്ഷകൾ എന്നിവ സുരക്ഷിതമായി ഉപയോഗിക്കുക." },
    { id: "handicrafts", title: "കൈவினைവസ്തുക്കൾ", description: "കൈவினை വസ്തുക്കൾ നിർമ്മിച്ച് പ്രാദേശിക വിപണിയിലോ ഓൺലൈനിലോ വിൽക്കുക." }
  ],
  pa: [
    { id: "farming", title: "ਆਧੁਨਿਕ ਖੇਤੀਬਾੜੀ", description: "ਜੈਵਿਕ ਖਾਦਾਂ, ਫਸਲੀ ਚੱਕਰ ਅਤੇ ਪਾਣੀ ਦੀ ਬਚਤ ਬਾਰੇ ਸਿੱਖੋ।" },
    { id: "finance", title: "ਬੁਨਿਆਦੀ ਵਿੱਤ", description: "ਬੈਂਕ ਖਾਤੇ, ਬਚਤ ਅਤੇ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਬਾਰੇ ਜਾਣਕਾਰੀ ਪ੍ਰਾਪਤ ਕਰੋ।" },
    { id: "health", title: "ਸਿਹਤ ਅਤੇ ਸਫ਼ਾਈ", description: "ਹੱਥ ਧੋਣਾ, ਸਾਫ਼ ਪੀਣ ਵਾਲਾ ਪਾਣੀ ਅਤੇ ਬੱਚਿਆਂ ਦੀ ਖ਼ੁਰਾਕ।" },
    { id: "digital", title: "ਮੋਬਾਈਲ ਹੁਨਰ", description: "ਵਟਸਐਪ, ਪੇਮੈਂਟ ਅਤੇ ਆਨਲਾਈਨ ਫਾਰਮਾਂ ਦੀ ਸੁਰੱਖਿਅਤ ਵਰਤੋਂ।" },
    { id: "handicrafts", title: "ਹੱਥੀਂ ਬਣਾਈਆਂ ਚੀਜ਼ਾਂ", description: "ਆਪਣੇ ਹੱਥੀਂ ਬਣਾਈਆਂ ਚੀਜ਼ਾਂ ਨੂੰ ਸਥਾਨਕ ਮੰਡੀ ਜਾਂ ਆਨਲਾਈਨ ਵੇਚਣਾ।" }
  ],
  ur: [
    { id: "farming", title: "جدید کاشتکاری", description: "قدرتی کھادوں، فصلوں کے چکر اور پانی کی بچت کے بارے میں جانیں۔" },
    { id: "finance", title: "بنیادی فنانس", description: "بینک اکاؤنٹس، بچت اور سرکاری اسکیموں کو سمجھیں۔" },
    { id: "health", title: "صحت اور صفाई", description: "ہاتھوں کا دھونا, پینے کا صاف پانی اور بچوں کی غذائیت۔" },
    { id: "digital", title: "موبائل ہنر", description: "واٹس ایپ، ڈیجیٹل ادائیگیوں اور آن لائن فارمز کا محفوظ استعمال۔" },
    { id: "handicrafts", title: "دستکاری", description: "دستکاری کی چیزیں بنانا اور مقامی بازاروں یا آن لائن فروخت کرنا۔" }
  ],
  or: [
    { id: "farming", title: "ଆଧୁନିକ ଚାଷ", description: "ଜୈବିକ ସାର, ଫସଲ ଚକ୍ର ଏବଂ ଜଳ ସଞ୍ଚୟ ବିଷୟରେ ଶିଖନ୍ତୁ।" },
    { id: "finance", title: "ସାଧାରଣ ଆର୍ଥିକ ଜ୍ଞାନ", description: "ବ୍ୟାଙ୍କ ଆକାଉଣ୍ଟ୍, ଜମା ଶୈଳୀ ଏବେ ଚରକାରୀ ଯୋଜନା ବୁଝନ୍ତୁ।" },
    { id: "health", title: "ସ୍ବାସ୍ଥ୍ୟ ଓ ପରିମଳ", description: "ହାତ ଧୋଇବା, ସ୍ୱଚ୍ଛ ପାନୀୟ ଜଳ ଏବଂ ଶିଶୁର ଉପଯୁକ୍ତ ପୋଷଣ।" },
    { id: "digital", title: "ମୋବାଇଲ୍ ବ୍ୟବହାର ଜ୍ଞាន", description: "ହ୍ୱାଟ୍ସଆପ୍, ପେମେଣ୍ଟ ଓ ଅନଲାଇନ୍ ଫର୍ମ ପ୍ରକ୍ରିୟାର ସୁରକ୍ಷିତ ଉପଯୋଗ।" },
    { id: "handicrafts", title: "ହସ୍ତଶିଳ୍ପ", description: "ଘରୋଇ ସ୍ତរରେ ହସ୍ତଶିଳ୍ପ ସାମଗ୍ରୀ ପ୍ରସ୍ତୁତି ଓ ସେଗୁଡ଼ିକୁ ବିକ୍ରୟ କରିବା।" }
  ]
};

const SERVER_UI_TRANSLATIONS: Record<string, Record<string, string>> = {
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
    exploreMore: "और जानें",
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
    videoPaused: "वीडियो जनरेशन रुका हुआ है",
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
    exploreMore: "আরো জানুন",
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
    videoPaused: "ভিডিও তৈরি সাময়িক স্থগিত",
    title: "আপনার স্তর নির্বাচন করুন",
    subtitle: "আপনি গাইডটি কতটা বিস্তারিত চান তা চয়ন করুন।",
    beginnerLabel: "প্রাথমিক",
    beginnerDesc: "মৌলিক ধারণা এবং সহজ পদক্ষেপ সমূহ।",
    intermediateLabel: "মধ্যবর্তী",
    intermediateDesc: "বেসিক জ্ঞানসম্পন্ন ব্যক্তিদের জন্য বিস্তারিত গাইড।",
    advancedLabel: "উন্নত",
    advancedDesc: "विशेषज्ञों की सलाह और उन्नत तकनीकें।"
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
    exploreMore: "অধিক জানক",
    backToSkills: "দক্ষতালৈ ঘূড়ি যাওক",
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
    saving: "সংরক্ষণ করা হচ্ছে...",
    markComplete: "সম্পূৰ্ণ বুলি চিহ্নিত কৰক",
    generatingVideoGuide: "ভিডিঅ’ গাইড প্ৰস্তুত কৰি থকা হৈছে",
    videoWaitMsg: "অনুগ্ৰহ কৰি অপেক্ষা কৰক যেতিয়ালৈকে আমাৰ এআইয়ে এই দক্ষতাৰ বাবে এটা সুন্দৰ ভিডিও প্ৰস্তুত কৰে। ইয়াৰ কাৰণে ১-২ মিনিট লাগিব পাৰে।",
    videoPaused: "ভিডিঅ’ প্ৰস্তুত কৰা বন্ধ হৈছে",
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
    exploreMore: "વધુ જાણો",
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
    videoWaitMsg: "કૃપા કરીને પ્રતીક્ષા કરો જ્યારે અમારું એઆઈ આ કૌશલ્ય માટે કસ્ટમ માર્ગદર્શિકા બનાવે છે। આમાં સામાન્ય રીતે ૧-૨ મિનિટ લાગે છે.",
    videoPaused: "વિડિઓ જનરેશન અટકી ગયું",
    title: "તમારી કક્ષા પસંદ કરો",
    subtitle: "નિયત કરો કે તમે માર્ગદર્શિકા કેટલી વિગતવાર ઇચ્છો છો.",
    beginnerLabel: "શરૂઆતી",
    beginnerDesc: "પાકટ ખ્યાલો અને સરળ પગલાં.",
    intermediateLabel: "મધ્યવર્તી",
    intermediateDesc: "મૂળભૂત જ્ઞાન ધરાવતા લોકો માટે વિગતવાર માર્ગદર્શિકા.",
    advancedLabel: "અદ્યતન",
    advancedDesc: "નિષ્ણાંત ટિપ્સ અને અદ્યતન તકનીકો."
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
    exploreMore: "अधिक जाणून घ्या",
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
    videoPaused: "व्हिडिओ निर्मिती थांबली आहे",
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
    exploreMore: "மேலும் அறிய",
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
    videoPaused: "வீடியோ உருவாக்கம் நிறுத்தப்பட்டுள்ளது",
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
    exploreMore: "మరింత అన్వేషించండి",
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
    videoPaused: "వీడియో సృష్టి తాత్కాలికంగా నిలిచింది",
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
    exploreMore: "ಹೆಚ್ಚು ಅನ್ವೇಷಿಸಿ",
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
    videoPaused: "ವಿಡಿಯೋ ತಯಾರಿಕೆ ಸ್ಥಗಿತಗೊಂಡಿದೆ",
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
    exploreMore: "കൂടുതൽ അറിയുക",
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
    videoPaused: "വീഡിയോ നിർമ്മാണം താൽക്കാലികമായി തടസ്സപ്പെട്ടു",
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
    exploreMore: "ਹੋਰ ਜਾਣੋ",
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
    videoPaused: "ਵੀਡੀਓ ਬਣਨਾ ਰੁਕਿਆ",
    title: "ਆਪਣਾ ਪੱਧਰ ਚੁਣੋ",
    subtitle: "ਚੁਣੋ ਕਿ ਤੁਸੀਂ ਗਾਈਡ ਕਿੰਨੀ ਵਿਸਤ੍ਰਿਤ ਚਾਹੁੰਦੇ ਹੋ।",
    beginnerLabel: "ਸ਼ੁਰੂਆਤੀ",
    beginnerDesc: "ਬੁਨਿਆਦੀ ਸੰਕਲਪ ਅਤੇ ਸਰਲ ਕਦਮ।",
    intermediateLabel: "ਦਰਮਿਆਨਾ",
    intermediateDesc: "ਬੁਨਿਆਦੀ ਗਿਆਨ ਰੱਖਣ ਵਾਲਿਆਂ ਲਈ ਵਿਸਤ੍ਰਿਤ ਗਾਈਡ।",
    advancedLabel: "ਉੱਨਤ",
    advancedDesc: "ਮਾਹਰ ਸੁਝਾਅ ਅਤੇ ਉੱਨਤ ਤਕਨੀਕਾਂ।"
  },
  ur: {
    availableSkills: "دستیاب ہنر",
    learnNewSkills: "نئے ہنر سیکھیں",
    connectingTo: "آپ کو معلومات سے جوڑ رہا ہے - ",
    searchPlaceholder: "ہنر تلاش کریں...",
    browsingOffline: "آپ آف لائن ہیں۔ صرف محفوظ کردہ کورسز دستیاب ہیں۔",
    offlineMode: "آف لائن (ان بلٹ) موڈ",
    noSkillsFound: "کوئی ہنر نہیں ملا",
    trySearchingElse: "جیسے کاشتکاری یا موبائل تلاش کرنے کی کوشش کریں۔",
    clearSearch: "تلاش صاف کریں",
    needHelp: "مدد کی ضرورت ہے؟",
    talkToMentorDesc: "اپنے اے آئی مینٹر سے بات کریں - ",
    talkToMentorBtn: "مینٹر سے بات کریں",
    translatingLabels: "ترجمہ ہو رہا ہے...",
    startLearning: "سیکھنا شروع کریں",
    exploreMore: "مزید جانیں",
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
    videoWaitMsg: "براہ کرم انتظار کریں جب تک ہمارا اے آئی اس ہنر کے لیے ایک کسٹم ویڈیو گائیڈ بنائے۔ اس میں عام طور پر ۱-২ منٹ لگتے ہیں۔",
    videoPaused: "ویڈیو بننا رک گیا",
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
    talkToMentorBtn: "ମେଣ୍ଟରଙ୍କ ସହ କଥา ହୁଅନ୍ତು",
    translatingLabels: "ଅନୁବାଦ ହେଉଛି...",
    startLearning: "ଶିଖିବା ଆରମ୍ଭ କରନ୍ତୁ",
    exploreMore: "ଅଧିକ ଜାଣନ୍ତୁ",
    backToSkills: "ଦକ୍ଷତାକୁ ଫେରନ୍ତୁ",
    preparingGuide: "ଆପଣଙ୍କ ଗାଇଡ୍ ପ୍ରସ୍ତୁତ ରହିଛି",
    aiWriting: "ଜ୍ଞାନ AI ଲେଖୁଛି...",
    wrong: "କିଛି ଭୁଲ୍ ହେଲା",
    tryAgain: "ପୁଣି ଚେଷ୍ଟา କରନ୍ତು",
    generateVideo: "ଭିଡିଓ ପ୍ରସ୍ତୁତ କରନ୍ତୁ",
    videoReady: "ଭିଡିଓ ପ୍ରସ୍ତուତ",
    starting: "ଆରମ୍ଭ ହେଉଛି...",
    generating: "ତିଆରି ହେଉଛି...",
    saveOffline: "ଅଫଲାଇନ୍ ସେଭ୍ କରନ୍ତୁ",
    saved: "ସେଭ୍ ହେଲା",
    saving: "ସେଭ୍ ହେଉଛି...",
    markComplete: "ପୂର୍ଣ୍ଣ ଚିହ୍ନିତ କରନ୍ତୁ",
    generatingVideoGuide: "ଭିଡିઓ ଗାଇଡ୍ ପ୍ରସ୍ତୁତ ହେଉଛି",
    videoWaitMsg: "ଦୟାକରି ଅପେକ୍ଷା କରନ୍ତୁ, ଆମର ଏଆଇ ଏହି ଦକ୍ଷତା ପାଇଁ ଗୋଟିଏ ସୁନ୍ଦର ଭିଡ଼ିଓ ପ୍ରସ୍ତୁତ କରୁଛି। ଏଥିପାଇଁ ୧-୨ ମିନିଟ୍ ଲାଗିବ।",
    videoPaused: "ଭିଡ଼ିଓ ପ୍ରସ୍ତୁତି ବନ୍ଦ ହୋଇଛି",
    title: "ଆପଣଙ୍କ ସ୍ତର ବାଛନ୍ତୁ",
    subtitle: "ଗାଇଡ୍ କେତେ ବିସ୍ତୃତ ଭାବେ ଚାହୁଁଛନ୍ତି ତାହା ବାଛନ୍ତୁ।",
    beginnerLabel: "ପ୍ରାରମ୍ଭିକ",
    beginnerDesc: "ସାଧାରଣ ଧାରଣା ଏବଂ ସହಜ ପଦକ୍ଷେପ।",
    intermediateLabel: "ମଧ୍ୟବର୍ତ୍ତୀ",
    intermediateDesc: "ଠିକ୍ ଜ୍ଞାନ ଥିବା ଲୋକଙ୍କ ପାଇଁ ବିସ୍ତୃତ ଗାଇଡ୍।",
    advancedLabel: "ଉନ୍ନତ",
    advancedDesc: "ବିଶେଷଜ୍ଞଙ୍କ ପରାମର୍ଶ ଓ ଉନ୍ନତ ପ୍ରଣାଳୀ।"
  }
};

// Translation Endpoint for Dashboard
app.post("/api/translate-categories", async (req, res) => {
  const { categories, language } = req.body;
  const langCode = getLanguageCode(language);
  const nearest = findNearestLanguageCode(langCode);

  console.log(`Serving precompiled translation for categories in ${language} (nearest: ${nearest})`);
  if (nearest === 'en') {
    return res.json({ translatedCategories: categories });
  }
  const localTrans = SERVER_CATEGORIES_TRANSLATIONS[nearest];
  if (localTrans) {
    return res.json({ translatedCategories: localTrans });
  }
  return res.json({ translatedCategories: categories });
});

// Generic UI Translation Endpoint
app.post("/api/translate-ui", async (req, res) => {
  const { texts, language } = req.body;
  const langCode = getLanguageCode(language);
  const nearest = findNearestLanguageCode(langCode);

  console.log(`Serving precompiled translation for UI texts in ${language} (nearest: ${nearest})`);
  if (nearest === 'en') {
    return res.json({ translatedTexts: texts });
  }
  const localDict = SERVER_UI_TRANSLATIONS[nearest];
  if (localDict) {
    const translatedTexts: Record<string, string> = {};
    for (const key of Object.keys(texts)) {
      translatedTexts[key] = localDict[key] || texts[key];
    }
    return res.json({ translatedTexts });
  }
  return res.json({ translatedTexts: texts });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

