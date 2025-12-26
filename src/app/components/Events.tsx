"use client";

import React, { useRef, useEffect, useState } from "react";
import { useEvent } from "@/app/contexts/EventContext";
import { LoggedEvent } from "@/app/types";

export interface EventsProps {
  isExpanded: boolean;
}

function Events({ isExpanded }: EventsProps) {
  const [prevEventLogs, setPrevEventLogs] = useState<LoggedEvent[]>([]);
  const eventLogsContainerRef = useRef<HTMLDivElement | null>(null);

  const { loggedEvents, toggleExpand } = useEvent();

  const getDirectionArrow = (direction: string) => {
    if (direction === "client") return { symbol: "▲", color: "#ff9933", label: "CLIENT" };
    if (direction === "server") return { symbol: "▼", color: "#00ff88", label: "SERVER" };
    return { symbol: "•", color: "#00f5ff", label: "SYSTEM" };
  };

  useEffect(() => {
    const hasNewEvent = loggedEvents.length > prevEventLogs.length;

    if (isExpanded && hasNewEvent && eventLogsContainerRef.current) {
      eventLogsContainerRef.current.scrollTop =
        eventLogsContainerRef.current.scrollHeight;
    }

    setPrevEventLogs(loggedEvents);
  }, [loggedEvents, isExpanded]);

  return (
    <div
      className={
        (isExpanded
          ? "w-full flex-1 overflow-y-auto rounded-xl"
          : "w-0 overflow-hidden opacity-0") +
        " transition-all duration-200 ease-in-out flex flex-col"
      }
      style={{
        background: 'linear-gradient(180deg, rgba(10, 14, 26, 0.98) 0%, rgba(13, 27, 42, 0.95) 100%)',
      }}
      ref={eventLogsContainerRef}
    >
      {isExpanded && (
        <div className="flex flex-col min-h-0 p-2">
          <div className="min-h-0 space-y-1">
            {loggedEvents.map((log, idx) => {
              const arrowInfo = getDirectionArrow(log.direction);
              const isError =
                log.eventName.toLowerCase().includes("error") ||
                log.eventData?.response?.status_details?.error != null;

              return (
                <div
                  key={`${log.id}-${idx}`}
                  className="rounded-lg transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    background: isError 
                      ? 'linear-gradient(135deg, rgba(255, 46, 99, 0.15), rgba(255, 0, 60, 0.1))'
                      : log.direction === 'client'
                      ? 'linear-gradient(135deg, rgba(255, 153, 51, 0.1), rgba(255, 107, 53, 0.05))'
                      : 'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 200, 100, 0.05))',
                    border: isError
                      ? '1px solid rgba(255, 46, 99, 0.3)'
                      : log.direction === 'client'
                      ? '1px solid rgba(255, 153, 51, 0.2)'
                      : '1px solid rgba(0, 255, 136, 0.2)',
                    boxShadow: isError
                      ? '0 0 10px rgba(255, 46, 99, 0.1)'
                      : '0 0 10px rgba(0, 245, 255, 0.05)'
                  }}
                >
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="flex items-center justify-between cursor-pointer py-2.5 px-4"
                  >
                    <div className="flex items-center flex-1 gap-3">
                      {/* Direction Indicator */}
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md font-mono text-[10px] tracking-wider"
                        style={{
                          background: `${arrowInfo.color}15`,
                          border: `1px solid ${arrowInfo.color}40`,
                          color: arrowInfo.color
                        }}>
                        <span className="text-sm">{arrowInfo.symbol}</span>
                        <span>{arrowInfo.label}</span>
                      </div>
                      
                      {/* Event Name */}
                      <span
                        className="flex-1 text-sm font-mono tracking-wide"
                        style={{
                          color: isError ? '#ff2e63' : '#e0f7ff'
                        }}
                      >
                        {log.eventName}
                      </span>
                    </div>
                    
                    {/* Timestamp */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono tracking-wider px-2 py-1 rounded"
                        style={{
                          background: 'rgba(0, 168, 255, 0.1)',
                          color: 'rgba(0, 168, 255, 0.7)',
                          border: '1px solid rgba(0, 168, 255, 0.2)'
                        }}>
                        {log.timestamp}
                      </span>
                      <span className="text-xs" style={{ color: 'rgba(0, 245, 255, 0.5)' }}>
                        {log.expanded ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>

                  {log.expanded && log.eventData && (
                    <div className="px-4 pb-3">
                      <pre className="whitespace-pre-wrap break-words text-[11px] p-3 rounded-lg font-mono overflow-x-auto"
                        style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                          color: 'rgba(0, 245, 255, 0.8)',
                          border: '1px solid rgba(0, 245, 255, 0.1)',
                          maxHeight: '300px',
                          overflowY: 'auto'
                        }}>
                        {JSON.stringify(log.eventData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;
