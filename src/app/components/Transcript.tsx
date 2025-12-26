"use-client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { TranscriptItem } from "@/app/types";
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { DownloadIcon, ClipboardCopyIcon } from "@radix-ui/react-icons";
import { GuardrailChip } from "./GuardrailChip";

export interface TranscriptProps {
  userText: string;
  setUserText: (val: string) => void;
  onSendMessage: () => void;
  canSend: boolean;
  downloadRecording: () => void;
}

function Transcript({
  userText,
  setUserText,
  onSendMessage,
  canSend,
  downloadRecording,
}: TranscriptProps) {
  const { transcriptItems, toggleTranscriptItemExpand } = useTranscript();
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const [prevLogs, setPrevLogs] = useState<TranscriptItem[]>([]);
  const [justCopied, setJustCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function scrollToBottom() {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }

  useEffect(() => {
    const hasNewMessage = transcriptItems.length > prevLogs.length;
    const hasUpdatedMessage = transcriptItems.some((newItem, index) => {
      const oldItem = prevLogs[index];
      return (
        oldItem &&
        (newItem.title !== oldItem.title || newItem.data !== oldItem.data)
      );
    });

    if (hasNewMessage || hasUpdatedMessage) {
      scrollToBottom();
    }

    setPrevLogs(transcriptItems);
  }, [transcriptItems]);

  // Autofocus on text box input on load
  useEffect(() => {
    if (canSend && inputRef.current) {
      inputRef.current.focus();
    }
  }, [canSend]);

  const handleCopyTranscript = async () => {
    if (!transcriptRef.current) return;
    try {
      await navigator.clipboard.writeText(transcriptRef.current.innerText);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy transcript:", error);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 rounded-xl"
      style={{
        background: 'linear-gradient(180deg, rgba(10, 14, 26, 0.98) 0%, rgba(13, 27, 42, 0.95) 100%)',
      }}>
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header removed - now handled in App.tsx */}
        <div className="flex items-center justify-end px-4 py-2 gap-x-2"
          style={{
            background: 'linear-gradient(90deg, rgba(0, 255, 136, 0.05), rgba(0, 245, 255, 0.08))',
            borderBottom: '1px solid rgba(0, 245, 255, 0.15)'
          }}>
          <button
            onClick={handleCopyTranscript}
            className="text-xs px-3 py-1.5 rounded-lg flex items-center justify-center gap-x-1.5 font-mono tracking-wider transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.15), rgba(0, 168, 255, 0.1))',
              border: '1px solid rgba(0, 245, 255, 0.3)',
              color: '#00f5ff',
              boxShadow: '0 0 10px rgba(0, 245, 255, 0.1)'
            }}
          >
            <ClipboardCopyIcon className="w-3.5 h-3.5" />
            {justCopied ? "COPIED!" : "COPY"}
          </button>
          <button
            onClick={downloadRecording}
            className="text-xs px-3 py-1.5 rounded-lg flex items-center justify-center gap-x-1.5 font-mono tracking-wider transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 200, 100, 0.1))',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              color: '#00ff88',
              boxShadow: '0 0 10px rgba(0, 255, 136, 0.1)'
            }}
          >
            <DownloadIcon className="w-3.5 h-3.5" />
            <span>DOWNLOAD AUDIO</span>
          </button>
        </div>

        {/* Transcript Content */}
        <div
          ref={transcriptRef}
          className="overflow-auto p-4 flex flex-col gap-y-4 h-full"
          style={{
            background: `
              radial-gradient(ellipse at 30% 0%, rgba(0, 255, 136, 0.03) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 100%, rgba(0, 245, 255, 0.03) 0%, transparent 50%)
            `
          }}
        >
          {[...transcriptItems]
            .sort((a, b) => a.createdAtMs - b.createdAtMs)
            .map((item) => {
              const {
                itemId,
                type,
                role,
                data,
                expanded,
                timestamp,
                title = "",
                isHidden,
                guardrailResult,
              } = item;

            if (isHidden) {
              return null;
            }

            if (type === "MESSAGE") {
              const isUser = role === "user";
              const containerClasses = `flex justify-end flex-col ${
                isUser ? "items-end" : "items-start"
              }`;
              
              // IAF themed message bubbles
              const bubbleStyle = isUser 
                ? {
                    background: 'linear-gradient(135deg, rgba(255, 153, 51, 0.2), rgba(255, 107, 53, 0.15))',
                    border: '1px solid rgba(255, 153, 51, 0.4)',
                    color: '#fff',
                    boxShadow: '0 0 15px rgba(255, 153, 51, 0.15), inset 0 0 20px rgba(255, 153, 51, 0.05)'
                  }
                : {
                    background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.15), rgba(0, 168, 255, 0.1))',
                    border: '1px solid rgba(0, 245, 255, 0.3)',
                    color: '#e0f7ff',
                    boxShadow: '0 0 15px rgba(0, 245, 255, 0.1), inset 0 0 20px rgba(0, 245, 255, 0.03)'
                  };
              
              const isBracketedMessage =
                title.startsWith("[") && title.endsWith("]");
              const messageStyle = isBracketedMessage
                ? 'italic opacity-70'
                : '';
              const displayTitle = isBracketedMessage
                ? title.slice(1, -1)
                : title;

              return (
                <div key={itemId} className={containerClasses}>
                  <div className="max-w-lg">
                    <div
                      className={`max-w-lg p-3 rounded-t-xl ${
                        guardrailResult ? "" : "rounded-b-xl"
                      }`}
                      style={bubbleStyle}
                    >
                      <div
                        className="text-[10px] font-mono tracking-wider mb-1"
                        style={{ color: isUser ? 'rgba(255, 153, 51, 0.7)' : 'rgba(0, 245, 255, 0.6)' }}
                      >
                        {isUser ? '👤 Me' : '🤖 Agent'} • {timestamp}
                      </div>
                      <div className={`whitespace-pre-wrap ${messageStyle}`}>
                        <ReactMarkdown>{displayTitle}</ReactMarkdown>
                      </div>
                    </div>
                    {guardrailResult && (
                      <div className="px-3 py-2 rounded-b-xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 46, 99, 0.15), rgba(255, 0, 60, 0.1))',
                          borderTop: '1px solid rgba(255, 46, 99, 0.3)'
                        }}>
                        <GuardrailChip guardrailResult={guardrailResult} />
                      </div>
                    )}
                  </div>
                </div>
              );
            } else if (type === "BREADCRUMB") {
              return (
                <div
                  key={itemId}
                  className="flex flex-col justify-start items-start text-sm"
                >
                  <span className="text-[9px] font-mono tracking-wider" style={{ color: 'rgba(0, 168, 255, 0.6)' }}>{timestamp}</span>
                  <div
                    className={`whitespace-pre-wrap flex items-center font-mono text-xs ${
                      data ? "cursor-pointer hover:opacity-80" : ""
                    }`}
                    style={{ color: '#00a8ff' }}
                    onClick={() => data && toggleTranscriptItemExpand(itemId)}
                  >
                    {data && (
                      <span
                        className={`mr-1 transform transition-transform duration-200 select-none font-mono`}
                        style={{ color: 'rgba(0, 168, 255, 0.5)' }}
                      >
                        {expanded ? "▼" : "▶"}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded"
                      style={{
                        background: 'linear-gradient(90deg, rgba(0, 168, 255, 0.1), transparent)',
                        borderLeft: '2px solid rgba(0, 168, 255, 0.5)'
                      }}>
                      {title}
                    </span>
                  </div>
                  {expanded && data && (
                    <div className="text-left mt-2 ml-3">
                      <pre className="border-l-2 whitespace-pre-wrap break-words font-mono text-[10px] p-2 rounded-r"
                        style={{
                          borderColor: 'rgba(0, 168, 255, 0.3)',
                          background: 'rgba(0, 168, 255, 0.05)',
                          color: 'rgba(0, 245, 255, 0.8)'
                        }}>
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            } else {
              // Fallback if type is neither MESSAGE nor BREADCRUMB
              return (
                <div
                  key={itemId}
                  className="flex justify-center text-sm italic font-mono"
                  style={{ color: 'rgba(255, 153, 51, 0.6)' }}
                >
                  Unknown item type: {type}{" "}
                  <span className="ml-2 text-xs">{timestamp}</span>
                </div>
              );
            }
          })}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 flex items-center gap-x-2 flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, rgba(13, 27, 42, 0.95), rgba(10, 14, 26, 0.98))',
          borderTop: '1px solid rgba(0, 245, 255, 0.15)'
        }}>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSend) {
                onSendMessage();
              }
            }}
            className="w-full px-4 py-2.5 rounded-lg font-mono text-sm focus:outline-none transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, rgba(26, 39, 68, 0.8), rgba(13, 27, 42, 0.9))',
              border: '1px solid rgba(0, 245, 255, 0.2)',
              color: '#e0f7ff',
              boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3)'
            }}
            placeholder="Enter command..."
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[10px] font-mono tracking-wider pointer-events-none"
            style={{ color: 'rgba(0, 245, 255, 0.4)' }}>
            {userText ? '' : '›'}
          </div>
        </div>
        <button
          onClick={onSendMessage}
          disabled={!canSend || !userText.trim()}
          className="rounded-lg p-2.5 disabled:opacity-30 transition-all duration-200 hover:scale-105"
          style={{
            background: canSend && userText.trim() 
              ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.3), rgba(0, 200, 100, 0.2))'
              : 'linear-gradient(135deg, rgba(100, 100, 100, 0.2), rgba(80, 80, 80, 0.1))',
            border: canSend && userText.trim()
              ? '1px solid rgba(0, 255, 136, 0.5)'
              : '1px solid rgba(100, 100, 100, 0.3)',
            boxShadow: canSend && userText.trim() ? '0 0 15px rgba(0, 255, 136, 0.2)' : 'none'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={canSend && userText.trim() ? "#00ff88" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Transcript;
