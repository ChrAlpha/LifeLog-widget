"use client";

import { useState, useEffect } from "react";
import TimeDisplayContainer from "@/components/main-container"; // Import the new container

export default function TimeTracker() {
  const [selectedTab, setSelectedTab] = useState("Today");
  const tabs = ["Today", "Week", "Month", "Year", "Life"];
  const [currentTime, setCurrentTime] = useState("");
  const [gridData, setGridData] = useState<number[][]>([]);
  const [navIndicators, setNavIndicators] = useState<number[]>([]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const updateDateTime = () => {
      const now = new Date();
      const hours = now.getHours(); // 0-23
      const minutes = now.getMinutes(); // 0-59

      // Format time as HH:MM
      const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      setCurrentTime(formattedTime);

      // Calculate gridData (24 hours, 6 rows x 4 columns)
      const newGridDataArray: number[] = Array(24).fill(0);
      for (let i = 0; i < 24; i++) {
        if (i < hours) {
          newGridDataArray[i] = 1; // Past hour (white)
        }
        else if (i === hours) {
          newGridDataArray[i] = 2; // Current hour (orange)
        }
        else {
          newGridDataArray[i] = 0; // Future hour (gray)
        }
      }
      // Reshape into 6x4 grid
      const reshapedGridData: number[][] = [];
      for (let i = 0; i < 6; i++) {
        reshapedGridData.push(newGridDataArray.slice(i * 4, i * 4 + 4));
      }
      setGridData(reshapedGridData);

      // Calculate navIndicators (6 indicators for 60 minutes)
      // Each indicator represents 10 minutes (60 / 6)
      const newNavIndicatorsArray: number[] = Array(6).fill(0);
      const currentMinuteBlock = Math.floor(minutes / 10); // 0-4

      for (let i = 0; i < 6; i++) {
        if (i < currentMinuteBlock) {
          newNavIndicatorsArray[i] = 1; // Past block (white)
        }
        else if (i === currentMinuteBlock) {
          newNavIndicatorsArray[i] = (minutes - i * 10) / 10; // Current block (orange)
        }
        else {
          newNavIndicatorsArray[i] = 0; // Future block (gray)
        }
      }
      setNavIndicators(newNavIndicatorsArray);
    };

    // Initial call to set the time immediately
    updateDateTime();

    // Calculate time until the next minute
    const now = new Date();
    const millisecondsUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    // Schedule the first update for the start of the next minute
    const timeoutId = setTimeout(() => {
      updateDateTime(); // Update at the start of the minute

      // Then, set an interval for every minute thereafter
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
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`size-3 rounded-sm ${cell === 0 ? "bg-gray-700" : cell === 1 ? "bg-white" : "animate-pulse bg-orange-500"}`}
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
                style={{ height: `${indicator !== 1 && indicator !== 0 ? indicator * 1.5 : 1.5}rem` }} // Adjust height based on indicator value
              />
            ))}
          </div>
        </>
      )}
    </TimeDisplayContainer>
  );
}
