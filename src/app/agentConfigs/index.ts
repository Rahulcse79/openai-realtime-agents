import { CoralAiAgent } from "./CoralAiAgent";
import type { RealtimeAgent } from "@openai/agents/realtime";

export const allAgentSets: Record<string, RealtimeAgent[]> = {
  CoralAiAgent: CoralAiAgent,
};

export const defaultAgentSetKey = "CoralAiAgent";
