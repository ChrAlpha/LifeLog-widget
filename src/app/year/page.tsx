"use client";

import { useState, useEffect } from "react";
import TimeDisplayContainer from "@/components/main-container";
import { StatusDot, generateGridData } from "@/components/status-dot";
import { getDaySuffix, getDayOfYear, getDaysInYear } from "@/lib/date-utils";

export default function YearPage() {
  const [selectedTab, setSelectedTab] = useState("Year");
  const tabs = ["Today", "Week", "Month", "Year", "Life"];

  // Synchronous initial state to avoid layout shift
  const nowInit = new Date();
  const initDayOfYear = getDayOfYear(nowInit);
  const initYear = nowInit.getFullYear();
  const initTotalDays = getDaysInYear(initYear);
  const initialDaysGrid = generateGridData(initTotalDays, initDayOfYear);

  const [currentDayOfYear, setCurrentDayOfYear] = useState(initDayOfYear);
  const [currentYear, setCurrentYear] = useState(initYear);
  const [daysInYearGridData, setDaysInYearGridData] = useState(initialDaysGrid);
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
      setDaysInYearGridData(generateGridData(daysInThisYear, dayOfYear));
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

  const dayGridCols = 18;
  const dayGridRows = Math.ceil(totalDaysInCurrentYear / dayGridCols);

  return (
    <TimeDisplayContainer
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      tabs={tabs}
      hideTimeSpecificElements={true}
    >
      <div className="mb-8">
        <h1 className="text-6xl font-light tracking-widest text-white">
          {currentDayOfYear}
          {getDaySuffix(currentDayOfYear)}
        </h1>
        <p className="text-xl text-gray-400">
          day of
          {" "}
          {currentYear}
        </p>
      </div>

      {/* Grid for days of the year */}
      <div className="mb-12 grid grid-cols-18 gap-2">
        {daysInYearGridData.map((status, index) => (
          <StatusDot
            key={`day-of-year-${index}`}
            status={status}
            title={`Day ${index + 1} of ${totalDaysInCurrentYear}`}
          />
        ))}
        {/* Fill remaining grid cells if the grid isn't perfectly filled by days */}
        {Array.from({ length: (dayGridCols * dayGridRows) - totalDaysInCurrentYear }).map(
          (_, index) => (
            <div
              key={`empty-year-day-${index}`}
              className="size-1.5 rounded-sm bg-transparent"
            />
          ),
        )}
      </div>
    </TimeDisplayContainer>
  );
}
