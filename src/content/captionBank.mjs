// The actual creative content — hand-written once, reused on rotation. This is what keeps
// the whole system free: no AI-API call is needed at post time, just real store data
// (from Firestore) filled into these templates. {{placeholders}} get replaced at runtime
// by src/content/pick.mjs. Cycles through the array for each theme (index = week number
// mod array length), so nothing repeats for several weeks straight.
//
// Voice: Roman Urdu / English mix, warm, women-empowerment, casual-but-credible —
// matching HerCommerce's established brand voice.

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
        'Online business hai... but sales nahi aa rahi?',
        'Her-Commerce se apna business easily manage karo.',
        'Products showcase karo, customers tak pohoncho, aur grow karo.',
      ],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption: 'Orders track karne ke liye Excel sheets aur alag alag WhatsApp chats? Ab nahi. 📦\n\n👉 Link in bio',
      onScreenText: ['Orders bikhar gaye hain?', 'Sab kuch ek jagah manage karo 📦', 'HerCommerce free mein try karo'],
      voiceover: [
        'Orders yaad rakhna, customers ko reply karna, sab kuch bikhar jaata hai na?',
        'HerCommerce pe sab ek hi jagah — products, orders, customers.',
        'Ek app, poora business.',
      ],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption: 'Apna website banwane ke liye paise nahi hain? Aapko zaroorat hi nahi. 🆓\n\n👉 Link in bio',
      onScreenText: ['Website banwane ke paise nahi?', "Zaroorat hi nahi 🆓", 'HerCommerce pe free store banao'],
      voiceover: [
        'Lagta hai online store banwane ke liye bara budget chahiye?',
        'HerCommerce pe apna professional store bilkul free mein banta hai.',
        'Bas apne products daalo aur bechna shuru karo.',
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
      voiceover: ['Products showcase karo, customers tak pohoncho, aur grow karo.', 'Her-Commerce — your business, your growth.'],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption: 'Apna store customize karo — apna brand, apna style. 🎨\n\n👉 Link in bio',
      onScreenText: ['Apna brand, apna style 🎨', 'HerCommerce pe store customize karo', 'Colors, layout — sab aapki marzi'],
      voiceover: ['Apna store bilkul apne brand jaisa banao.', 'Colors, layout, sab kuch customize karo.', 'Bilkul free, bilkul aasan.'],
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
      hashtags: HASHTAGS_CORE,
    },
    {
      caption:
        "Meet {{ownerName}}, the woman behind {{storeName}} 💗 — {{category}} mein apna naam bana rahi hain. Support karein: {{link}}",
      hashtags: HASHTAGS_CORE,
    },
  ],
}
