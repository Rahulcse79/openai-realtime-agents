"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import Transcript from "./components/Transcript";
import Events from "./components/Events";
import BottomToolbar from "./components/BottomToolbar";
import TaskApiDemo from "./components/TaskApiDemo";
import { SessionStatus } from "@/app/types";
import type { RealtimeAgent } from "@openai/agents/realtime";
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { useEvent } from "@/app/contexts/EventContext";
import { useRealtimeSession } from "./hooks/useRealtimeSession";
import HumanSensorDashboard from "./components/HumanSensorDashboard";
import {
  createLanguageLockGuardrail,
  createModerationGuardrail,
} from "@/app/agentConfigs/guardrails";
import { allAgentSets, defaultAgentSetKey } from "@/app/agentConfigs";
import { CoralAiAgent } from "@/app/agentConfigs/CoralAiAgent";
import { CoralAiAgentCompanyName } from "@/app/agentConfigs/CoralAiAgent";

const sdkScenarioMap: Record<string, RealtimeAgent[]> = {
  CoralAiScenario: CoralAiAgent,
};

import useAudioDownload from "./hooks/useAudioDownload";
import { useHandleSessionHistory } from "./hooks/useHandleSessionHistory";

function App() {
  const searchParams = useSearchParams()!;
  const urlCodec = searchParams.get("codec") || "opus";
  const { addTranscriptMessage, addTranscriptBreadcrumb } = useTranscript();
  const { logClientEvent, logServerEvent } = useEvent();
  const [selectedAgentName, setSelectedAgentName] = useState<string>("");
  const [selectedAgentConfigSet, setSelectedAgentConfigSet] = useState<
    RealtimeAgent[] | null
  >(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const handoffTriggeredRef = useRef(false);
  const [sdkAudioElement, setSdkAudioElement] = useState<HTMLAudioElement | undefined>(undefined);

  useEffect(() => {
    const el = document.createElement("audio");
    el.autoplay = true;
    el.style.display = "none";
    document.body.appendChild(el);
    setSdkAudioElement(el);

    return () => {
      if (el && document.body.contains(el)) {
        document.body.removeChild(el);
      }
    };
  }, []);

  useEffect(() => {
    if (sdkAudioElement && !audioElementRef.current) {
      audioElementRef.current = sdkAudioElement;
    }
  }, [sdkAudioElement]);

  const { connect, disconnect, sendUserText, sendEvent, interrupt, mute } =
    useRealtimeSession({
      onConnectionChange: (s) => setSessionStatus(s as SessionStatus),
      onAgentHandoff: (agentName: string) => {
        handoffTriggeredRef.current = true;
        setSelectedAgentName(agentName);
      },
    });

  const [sessionStatus, setSessionStatus] =
    useState<SessionStatus>("DISCONNECTED");

  const [isEventsPaneExpanded, setIsEventsPaneExpanded] =
    useState<boolean>(true);
  const [isTasksPaneOpen, setIsTasksPaneOpen] = useState<boolean>(false);
  const [userText, setUserText] = useState<string>("");
  const [isPTTActive, setIsPTTActive] = useState<boolean>(false);
  const [isPTTUserSpeaking, setIsPTTUserSpeaking] = useState<boolean>(false);
  const [isAudioPlaybackEnabled, setIsAudioPlaybackEnabled] = useState<boolean>(true);

  // Load audio playback setting from localStorage after mount
  useEffect(() => {
    const stored = localStorage.getItem("audioPlaybackEnabled");
    if (stored !== null) {
      setIsAudioPlaybackEnabled(stored === "true");
    }
  }, []);

  const { startRecording, stopRecording, downloadRecording } =
    useAudioDownload();

  const sendClientEvent = (eventObj: any, eventNameSuffix = "") => {
    try {
      sendEvent(eventObj);
      logClientEvent(eventObj, eventNameSuffix);
    } catch (err) {
      console.error("Failed to send via SDK", err);
    }
  };

  useHandleSessionHistory();

  useEffect(() => {
    let finalAgentConfig = searchParams.get("agentConfig");
    if (!finalAgentConfig || !allAgentSets[finalAgentConfig]) {
      finalAgentConfig = defaultAgentSetKey;
      const url = new URL(window.location.toString());
      url.searchParams.set("agentConfig", finalAgentConfig);
      window.location.replace(url.toString());
      return;
    }

    const agents = allAgentSets[finalAgentConfig];
    const agentKeyToUse = agents[0]?.name || "";

    setSelectedAgentName(agentKeyToUse);
    setSelectedAgentConfigSet(agents);
  }, [searchParams]);

  useEffect(() => {
    if (selectedAgentName && sessionStatus === "DISCONNECTED") {
      connectToRealtime();
    }
  }, [selectedAgentName]);

  useEffect(() => {
    if (
      sessionStatus === "CONNECTED" &&
      selectedAgentConfigSet &&
      selectedAgentName
    ) {
      const currentAgent = selectedAgentConfigSet.find(
        (a) => a.name === selectedAgentName
      );
      addTranscriptBreadcrumb(`Agent: ${selectedAgentName}`, currentAgent);
      updateSession(!handoffTriggeredRef.current);
      handoffTriggeredRef.current = false;
    }
  }, [selectedAgentConfigSet, selectedAgentName, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "CONNECTED") {
      updateSession();
    }
  }, [isPTTActive]);

  const fetchEphemeralKey = async (): Promise<string | null> => {
    logClientEvent({ url: "/session" }, "fetch_session_token_request");
    const tokenResponse = await fetch("/api/session");
    const data = await tokenResponse.json();
    logServerEvent(data, "fetch_session_token_response");

    if (!data.client_secret?.value) {
      logClientEvent(data, "error.no_ephemeral_key");
      console.error("No ephemeral key provided by the server");
      setSessionStatus("DISCONNECTED");
      return null;
    }

    return data.client_secret.value;
  };

  const connectToRealtime = async () => {
    const agentSetKey = searchParams.get("agentConfig") || "default";
    if (sdkScenarioMap[agentSetKey]) {
      if (sessionStatus !== "DISCONNECTED") return;
      setSessionStatus("CONNECTING");

      try {
        const EPHEMERAL_KEY = await fetchEphemeralKey();
        if (!EPHEMERAL_KEY) return;

        const reorderedAgents = [...sdkScenarioMap[agentSetKey]];
        const idx = reorderedAgents.findIndex(
          (a) => a.name === selectedAgentName
        );
        if (idx > 0) {
          const [agent] = reorderedAgents.splice(idx, 1);
          reorderedAgents.unshift(agent);
        }

        const moderationGuardrail = createModerationGuardrail(
          CoralAiAgentCompanyName
        );
        const languageGuardrail = createLanguageLockGuardrail();

        await connect({
          getEphemeralKey: async () => EPHEMERAL_KEY,
          initialAgents: reorderedAgents,
          audioElement: sdkAudioElement,
          outputGuardrails: [moderationGuardrail, languageGuardrail],
          extraContext: {
            addTranscriptBreadcrumb,
          },
        });
      } catch (err) {
        console.error("Error connecting via SDK:", err);
        setSessionStatus("DISCONNECTED");
      }
      return;
    }
  };

  const disconnectFromRealtime = () => {
    disconnect();
    setSessionStatus("DISCONNECTED");
    setIsPTTUserSpeaking(false);
  };

  const sendSimulatedUserMessage = (text: string) => {
    const id = uuidv4().slice(0, 32);
    addTranscriptMessage(id, "user", text, true);

    sendClientEvent({
      type: "conversation.item.create",
      item: {
        id,
        type: "message",
        role: "user",
        content: [{ type: "input_text", text }],
      },
    });
    sendClientEvent(
      { type: "response.create" },
      "(simulated user text message)"
    );
  };

  const updateSession = (shouldTriggerResponse: boolean = false) => {
    const turnDetection = isPTTActive
      ? null
      : {
          type: "server_vad",
          threshold: 0.9,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
          create_response: true,
        };

    sendEvent({
      type: "session.update",
      session: {
        turn_detection: turnDetection,
      },
    });

    if (shouldTriggerResponse) {
      sendSimulatedUserMessage("hi");
    }
    return;
  };

  const handleSendTextMessage = () => {
    if (!userText.trim()) return;
    interrupt();

    try {
      sendUserText(userText.trim());
    } catch (err) {
      console.error("Failed to send via SDK", err);
    }

    setUserText("");
  };

  const handleTalkButtonDown = () => {
    if (sessionStatus !== "CONNECTED") return;
    interrupt();

    setIsPTTUserSpeaking(true);
    sendClientEvent({ type: "input_audio_buffer.clear" }, "clear PTT buffer");
  };

  const handleTalkButtonUp = () => {
    if (sessionStatus !== "CONNECTED" || !isPTTUserSpeaking) return;

    setIsPTTUserSpeaking(false);
    sendClientEvent({ type: "input_audio_buffer.commit" }, "commit PTT");
    sendClientEvent({ type: "response.create" }, "trigger response PTT");
  };

  const onToggleConnection = () => {
    if (sessionStatus === "CONNECTED" || sessionStatus === "CONNECTING") {
      disconnectFromRealtime();
      setSessionStatus("DISCONNECTED");
    } else {
      connectToRealtime();
    }
  };

  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAgentConfig = e.target.value;
    const url = new URL(window.location.toString());
    url.searchParams.set("agentConfig", newAgentConfig);
    window.location.replace(url.toString());
  };

  const handleSelectedAgentChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newAgentName = e.target.value;

    disconnectFromRealtime();
    setSelectedAgentName(newAgentName);
  };

  const handleCodecChange = (newCodec: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set("codec", newCodec);
    window.location.replace(url.toString());
  };

  useEffect(() => {
    const storedPushToTalkUI = localStorage.getItem("pushToTalkUI");
    if (storedPushToTalkUI) {
      setIsPTTActive(storedPushToTalkUI === "true");
    }
    const storedLogsExpanded = localStorage.getItem("logsExpanded");
    if (storedLogsExpanded) {
      setIsEventsPaneExpanded(storedLogsExpanded === "true");
    }
    const storedTasksOpen = localStorage.getItem("tasksOpen");
    if (storedTasksOpen) {
      setIsTasksPaneOpen(storedTasksOpen === "true");
    }
    const storedAudioPlaybackEnabled = localStorage.getItem(
      "audioPlaybackEnabled"
    );
    if (storedAudioPlaybackEnabled) {
      setIsAudioPlaybackEnabled(storedAudioPlaybackEnabled === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pushToTalkUI", isPTTActive.toString());
  }, [isPTTActive]);

  useEffect(() => {
    localStorage.setItem("logsExpanded", isEventsPaneExpanded.toString());
  }, [isEventsPaneExpanded]);

  useEffect(() => {
    localStorage.setItem("tasksOpen", isTasksPaneOpen.toString());
  }, [isTasksPaneOpen]);



  useEffect(() => {
    localStorage.setItem(
      "audioPlaybackEnabled",
      isAudioPlaybackEnabled.toString()
    );
  }, [isAudioPlaybackEnabled]);

  useEffect(() => {
    if (audioElementRef.current) {
      if (isAudioPlaybackEnabled) {
        audioElementRef.current.muted = false;
        audioElementRef.current.play().catch((err) => {
          console.warn("Autoplay may be blocked by browser:", err);
        });
      } else {
        audioElementRef.current.muted = true;
        audioElementRef.current.pause();
      }
    }

    try {
      mute(!isAudioPlaybackEnabled);
    } catch (err) {
      console.warn("Failed to toggle SDK mute", err);
    }
  }, [isAudioPlaybackEnabled]);

  useEffect(() => {
    if (sessionStatus === "CONNECTED") {
      try {
        mute(!isAudioPlaybackEnabled);
      } catch (err) {
        console.warn("mute sync after connect failed", err);
      }
    }
  }, [sessionStatus, isAudioPlaybackEnabled]);

  useEffect(() => {
    if (sessionStatus === "CONNECTED" && audioElementRef.current?.srcObject) {
      const remoteStream = audioElementRef.current.srcObject as MediaStream;
      startRecording(remoteStream);
    }

    return () => {
      stopRecording();
    };
  }, [sessionStatus]);

  const agentSetKey = searchParams.get("agentConfig") || "default";

  return (
    <div className="text-base flex flex-col h-screen bg-[#0a0e1a] text-gray-100 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-20"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 245, 255, 0.02) 2px,
            rgba(0, 245, 255, 0.02) 4px
          )`
        }}
      ></div>
      

      {/* Header - IAF Advanced Command Center */}
      <div className="px-6 py-3 flex justify-between items-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #0a1628 0%, #1a2744 30%, #0d1b2a 70%, #0a1628 100%)`,
          borderBottom: '1px solid rgba(0, 245, 255, 0.3)',
          boxShadow: '0 4px 30px rgba(0, 245, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Animated Radar Background */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(0, 245, 255, 0.3) 0%, transparent 25%),
              radial-gradient(circle at 80% 50%, rgba(255, 153, 51, 0.2) 0%, transparent 25%),
              linear-gradient(rgba(0, 245, 255, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 245, 255, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 100% 100%, 40px 40px, 40px 40px'
          }}
        ></div>

        <div
          className="flex items-center cursor-pointer hover:scale-[1.01] transition-all duration-300 relative z-10"
          onClick={() => window.location.reload()}
        >
          <div className="relative mr-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00f5ff] via-[#ff9933] to-[#138808] rounded-xl opacity-60 blur-sm animate-pulse"></div>
            <div className="relative bg-[#0a0e1a] rounded-lg p-2 border border-[#00f5ff]/40"
              style={{ boxShadow: '0 0 25px rgba(0, 245, 255, 0.3)' }}>
              <Image 
                src="/openai-logomark.svg" 
                alt="Coral AI Logo" 
                width={150} 
                height={80}
                className="opacity-90"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="text-xl font-black tracking-[0.15em] text-transparent bg-clip-text"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #FF9933, #FFFFFF, #138808)',
                  textShadow: '0 0 30px rgba(255, 153, 51, 0.3)'
                }}>
                CORAL ADVANCE AI/ML IVRS
              </div>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-sm tracking-[0.2em] text-[#00f5ff] font-bold">
                Interactive Voice Response System (IVRS)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-gradient-to-b from-[#0a1628] to-[#0d1b2a] border border-[#00f5ff]/30"
            style={{ boxShadow: '0 0 15px rgba(0, 245, 255, 0.1)' }}>
            <label className="text-[9px] tracking-[0.2em] text-[#00f5ff]/70 font-mono flex items-center gap-1.5">
             SCENARIO
            </label>
            <div className="relative">
              <select
                value={agentSetKey}
                onChange={handleAgentChange}
                className="appearance-none bg-[#1a2744] text-[#00f5ff] border border-[#00f5ff]/20 rounded-lg text-xs px-3 py-1.5 pr-8 cursor-pointer font-mono focus:outline-none focus:border-[#00f5ff] transition-all"
              >
                {Object.keys(allAgentSets).map((agentKey) => (
                  <option key={agentKey} value={agentKey}>
                    {agentKey}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-[#00f5ff]">
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.44l3.71-3.21a.75.75 0 111.04 1.08l-4.25 3.65a.75.75 0 01-1.04 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {agentSetKey && (
            <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-gradient-to-b from-[#0a1628] to-[#0d1b2a] border border-[#00ff88]/30"
              style={{ boxShadow: '0 0 15px rgba(0, 255, 136, 0.1)' }}>
              <label className="text-[9px] tracking-[0.2em] text-[#00ff88]/70 font-mono flex items-center gap-1.5">
                AGENT
              </label>
              <div className="relative">
                <select
                  value={selectedAgentName}
                  onChange={handleSelectedAgentChange}
                  className="appearance-none bg-[#1a2744] text-[#00ff88] border border-[#00ff88]/20 rounded-lg text-xs px-3 py-1.5 pr-8 cursor-pointer font-mono focus:outline-none focus:border-[#00ff88] transition-all"
                >
                  {selectedAgentConfigSet?.map((agent) => (
                    <option key={agent.name} value={agent.name}>
                      {agent.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-[#00ff88]">
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.44l3.71-3.21a.75.75 0 111.04 1.08l-4.25 3.65a.75.75 0 01-1.04 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(0, 245, 255, 0.03) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(255, 153, 51, 0.03) 0%, transparent 50%),
            radial-gradient(ellipse at center, #0d1b2a 0%, #0a0e1a 50%, #050709 100%)
          `
        }}>
        <div className="flex flex-col gap-3 p-3">
          {/* Top Section: Dashboard and Transcript */}
          <div className="flex gap-3 h-[calc(100vh-200px)]">
            {/* Dashboard - Left Side */}
            <div className="flex-1 overflow-auto rounded-xl relative"
              style={{
                background: 'linear-gradient(145deg, rgba(10, 22, 40, 0.95), rgba(13, 27, 42, 0.98))',
                border: '1px solid rgba(0, 245, 255, 0.15)',
                boxShadow: '0 0 30px rgba(0, 245, 255, 0.08), inset 0 0 40px rgba(0, 245, 255, 0.02)'
              }}>
              {/* HUD Corner Brackets */}
              <div className="absolute top-0 left-0 w-10 h-10 border-l-2 border-t-2 border-[#00f5ff]/60 rounded-tl-xl"></div>
              <div className="absolute top-0 right-0 w-10 h-10 border-r-2 border-t-2 border-[#ff9933]/60 rounded-tr-xl"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 border-l-2 border-b-2 border-[#138808]/60 rounded-bl-xl"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 border-r-2 border-b-2 border-[#00f5ff]/60 rounded-br-xl"></div>
              <HumanSensorDashboard />
            </div>

            {/* Transcript - Right Side */}
            <div className="w-[500px] shrink-0 flex flex-col rounded-xl overflow-hidden relative"
              style={{
                background: 'linear-gradient(145deg, rgba(10, 22, 40, 0.95), rgba(13, 27, 42, 0.98))',
                border: '1px solid rgba(0, 255, 136, 0.15)',
                boxShadow: '0 0 30px rgba(0, 255, 136, 0.08), inset 0 0 40px rgba(0, 255, 136, 0.02)'
              }}>
              {/* Transcript Header */}
              <div className="px-4 py-3 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 245, 255, 0.05))',
                  borderBottom: '1px solid rgba(0, 255, 136, 0.2)'
                }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div>
                      <h2 className="text-sm font-bold text-[#00ff88] tracking-[0.15em] font-mono">Communication</h2>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${
                    sessionStatus === 'CONNECTED' 
                      ? 'bg-[#00ff88]/10 border-[#00ff88]/40' 
                      : sessionStatus === 'CONNECTING' 
                      ? 'bg-[#ff9933]/10 border-[#ff9933]/40' 
                      : 'bg-[#ff2e63]/10 border-[#ff2e63]/40'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      sessionStatus === 'CONNECTED' 
                        ? 'bg-[#00ff88] animate-pulse shadow-[0_0_8px_#00ff88]' 
                        : sessionStatus === 'CONNECTING' 
                        ? 'bg-[#ff9933] animate-pulse shadow-[0_0_8px_#ff9933]' 
                        : 'bg-[#ff2e63] shadow-[0_0_8px_#ff2e63]'
                    }`}></span>
                    <span className={`text-[10px] font-mono font-bold ${
                      sessionStatus === 'CONNECTED' 
                        ? 'text-[#00ff88]' 
                        : sessionStatus === 'CONNECTING' 
                        ? 'text-[#ff9933]' 
                        : 'text-[#ff2e63]'
                    }`}>{sessionStatus}</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <Transcript
                  userText={userText}
                  setUserText={setUserText}
                  onSendMessage={handleSendTextMessage}
                  downloadRecording={downloadRecording}
                  canSend={sessionStatus === "CONNECTED"}
                />
              </div>
            </div>
          </div>

          {isEventsPaneExpanded && (
            <div className="h-[350px] shrink-0 rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(10, 22, 40, 0.95), rgba(13, 27, 42, 0.98))',
                border: '1px solid rgba(0, 168, 255, 0.15)',
                boxShadow: '0 0 30px rgba(0, 168, 255, 0.08)'
              }}>
              <div className="px-4 py-2.5 flex items-center justify-between"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 168, 255, 0.1), rgba(0, 245, 255, 0.05))',
                  borderBottom: '1px solid rgba(0, 168, 255, 0.2)'
                }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0a1628] border border-[#00a8ff]/40 flex items-center justify-center">
                    <span className="text-sm">📊</span>
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-[#00a8ff] tracking-[0.15em] font-mono">FLIGHT TELEMETRY</h2>
                    <p className="text-[8px] text-[#00f5ff]/60 tracking-[0.2em]">REAL-TIME DATA STREAM</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-[#00a8ff]/70 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00a8ff] animate-pulse"></span>
                  RECORDING
                </div>
              </div>
              <div className="flex-1 overflow-hidden h-[calc(100%-44px)]">
                <Events isExpanded={isEventsPaneExpanded} />
              </div>
            </div>
          )}

          {/* Tasks Section */}
          {isTasksPaneOpen && (
            <div className="h-[350px] shrink-0 rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(10, 22, 40, 0.95), rgba(13, 27, 42, 0.98))',
                border: '1px solid rgba(255, 153, 51, 0.15)',
                boxShadow: '0 0 30px rgba(255, 153, 51, 0.08)'
              }}>
              <div className="px-4 py-2.5 flex items-center justify-between"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 153, 51, 0.1), rgba(255, 107, 53, 0.05))',
                  borderBottom: '1px solid rgba(255, 153, 51, 0.2)'
                }}>
                <div className="flex items-center gap-2">
                  <div>
                    <h2 className="text-xs font-bold text-[#ff9933] tracking-[0.15em] font-mono">TASK</h2>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-3 h-[calc(100%-44px)]">
                <TaskApiDemo />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative"
        style={{
          background: 'linear-gradient(180deg, #1a2744 0%, #0a1628 100%)',
          borderTop: '1px solid rgba(0, 245, 255, 0.2)',
          boxShadow: '0 -4px 20px rgba(0, 245, 255, 0.08)'
        }}>
        {/* Indian Tricolor Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 flex">
          <div className="flex-1 bg-gradient-to-r from-[#FF9933] to-[#FFB366] shadow-[0_-2px_10px_rgba(255,153,51,0.4)]"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-gradient-to-r from-[#138808] to-[#1DB954] shadow-[0_-2px_10px_rgba(19,136,8,0.4)]"></div>
        </div>
        <BottomToolbar
          sessionStatus={sessionStatus}
          onToggleConnection={onToggleConnection}
          isPTTActive={isPTTActive}
          setIsPTTActive={setIsPTTActive}
          isPTTUserSpeaking={isPTTUserSpeaking}
          handleTalkButtonDown={handleTalkButtonDown}
          handleTalkButtonUp={handleTalkButtonUp}
          isEventsPaneExpanded={isEventsPaneExpanded}
          setIsEventsPaneExpanded={(val) => {
            setIsEventsPaneExpanded(val);
          }}
          isTasksPaneOpen={isTasksPaneOpen}
          setIsTasksPaneOpen={(val) => {
            setIsTasksPaneOpen(val);
          }}
          isAudioPlaybackEnabled={isAudioPlaybackEnabled}
          setIsAudioPlaybackEnabled={setIsAudioPlaybackEnabled}
          codec={urlCodec}
          onCodecChange={handleCodecChange}
        />
      </div>
    </div>
  );
}

export default App;
