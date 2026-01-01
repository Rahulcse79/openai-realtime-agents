import React from "react";
import { SessionStatus } from "@/app/types";

interface BottomToolbarProps {
  sessionStatus: SessionStatus;
  onToggleConnection: () => void;
  isPTTActive: boolean;
  setIsPTTActive: (val: boolean) => void;
  isPTTUserSpeaking: boolean;
  handleTalkButtonDown: () => void;
  handleTalkButtonUp: () => void;
  isEventsPaneExpanded: boolean;
  setIsEventsPaneExpanded: (val: boolean) => void;
  setIsTasksPaneOpen: (val: boolean) => void;
  isTasksPaneOpen: boolean;
  isAudioPlaybackEnabled: boolean;
  setIsAudioPlaybackEnabled: (val: boolean) => void;
  codec: string;
  onCodecChange: (newCodec: string) => void;
}

function BottomToolbar({
  sessionStatus,
  onToggleConnection,
  isPTTActive,
  setIsPTTActive,
  isPTTUserSpeaking,
  handleTalkButtonDown,
  handleTalkButtonUp,
  isEventsPaneExpanded,
  setIsEventsPaneExpanded,
  isTasksPaneOpen,
  setIsTasksPaneOpen,
  isAudioPlaybackEnabled,
  setIsAudioPlaybackEnabled,
  codec,
  onCodecChange,
}: BottomToolbarProps) {
  const isConnected = sessionStatus === "CONNECTED";
  const isConnecting = sessionStatus === "CONNECTING";

  const handleCodecChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCodec = e.target.value;
    onCodecChange(newCodec);
  };

  function getConnectionButtonLabel() {
    if (isConnected) return "Disconnect";
    if (isConnecting) return "Connecting...";
    return "Connect";
  }

  function getConnectionButtonClasses() {
    const baseClasses = "ui-btn text-base h-11 w-36";
    const cursorClass = isConnecting ? "cursor-not-allowed" : "cursor-pointer";

    if (isConnected) {
      return `bg-red-600 hover:bg-red-700 ${cursorClass} ${baseClasses}`;
    }
    return `ui-btn-primary ${cursorClass} ${baseClasses}`;
  }

  return (
    <div className="px-4 pb-4">
      <div className="ui-panel app-soft flex flex-row flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-3 rounded-2xl">
      <button
        onClick={onToggleConnection}
        className={getConnectionButtonClasses()}
        disabled={isConnecting}
      >
        {getConnectionButtonLabel()}
      </button>

      <div className="flex flex-row items-center gap-2">
        <input
          id="push-to-talk"
          type="checkbox"
          checked={isPTTActive}
          onChange={(e) => setIsPTTActive(e.target.checked)}
          disabled={!isConnected}
          className="w-4 h-4 accent-sky-400 bg-white/90 border border-white/20 rounded focus:ring-2 focus:ring-sky-400/40"
        />
        <label
          htmlFor="push-to-talk"
          className="flex items-center cursor-pointer text-sm font-medium text-white"
        >
          Push to talk
        </label>
        <button
          onMouseDown={handleTalkButtonDown}
          onMouseUp={handleTalkButtonUp}
          onTouchStart={handleTalkButtonDown}
          onTouchEnd={handleTalkButtonUp}
          disabled={!isPTTActive}
          className={
            (isPTTUserSpeaking
              ? "ui-btn bg-emerald-500/90 hover:bg-emerald-500 text-white border border-emerald-300/30"
              : "ui-btn bg-red-500/90 hover:bg-red-500 text-white border border-red-300/30") +
            " h-10 px-4" +
            (!isPTTActive ? " opacity-50 cursor-not-allowed" : "")
          }
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="shrink-0"
          >
            <path
              d="M12 14c1.6569 0 3-1.3431 3-3V6c0-1.65685-1.3431-3-3-3s-3 1.34315-3 3v5c0 1.6569 1.3431 3 3 3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 11v0.5c0 3.866-3.134 7-7 7s-7-3.134-7-7V11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 18.5V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Talk
        </button>
      </div>

      <div className="flex flex-row items-center gap-1">
        <input
          id="audio-playback"
          type="checkbox"
          checked={isAudioPlaybackEnabled}
          onChange={(e) => setIsAudioPlaybackEnabled(e.target.checked)}
          disabled={!isConnected}
          className="w-4 h-4 accent-sky-400 bg-white/90 border border-white/20 rounded focus:ring-2 focus:ring-sky-400/40"
        />
        <label
          htmlFor="audio-playback"
          className="flex items-center cursor-pointer text-sm font-medium text-white"
        >
          Audio playback
        </label>
      </div>

      <div className="flex flex-row items-center gap-2">
        <input
          id="logs"
          type="checkbox"
          checked={isEventsPaneExpanded}
          onChange={(e) => setIsEventsPaneExpanded(e.target.checked)}
          className="w-4 h-4 accent-sky-400 bg-white/90 border border-white/20 rounded focus:ring-2 focus:ring-sky-400/40"
        />
        <label
          htmlFor="logs"
          className="flex items-center cursor-pointer text-sm font-medium text-white"
        >
          Logs
        </label>
      </div>

      <div className="flex flex-row items-center gap-2">
        <input
          id="tasks"
          type="checkbox"
          checked={isTasksPaneOpen}
          onChange={(e) => setIsTasksPaneOpen(e.target.checked)}
          className="w-4 h-4 accent-sky-400 bg-white/90 border border-white/20 rounded focus:ring-2 focus:ring-sky-400/40"
        />
        <label
          htmlFor="tasks"
          className="flex items-center cursor-pointer text-sm font-medium text-white"
        >
          Tasks
        </label>
      </div>

      <div className="flex flex-row items-center gap-2">
        <div className="text-sm font-medium text-white">Codec:</div>
        <select
          id="codec-select"
          value={codec}
          onChange={handleCodecChange}
          className="ui-input !w-auto !py-2 !px-3 text-sm cursor-pointer text-white"
        >
          <option value="opus">Opus (48 kHz)</option>
          <option value="pcmu">PCMU (8 kHz)</option>
          <option value="pcma">PCMA (8 kHz)</option>
        </select>
      </div>
      </div>
    </div>
  );
}

export default BottomToolbar;
