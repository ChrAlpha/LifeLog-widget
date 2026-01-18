"use client";

import { useState, useEffect } from "react";
import TimeDisplayContainer from "@/components/main-container";
import { StatusDot, GRID_STATUS, type GridStatus } from "@/components/status-dot";

export default function TimeTracker() {
  const [selectedTab, setSelectedTab] = useState("Today");
  const tabs = ["Today", "Week", "Month", "Year", "Life"];

  // Compute initial state synchronously to avoid layout jump after mount
  const computeInitial = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    // 24 hours -> 6x4 grid
    const newGridDataArray: GridStatus[] = Array(24).fill(GRID_STATUS.FUTURE);
    for (let i = 0; i < 24; i++) {
      if (i < hours) newGridDataArray[i] = GRID_STATUS.PAST;
      else if (i === hours) newGridDataArray[i] = GRID_STATUS.CURRENT;
    }
    const reshapedGridData: GridStatus[][] = [];
    for (let i = 0; i < 6; i++) {
      reshapedGridData.push(newGridDataArray.slice(i * 4, i * 4 + 4));
    }

    // 6 indicators for 60 minutes, each represents 10 minutes
    const newNavIndicatorsArray: number[] = Array(6).fill(0);
    const currentMinuteBlock = Math.floor(minutes / 10);
    for (let i = 0; i < 6; i++) {
      if (i < currentMinuteBlock) newNavIndicatorsArray[i] = 1;
      else if (i === currentMinuteBlock) newNavIndicatorsArray[i] = (minutes - i * 10) / 10;
    }

    return { formattedTime, reshapedGridData, newNavIndicatorsArray } as const;
  };

  const initial = computeInitial();
  const [currentTime, setCurrentTime] = useState(initial.formattedTime);
  const [gridData, setGridData] = useState<GridStatus[][]>(initial.reshapedGridData);
  const [navIndicators, setNavIndicators] = useState<number[]>(initial.newNavIndicatorsArray);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const updateDateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Format time as HH:MM
      const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      setCurrentTime(formattedTime);

      // Calculate gridData (24 hours, 6 rows x 4 columns)
      const newGridDataArray: GridStatus[] = Array(24).fill(GRID_STATUS.FUTURE);
      for (let i = 0; i < 24; i++) {
        if (i < hours) {
          newGridDataArray[i] = GRID_STATUS.PAST;
        }
        else if (i === hours) {
          newGridDataArray[i] = GRID_STATUS.CURRENT;
        }
      }
      // Reshape into 6x4 grid
      const reshapedGridData: GridStatus[][] = [];
      for (let i = 0; i < 6; i++) {
        reshapedGridData.push(newGridDataArray.slice(i * 4, i * 4 + 4));
      }
      setGridData(reshapedGridData);

      // Calculate navIndicators (6 indicators for 60 minutes)
      const newNavIndicatorsArray: number[] = Array(6).fill(0);
      const currentMinuteBlock = Math.floor(minutes / 10);

      for (let i = 0; i < 6; i++) {
        if (i < currentMinuteBlock) {
          newNavIndicatorsArray[i] = 1;
        }
        else if (i === currentMinuteBlock) {
          newNavIndicatorsArray[i] = (minutes - i * 10) / 10;
        }
      }
      setNavIndicators(newNavIndicatorsArray);
    };

    // Calculate time until the next minute
    const now = new Date();
    const millisecondsUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    // Schedule the first update for the start of the next minute
    const timeoutId = setTimeout(() => {
      updateDateTime();
      intervalId = setInterval(updateDateTime, 60000);
    }, millisecondsUntilNextMinute);

    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return (
    <TimeDisplayContainer
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      tabs={tabs}
      currentTime={currentTime}
    >
      {/* Grid of dots specific to Today page */}
      <div className="mb-20 grid grid-cols-4 gap-8">
        {gridData.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <StatusDot
              key={`${rowIndex}-${colIndex}`}
              status={cell}
              title={`Hour ${rowIndex * 4 + colIndex}`}
            />
          )),
        )}
      </div>
      {navIndicators.length > 0 && (
        <>
          {/* Bottom navigation indicators */}
          <div className="mb-6 flex justify-center space-x-8">
            {navIndicators.map((indicator, index) => (
              <div
                key={index}
                className={`h-6 w-0.5 ${indicator === 1
                  ? "bg-white"
                  : indicator === 0
                    ? "bg-gray-700"
                    : "animate-pulse bg-orange-500"
                }`}
                style={{ height: `${indicator !== 1 && indicator !== 0 ? indicator * 1.5 : 1.5}rem` }}
              />
            ))}
          </div>
        </>
      )}
    </TimeDisplayContainer>
  );
}
