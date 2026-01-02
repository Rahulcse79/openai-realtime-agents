import { CoralAiAgent } from "./CoralAiAgent";
import { HotelAiAgent } from "./HotelAiAgent";
import { HospitalAiAgent } from "./HospitalAiAgent";
import type { RealtimeAgent } from "@openai/agents/realtime";

export const allAgentSets: Record<string, RealtimeAgent[]> = {
  CoralAiScenario: CoralAiAgent,
  HotelAiScenario: HotelAiAgent,
  HospitalAiScenario: HospitalAiAgent,
};

export const defaultAgentSetKey = "CoralAiScenario";
