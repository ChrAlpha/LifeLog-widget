"use client";

import { useState, useEffect } from "react";
import TimeDisplayContainer from "@/components/main-container";
import { StatusDot, generateGridData } from "@/components/status-dot";
import { getDaySuffix, getMonthName, getDaysInMonth, getFirstDayOfMonth } from "@/lib/date-utils";

export default function MonthPage() {
  const [selectedTab, setSelectedTab] = useState("Month");
  const tabs = ["Today", "Week", "Month", "Year", "Life"];
  const totalMonths = 12;

  // Synchronous initial state to avoid layout shift
  const nowInit = new Date();
  const initDay = nowInit.getDate();
  const initMonth = nowInit.getMonth();
  const initYear = nowInit.getFullYear();
  const initDaysInMonth = getDaysInMonth(initYear, initMonth);
  const initFirstDayIdx = getFirstDayOfMonth(initYear, initMonth);

  const initialDaysGrid = generateGridData(initDaysInMonth, initDay);
  const initialMonthsGrid = generateGridData(totalMonths, initMonth, true);

  const [currentDayOfMonth, setCurrentDayOfMonth] = useState(initDay);
  const [currentMonth, setCurrentMonth] = useState(initMonth);
  const [currentYear, setCurrentYear] = useState(initYear);
  const [daysInMonthGridData, setDaysInMonthGridData] = useState(initialDaysGrid);
  const [monthsInYearGridData, setMonthsInYearGridData] = useState(initialMonthsGrid);
  const [totalDaysInCurrentMonth, setTotalDaysInCurrentMonth] = useState(initDaysInMonth);
  const [firstDayIndex, setFirstDayIndex] = useState(initFirstDayIdx);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const updateMonthView = () => {
      const now = new Date();
      const dayOfMonth = now.getDate();
      const monthOfYear = now.getMonth();
      const year = now.getFullYear();
      const daysInThisMonth = getDaysInMonth(year, monthOfYear);
      const firstDay = getFirstDayOfMonth(year, monthOfYear);

      setCurrentDayOfMonth(dayOfMonth);
      setCurrentMonth(monthOfYear);
      setCurrentYear(year);
      setTotalDaysInCurrentMonth(daysInThisMonth);
      setFirstDayIndex(firstDay);
      setDaysInMonthGridData(generateGridData(daysInThisMonth, dayOfMonth));
      setMonthsInYearGridData(generateGridData(totalMonths, monthOfYear, true));
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
      updateMonthView();
      intervalId = setInterval(updateMonthView, 24 * 60 * 60 * 1000);
    }, millisecondsUntilNextDay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // For the calendar grid of days
  const dayGridCols = 7;
  const dayGridTotalCells = Math.ceil((totalDaysInCurrentMonth + firstDayIndex) / dayGridCols) * dayGridCols;

  return (
    <TimeDisplayContainer
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      tabs={tabs}
      hideTimeSpecificElements={true}
    >
      <div className="mb-8">
        <h1 className="text-6xl font-light tracking-widest text-white">
          {currentDayOfMonth}
          {getDaySuffix(currentDayOfMonth)}
        </h1>
      </div>
      <div className="mb-12 grid grid-cols-7 gap-4">
        {/* Empty cells for days before the first day of the month */}
        {Array.from({ length: firstDayIndex }).map((_, index) => (
          <div
            key={`empty-start-${index}`}
            className="size-3 rounded-sm bg-transparent"
          />
        ))}
        {/* Cells for the days of the month */}
        {daysInMonthGridData.map((status, index) => (
          <StatusDot
            key={`day-${index}`}
            status={status}
            title={`Day ${index + 1}`}
          />
        ))}
        {/* Fill remaining grid cells at the end */}
        {Array.from({ length: dayGridTotalCells - (totalDaysInCurrentMonth + firstDayIndex) }).map(
          (_, index) => (
            <div
              key={`empty-end-${index}`}
              className="size-3 rounded-sm bg-transparent"
            />
          ),
        )}
      </div>

      <h2 className="mb-4 text-xl text-gray-400">
        <span className="text-3xl text-white">{getMonthName(currentMonth)}</span>
        {" "}
        in
        {" "}
        {currentYear}
      </h2>
      {/* Months of the year grid */}
      <div className="mb-20 grid grid-cols-6 gap-4">
        {monthsInYearGridData.map((status, index) => (
          <StatusDot
            key={`month-${index}`}
            status={status}
            title={getMonthName(index)}
          />
        ))}
        {/* Fill remaining grid cells if not a perfect 12 */}
        {Array.from({ length: (Math.ceil(totalMonths / 6) * 6) - totalMonths }).map(
          (_, index) => (
            <div
              key={`empty-month-${index}`}
              className="size-3 rounded-sm bg-black"
            />
          ),
        )}
      </div>
    </TimeDisplayContainer>
  );
}
