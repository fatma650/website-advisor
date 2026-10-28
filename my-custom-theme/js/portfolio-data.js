/**
 * ADVISOR AGENCY - PORTFOLIO CASE STUDIES DATA
 * Real client data, campaign copy, art direction notes, and extracted assets.
 */

// كل مشروع: id ثابت، category للفلترة، خدمات، قصة، نتائج، ثم صور مع وصف ونسبة أبعاد.
// لتعديل الأرقام والمحتوى الإنجليزي ابدأ هنا، وأضف المقابل في project-translations.js.
window.ADVISOR_PROJECTS = [
  {
    id: "deyar",
    category: "REAL ESTATE",
    number: "01",
    title: "DEYAR RESIDENCES",
    subtitle: "High-End Property Investment & Living Experience",
    year: "2024",
    client: "Deyar Developments (ديار)",
    location: "Sheikh Zayed & 6th of October, Egypt",
    services: [
      "Social Media Strategy",
      "Creative Direction",
      "Visual Design",
      "Arabic & English Copywriting",
      "Campaign Art Direction"
    ],
    summary: "A premium real estate social media campaign repositioning luxury living and high-yield property investment in West Cairo through editorial storytelling and architectural transparency.",
    heroImage: "assets/portfolio/deyar/deyar_hero_model.jpg",
    boardImage: "assets/portfolio/deyar/deyar_campaign_board.jpg",
    challenge: `Real estate marketing in Egypt has become oversaturated with generic 3D renders, repetitive sales jargon, and uninspired discount offers. Deyar needed to cut through this market fatigue to launch their exclusive 14-unit residential boutique collection and premium rental suites. The key hurdle was reaching discerning, upper-middle-class investors and tenants who value design integrity, location prestige, and realistic financial returns rather than exaggerated promises.`,
    approach: `In line with ADVISOR's core philosophy—"Strategy before noise"—we avoided typical hard-selling tactics. Instead, we developed a multi-layered narrative campaign built around three strategic pillars:
    1. Financial Intelligence: Clear, transparent messaging highlighting up to 13,000 EGP/month rental income and low-friction ownership models.
    2. Educational Value: Informative carousels addressing critical buyer questions: "Before you buy... know what you truly own" and "5 reasons to consider Deyar".
    3. Tactile Architecture: Framing homes as sensory retreats rather than square meters—"A Space To Stay, A Place To Experience."`,
    creativeDirection: `We established an editorial visual identity rooted in warm architectural minimalism. Using sun-drenched natural lighting, deep dramatic cast shadows, and tactile interior materials (warm woods, textured linens, clean bronze hardware), every visual felt calm, premium, and lived-in. Arabic typography was set in bold contemporary weights paired with clean geometric Latin accents, creating instant prestige on mobile feeds.`,
    results: [
      { label: "Sales Target", value: "100% In 45 Days", desc: "All 14 boutique units reserved within initial launch phase." },
      { label: "Rental Inquiries", value: "+380%", desc: "Surge in qualified high-budget tenancy applications." },
      { label: "Cost Per Lead", value: "-42%", desc: "Significant reduction compared to industry benchmarks through high organic save rates." }
    ],
    gallery: [
      {
        src: "assets/portfolio/deyar/deyar_hero_model.jpg",
        caption: "Campaign Master Visual — 'قبل ما تشتري... اعرف إنت بتملك إيه' (Before you buy... know what you own)",
        ratio: "4:3"
      },
      {
        src: "assets/portfolio/deyar/deyar_bedroom.jpg",
        caption: "Interior Detail — 'الجودة تبدأ من التفاصيل' (Quality begins in the details)",
        ratio: "4:5"
      },
      {
        src: "assets/portfolio/deyar/deyar_keyhole.jpg",
        caption: "Rental Value Proposition — 'مش هتحتاج تدور على مستأجر بنفسك - Rental up to 13,000 EGP/mo'",
        ratio: "4:5"
      },
      {
        src: "assets/portfolio/deyar/deyar_5reasons.jpg",
        caption: "Investor Carousel — '5 أسباب تخليك تفكر في ديار' (5 reasons to consider Deyar)",
        ratio: "4:5"
      },
      {
        src: "assets/portfolio/deyar/deyar_shadow_study.jpg",
        caption: "Atmospheric Visual — 'A Space To Stay, A Place To Experience'",
        ratio: "4:5"
      },
      {
        src: "assets/portfolio/deyar/deyar_14units.jpg",
        caption: "Scarcity Launch Visual — '14 Units Available - طريقة مختلفة للتملك والاستثمار'",
        ratio: "4:5"
      },
      {
        src: "assets/portfolio/deyar/deyar_door_key.jpg",
        caption: "Entry Point Campaign — 'الإستثمار العقاري مش لازم يبدأ بشقة'",
        ratio: "4:5"
      }
    ]
  },
  {
    id: "elbasha",
    category: "AUTOMOTIVE",
    number: "02",
    title: "EL BASHA MOTORS",
    subtitle: "Precision Diagnostic Engineering & Transparency Campaign",
    year: "2024",
    client: "El Basha Car Diagnostic Center (مركز الباشا)",
    location: "Cairo, Egypt",
    services: [
      "Brand Positioning",
      "Social Media Campaign",
      "Art Direction",
      "Creative Copywriting",
      "Digital Advertising"
    ],
    summary: "Transforming automotive diagnostics in Egypt into a trusted, high-tech experience through the viral campaign '#الخبرة_تحكم' (Experience Governs).",
    heroImage: "assets/portfolio/elbasha/elbasha_hero_dent.jpg",
    boardImage: "assets/portfolio/elbasha/elbasha_campaign_board.jpg",
    challenge: `The used car inspection and workshop market in Egypt suffers from pervasive skepticism. Vehicle buyers and owners are frequently worried about undisclosed collision damage, falsified chassis reports, and superficial checks. El Basha Center needed to clearly differentiate itself from ordinary mechanics and establish itself as the definitive scientific authority for vehicle inspection.`,
    approach: `Advisor conceptualized the signature brand campaign: '#الخبرة_تحكم' (Experience Governs). We shifted the brand away from greasy garage tropes into a forensic automotive laboratory. Every creative delivered uncompromising clarity:
    • Macro close-ups exposing subtle structural dents: 'مش كل خبطة تبان' (Not every dent is obvious).
    • Computerized diagnostics and voltage load tests: 'فحص إلكتروني.. يطمنك على عربيتك'.
    • Definitive printed certification warranties: 'نتيجة تستند عليها' (A result you can bank on).`,
    creativeDirection: `A high-impact, technical color palette anchored by electric cobalt blue (#0052FF), clean stark white, and deep obsidian black. We utilized bold angular speed diagonals, precision millimeter measurement callouts, and tactile macro vehicle photography to establish institutional authority.`,
    results: [
      { label: "Diagnostic Bookings", value: "+240%", desc: "Massive increase in pre-purchase vehicle examination bookings." },
      { label: "Campaign Impressions", value: "1.2M+", desc: "Targeted reach across car enthusiast groups and prospective buyers." },
      { label: "Brand Trust Index", value: "98%", desc: "Rated top recommended inspection center across Cairo automotive forums." }
    ],
    gallery: [
      {
        src: "assets/portfolio/elbasha/elbasha_hero_dent.jpg",
        caption: "Hero Campaign Visual — 'مش كل خبطة تبان - #الخبرة_تحكم' (Not every dent is obvious - Experience Governs)",
        ratio: "4:3"
      },
      {
        src: "assets/portfolio/elbasha/elbasha_keys_handover.jpg",
        caption: "Handover Assurance — 'الخبرة بتفرق' (Experience makes the difference)",
        ratio: "4:5"
      },
      {
        src: "assets/portfolio/elbasha/elbasha_battery_diagnostics.jpg",
        caption: "High-Tech Diagnostics — 'فحص إلكتروني.. يطمنك على عربيتك'",
        ratio: "4:5"
      },
      {
        src: "assets/portfolio/elbasha/elbasha_medal_keys.jpg",
        caption: "Quality Benchmark — 'ليه تختار مركز الباشا' (Why choose El Basha Center)",
        ratio: "4:5"
      },
      {
        src: "assets/portfolio/elbasha/elbasha_blue_suv.jpg",
        caption: "Certified Inspection Tape — 'نتيجة تستند عليها'",
        ratio: "4:5"
      },
      {
        src: "assets/portfolio/elbasha/elbasha_inspection_checkmark.jpg",
        caption: "Digital Seal of Approval — The comprehensive certified diagnostic inspection checklist",
        ratio: "4:5"
      }
    ]
  },
  {
    id: "farida",
    category: "FASHION",
    number: "03",
    title: "FARIDA HAUTE COUTURE",
    subtitle: "Tactile Luxury & Modern Feminine Sophistication",
    year: "2024",
    client: "Farida Women's Fashion (أزياء فريدة)",
    location: "Cairo & Alexandria, Egypt",
    services: [
      "Editorial Art Direction",
      "Fashion Lookbook Design",
      "Social Media Aesthetic",
      "Content Strategy",
      "Typography Guidelines"
    ],
    summary: "Elevating contemporary women's fashion through editorial craftsmanship, fabric-first visual storytelling, and high-fashion aesthetics under the banner 'Feel The Elegance'.",
    heroImage: "assets/portfolio/farida/farida_hero_texture.jpg",
    boardImage: "assets/portfolio/farida/farida_campaign_board.jpg",
    challenge: `The women's ready-to-wear landscape in the Middle East is heavily crowded with fast-fashion copies and low-cost mass production. Farida needed to showcase the premium tailoring, rich fabric blends, and thoughtful silhouette design of their apparel to justify a higher price point and build lasting brand loyalty among stylish, discerning women.`,
    approach: `Advisor crafted a high-fashion campaign built on sensory tactile connection: 'Feel The Elegance'. Rather than standard catalogue shots, we placed rich textile intimacy front and center. We highlighted:
    • Heavy macro weaves of deep wine-red jacquard fabric against crisp selvedge denim.
    • Clean, architectural silhouettes that flatter diverse body types effortlessly.
    • Curated day-to-evening collections: breezy smocked dresses, pleated midi skirts, and tailored matching sets.`,
    creativeDirection: `Inspired by European fashion publishing (Vogue, Harper's Bazaar), we utilized generous whitespace, oversized elegant serif lettering ('Farida'), minimalist neutral backdrops, and natural fabric texture details. Every post feels like an editorial tear-sheet from a luxury magazine.`,
    results: [
      { label: "Collection Sellout", value: "100% In 3 Weeks", desc: "Hero pieces sold out completely during the first drop." },
      { label: "Instagram Saves", value: "4.2x", desc: "Exponential increase in audience collection bookmarks and style shares." },
      { label: "Brand Equity", value: "+180%", desc: "Elevated perceived brand tier into accessible luxury." }
    ],
    gallery: [
      {
        src: "assets/portfolio/farida/farida_hero_texture.jpg",
        caption: "Sensory Texture Macro — 'Feel The Elegance - High quality material'",
        ratio: "4:3"
      },
      {
        src: "assets/portfolio/farida/farida_white_dress.jpg",
        caption: "Minimalist Studio Silhouette — The Smocked Linen Summer Dress",
        ratio: "1:1"
      },
      {
        src: "assets/portfolio/farida/farida_skirts_lineup.jpg",
        caption: "Pattern & Silhouette Study — Farida Curated Summer Midi Skirts Lineup",
        ratio: "1:1"
      },
      {
        src: "assets/portfolio/farida/farida_dark_trousers.jpg",
        caption: "Tailoring Excellence — High-Waist Relaxed Trouser Cut",
        ratio: "1:1"
      },
      {
        src: "assets/portfolio/farida/farida_pink_suit.jpg",
        caption: "Lounge Sophistication — Pastel Blush Two-Piece Ensemble",
        ratio: "1:1"
      }
    ]
  },
  {
    id: "hadaya",
    category: "GIFTS & LIFESTYLE",
    number: "04",
    title: "HADAYA BEDAYA",
    subtitle: "Sacred Milestones & Bespoke Ceremonial Keepsakes",
    year: "2024",
    client: "Hadaya Bedaya Gifts (هدايا بداية)",
    location: "Egypt & Saudi Arabia",
    services: [
      "Product Art Direction",
      "Seasonal Campaigns",
      "Packaging Design Direction",
      "Social Media Strategy",
      "Emotional Copywriting"
    ],
    summary: "Reimagining Hajj, Umrah, and life-milestone gifting through bespoke artisanal presentation and emotionally resonant visual storytelling.",
    heroImage: "assets/portfolio/hadaya/hadaya_hero_hamper.png",
    boardImage: "assets/portfolio/hadaya/hadaya_campaign_board.jpg",
    challenge: `Spiritual keepsakes and event giveaways (Hajj, Umrah, newborn celebrations, graduations) in the Arab region are often packaged cheaply in generic plastic. Hadaya Bedaya wanted to offer elevated, bespoke gift hampers that honor the sacred and celebratory weight of life's most precious occasions.`,
    approach: `Advisor transformed the brand's social presence into a gallery of celebration and reverence:
    • 'مش مجرد هدية... دي ذكرى بتفضل' (Not just a gift... it's a memory that lasts).
    • Showcasing velvet Quran cases, pearl prayer beads, and personalized fragrance bottles in bespoke wooden and woven presentation baskets.
    • Launching dedicated seasonal collections for Graduation ('كل مناسبة لها توزيعة تليق بيها') and Newborn Milestones ('تفاصيل صغيرة... بتكمل فرحة كبيرة').`,
    creativeDirection: `Warm, natural, and reverent. We paired organic woven textures, delicate dried eucalyptus and baby's-breath florals, warm ambient lighting, and bespoke Arabic calligraphy to evoke feelings of warmth, gratitude, and blessed remembrance.`,
    results: [
      { label: "Pilgrimage Season Orders", value: "+310%", desc: "Highest seasonal turnover in company history for Hajj & Umrah sets." },
      { label: "Repeat Customers", value: "64%", desc: "High customer loyalty driven by packaging delight." },
      { label: "Regional Reach", value: "KSA & UAE", desc: "Expanded shipping footprint to Gulf markets." }
    ],
    gallery: [
      {
        src: "assets/portfolio/hadaya/hadaya_hero_hamper.png",
        caption: "Hero Gift Hamper — 'يومهم المميز... يستاهل هدية مميزة' (Their special day deserves a special gift)",
        ratio: "4:3"
      },
      {
        src: "assets/portfolio/hadaya/hadaya_graduation_favors.png",
        caption: "Graduation Keepsakes — 'كل مناسبة لها توزيعة تليق بيها' (Every occasion deserves a worthy giveaway)",
        ratio: "1:1"
      },
      {
        src: "assets/portfolio/hadaya/hadaya_baby_gifts.png",
        caption: "Newborn Celebrations — 'تفاصيل صغيرة... بتكمل فرحة كبيرة' (Small details complete great joy)",
        ratio: "1:1"
      },
      {
        src: "assets/portfolio/hadaya/hadaya_hajj_quran.png",
        caption: "Hajj & Umrah Heritage Set — 'مش مجرد هدية... دي ذكرى بتفضل' (A memory that remains)",
        ratio: "1:1"
      },
      {
        src: "assets/portfolio/hadaya/hadaya_umrah_bags.png",
        caption: "Sacred Souvenirs — 'هدية بسيطة لمناسبة سعيدة' (Bespoke gift boxes for blessed returns)",
        ratio: "1:1"
      }
    ]
  },
  {
    id: "superlab",
    category: "MEDICAL & HEALTHCARE",
    number: "05",
    title: "SUPER LAB DIAGNOSTICS",
    subtitle: "Empathetic Healthcare Communication & Medical Insight",
    year: "2024",
    client: "Super Lab Clinical Laboratories (معامل سوبر للتحاليل الطبية)",
    location: "Greater Cairo, Egypt",
    services: [
      "Healthcare Marketing Strategy",
      "Medical Copywriting",
      "Campaign Art Direction",
      "Patient Journey Mapping",
      "Community Awareness"
    ],
    summary: "Humanizing clinical diagnostic testing through warm, relatable lifestyle storytelling, accessible scientific clarity, and empowering patient awareness.",
    heroImage: "assets/portfolio/superlab/superlab_hero_scale.png",
    boardImage: "assets/portfolio/superlab/superlab_campaign_board.jpg",
    challenge: `Medical laboratories frequently intimidate patients with cold clinical terminology, scary disease warnings, or unapproachable diagnostic menus. Super Lab wanted to bridge the gap between complex clinical science and daily human health, motivating people to take proactive care of their bodies without anxiety.`,
    approach: `Advisor transformed clinical testing from an anxious duty into a journey of self-care and empowerment under the motto: 'دقة النتائج.. رحلة مش خطوة' (Diagnostic accuracy is a journey, not just a step). We targeted real-life patient struggles:
    • The metabolic plateau: 'وزنك ثابت مهما حاولتي؟' (Is your weight stuck no matter how hard you try?).
    • Differentiating symptoms: 'عندنا أنيميا ولا نقص حديد بس؟' (Do we have anemia or just iron deficiency?).
    • Age-specific wellness: Preventive blood screenings for people in their 30s.
    • Pre-marriage readiness: Emotional reassurance before starting a family.`,
    creativeDirection: `Warm, uplifting, and human-centric. Soft warm-toned photography, reassuring physician consultations, 3D medical illustrations (red blood cells and clinical glass test tubes) rendered with gold and soft white light rather than sterile hospital blue.`,
    results: [
      { label: "Screening Bookings", value: "+320%", desc: "Surge in comprehensive wellness and metabolic testing appointments." },
      { label: "Community Engagement", value: "45K+", desc: "Organic shares and questions answered in comments." },
      { label: "Patient Retention", value: "78%", desc: "Patients opting for periodic annual health monitoring." }
    ],
    gallery: [
      {
        src: "assets/portfolio/superlab/superlab_hero_scale.png",
        caption: "Metabolic Awareness Hero — 'وزنك ثابت مهما حاولتي؟' (Is your weight stuck no matter what you try?)",
        ratio: "4:3"
      },
      {
        src: "assets/portfolio/superlab/superlab_blood_cells.png",
        caption: "Hematology Insight — 'عندنا أنيميا ولا نقص حديد بس؟' (Anemia vs. Iron Deficiency)",
        ratio: "1:1"
      },
      {
        src: "assets/portfolio/superlab/superlab_test_tube.png",
        caption: "Scientific Precision — 'دقة النتائج.. رحلة مش خطوة' (Accuracy is a journey)",
        ratio: "1:1"
      },
      {
        src: "assets/portfolio/superlab/superlab_clinic_consultation.png",
        caption: "Preventative Screening — 'لو إنت في الـ 30... اعرف إيه المناسب لجسمك'",
        ratio: "1:1"
      },
      {
        src: "assets/portfolio/superlab/superlab_premarriage.jpg",
        caption: "Pre-Marital Screenings — 'قبل الفرح.. ماتنساش أهم خطوة'",
        ratio: "1:1"
      }
    ]
  },
  {
    id: "logofolio",
    category: "BRANDING",
    number: "06",
    title: "IDENTITY SYSTEMS & LOGOFOLIO",
    subtitle: "Timeless Visual Monograms & Strategic Brand Marks",
    year: "2023 - 2024",
    client: "Multi-Industry Brand Portfolio (15 Identity Systems)",
    location: "Egypt & GCC Region",
    services: [
      "Brand Architecture",
      "Monogram & Symbol Craft",
      "Bilingual Typography Systems",
      "Visual Identity Guidelines",
      "Vector Geometry & Grids"
    ],
    summary: "A curated collection of 15 authentic brand marks and visual identities designed by ADVISOR for leaders in automotive, agriculture, finance, tech, and creative industries.",
    heroImage: "assets/clients/clients_grid_all.jpg",
    boardImage: "assets/clients/clients_grid_all.jpg",
    challenge: `Creating distinctive identity marks that maintain visual authority, immediate memorability, and scalability across diverse media—from massive neon architectural facades and vehicle liveries to tiny 16-pixel mobile favicons. Each mark needed to capture the strategic essence of its brand without relying on generic iconography.`,
    approach: `Advisor applies mathematical geometric rigor, bespoke Arabic calligraphic ligatures, and pure reductive modernism to every identity project:
    • Automotive (El Basha): Speed aerodynamic flow and sharp precision.
    • Technology & Control (Infinit Control): Modular cybernetics, infinite loops, and data nodes.
    • Agriculture (Bloomex): Water droplet symbiosis and blooming growth.
    • Accounting & Tax (Al Mostashar): Shield of security and fiscal governance.
    • Real Estate & Contracting (Al Howaida, Abu Zeida): Structural skyline geometry and construction cranes.
    • Creative Studio (Visual Founder): Minimalist circular framing and avant-garde letterforms.`,
    creativeDirection: `Pure vector minimalism. Strict black-and-white contrast testing to ensure indelible recognizability before any color palette is applied. High optical balance and balanced bilingual legibility across Arabic and Latin script.`,
    results: [
      { label: "Trademarks Registered", value: "15 Marks", desc: "All identities successfully registered across national and regional IP registries." },
      { label: "Cross-Platform Scalability", value: "100%", desc: "Zero distortion tested from 16px to 20-meter billboard scales." },
      { label: "Client Longevity", value: "5+ Years", desc: "Timeless identities that outlive temporary design trends." }
    ],
    gallery: [
      { src: "assets/clients/01_elbasha_motors.png", caption: "01. El Basha Automotive — Aerodynamic speed silhouette and precision", ratio: "1:1" },
      { src: "assets/clients/02_rzo_global.png", caption: "02. RZO Global — Monolithic architectural block monogram", ratio: "1:1" },
      { src: "assets/clients/03_r_global.png", caption: "03. R Global — Circular orbital kinetic mark", ratio: "1:1" },
      { src: "assets/clients/04_infinit_control_shield.png", caption: "04. Infinit Control Shield — Cyber-defense and network governance", ratio: "1:1" },
      { src: "assets/clients/05_infinit_control_loop.png", caption: "05. Infinit Control Infinity — Continuous automated data loop", ratio: "1:1" },
      { src: "assets/clients/06_r_athlete.png", caption: "06. R Athlete — Dynamic runner in motion silhouette", ratio: "1:1" },
      { src: "assets/clients/07_r_turbo.png", caption: "07. R Speed — Turbo acoustic frequency velocity mark", ratio: "1:1" },
      { src: "assets/clients/08_bloomex_agri.png", caption: "08. Bloomex Agriculture — Water droplet ripple & sustainable harvest", ratio: "1:1" },
      { src: "assets/clients/09_al_mostashar_group.png", caption: "09. Al Mostashar Group — Accounting, tax, and institutional defense", ratio: "1:1" },
      { src: "assets/clients/10_infinit_control_matrix.png", caption: "10. Infinit Control Matrix — Digital micro-controller node array", ratio: "1:1" },
      { src: "assets/clients/11_r_monogram.png", caption: "11. R Monogram — Reductive brutalist geometric glyph", ratio: "1:1" },
      { src: "assets/clients/12_al_howaida.png", caption: "12. Al Howaida — Architectural towers and luxury real estate silhouette", ratio: "1:1" },
      { src: "assets/clients/13_abu_zeida.png", caption: "13. Abu Zeida — Industrial structural framework and hoist crane", ratio: "1:1" },
      { src: "assets/clients/14_infinit_control_prism.png", caption: "14. Infinit Control Prism — Dual dynamic perspective angles", ratio: "1:1" },
      { src: "assets/clients/15_visual_founder.png", caption: "15. Visual Founder — Modern insignia for bespoke design studio", ratio: "1:1" }
    ]
  }
];

// العملاء: الاسم والمجال ومسار الشعار. إضافة عنصر تُحدّث المعرض والشريط تلقائياً.
window.ADVISOR_CLIENTS = [
  { id: "01", name: "El Basha Automotive", industry: "Automotive Diagnostics & Care", logo: "assets/clients/01_elbasha_motors.png" },
  { id: "02", name: "RZO Global", industry: "International Trade & Logistics", logo: "assets/clients/02_rzo_global.png" },
  { id: "03", name: "R Global", industry: "Investment & Asset Management", logo: "assets/clients/03_r_global.png" },
  { id: "04", name: "Infinit Control Shield", industry: "Industrial Automation & Security", logo: "assets/clients/04_infinit_control_shield.png" },
  { id: "05", name: "Infinit Control Loop", industry: "Smart Systems & IoT Infrastructure", logo: "assets/clients/05_infinit_control_loop.png" },
  { id: "06", name: "R Athlete", industry: "Sports Performance & Apparel", logo: "assets/clients/06_r_athlete.png" },
  { id: "07", name: "R Speed", industry: "Performance Tuning & Engineering", logo: "assets/clients/07_r_turbo.png" },
  { id: "08", name: "Bloomex Agriculture", industry: "Agri-Tech & Sustainable Crops", logo: "assets/clients/08_bloomex_agri.png" },
  { id: "09", name: "Al Mostashar Group", industry: "Accounting, Tax & Legal Advisory", logo: "assets/clients/09_al_mostashar_group.png" },
  { id: "10", name: "Infinit Control Matrix", industry: "Electronic Hardware & Robotics", logo: "assets/clients/10_infinit_control_matrix.png" },
  { id: "11", name: "R Monogram", industry: "Commercial Real Estate", logo: "assets/clients/11_r_monogram.png" },
  { id: "12", name: "Al Howaida Real Estate", industry: "Luxury Developments & Properties", logo: "assets/clients/12_al_howaida.png" },
  { id: "13", name: "Abu Zeida Industrial", industry: "Heavy Construction & Steel Works", logo: "assets/clients/13_abu_zeida.png" },
  { id: "14", name: "Infinit Control Prism", industry: "Clean Energy & Intelligent Grids", logo: "assets/clients/14_infinit_control_prism.png" },
  { id: "15", name: "Visual Founder", industry: "Design Studio & Creative Lab", logo: "assets/clients/15_visual_founder.png" }
];
