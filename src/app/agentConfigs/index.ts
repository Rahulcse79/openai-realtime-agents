import { CoralAiAgent } from "./CoralAiAgent";
import type { RealtimeAgent } from "@openai/agents/realtime";

export const allAgentSets: Record<string, RealtimeAgent[]> = {
  CoralAiScenario: CoralAiAgent,
};

export const defaultAgentSetKey = "CoralAiScenario";
