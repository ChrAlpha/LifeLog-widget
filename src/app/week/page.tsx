"use client";

import { useState, useEffect } from "react";
import TimeDisplayContainer from "@/components/main-container";
import { StatusDot, generateGridData } from "@/components/status-dot";
import { getISOWeekNumber, getISOWeeksInYear, getWeekDay } from "@/lib/date-utils";

export default function WeekPage() {
  const [selectedTab, setSelectedTab] = useState("Week");
  const tabs = ["Today", "Week", "Month", "Year", "Life"];

  // Initial synchronous state to avoid layout jump
  const nowInit = new Date();
  const initialWeekOfYear = getISOWeekNumber(nowInit);
  const [initialWeekIndex, initialWeekDay] = getWeekDay(nowInit);
  const initTotalWeeks = getISOWeeksInYear(nowInit.getFullYear());

  const initialWeekGridData = generateGridData(7, initialWeekIndex, true);
  const initialWeekOfYearGridData = generateGridData(initTotalWeeks, initialWeekOfYear);

  const [currentWeek, setCurrentWeek] = useState(initialWeekOfYear);
  const [currentYear, setCurrentYear] = useState(nowInit.getFullYear());
  const [totalWeeks, setTotalWeeks] = useState(initTotalWeeks);
  const [weekDay, setWeekDay] = useState(initialWeekDay);
  const [weekGridData, setWeekGridData] = useState(initialWeekGridData);
  const [weekofYearGridData, setWeekofYearGridData] = useState(initialWeekOfYearGridData);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const updateWeekView = () => {
      const now = new Date();
      const weekOfYear = getISOWeekNumber(now);
      const [weekIndex, weekDayName] = getWeekDay(now);
      const year = now.getFullYear();
      const weeksInYear = getISOWeeksInYear(year);

      setCurrentWeek(weekOfYear);
      setCurrentYear(year);
      setTotalWeeks(weeksInYear);
      setWeekDay(weekDayName);
      setWeekGridData(generateGridData(7, weekIndex, true));
      setWeekofYearGridData(generateGridData(weeksInYear, weekOfYear));
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
      updateWeekView();
      intervalId = setInterval(updateWeekView, 1000 * 60 * 60 * 24);
    }, millisecondsUntilNextDay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const numCols = 7;
  const numRows = Math.ceil(totalWeeks / numCols);

  return (
    <TimeDisplayContainer
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      tabs={tabs}
      hideTimeSpecificElements={true}
    >
      <div className="mb-8">
        <h1 className="text-6xl font-light tracking-widest text-white">
          {weekDay}
        </h1>
      </div>
      <div className="mb-12 grid grid-cols-7 gap-4">
        {weekGridData.map((status, index) => (
          <StatusDot
            key={index}
            status={status}
            title={`Day ${index + 1}`}
          />
        ))}
      </div>
      {/* Week of year specific content */}
      <h2 className="mb-4 text-xl text-gray-400">
        Week
        {" "}
        {currentWeek}
        {" "}
        of
        {" "}
        {totalWeeks}
        {" "}
        in
        {" "}
        {currentYear}
      </h2>
      <div className="mb-12 grid grid-cols-7 gap-4">
        {weekofYearGridData.map((status, index) => (
          <StatusDot
            key={index}
            status={status}
            title={`Week ${index + 1}`}
          />
        ))}
        {/* Fill remaining grid cells */}
        {Array.from({ length: numRows * numCols - totalWeeks }).map(
          (_, index) => (
            <div
              key={`empty-${index}`}
              className="size-3 rounded-sm bg-black"
            />
          ),
        )}
      </div>
    </TimeDisplayContainer>
  );
}
