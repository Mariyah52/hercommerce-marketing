// The actual creative content — hand-written once, reused on rotation. This is what keeps
// the whole system free: no AI-API call is needed at post time, just real store data
// (from Firestore) filled into these templates. {{placeholders}} get replaced at runtime
// by src/content/pick.mjs. Cycles through the array for each theme (index = week number
// mod array length), so nothing repeats for several weeks straight.
//
// Voice: Roman Urdu / English mix, warm, women-empowerment, casual-but-credible —
// matching HerCommerce's established brand voice. (Reel `voiceover` lines are written in
// actual Urdu script instead — see src/reel/build.mjs for why.)

const HASHTAGS_CORE = '#HerCommerce #WomenEntrepreneurs #OnlineBusinessPakistan #SmallBusinessPakistan #EcommercePakistan #SupportWomenOwnedBusiness #ShopLocalPakistan #StartYourJourney'

export const CAPTION_BANK = {
  // ---- Monday: carousel — tips / how-to ----
  tips: [
    {
      caption:
        "Apna online business shuru karna itna mushkil nahi jitna lagta hai. 💗\n\nYeh 5 steps follow karo aur aaj hi apna digital store live kar do — bilkul free.\n\n👉 Link in bio",
      slides: [
        'Apna online business 5 steps mein shuru karo 💗',
        '1️⃣ HerCommerce pe free account banao',
        '2️⃣ Apni category choose karo',
        '3️⃣ Products add karo — photos, price, stock',
        '4️⃣ Apna store design customize karo',
        "5️⃣ Link share karo — order aana shuru! 🎉",
      ],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption:
        "Product photos hi aapke store ki pehli impression hain. Chand chhoti tabdeeliyan, bara farq. 📸\n\n👉 Link in bio — apna store free mein banao",
      slides: [
        'Behtar product photos = zyada orders 📸',
        'Natural light use karo, flash nahi',
        'Plain background rakho — product highlight ho',
        'Multiple angles se photo lo',
        'Zoom karke details bhi dikhao',
      ],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption:
        "Customers tak pohochne ka sabse asaan tareeqa? Apna link sahi jagah share karna. 🔗\n\n👉 Link in bio",
      slides: [
        'Apna store link kahan share karo? 🔗',
        'Instagram bio mein daalo',
        'WhatsApp status pe lagao',
        'Family/friends groups mein share karo',
        'Har order ke packaging pe QR code print karo',
      ],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption:
        "Pricing confuse karti hai? Yeh simple formula try karo. 💰\n\n👉 Link in bio — apna store free mein manage karo",
      slides: [
        'Apne product ki price kaise set karo? 💰',
        'Cost price + delivery + thora profit margin',
        'Competitors ki pricing bhi dekho',
        'Bundle offers try karo (2 ke sath 1 discount)',
        'Seasonal sales pe special pricing',
      ],
      hashtags: HASHTAGS_CORE,
    },
  ],

  // ---- Tuesday: reel — problem / solution ----
  problem_solution: [
    {
      caption: 'Online business hai... but sales nahi aa rahi? Her-Commerce try karo. 💗\n\n👉 Link in bio',
      onScreenText: ['Online business hai...', 'but sales nahi aa rahi? 😩', 'Her-Commerce try karo 💗', 'Your business, your growth.'],
      voiceover: [
        'آن لائن بزنس ہے… لیکن سیلز نہیں آ رہیں؟',
        'ہر کامرس سے اپنا بزنس آسانی سے منیج کریں۔',
        'پراڈکٹس دکھائیں، کسٹمرز تک پہنچیں، اور آگے بڑھیں۔',
      ],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption: 'Orders track karne ke liye Excel sheets aur alag alag WhatsApp chats? Ab nahi. 📦\n\n👉 Link in bio',
      onScreenText: ['Orders bikhar gaye hain?', 'Sab kuch ek jagah manage karo 📦', 'HerCommerce free mein try karo'],
      voiceover: [
        'آرڈرز یاد رکھنا، کسٹمرز کو جواب دینا، سب کچھ بکھر جاتا ہے نا؟',
        'ہر کامرس پر سب ایک ہی جگہ — پراڈکٹس، آرڈرز، کسٹمرز۔',
        'ایک ایپ، پورا بزنس۔',
      ],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption: 'Apna website banwane ke liye paise nahi hain? Aapko zaroorat hi nahi. 🆓\n\n👉 Link in bio',
      onScreenText: ['Website banwane ke paise nahi?', "Zaroorat hi nahi 🆓", 'HerCommerce pe free store banao'],
      voiceover: [
        'لگتا ہے آن لائن اسٹور بنوانے کے لیے بڑا بجٹ چاہیے؟',
        'ہر کامرس پر اپنا پروفیشنل اسٹور بالکل فری میں بنتا ہے۔',
        'بس اپنی پراڈکٹس ڈالیں اور بیچنا شروع کریں۔',
      ],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption: 'DMs mein order, comments mein order, WhatsApp pe order — sab alag jagah? Sambhalna mushkil hai. 😵‍💫\n\n👉 Link in bio',
      onScreenText: ['Orders har jagah bikhre hain?', 'DMs, comments, WhatsApp — sab alag 😵‍💫', 'HerCommerce pe sab ek jagah'],
      voiceover: [
        'ڈی ایمز میں آرڈر، کمنٹس میں آرڈر، واٹس ایپ پر آرڈر — سب الگ جگہ سے سنبھالنا مشکل ہے نا؟',
        'ہر کامرس پر آپ کا پورا اسٹور ایک ہی لنک پر ہوتا ہے۔',
        'کسٹمر آرڈر کرتا ہے، آپ آسانی سے منیج کرتی ہیں۔',
      ],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption: 'Stock khatam ho gaya aur pata hi nahi chala? Customer ko bata na parhe, isse pehle fix karo. 📦\n\n👉 Link in bio',
      onScreenText: ['Stock khatam, pata hi nahi chala?', 'Customer ko mana karna padta hai 😩', 'HerCommerce pe stock track karo'],
      voiceover: [
        'اسٹاک ختم ہو جاتا ہے اور پتا ہی نہیں چلتا، پھر کسٹمر کو منع کرنا پڑتا ہے؟',
        'ہر کامرس پر اپنا اسٹاک لائیو ٹریک کریں۔',
        'جو بھی بچے، وہی دکھے — کوئی کنفیوژن نہیں۔',
      ],
      hashtags: HASHTAGS_CORE,
    },
  ],

  // ---- Wednesday: single post — quick tip / testimonial-style ----
  quick_tip: [
    {
      caption:
        "Chhota tip, bara farq: apne store ka description short aur clear rakho. Customer 3 second mein samajh jaye aap kya bechti hain. ✨\n\n👉 Link in bio",
      hashtags: HASHTAGS_CORE,
    },
    {
      caption:
        "Har hafte apna store check karo — kya products out of stock hain? Kya koi message reply ka wait kar raha hai? 5 minute ka kaam, bara farq. 💗",
      hashtags: HASHTAGS_CORE,
    },
    {
      caption:
        "Consistency hi sabse bari marketing strategy hai. Roz nahi, to hafte mein kam az kam 2-3 baar apne customers se connect rahein. 📲",
      hashtags: HASHTAGS_CORE,
    },
    {
      caption:
        "Reminder: aapka business, aapki mehnat, aapki pehchaan. Chahe chhota shuru ho, har order ek jeet hai. Keep going. 💪💗",
      hashtags: HASHTAGS_CORE,
    },
  ],

  // ---- Thursday: carousel — vision / women-empowerment storytelling ----
  vision: [
    {
      caption:
        "HerCommerce sirf ek app nahi — yeh un auraton ke liye hai jo apna kaam khud khara karna chahti hain. Ghar se, apne time pe, apni shart pe. 💗\n\n👉 Link in bio",
      slides: [
        'Har auraton ka apna business ho sakta hai 💗',
        'Ghar baithe, apne time pe kaam karo',
        'Koi bara investment nahi chahiye',
        'Sirf himmat aur ek idea chahiye',
        'HerCommerce aapke sath hai — free',
      ],
      hashtags: HASHTAGS_CORE + ' #WomenInBusiness',
    },
    {
      caption:
        "Jo auraten apna business chalati hain, wo sirf paisay nahi kamatin — apni pehchaan banati hain. HerCommerce yeh journey asaan banata hai. ✨\n\n👉 Link in bio",
      slides: [
        'Apna business = apni pehchaan ✨',
        'Financially independent banna',
        'Apne decisions khud lena',
        'Apne bachon ke liye misaal banna',
        'Yeh sab possible hai — shuru karo',
      ],
      hashtags: HASHTAGS_CORE + ' #WomenInBusiness',
    },
    {
      caption:
        "Pakistan mein hazaaron talented women hain jo bas ek platform ki talash mein hain. HerCommerce unke liye bana hai. 🇵🇰💗\n\n👉 Link in bio",
      slides: [
        'Talent hai, platform nahi tha 🇵🇰',
        'Ab hai — HerCommerce',
        'Bilkul free, poora saal',
        'Apni community, apna support system',
        'Join karo — your business, your growth',
      ],
      hashtags: HASHTAGS_CORE + ' #WomenInBusiness',
    },
  ],

  // ---- Friday: reel — feature highlight / store spotlight ----
  feature_highlight: [
    {
      caption: 'Products showcase karo, customers tak pohoncho, aur grow karo. 📈\n\n👉 Link in bio',
      onScreenText: ['New Order! 🎉', 'A customer just placed an order', 'Her-Commerce — your business, your growth'],
      voiceover: ['پراڈکٹس دکھائیں، کسٹمرز تک پہنچیں، اور آگے بڑھیں۔', 'ہر کامرس — آپ کا بزنس، آپ کی ترقی۔'],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption: 'Apna store customize karo — apna brand, apna style. 🎨\n\n👉 Link in bio',
      onScreenText: ['Apna brand, apna style 🎨', 'HerCommerce pe store customize karo', 'Colors, layout — sab aapki marzi'],
      voiceover: ['اپنا اسٹور بالکل اپنے برانڈ جیسا بنائیں۔', 'رنگ، لے آؤٹ، سب کچھ کسٹمائز کریں۔', 'بالکل فری، بالکل آسان۔'],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption: 'Achi photos, clear pricing, easy checkout — bas itna chahiye customer ko order karne ke liye. ✨\n\n👉 Link in bio',
      onScreenText: ['Customer order kab karta hai? ✨', 'Achi photos + clear pricing', 'HerCommerce pe dono asaan hain'],
      voiceover: [
        'کسٹمر آرڈر تب کرتا ہے جب تصویریں اچھی ہوں اور قیمت واضح ہو۔',
        'ہر کامرس پر اپنا کیٹلاگ پروفیشنل دکھائیں۔',
        'آسان چیک آؤٹ، زیادہ آرڈرز۔',
      ],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption: 'Naye customers tak pohonchna mushkil lagta hai? Apna store link sahi jagah share karo aur dekho farq. 🚀\n\n👉 Link in bio',
      onScreenText: ['Naye customers tak kaise pohonchein? 🚀', 'Apna link sahi jagah share karo', 'HerCommerce — your business, your growth'],
      voiceover: [
        'نئے کسٹمرز تک پہنچنا مشکل لگتا ہے؟',
        'اپنا ہر کامرس لنک انسٹاگرام، واٹس ایپ، ہر جگہ شیئر کریں۔',
        'جتنا شیئر، اتنی ترقی۔',
      ],
      hashtags: HASHTAGS_CORE,
    },
  ],

  // ---- Saturday: single post — community engagement ----
  community: [
    {
      caption:
        "Aapka store kis cheez ke liye mashhoor hai? Comments mein batayein — best answer ko agle hafte feature karenge! 👇💗",
      hashtags: HASHTAGS_CORE,
    },
    {
      caption:
        "Tag a woman who should start her own online business today. Shayad yeh unki push ho jo unhein chahiye. 💗👇",
      hashtags: HASHTAGS_CORE,
    },
    {
      caption:
        "Poll: aapka business start karne ka sabse bara darr kya tha? 1️⃣ Paisa 2️⃣ Time 3️⃣ Confidence — comments mein batayein 👇",
      hashtags: HASHTAGS_CORE,
    },
  ],

  // ---- Store spotlight (manual pick / unlocked after ~40 stores) ----
  // Filled with real data at post time — {{storeName}}, {{ownerName}}, {{category}}, {{link}}.
  store_spotlight: [
    {
      caption:
        "This week's spotlight: {{storeName}} 💗 — {{category}} ka khoobsurat collection. {{ownerName}} ki mehnat aur creativity ko salute. Check out their store: {{link}}\n\n👉 Apna bhi store banao — link in bio",
      onScreenText: ["This week's spotlight 💗", '{{storeName}}', '{{category}} ka khoobsurat collection'],
      voiceover: [
        'اس ہفتے کا اسپاٹ لائٹ ہے {{storeName}}۔',
        '{{ownerName}} کی محنت اور تخلیقی صلاحیت کو سلیوٹ۔',
        'ان کا اسٹور چیک کریں، لنک بائیو میں ہے۔',
      ],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption:
        "Meet {{ownerName}}, the woman behind {{storeName}} 💗 — {{category}} mein apna naam bana rahi hain. Support karein: {{link}}",
      onScreenText: ['Meet {{ownerName}} 💗', 'the woman behind {{storeName}}', '{{category}} mein apna naam bana rahi hain'],
      voiceover: [
        'ملیے {{ownerName}} سے، جو {{storeName}} کے پیچھے ہیں۔',
        '{{category}} میں اپنا نام بنا رہی ہیں۔',
        'انہیں سپورٹ کریں — لنک بائیو میں ہے۔',
      ],
      hashtags: HASHTAGS_CORE,
    },
  ],
}
