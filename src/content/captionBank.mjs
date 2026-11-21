// The actual creative content — hand-written once, reused on rotation. This is what keeps
// the whole system free: no AI-API call is needed at post time, just real store data
// (from Firestore) filled into these templates. {{placeholders}} get replaced at runtime
// by src/content/pick.mjs. Cycles through the array for each theme (index = week number
// mod array length), so nothing repeats for several weeks straight.
//
// Voice: Roman Urdu / English mix, warm, women-empowerment, casual-but-credible —
// matching HerCommerce's established brand voice. Reel `voiceover` lines are ALSO written in
// Roman Urdu (Urdu in English letters): they are spoken by the English-India voice
// "Neerja", which reads Roman Urdu clearly but cannot read Urdu script at all (tested).
// Keep the brand written as "Her Commerce" so it is pronounced correctly.

const HASHTAGS_CORE = '#HerCommerce #WomenEntrepreneurs #OnlineBusinessPakistan #SmallBusinessPakistan #EcommercePakistan #SupportWomenOwnedBusiness #ShopLocalPakistan #StartYourJourney'

export const CAPTION_BANK = {
  // ---- Monday: carousel — tips / how-to ----
  tips: [
    {
      caption:
        "Naye client ko apna sab kuch kaise dikhayein? 4 asaan steps. 🔗\n\n👉 Link in bio — apna store free mein banayein",
      slides: [
        'Naye client ko kaise bhejein? 🔗',
        'Products HerCommerce par ek baar add karo 📦',
        'Client ne pucha? Sirf apna store link bhejo',
        'Photos aur prices wahan khud dekh lega',
        'Order seedha aap tak — koi bar bar message nahi ✅',
      ],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption:
        "HerCommerce kya hai? Free online store, jahan aap products ek baar add karte hain aur sirf link share karte hain. Marketing mein bhi hum aapke saath hain. 💗\n\n👉 Link in bio",
      slides: [
        'HerCommerce kya hai? 💗',
        'Free online store — Shopify jaisi dollar wali monthly fees nahi 💸',
        'Products sirf ek baar add karo 📦',
        'WhatsApp par baar baar photos nahi, sirf apna link bhejo 🔗',
        'Hum aapke store ki marketing bhi karte hain 📣',
        'Aaj hi free store banao — link in bio',
      ],
      hashtags: HASHTAGS_CORE,
    },
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
      caption: 'Doosre sellers se milna chahte hain? Hamara WhatsApp group join karein. 💬\n\n{{groupLink}}',
      onScreenText: ['Akeli seller feel ho rahi hai? 🥺', 'Hamara WhatsApp group join karo 💬', 'Tips, support, aur community 💗'],
      voiceover: [
        'Business akele chalana mushkil lagta hai?',
        'Her Commerce ka WhatsApp group join karein, tips, support, aur doosre sellers se milna.',
        'Link caption mein hai.',
      ],
      hashtags: HASHTAGS_CORE,
    },
    // ---- "What is HerCommerce" messages (Nov 2026): Shopify cost / we market your products / add once, share link ----
    {
      caption: 'Online presence barhani hai, lekin Shopify jaisi dollar wali monthly fees nahi dena chahte? 💸 HerCommerce par apna store bilkul free banayein.\n\n👉 Link in bio',
      onScreenText: ['Online presence barhani hai?', 'Shopify ki monthly fees dollars mein 💸', 'HerCommerce pe store bilkul free 💗'],
      voiceover: [
        'Apni online presence barhana chahte hain, lekin Shopify ki monthly fees dollars mein hoti hai?',
        'Her Commerce par aapka store bilkul free hai.',
        'Aaj hi apna store banayein aur bechna shuru karein.',
      ],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption: 'Aap sirf products add karein, marketing hum karte hain. 📣 HerCommerce aapke store ko apne pages par feature karta hai.\n\n👉 Link in bio',
      onScreenText: ['Products aap add karo 📦', 'Marketing hum karte hain 📣', 'HerCommerce pe apna store banao 💗'],
      voiceover: [
        'Aap sirf apne products add karein.',
        'Her Commerce aapke store ko apne Instagram aur Facebook par feature karta hai.',
        'Aap bechein, marketing hum sambhalte hain.',
      ],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption: 'Har customer ko WhatsApp par baar baar photos aur prices bhejna band karein. 📲 Products ek baar add karein, phir sirf apna link share karein.\n\n👉 Link in bio',
      onScreenText: ['Baar baar photos bhejna? 😩', 'Products sirf ek baar add karo', 'Phir sirf apna link bhejo 🔗'],
      voiceover: [
        'Har customer ko WhatsApp par baar baar photos aur prices bhejte hain?',
        'Her Commerce par products sirf ek baar add karein.',
        'Phir sirf apna store link bhejein, baaki sab customer khud dekh lega.',
      ],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption: 'Online business hai... but sales nahi aa rahi? Her-Commerce try karo. 💗\n\n👉 Link in bio',
      onScreenText: ['Online business hai...', 'but sales nahi aa rahi? 😩', 'Her-Commerce try karo 💗', 'Your business, your growth.'],
      voiceover: ['Online business hai, lekin sales nahi aa rahi?','Her Commerce se apna business aasani se manage karein.','Products dikhayein, customers tak pahunchein, aur aage badhein.'],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption: 'Orders track karne ke liye Excel sheets aur alag alag WhatsApp chats? Ab nahi. 📦\n\n👉 Link in bio',
      onScreenText: ['Orders bikhar gaye hain?', 'Sab kuch ek jagah manage karo 📦', 'HerCommerce free mein try karo'],
      voiceover: ['Orders yaad rakhna, customers ko jawab dena, sab kuch bikhar jata hai na?','Her Commerce par sab ek hi jagah, products, orders, customers.','Ek app, poora business.'],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption: 'Apna website banwane ke liye paise nahi hain? Aapko zaroorat hi nahi. 🆓\n\n👉 Link in bio',
      onScreenText: ['Website banwane ke paise nahi?', "Zaroorat hi nahi 🆓", 'HerCommerce pe free store banao'],
      voiceover: ['Lagta hai online store banwane ke liye bara budget chahiye?','Her Commerce par apna professional store bilkul free mein banta hai.','Bas apne products daalein aur bechna shuru karein.'],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption: 'DMs mein order, comments mein order, WhatsApp pe order — sab alag jagah? Sambhalna mushkil hai. 😵‍💫\n\n👉 Link in bio',
      onScreenText: ['Orders har jagah bikhre hain?', 'DMs, comments, WhatsApp — sab alag 😵‍💫', 'HerCommerce pe sab ek jagah'],
      voiceover: ['DMs mein order, comments mein order, WhatsApp par order, sab alag jagah se sambhalna mushkil hai na?','Her Commerce par aapka poora store ek hi link par hota hai.','Customer order karta hai, aap aasani se manage kar sakte hain.'],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption: 'Stock khatam ho gaya aur pata hi nahi chala? Customer ko bata na parhe, isse pehle fix karo. 📦\n\n👉 Link in bio',
      onScreenText: ['Stock khatam, pata hi nahi chala?', 'Customer ko mana karna padta hai 😩', 'HerCommerce pe stock track karo'],
      voiceover: ['Stock khatam ho jata hai aur pata hi nahi chalta, phir customer ko mana karna parta hai?','Her Commerce par apna stock live track karein.','Jo bhi bache, wohi dikhe, koi confusion nahi.'],
      hashtags: HASHTAGS_CORE,
    },
  ],

  // ---- Wednesday: single post — quick tip / testimonial-style ----
  quick_tip: [
    {
      caption:
        "Naye customer ne register kiya ya pooch liya? Saare products WhatsApp par bhejne ki zaroorat nahi. Bas apne HerCommerce store ka link bhej dein, wo sab kuch khud dekh lega. 🔗\n\n👉 Apna free store banayein — link in bio",
      hashtags: HASHTAGS_CORE,
    },
    {
      caption:
        "\"Price kya hai?\" — har baar photo na bhejein. Ek link bhejein, products aur prices sab wahan hain. 💬➡️🔗\n\n👉 Link in bio",
      hashtags: HASHTAGS_CORE,
    },
    {
      caption:
        "Apna store link kahan lagayein? Instagram bio, WhatsApp status, packaging, visiting card. Ek link, poora catalog. 🔗✨\n\n👉 Link in bio",
      hashtags: HASHTAGS_CORE,
    },
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
      caption: 'HerCommerce kya hai? 3 baatein jo aapko jaanni chahiye. 💗\n\n👉 Link in bio',
      onScreenText: ['HerCommerce kya hai? 💗', '1. Free online store, dollar wali fees nahi', '2. Aapke products ki marketing hum karte hain', '3. Products ek baar add karo, sirf link bhejo'],
      voiceover: [
        'Her Commerce kya hai? Teen baatein.',
        'Pehli, aapka online store bilkul free hai, Shopify jaisi dollar wali fees nahi.',
        'Doosri, aapke products ki marketing hum karte hain.',
        'Teesri, products sirf ek baar add karein, phir WhatsApp par sirf link bhejein.',
      ],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption: 'Products showcase karo, customers tak pohoncho, aur grow karo. 📈\n\n👉 Link in bio',
      onScreenText: ['New Order! 🎉', 'A customer just placed an order', 'Her-Commerce — your business, your growth'],
      voiceover: ['Products dikhayein, customers tak pahunchein, aur aage badhein.','Her Commerce, aapka business, aapki taraqqi.'],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption: 'Apna store customize karo — apna brand, apna style. 🎨\n\n👉 Link in bio',
      onScreenText: ['Apna brand, apna style 🎨', 'HerCommerce pe store customize karo', 'Colors, layout — sab aapki marzi'],
      voiceover: ['Apna store bilkul apne brand jaisa banayein.','Rang, layout, sab kuch customize karein.','Bilkul free, bilkul aasaan.'],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption: 'Achi photos, clear pricing, easy checkout — bas itna chahiye customer ko order karne ke liye. ✨\n\n👉 Link in bio',
      onScreenText: ['Customer order kab karta hai? ✨', 'Achi photos + clear pricing', 'HerCommerce pe dono asaan hain'],
      voiceover: ['Customer order tab karta hai jab tasveerein achhi hon aur qeemat wazeh ho.','Her Commerce par apna catalog professional dikhayein.','Aasaan checkout, zyada orders.'],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption: 'Naye customers tak pohonchna mushkil lagta hai? Apna store link sahi jagah share karo aur dekho farq. 🚀\n\n👉 Link in bio',
      onScreenText: ['Naye customers tak kaise pohonchein? 🚀', 'Apna link sahi jagah share karo', 'HerCommerce — your business, your growth'],
      voiceover: ['Naye customers tak pahunchna mushkil lagta hai?','Apna Her Commerce link Instagram, WhatsApp, har jagah share karein.','Jitna share, utni taraqqi.'],
      hashtags: HASHTAGS_CORE,
    },
  ],

  // ---- Saturday: single post — community engagement ----
  community: [
    {
      caption:
        "Hamara HerCommerce WhatsApp group join karein: tips, support aur doosre sellers se milna. 💬💗\n\nJoin karne ka link: {{groupLink}}",
      hashtags: HASHTAGS_CORE,
    },
    {
      caption:
        "Naye brands HerCommerce par aa rahe hain — swagat! 🎉 Aapka store bhi hai? Comments mein apna Instagram handle likhein, hum aapke saath collab post karenge. 🤝👇",
      hashtags: HASHTAGS_CORE,
    },
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
      voiceover: ['Is hafte ka spotlight hai {{storeName}}.','{{ownerName}} ki mehnat aur takhleeqi salahiyat ko salute.','Unka store check karein, link bio mein hai.'],
      hashtags: HASHTAGS_CORE,
    },
    {
      caption:
        "Meet {{ownerName}}, the woman behind {{storeName}} 💗 — {{category}} mein apna naam bana rahi hain. Support karein: {{link}}",
      onScreenText: ['Meet {{ownerName}} 💗', 'the woman behind {{storeName}}', '{{category}} mein apna naam bana rahi hain'],
      voiceover: ['Miliye {{ownerName}} se, jo {{storeName}} ke peeche hain.','{{category}} mein apna naam bana rahe hain.','Unhein support karein, link bio mein hai.'],
      hashtags: HASHTAGS_CORE,
    },
  ],
}
