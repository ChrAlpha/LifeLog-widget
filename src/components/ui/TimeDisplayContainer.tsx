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
        <div className="relative w-full max-w-md mx-auto overflow-hidden bg-black rounded-3xl p-8 pb-12 shadow-xl">
            {/* Top navigation */}
            <div className="flex items-center justify-between mb-12">
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
                <ChevronRight className="w-4 h-4 text-gray-500" />
            </div>

            {!hideTimeSpecificElements && currentTime && (
                <>
                    {/* Time display */}
                    <div className="mb-8">
                        <h1 className="text-6xl font-light text-white tracking-widest">
                            {currentTime}
                        </h1>
                    </div>
                </>
            )}

            {/* Main content passed as children */}
            {children}

            {/* Bottom bar */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-700 rounded-full" />

            {/* Bottom left icon */}
            <div className="absolute bottom-4 left-4">
                <RotateCcw className="w-4 h-4 text-gray-500" />
            </div>

            {/* Bottom right text */}
            <div className="absolute bottom-4 right-4 text-right">
                <p className="text-[8px] text-gray-500">OLIVER REICHENSTEIN</p>
                <p className="text-[8px] text-gray-500">© IAWRITER.COM</p>
            </div>
        </div>
    );
}
