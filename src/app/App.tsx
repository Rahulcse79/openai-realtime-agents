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
    // Create audio element only on client side
    const el = document.createElement("audio");
    el.autoplay = true;
    el.style.display = "none";
    document.body.appendChild(el);
    setSdkAudioElement(el);

    return () => {
      // Cleanup on unmount
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
    <div className="text-base flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-gray-800">
      {/* Header with Premium Gradient */}
      <div className="p-4 text-lg font-semibold flex justify-between items-center bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 shadow-2xl text-white relative overflow-hidden">
        {/* Animated Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-fuchsia-600/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
        
        <div
          className="flex items-center cursor-pointer hover:scale-105 transition-all duration-300 relative z-10"
          onClick={() => window.location.reload()}
        >
          <div className="bg-white/95 rounded-2xl p-3 mr-4 shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-white/20">
            <Image
              src="/openai-logomark.svg"
              alt="OpenAI Logo"
              width={140}
              height={70}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="text-2xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-white drop-shadow-lg">
              CORAL AI IVRS
            </div>
            <div className="text-sm font-medium opacity-90 tracking-wide">
              ✨ Intelligent Voice Response System
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex items-center bg-white/15 backdrop-blur-md rounded-2xl px-5 py-3 shadow-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
            <label className="flex items-center text-sm gap-2 mr-3 font-semibold">
              📋 Scenario
            </label>
            <div className="relative inline-block">
              <select
                value={agentSetKey}
                onChange={handleAgentChange}
                className="appearance-none bg-white text-gray-800 border-none rounded-xl text-sm px-4 py-2 pr-10 cursor-pointer font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                {Object.keys(allAgentSets).map((agentKey) => (
                  <option key={agentKey} value={agentKey}>
                    {agentKey}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-purple-600">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.44l3.71-3.21a.75.75 0 111.04 1.08l-4.25 3.65a.75.75 0 01-1.04 0L5.21 8.27a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {agentSetKey && (
            <div className="flex items-center bg-white/15 backdrop-blur-md rounded-2xl px-5 py-3 shadow-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
              <label className="flex items-center text-sm gap-2 mr-3 font-semibold">
                🤖 Agent
              </label>
              <div className="relative inline-block">
                <select
                  value={selectedAgentName}
                  onChange={handleSelectedAgentChange}
                  className="appearance-none bg-white text-gray-800 border-none rounded-xl text-sm px-4 py-2 pr-10 cursor-pointer font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  {selectedAgentConfigSet?.map((agent) => (
                    <option key={agent.name} value={agent.name}>
                      {agent.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-purple-600">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.44l3.71-3.21a.75.75 0 111.04 1.08l-4.25 3.65a.75.75 0 01-1.04 0L5.21 8.27a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main scrollable container */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
        <div className="flex flex-col gap-5 p-5">
          {/* Top Section: Dashboard and Transcript - Full Height */}
          <div className="flex gap-5 h-[calc(100vh-200px)]">
            {/* Dashboard - Left Side */}
            <div className="flex-1 overflow-auto rounded-3xl bg-gradient-to-br from-slate-800/50 via-purple-900/30 to-slate-800/50 shadow-2xl border border-purple-500/20 backdrop-blur-xl relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-fuchsia-500/5 rounded-3xl pointer-events-none"></div>
              <HumanSensorDashboard />
            </div>

            {/* Transcript - Right Side */}
            <div className="w-[550px] shrink-0 flex flex-col rounded-3xl bg-gradient-to-br from-slate-800/80 via-purple-900/40 to-slate-800/80 shadow-2xl border border-purple-400/30 overflow-hidden backdrop-blur-xl relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-3xl pointer-events-none"></div>
              <div className="px-6 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5"></div>
                <h2 className="text-xl font-bold flex items-center gap-3 relative z-10">
                  <span className="text-2xl">💬</span>
                  <span className="tracking-wide">Conversation</span>
                  <div className="ml-auto flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${sessionStatus === 'CONNECTED' ? 'bg-green-400 animate-pulse' : sessionStatus === 'CONNECTING' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'}`}></span>
                    <span className="text-sm font-medium opacity-90">{sessionStatus}</span>
                  </div>
                </h2>
              </div>
              <div className="flex-1 overflow-hidden relative z-10">
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

          {/* Bottom Section: Events - Expandable */}
          {isEventsPaneExpanded && (
            <div className="flex gap-5 h-[420px] shrink-0">
              <div className="flex-1 flex flex-col rounded-3xl bg-gradient-to-br from-slate-800/80 via-blue-900/30 to-slate-800/80 shadow-2xl border border-blue-400/30 overflow-hidden backdrop-blur-xl relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 rounded-3xl pointer-events-none"></div>
                <div className="px-6 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5"></div>
                  <h2 className="text-xl font-bold flex items-center gap-3 relative z-10">
                    <span className="text-2xl">📊</span>
                    <span className="tracking-wide">Event Logs</span>
                    <div className="ml-auto text-sm font-medium opacity-90">Real-time Activity Monitor</div>
                  </h2>
                </div>
                <div className="flex-1 overflow-hidden relative z-10">
                  <Events isExpanded={isEventsPaneExpanded} />
                </div>
              </div>
            </div>
          )}

          {/* Tasks Section - Expandable */}
          {isTasksPaneOpen && (
            <div className="flex gap-5 h-[420px] shrink-0">
              <div className="flex-1 flex flex-col rounded-3xl bg-gradient-to-br from-slate-800/80 via-emerald-900/30 to-slate-800/80 shadow-2xl border border-emerald-400/30 overflow-hidden backdrop-blur-xl relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5 rounded-3xl pointer-events-none"></div>
                <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5"></div>
                  <h2 className="text-xl font-bold flex items-center gap-3 relative z-10">
                    <span className="text-2xl">✅</span>
                    <span className="tracking-wide">Tasks</span>
                    <div className="ml-auto text-sm font-medium opacity-90">Task Management</div>
                  </h2>
                </div>
                <div className="flex-1 overflow-auto p-5 relative z-10">
                  <TaskApiDemo />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Toolbar with Premium Design */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 shadow-2xl border-t border-purple-500/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-fuchsia-600/5 to-purple-600/5"></div>
        <div className="relative z-10">
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
    </div>
  );
}

export default App;
