export type PatentInput = {
  id: string;
  metadata: string; // title, applicant, sector, date, abstract, use cases pasted from AtomAI
  strategicRelevance: string;
  technicalStrength: string;
  legalDurability: string;
  marketLeverage: string;
  freedomToOperate: string;
  licensingFeasibility: string;
};

export type CategoryScore = {
  score: number;
  rationale: string;
};

export type PatentScore = {
  id: string;
  perCategory: {
    strategicRelevance: CategoryScore;
    technicalStrength: CategoryScore;
    legalDurability: CategoryScore;
    marketLeverage: CategoryScore;
    freedomToOperate: CategoryScore;
    licensingFeasibility: CategoryScore;
  };
  weightedTotal: number;
};

export type ScoreRequest = {
  problemStatement: string;
  patents: PatentInput[];
};

export type ScoreResponse = {
  results: PatentScore[];
};

export type AppState = {
  problemStatement: string;
  patents: PatentInput[];
  results?: PatentScore[];
};

// Scoring weights
export const SCORING_WEIGHTS = {
  strategicRelevance: 0.30,
  technicalStrength: 0.20,
  legalDurability: 0.15,
  marketLeverage: 0.15,
  freedomToOperate: 0.10,
  licensingFeasibility: 0.10,
} as const;

// Category display names and descriptions
export const CATEGORIES = {
  strategicRelevance: {
    title: "Strategic Relevance",
    header: "What is the patent about and which applications could it impact?",
    subheader: "Paste AtomAI long answer",
  },
  technicalStrength: {
    title: "Technical Strength", 
    header: "How strong are the technical claims and methods?",
    subheader: "Paste AtomAI long answer",
  },
  legalDurability: {
    title: "Legal Durability",
    header: "What does family breadth imply for long term protection?", 
    subheader: "Paste AtomAI long answer",
  },
  marketLeverage: {
    title: "Market Leverage",
    header: "Which commercial advantages and industries could benefit?",
    subheader: "Paste AtomAI long answer",
  },
  freedomToOperate: {
    title: "Freedom to Operate",
    header: "Are there carve outs or design arounds and how central is the approach?",
    subheader: "Paste AtomAI long answer",
  },
  licensingFeasibility: {
    title: "Licensing Feasibility",
    header: "Who owns it and how easy is licensing?",
    subheader: "Paste AtomAI long answer",
  },
} as const;
