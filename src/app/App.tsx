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
    <div className="text-base flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-gray-800">
      {/* Header with Gradient */}
      <div className="p-4 text-lg font-semibold flex justify-between items-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg text-white">
        <div
          className="flex items-center cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.location.reload()}
        >
          <div className="bg-white rounded-lg p-2 mr-3 shadow-md">
            <Image
              src="/openai-logomark.svg"
              alt="OpenAI Logo"
              width={150}
              height={80}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="text-xl font-bold tracking-wide">
              CORAL AI IVRS
            </div>
            <div className="text-xs font-normal opacity-90">
              Intelligent Voice Response System
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
            <label className="flex items-center text-sm gap-2 mr-2 font-medium">
              📋 Scenario
            </label>
            <div className="relative inline-block">
              <select
                value={agentSetKey}
                onChange={handleAgentChange}
                className="appearance-none bg-white text-gray-800 border-none rounded-lg text-sm px-3 py-1.5 pr-8 cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-sm"
              >
                {Object.keys(allAgentSets).map((agentKey) => (
                  <option key={agentKey} value={agentKey}>
                    {agentKey}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-600">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
              <label className="flex items-center text-sm gap-2 mr-2 font-medium">
                🤖 Agent
              </label>
              <div className="relative inline-block">
                <select
                  value={selectedAgentName}
                  onChange={handleSelectedAgentChange}
                  className="appearance-none bg-white text-gray-800 border-none rounded-lg text-sm px-3 py-1.5 pr-8 cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-sm"
                >
                  {selectedAgentConfigSet?.map((agent) => (
                    <option key={agent.name} value={agent.name}>
                      {agent.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-600">
                  <svg
                    className="h-4 w-4"
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
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          {/* Top Section: Dashboard and Transcript - Full Height */}
          <div className="flex gap-4 h-[calc(100vh-180px)]">
            {/* Dashboard - Left Side */}
            <div className="flex-1 overflow-auto rounded-3xl bg-gradient-to-br from-white via-gray-50 to-indigo-50 shadow-2xl border-2 border-indigo-200/50 backdrop-blur-sm">
              <HumanSensorDashboard />
            </div>

            {/* Transcript - Right Side */}
            <div className="w-[580px] shrink-0 flex flex-col rounded-3xl bg-gradient-to-br from-white via-purple-50 to-pink-50 shadow-2xl border-2 border-purple-200/50 overflow-hidden backdrop-blur-sm">
              <div className="px-5 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span>💬</span>
                  <span>Conversation</span>
                </h2>
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

          {/* Bottom Section: Events - Always visible on scroll */}
          {isEventsPaneExpanded && (
            <div className="flex gap-4 h-[400px] shrink-0">
              <div className="flex-1 flex flex-col rounded-3xl bg-gradient-to-br from-white via-blue-50 to-cyan-50 shadow-2xl border-2 border-blue-200/50 overflow-hidden backdrop-blur-sm">
                <div className="px-5 py-3 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <span>📊</span>
                    <span>Event Logs</span>
                  </h2>
                </div>
                <div className="flex-1 overflow-hidden">
                  <Events isExpanded={isEventsPaneExpanded} />
                </div>
              </div>
            </div>
          )}

          {/* Tasks Section - Always visible on scroll */}
          {isTasksPaneOpen && (
            <div className="flex gap-4 h-[400px] shrink-0">
              <div className="flex-1 flex flex-col rounded-3xl bg-gradient-to-br from-white via-green-50 to-emerald-50 shadow-2xl border-2 border-green-200/50 overflow-hidden backdrop-blur-sm">
                <div className="px-5 py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <span>✅</span>
                    <span>Tasks</span>
                  </h2>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <TaskApiDemo />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Toolbar */}
      <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-black shadow-2xl">
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
