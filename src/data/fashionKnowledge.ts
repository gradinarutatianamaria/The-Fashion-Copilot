export interface PresetPrompt {
  id: string;
  category: string;
  role: 'stylist' | 'editor' | 'trend_researcher' | 'creative_director' | 'brand_strategist' | 'all';
  title: string;
  prompt: string;
  icon: string;
}

export const PRESET_PROMPTS: PresetPrompt[] = [
  {
    id: 'p1',
    category: 'Runway & Critique',
    role: 'editor',
    title: 'Saint Laurent vs Phoebe Philo Silhouette Evolution',
    prompt: 'Compare the modern tailoring silhouettes of Saint Laurent under Anthony Vaccarello with Phoebe Philo’s eponymous label. What are the key architectural proportion differences, and why does Philo’s high-break trouser work so effectively for contemporary luxury?',
    icon: 'Sparkles',
  },
  {
    id: 'p2',
    category: 'Styling & Proportions',
    role: 'stylist',
    title: 'Deconstructing Wide-Leg Trouser Proportions',
    prompt: 'I want to style high-waisted, wide-leg charcoal wool trousers without looking swallow-tailed or visually short. Walk me through footwear pairings (toe shape, heel pitch), outerwear hem lengths, and the exact rule of thirds for tucking shirts.',
    icon: 'Scissors',
  },
  {
    id: 'p3',
    category: 'Trend & Culture',
    role: 'trend_researcher',
    title: 'Macro vs Micro-Trends: The Post-Streetwear Pivot',
    prompt: 'Trace the macro shift away from graphic-heavy streetwear toward quiet tactile tailoring and heritage equestrian styles. Clearly distinguish verifiable runway facts, analytical cultural drivers, and commercial longevity predictions for 2026/2027.',
    icon: 'TrendingUp',
  },
  {
    id: 'p4',
    category: 'Creative Direction',
    role: 'creative_director',
    title: 'Neo-Brutalist Autumn Editorial Pitch',
    prompt: 'Develop an editorial concept titled "Monolithic Solitude" for an avant-garde publication like Dazed or Self Service. Give me the visual mood, 4 key runway-inspired looks with drape/fabric specifications, concrete set design, and harsh tungsten lighting directions.',
    icon: 'Camera',
  },
  {
    id: 'p5',
    category: 'Brand & Merchandising',
    role: 'brand_strategist',
    title: 'Direct-to-Consumer Upcycled Luxury Strategy',
    prompt: 'I am planning an independent luxury capsule brand using deadstock Loro Piana cashmere and upcycled Japanese raw denim. Critique my pricing architecture ($280-$850), customer acquisition strategy, circularity certification, and retail pop-up viability.',
    icon: 'Briefcase',
  },
  {
    id: 'p6',
    category: 'Second-Hand & Archive',
    role: 'stylist',
    title: 'Archival Sourcing Guide: 90s Minimalist Jackets',
    prompt: 'Give me a curated vintage sourcing guide for 1990s-2000s minimalist blazers and leather jackets (Helmut Lang, Jil Sander, Donna Karan, Prada Sport). What exact search queries, material compositions, and zipper/tag identifiers should I look for on eBay and Vestiaire?',
    icon: 'ShoppingBag',
  },
  {
    id: 'p7',
    category: 'Fashion Tech & AI',
    role: 'brand_strategist',
    title: 'Generative AI & 3D Prototyping in High Fashion',
    prompt: 'Analyze how generative AI and 3D digital sampling (CLO 3D) are reshaping the luxury fashion supply chain. Where does AI add genuine creative and commercial value, and where are brands making superficial PR mistakes?',
    icon: 'Cpu',
  },
];

export interface SampleOutfitImage {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
}

// Curated high quality fashion imagery for testing Vision Lab
export const SAMPLE_OUTFIT_IMAGES: SampleOutfitImage[] = [
  {
    id: 'sample-1',
    title: 'Oversized Sartorial Minimalism',
    description: 'Double-breasted boxy wool blazer with wide puddle trousers & leather boots',
    category: 'Tailoring / Sartorial',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sample-2',
    title: 'Layered Utilitarian Monochrome',
    description: 'Tech-wool trench with cargo detailing, heavy rib knit and lug-sole derby shoes',
    category: 'Modern Streetwear / Utility',
    imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sample-3',
    title: 'Draped Sculptural Silhouette',
    description: 'Fluid pleated midi skirt with asymmetric silk poplin top & pointed mules',
    category: 'Editorial Avant-Garde',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sample-4',
    title: 'Relaxed Heritage Casual',
    description: 'Vintage tweed chore coat over ecru denim and suede Chelsea boots',
    category: 'Vintage / Archive Casual',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
  },
];

export interface FashionHouseItem {
  name: string;
  era: string;
  creativeDirectors: string;
  signatureCodes: string[];
  keyLegacy: string;
}

export const ICONIC_HOUSES: FashionHouseItem[] = [
  {
    name: 'Maison Margiela',
    era: '1988 – Present',
    creativeDirectors: 'Martin Margiela (1988-2009), John Galliano (2014-Present)',
    signatureCodes: ['Deconstructed garments', 'Exposed basting threads', 'Tabi split-toe', 'Artisanal repurposing', 'Anonymity'],
    keyLegacy: 'Pioneered subversive deconstruction, transforming garment construction into philosophical commentary.',
  },
  {
    name: 'Helmut Lang',
    era: '1986 – 2005 (Golden Era)',
    creativeDirectors: 'Helmut Lang',
    signatureCodes: ['Internal holster straps', 'Painter denim', 'Bondage ribbon detailing', 'Sheer silk overlays', 'Austrian minimalism'],
    keyLegacy: 'Created the modern urban luxury wardrobe, merging high tailoring with military utility and contemporary art.',
  },
  {
    name: 'Alexander McQueen',
    era: '1992 – Present',
    creativeDirectors: 'Lee Alexander McQueen (1992-2010), Sarah Burton, Seán McGirr',
    signatureCodes: ['Bumster trousers', 'Armadillo shoes', 'Frock coat precision', 'Gothic romanticism', 'Savage beauty tailoring'],
    keyLegacy: 'Mastery of Savile Row tailoring pushed into theatrical, deeply emotional runway narratives.',
  },
  {
    name: 'Céline / Phoebe Philo',
    era: '2008 – 2018',
    creativeDirectors: 'Phoebe Philo',
    signatureCodes: ['Clean geometric proportions', 'Trench coat deconstruction', 'Luggage & Lug tote silhouettes', 'Earthy & camel palettes'],
    keyLegacy: 'Redefined female-first luxury dressing: empowering, cerebral, effortlessly chic without objectification.',
  },
  {
    name: 'Comme des Garçons',
    era: '1969 – Present',
    creativeDirectors: 'Rei Kawakubo',
    signatureCodes: ['Anti-fashion asymmetry', 'Bulges & body distortions', 'Monochrome & pitch black', 'Distressed raw wool'],
    keyLegacy: 'Challenged Western ideals of symmetry and beauty; established conceptual fashion as high art.',
  },
  {
    name: 'Yves Saint Laurent',
    era: '1961 – Present',
    creativeDirectors: 'Yves Saint Laurent, Tom Ford, Hedi Slimane, Anthony Vaccarello',
    signatureCodes: ['Le Smoking tuxedo for women', 'Safari jacket', 'Saharienne', 'Sharp shoulder pads', 'Mondrian dress'],
    keyLegacy: 'Democratized modern womenswear by elevating menswear tailoring into empowering feminine staples.',
  },
];

export interface TextileGuideItem {
  fabric: string;
  weightDrape: string;
  bestUse: string;
  careLongevity: string;
  vintageSearchTerms: string[];
}

export const TEXTILE_GUIDE: TextileGuideItem[] = [
  {
    fabric: 'Wool Gabardine',
    weightDrape: 'Medium-heavy, crisp architectural drape with high tensile strength',
    bestUse: 'Structured blazers, trench coats, pleated tailored trousers',
    careLongevity: 'Extremely durable, resists wrinkling; steam and dry clean sparingly',
    vintageSearchTerms: ['100% wool gabardine trench', 'vintage Burberry gabardine', 'military wool gabardine coat'],
  },
  {
    fabric: 'Silk Crepe de Chine / Habotai',
    weightDrape: 'Ultra-fluid, liquid movement with subtle textured luster',
    bestUse: 'Bias-cut slip dresses, draped shirting, scarf collars',
    careLongevity: 'Delicate but breathable; hand wash cool or gentle dry clean',
    vintageSearchTerms: ['90s silk bias cut slip', 'heavy silk crepe shirt vintage', 'vintage Donna Karan silk top'],
  },
  {
    fabric: 'Raw / Selvedge Denim (13-16oz)',
    weightDrape: 'Stiff and boxy initially; molds to individual anatomy over time',
    bestUse: 'Straight-leg 5-pocket jeans, trucker jackets, utilitarian workshirts',
    careLongevity: 'Decade+ longevity; cold soak inside out, line dry',
    vintageSearchTerms: ['vintage Levi’s 501 made in USA', 'Japanese selvedge denim jacket', 'Kuroki denim jeans'],
  },
  {
    fabric: 'Cashmere Double-Face',
    weightDrape: 'Substantial yet lightweight warmth; sumptuous plush softness',
    bestUse: 'Unlined wrap coats, minimalist overcoats, heirloom knits',
    careLongevity: 'High luxury investment; comb pills with cedar comb, store folded',
    vintageSearchTerms: ['vintage Max Mara double face cashmere', 'Loro Piana vintage knit', 'vintage ballantyne cashmere'],
  },
  {
    fabric: 'High-Twist Poplin Cotton',
    weightDrape: 'Crisp, structural with paper-like snap and high breathability',
    bestUse: 'Oversized shirting, tiered architectural skirts, popover blouses',
    careLongevity: 'High durability; machine wash gentle, press with hot steam',
    vintageSearchTerms: ['vintage Thomas Pink poplin shirt', 'vintage Jil Sander white poplin', 'charvet poplin shirt'],
  },
];
