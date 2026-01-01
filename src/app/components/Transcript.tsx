"use-client";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { TranscriptItem } from "@/app/types";
import Image from "next/image";
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
    <div className="flex flex-col flex-1 min-h-0 rounded-2xl ui-panel overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between px-6 py-3 sticky top-0 z-10 text-base ui-panel-header">
          <span className="font-semibold">Transcript</span>
          <div className="flex gap-x-2">
            <button
              onClick={handleCopyTranscript}
              className="ui-btn ui-btn-secondary h-9 px-3 text-sm"
            >
              <ClipboardCopyIcon />
              {justCopied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={downloadRecording}
              className="ui-btn ui-btn-secondary h-9 px-3 text-sm"
            >
              <DownloadIcon />
              <span>Download Audio</span>
            </button>
          </div>
        </div>

        {/* Transcript Content */}
        <div
          ref={transcriptRef}
          className="overflow-auto p-5 flex flex-col gap-y-4 h-full"
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
                const bubbleBase = `max-w-lg p-3 shadow-sm border ${
                  isUser
                    ? "bg-gray-900 text-gray-100 border-white/10"
                    : "bg-slate-900 text-white border-white/10"
                }`;
                const isBracketedMessage =
                  title.startsWith("[") && title.endsWith("]");
                const messageStyle = isBracketedMessage
                  ? "italic text-gray-400"
                  : "";
                const displayTitle = isBracketedMessage
                  ? title.slice(1, -1)
                  : title;

                return (
                  <div key={itemId} className={containerClasses}>
                    <div className="max-w-lg">
                      <div
                        className={`${bubbleBase} rounded-2xl ${
                          guardrailResult ? "" : "rounded-b-xl"
                        }`}
                      >
                        <div
                          className={`text-xs ${
                            isUser ? "text-white/60" : "text-white/60"
                          } font-mono`}
                        >
                          {timestamp}
                        </div>
                        <div className={`whitespace-pre-wrap ${messageStyle}`}>
                          <ReactMarkdown>{displayTitle}</ReactMarkdown>
                        </div>
                      </div>
                      {guardrailResult && (
                        <div className="bg-slate-50 px-3 py-2 rounded-b-2xl border border-slate-200 border-t-0">
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
                    className="flex flex-col justify-start items-start text-white/70 text-sm"
                  >
                    <span className="text-xs font-mono">{timestamp}</span>
                    <div
                      className={`whitespace-pre-wrap flex items-center font-mono text-sm text-white ${
                        data ? "cursor-pointer" : ""
                      }`}
                      onClick={() => data && toggleTranscriptItemExpand(itemId)}
                    >
                      {data && (
                        <span
                          className={`text-white/60 mr-1 transform transition-transform duration-200 select-none font-mono ${
                            expanded ? "rotate-90" : "rotate-0"
                          }`}
                        >
                          ▶
                        </span>
                      )}
                      {title}
                    </div>
                    {expanded && data && (
                      <div className="text-white text-left">
                        <pre className="border-l-2 ml-1 border-gray-200 whitespace-pre-wrap break-words font-mono text-xs mb-2 mt-2 pl-2">
                          {JSON.stringify(data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div
                    key={itemId}
                    className="flex justify-center text-white/70 text-sm italic font-mono"
                  >
                    Unknown item type: {type}{" "}
                    <span className="ml-2 text-xs">{timestamp}</span>
                  </div>
                );
              }
            })}
        </div>
      </div>

      <div className="p-4 flex items-center gap-x-2 flex-shrink-0 border-t border-white/10 bg-black/20 backdrop-blur">
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
          className="flex-1 ui-input bg-black/30 border-white/15 text-white placeholder:text-white/60 focus:outline-none"
          placeholder="Type a message..."
        />
        <button
          onClick={onSendMessage}
          disabled={!canSend || !userText.trim()}
          className="ui-btn ui-btn-primary rounded-full h-10 w-10 p-0 disabled:opacity-50"
        >
          <Image src="arrow.svg" alt="Send" width={24} height={24} />
        </button>
      </div>
    </div>
  );
}

export default Transcript;
