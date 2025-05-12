"use client";

import { useState, useEffect } from "react";
import TimeDisplayContainer from "@/components/ui/TimeDisplayContainer";

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
    const [selectedTab, setSelectedTab] = useState("Year"); // Set initial tab
    const tabs = ["Today", "Week", "Month", "Year", "Life"]; // Define tabs
    const [currentDayOfYear, setCurrentDayOfYear] = useState(0);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [daysInYearGridData, setDaysInYearGridData] = useState<number[]>([]);
    const [totalDaysInCurrentYear, setTotalDaysInCurrentYear] = useState(0);

    useEffect(() => {
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
                } else if (i + 1 === dayOfYear) {
                    newDaysGridData[i] = 2; // Current day (orange)
                } else {
                    newDaysGridData[i] = 0; // Future day (gray)
                }
            }
            setDaysInYearGridData(newDaysGridData);
        };

        updateYearView();
        // Update once a day
        const intervalId = setInterval(updateYearView, 24 * 60 * 60 * 1000);

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

    // For the calendar grid of days in the year
    // Aim for a grid that's roughly square-ish or fits well.
    // E.g., 25 columns would mean about 14-15 rows.
    const dayGridCols = 25; // Adjust as needed for visual appeal
    const dayGridRows = Math.ceil(totalDaysInCurrentYear / dayGridCols);


    return (
        <TimeDisplayContainer
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            tabs={tabs}
            hideTimeSpecificElements={true} // Hide time and minute indicators
        >
            <div className="mb-8">
                <h1 className="text-6xl font-light text-white tracking-widest">
                    {currentDayOfYear}{getDaySuffix(currentDayOfYear)}
                </h1>
                <p className="text-xl text-gray-400">day of {currentYear}</p>
            </div>

            {/* Grid for days of the year */}
            <div className="grid grid-cols-18 gap-2 mb-12"> {/* Reduced gap for denser grid */}
                {daysInYearGridData.map((status, index) => (
                    <div
                        key={`day-of-year-${index}`}
                        className={`w-3 h-3 rounded-sm ${ // Smaller dots
                            status === 0
                                ? "bg-gray-700" // Future day
                                : status === 1
                                    ? "bg-white" // Past day
                                    : "bg-orange-500 animate-pulse" // Current day
                            }`}
                        title={`Day ${index + 1} of ${totalDaysInCurrentYear}`}
                    />
                ))}
                {/* Optional: Fill remaining grid cells if the grid isn't perfectly filled by days */}
                {Array.from({ length: (dayGridCols * dayGridRows) - totalDaysInCurrentYear }).map(
                    (_, index) => (
                        <div
                            key={`empty-year-day-${index}`}
                            className="w-1.5 h-1.5 rounded-sm bg-transparent" // Or match container background
                        />
                    ),
                )}
            </div>

            {/* Year display - already part of the title, but could add more here if needed */}
            {/* <h2 className="text-3xl mb-4 text-white">{currentYear}</h2> */}

        </TimeDisplayContainer>
    );
}
