import { useCallback, useRef, useState, useEffect } from "react";
import type { RealtimeSession, RealtimeAgent } from "@openai/agents/realtime";
import { applyCodecPreferences } from "../lib/codecUtils";
import { useEvent } from "../contexts/EventContext";
import { useHandleSessionHistory } from "./useHandleSessionHistory";
import { SessionStatus } from "../types";

export interface RealtimeSessionCallbacks {
  onConnectionChange?: (status: SessionStatus) => void;
  onAgentHandoff?: (agentName: string) => void;
}

export interface ConnectOptions {
  getEphemeralKey: () => Promise<string>;
  initialAgents: RealtimeAgent[];
  audioElement?: HTMLAudioElement;
  extraContext?: Record<string, any>;
  outputGuardrails?: any[];
}

export function useRealtimeSession(callbacks: RealtimeSessionCallbacks = {}) {
  const sessionRef = useRef<RealtimeSession | null>(null);
  const [status, setStatus] = useState<SessionStatus>("DISCONNECTED");

  const { logClientEvent, logServerEvent } = useEvent();
  const historyHandlers = useHandleSessionHistory().current;

  const updateStatus = useCallback(
    (s: SessionStatus) => {
      setStatus(s);
      callbacks.onConnectionChange?.(s);
      logClientEvent({}, s);
    },
    [callbacks, logClientEvent]
  );

  const handleTransportEvent = useCallback(
    (event: any) => {
      switch (event.type) {
        case "conversation.item.input_audio_transcription.completed":
        case "response.audio_transcript.done":
          historyHandlers.handleTranscriptionCompleted(event);
          break;

        case "response.audio_transcript.delta":
          historyHandlers.handleTranscriptionDelta(event);
          break;

        default:
          logServerEvent(event);
      }
    },
    [historyHandlers, logServerEvent]
  );

  const codecParamRef = useRef<string>(
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
          .get("codec")
          ?.toLowerCase() ?? "opus"
      : "opus"
  );

  const applyCodec = useCallback((pc: RTCPeerConnection) => {
    applyCodecPreferences(pc, codecParamRef.current);
  }, []);

  const handleAgentHandoff = useCallback(
    (item: any) => {
      const history = item?.context?.history;
      if (!Array.isArray(history) || !history.length) return;

      const last = history[history.length - 1];
      const name = last?.name;
      if (typeof name !== "string") return;

      const agent = name.split("transfer_to_")[1];
      if (agent) {
        callbacks.onAgentHandoff?.(agent);
      }
    },
    [callbacks]
  );

  useEffect(() => {
    const session = sessionRef.current;
    if (!session) return;

    session.on("error", (err: any) =>
      logServerEvent({
        type: "error",
        message: err,
      })
    );

    session.on("agent_handoff", handleAgentHandoff);
    session.on("agent_tool_start", historyHandlers.handleAgentToolStart);
    session.on("agent_tool_end", historyHandlers.handleAgentToolEnd);
    session.on("history_updated", historyHandlers.handleHistoryUpdated);
    session.on("history_added", historyHandlers.handleHistoryAdded);
    session.on("guardrail_tripped", historyHandlers.handleGuardrailTripped);
    session.on("transport_event", handleTransportEvent);

    return () => {
      session.removeAllListeners?.();
    };
  }, [
    handleAgentHandoff,
    handleTransportEvent,
    historyHandlers,
    logServerEvent,
  ]);

  const connect = useCallback(
    async ({
      getEphemeralKey,
      initialAgents,
      audioElement,
      extraContext,
      outputGuardrails,
    }: ConnectOptions) => {
      if (sessionRef.current) return;

      if (typeof window === "undefined") {
        throw new Error("RealtimeSession can only run in browser");
      }

      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("getUserMedia not available");
      }

      updateStatus("CONNECTING");

      const apiKey = await getEphemeralKey();
      const rootAgent = initialAgents[0];

      const { RealtimeSession, OpenAIRealtimeWebRTC } = await import(
        "@openai/agents/realtime"
      );

      sessionRef.current = new RealtimeSession(rootAgent, {
        transport: new OpenAIRealtimeWebRTC({
          audioElement,
          changePeerConnection: async (pc) => {
            applyCodec(pc);
            return pc;
          },
        }),
        model: process.env.NEXT_PUBLIC_OPENAI_MODEL,
        config: {
          inputAudioTranscription: {
            model: process.env.NEXT_PUBLIC_OPENAI_AUDIO_TRANSCRIPTION_MODEL,
          },
        },
        outputGuardrails: outputGuardrails ?? [],
        context: extraContext ?? {},
      });

      await sessionRef.current.connect({
        apiKey,
      });

      updateStatus("CONNECTED");
    },
    [applyCodec, updateStatus]
  );

  const disconnect = useCallback(() => {
    sessionRef.current?.close();
    sessionRef.current = null;
    updateStatus("DISCONNECTED");
  }, [updateStatus]);

  const assertConnected = () => {
    if (!sessionRef.current) {
      throw new Error("RealtimeSession not connected");
    }
  };

  const interrupt = useCallback(() => {
    sessionRef.current?.interrupt();
  }, []);

  const sendUserText = useCallback((text: string) => {
    assertConnected();
    sessionRef.current!.sendMessage(text);
  }, []);

  const sendEvent = useCallback((ev: any) => {
    sessionRef.current?.transport.sendEvent(ev);
  }, []);

  const mute = useCallback((m: boolean) => {
    sessionRef.current?.mute(m);
  }, []);

  const pushToTalkStart = useCallback(() => {
    sessionRef.current?.transport.sendEvent({
      type: "input_audio_buffer.clear",
    });
  }, []);

  const pushToTalkStop = useCallback(() => {
    if (!sessionRef.current) return;
    sessionRef.current.transport.sendEvent({
      type: "input_audio_buffer.commit",
    });
    sessionRef.current.transport.sendEvent({
      type: "response.create",
    });
  }, []);

  return {
    status,
    connect,
    disconnect,
    sendUserText,
    sendEvent,
    mute,
    pushToTalkStart,
    pushToTalkStop,
    interrupt,
  } as const;
}
