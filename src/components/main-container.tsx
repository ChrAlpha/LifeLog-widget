"use client";

import { ChevronRight, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface TimeDisplayContainerProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  tabs: string[];
  children: React.ReactNode;
  // Optional prop to hide the time-specific elements if not needed for all views
  hideTimeSpecificElements?: boolean;
  currentTime?: string; // Only needed if not hiding time-specific elements
}

export default function TimeDisplayContainer({
  selectedTab,
  setSelectedTab,
  tabs,
  children,
  hideTimeSpecificElements = false,
  currentTime,
}: TimeDisplayContainerProps) {
  const router = useRouter();

  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl bg-black p-8 pb-12 shadow-xl">
      {/* Top navigation */}
      <div className="mb-12 flex items-center justify-between">
        <div className="flex space-x-4 text-xs text-gray-400">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`${selectedTab === tab ? "text-white" : "text-gray-500"
                }`}
              onClick={() => {
                setSelectedTab(tab);
                router.push(`/${tab.toLowerCase()}`);
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <ChevronRight className="size-4 text-gray-500" />
      </div>

      {!hideTimeSpecificElements && currentTime && (
        <>
          {/* Time display */}
          <div className="mb-8">
            <h1 className="text-6xl font-light tracking-widest text-white">
              {currentTime}
            </h1>
          </div>
        </>
      )}

      {/* Main content passed as children */}
      {children}

      {/* Bottom bar */}
      <div className="absolute bottom-4 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-gray-700" />

      {/* Bottom left icon */}
      <div className="absolute bottom-4 left-4">
        <RotateCcw className="size-4 text-gray-500" />
      </div>

      {/* Bottom right text */}
      <div className="absolute bottom-4 right-4 text-right">
        <p className="text-[8px] text-gray-500">2025 - Present</p>
        <p className="text-[8px] text-gray-500">© ChrAlpha</p>
      </div>
    </div>
  );
}
