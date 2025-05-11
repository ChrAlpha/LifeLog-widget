"use client";

import { useState, useEffect } from "react";
import TimeDisplayContainer from "@/components/ui/TimeDisplayContainer"; // Import the container

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
    const [selectedTab, setSelectedTab] = useState("Month"); // Set initial tab
    const tabs = ["Today", "Week", "Month", "Year", "Life"]; // Define tabs
    const [currentDayOfMonth, setCurrentDayOfMonth] = useState(0);
    const [currentMonth, setCurrentMonth] = useState(0); // 0-indexed
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [daysInMonthGridData, setDaysInMonthGridData] = useState<number[]>([]);
    const [monthsInYearGridData, setMonthsInYearGridData] = useState<number[]>([]);
    const [totalDaysInCurrentMonth, setTotalDaysInCurrentMonth] = useState(0);
    const [firstDayIndex, setFirstDayIndex] = useState(0); // Starting day of the week for the month

    const totalMonths = 12;

    useEffect(() => {
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
                } else if (i + 1 === dayOfMonth) {
                    newDaysGridData[i] = 2; // Current day (orange)
                } else {
                    newDaysGridData[i] = 0; // Future day (gray)
                }
            }
            setDaysInMonthGridData(newDaysGridData);

            // Grid data for months in the year
            const newMonthsGridData: number[] = Array(totalMonths).fill(0);
            for (let i = 0; i < totalMonths; i++) {
                if (i < monthOfYear) {
                    newMonthsGridData[i] = 1; // Past month (white)
                } else if (i === monthOfYear) {
                    newMonthsGridData[i] = 2; // Current month (orange)
                } else {
                    newMonthsGridData[i] = 0; // Future month (gray)
                }
            }
            setMonthsInYearGridData(newMonthsGridData);
        };

        updateMonthView();
        // Update once a day, as month/day doesn't change more frequently
        const intervalId = setInterval(updateMonthView, 24 * 60 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    const getDaySuffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
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
            hideTimeSpecificElements={true} // Hide time and minute indicators
        >
            <div className="mb-8">
                <h1 className="text-6xl font-light text-white tracking-widest">
                    {currentDayOfMonth}{getDaySuffix(currentDayOfMonth)}
                </h1>
            </div>
            <div className={`grid grid-cols-7 gap-4 mb-12`}>
                {/* Empty cells for days before the first day of the month */}
                {Array.from({ length: firstDayIndex }).map((_, index) => (
                    <div
                        key={`empty-start-${index}`}
                        className="w-3 h-3 rounded-sm bg-transparent" // Or some other placeholder style
                    />
                ))}
                {/* Cells for the days of the month */}
                {daysInMonthGridData.map((status, index) => (
                    <div
                        key={`day-${index}`}
                        className={`w-3 h-3 rounded-sm ${status === 0
                            ? "bg-gray-700"
                            : status === 1
                                ? "bg-white"
                                : "bg-orange-500 animate-pulse"
                            }`}
                        title={`Day ${index + 1}`}
                    />
                ))}
                {/* Optional: Fill remaining grid cells at the end */}
                {Array.from({ length: dayGridTotalCells - (totalDaysInCurrentMonth + firstDayIndex) }).map(
                    (_, index) => (
                        <div
                            key={`empty-end-${index}`}
                            className="w-3 h-3 rounded-sm bg-transparent"
                        />
                    ),
                )}
            </div>

            <h2 className="text-xl mb-4 text-gray-400">
                <span className="text-3xl text-white">{getMonthName(currentMonth)}</span> in {currentYear}
            </h2>
            {/* Months of the year grid (e.g., 4x3) */}
            <div className="grid grid-cols-6 gap-4 mb-20"> {/* Adjusted to 6 columns for better fit */}
                {monthsInYearGridData.map((status, index) => (
                    <div
                        key={`month-${index}`}
                        className={`w-3 h-3 rounded-sm ${status === 0
                            ? "bg-gray-700"
                            : status === 1
                                ? "bg-white"
                                : "bg-orange-500 animate-pulse"
                            }`}
                        title={`${getMonthName(index)}`}
                    />
                ))}
                {/* Optional: Fill remaining grid cells if not a perfect 12 (e.g. if using 4x4 grid) */}
                {Array.from({ length: (Math.ceil(totalMonths / 6) * 6) - totalMonths }).map(
                    (_, index) => (
                        <div
                            key={`empty-month-${index}`}
                            className="w-3 h-3 rounded-sm bg-black" // Match container background
                        />
                    ),
                )}
            </div>
        </TimeDisplayContainer>
    );
}
