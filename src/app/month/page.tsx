"use client";

import { useState, useEffect } from "react";
import TimeDisplayContainer from "@/components/main-container";

// Helper function to get the month name
const getMonthName = (monthIndex: number): string => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[monthIndex];
};

// Helper function to get the number of days in a month
const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

// Helper function to get the starting day of the week for a month (0 for Sunday, 1 for Monday, etc.)
const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export default function MonthPage() {
  const [selectedTab, setSelectedTab] = useState("Month");
  const tabs = ["Today", "Week", "Month", "Year", "Life"];
  const [currentDayOfMonth, setCurrentDayOfMonth] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(0); // 0-indexed
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [daysInMonthGridData, setDaysInMonthGridData] = useState<number[]>([]);
  const [monthsInYearGridData, setMonthsInYearGridData] = useState<number[]>([]);
  const [totalDaysInCurrentMonth, setTotalDaysInCurrentMonth] = useState(0);
  const [firstDayIndex, setFirstDayIndex] = useState(0);
  const totalMonths = 12;

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const updateMonthView = () => {
      const now = new Date();
      const dayOfMonth = now.getDate();
      const monthOfYear = now.getMonth(); // 0-indexed
      const year = now.getFullYear();
      const daysInThisMonth = getDaysInMonth(year, monthOfYear);
      const firstDay = getFirstDayOfMonth(year, monthOfYear);

      setCurrentDayOfMonth(dayOfMonth);
      setCurrentMonth(monthOfYear);
      setCurrentYear(year);
      setTotalDaysInCurrentMonth(daysInThisMonth);
      setFirstDayIndex(firstDay);

      // Grid data for days in the month
      const newDaysGridData: number[] = Array(daysInThisMonth).fill(0);
      for (let i = 0; i < daysInThisMonth; i++) {
        if (i + 1 < dayOfMonth) {
          newDaysGridData[i] = 1; // Past day (white)
        }
        else if (i + 1 === dayOfMonth) {
          newDaysGridData[i] = 2; // Current day (orange)
        }
        else {
          newDaysGridData[i] = 0; // Future day (gray)
        }
      }
      setDaysInMonthGridData(newDaysGridData);

      // Grid data for months in the year
      const newMonthsGridData: number[] = Array(totalMonths).fill(0);
      for (let i = 0; i < totalMonths; i++) {
        if (i < monthOfYear) {
          newMonthsGridData[i] = 1; // Past month (white)
        }
        else if (i === monthOfYear) {
          newMonthsGridData[i] = 2; // Current month (orange)
        }
        else {
          newMonthsGridData[i] = 0; // Future month (gray)
        }
      }
      setMonthsInYearGridData(newMonthsGridData);
    };

    updateMonthView();

    // Update once a day, as month/day doesn't change more frequently
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

  const getDaySuffix = (day: number) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

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
          <div
            key={`day-${index}`}
            className={`size-3 rounded-sm ${status === 0
              ? "bg-gray-700"
              : status === 1
                ? "bg-white"
                : "animate-pulse bg-orange-500"
              }`}
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
        {currentYear}
      </h2>
      {/* Months of the year grid (e.g., 4x3) */}
      <div className="mb-20 grid grid-cols-6 gap-4">
        {" "}
        {/* Adjusted to 6 columns for better fit */}
        {monthsInYearGridData.map((status, index) => (
          <div
            key={`month-${index}`}
            className={`size-3 rounded-sm ${status === 0
              ? "bg-gray-700"
              : status === 1
                ? "bg-white"
                : "animate-pulse bg-orange-500"
              }`}
            title={`${getMonthName(index)}`}
          />
        ))}
        {/* Fill remaining grid cells if not a perfect 12 (e.g. if using 4x4 grid) */}
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
