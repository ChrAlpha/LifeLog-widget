"use client";

import { useState, useEffect } from "react";
import TimeDisplayContainer from "@/components/main-container";

// Helper function to get the day of the year (1-365 or 1-366 for leap years)
const getDayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

// Helper function to get the total number of days in a year
const getDaysInYear = (year: number): number => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
};

export default function YearPage() {
  const [selectedTab, setSelectedTab] = useState("Year");
  const tabs = ["Today", "Week", "Month", "Year", "Life"];
  // Synchronous initial state to avoid layout shift
  const nowInit = new Date();
  const initDayOfYear = getDayOfYear(nowInit);
  const initYear = nowInit.getFullYear();
  const initTotalDays = getDaysInYear(initYear);
  const initialDaysGrid: number[] = Array.from({ length: initTotalDays }, (_, i) =>
    i + 1 < initDayOfYear ? 1 : i + 1 === initDayOfYear ? 2 : 0,
  );

  const [currentDayOfYear, setCurrentDayOfYear] = useState(initDayOfYear);
  const [currentYear, setCurrentYear] = useState(initYear);
  const [daysInYearGridData, setDaysInYearGridData] = useState<number[]>(initialDaysGrid);
  const [totalDaysInCurrentYear, setTotalDaysInCurrentYear] = useState(initTotalDays);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const updateYearView = () => {
      const now = new Date();
      const dayOfYear = getDayOfYear(now);
      const year = now.getFullYear();
      const daysInThisYear = getDaysInYear(year);

      setCurrentDayOfYear(dayOfYear);
      setCurrentYear(year);
      setTotalDaysInCurrentYear(daysInThisYear);

      // Grid data for days in the year
      const newDaysGridData: number[] = Array(daysInThisYear).fill(0);
      for (let i = 0; i < daysInThisYear; i++) {
        if (i + 1 < dayOfYear) {
          newDaysGridData[i] = 1; // Past day (white)
        }
        else if (i + 1 === dayOfYear) {
          newDaysGridData[i] = 2; // Current day (orange)
        }
        else {
          newDaysGridData[i] = 0; // Future day (gray)
        }
      }
      setDaysInYearGridData(newDaysGridData);
    };

    // Update once a day
    const now = new Date();
    const nextDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0, 0,
    );
    const millisecondsUntilNextDay = nextDay.getTime() - now.getTime();
    const timeoutId = setTimeout(() => {
      updateYearView();
      intervalId = setInterval(updateYearView, 24 * 60 * 60 * 1000);
    }, millisecondsUntilNextDay);
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const getDaySuffix = (day: number) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  const dayGridCols = 18;
  const dayGridRows = Math.ceil(totalDaysInCurrentYear / dayGridCols);

  return (
    <TimeDisplayContainer
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      tabs={tabs}
      hideTimeSpecificElements={true} // Hide time and minute indicators
    >
      <div className="mb-8">
        <h1 className="text-6xl font-light tracking-widest text-white">
          {currentDayOfYear}
          {getDaySuffix(currentDayOfYear)}
        </h1>
        <p className="text-xl text-gray-400">
          day of
          {" " + currentYear}
        </p>
      </div>

      {/* Grid for days of the year */}
      <div className="mb-12 grid grid-cols-18 gap-2">
        {" "}
        {/* Reduced gap for denser grid */}
        {daysInYearGridData.map((status, index) => (
          <div
            key={`day-of-year-${index}`}
            className={`size-3 rounded-sm ${// Smaller dots
              status === 0
                ? "bg-gray-700" // Future day
                : status === 1
                  ? "bg-white" // Past day
                  : "animate-pulse bg-orange-500" // Current day
              }`}
            title={`Day ${index + 1} of ${totalDaysInCurrentYear}`}
          />
        ))}
        {/* Optional: Fill remaining grid cells if the grid isn't perfectly filled by days */}
        {Array.from({ length: (dayGridCols * dayGridRows) - totalDaysInCurrentYear }).map(
          (_, index) => (
            <div
              key={`empty-year-day-${index}`}
              className="size-1.5 rounded-sm bg-transparent" // Or match container background
            />
          ),
        )}
      </div>
    </TimeDisplayContainer>
  );
}
