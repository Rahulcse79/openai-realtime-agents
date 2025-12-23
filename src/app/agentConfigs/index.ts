import { simpleHandoffScenario } from './simpleHandoff';
import { customerServiceRetailScenario } from './customerServiceRetail';
import { CoralAiAgent } from './CoralAiAgent';
import { CoralTelecomIVRSScenario } from './CoralTelecomIVRS';

import type { RealtimeAgent } from '@openai/agents/realtime';

// Map of scenario key -> array of RealtimeAgent objects
export const allAgentSets: Record<string, RealtimeAgent[]> = {
  simpleHandoff: simpleHandoffScenario,
  customerServiceRetail: customerServiceRetailScenario,
  CoralAiAgent: CoralAiAgent,
  CoralTelecomIVRS: CoralTelecomIVRSScenario,
};

export const defaultAgentSetKey = 'CoralAiAgent';