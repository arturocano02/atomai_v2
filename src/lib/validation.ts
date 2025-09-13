import { z } from "zod";

export const PatentInputSchema = z.object({
  id: z.string().min(1),
  metadata: z.string(),
  strategicRelevance: z.string(),
  technicalStrength: z.string(),
  legalDurability: z.string(),
  marketLeverage: z.string(),
  freedomToOperate: z.string(),
  licensingFeasibility: z.string(),
});

export const CategoryScoreSchema = z.object({
  score: z.number().min(0).max(100),
  rationale: z.string().min(1),
});

export const PatentScoreSchema = z.object({
  id: z.string().min(1),
  perCategory: z.object({
    strategicRelevance: CategoryScoreSchema,
    technicalStrength: CategoryScoreSchema,
    legalDurability: CategoryScoreSchema,
    marketLeverage: CategoryScoreSchema,
    freedomToOperate: CategoryScoreSchema,
    licensingFeasibility: CategoryScoreSchema,
  }),
  weightedTotal: z.number().min(0).max(100),
});

export const ScoreRequestSchema = z.object({
  problemStatement: z.string().min(1),
  patents: z.array(PatentInputSchema).min(1).max(5),
});

export const ScoreResponseSchema = z.object({
  results: z.array(PatentScoreSchema),
});

export type PatentInputType = z.infer<typeof PatentInputSchema>;
export type CategoryScoreType = z.infer<typeof CategoryScoreSchema>;
export type PatentScoreType = z.infer<typeof PatentScoreSchema>;
export type ScoreRequestType = z.infer<typeof ScoreRequestSchema>;
export type ScoreResponseType = z.infer<typeof ScoreResponseSchema>;
