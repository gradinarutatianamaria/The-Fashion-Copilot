export type FashionRole =
  | 'all'
  | 'stylist'
  | 'editor'
  | 'trend_researcher'
  | 'creative_director'
  | 'brand_strategist'
  | 'all_star_panel';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  image?: string;
  sources?: Array<{ title: string; uri: string }>;
  expertRole?: FashionRole;
}

export interface SavedLookbookItem {
  id: string;
  title: string;
  category: 'styling' | 'editorial' | 'runway' | 'capsule' | 'brand' | 'vision';
  content: string;
  timestamp: string;
  image?: string;
  tags: string[];
}

export interface EditorialFormState {
  theme: string;
  targetPublication: string;
  season: string;
  vibeKeywords: string;
}

export interface CapsuleFormState {
  items: string[];
  lifestyle: string;
  aesthetic: string;
  budgetTier: string;
}
