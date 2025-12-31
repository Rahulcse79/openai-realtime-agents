import { CoralAiAgent } from "./CoralAiAgent";
import { HotelManagementAiAgent } from "./HotelManagmentAiAgent";
import type { RealtimeAgent } from "@openai/agents/realtime";

export const allAgentSets: Record<string, RealtimeAgent[]> = {
  CoralAiScenario: CoralAiAgent,
  HotelManagementAiScenario: HotelManagementAiAgent,
};

export const defaultAgentSetKey = "CoralAiScenario";
