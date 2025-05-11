"use client";

import { useState, useEffect } from "react";
import TimeDisplayContainer from "@/components/ui/TimeDisplayContainer"; // Import the container

// Helper function to get the week number
const getWeekNumber = (d: Date): number => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate week number
    const weekNo = Math.ceil((((d.valueOf() - yearStart.valueOf()) / 86400000) + 1) / 7);
    return weekNo;
};

const getWeekDay = (d: Date): [number, string] => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const day = d.getDay();
    return [day, days[day]];
}

export default function WeekPage() {
    const [selectedTab, setSelectedTab] = useState("Week"); // Set initial tab
    const tabs = ["Today", "Week", "Month", "Year", "Life"]; // Define tabs
    const [currentWeek, setCurrentWeek] = useState(0);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [weekDay, setWeekDay] = useState("");
    const [weekGridData, setWeekGridData] = useState<number[]>([]);
    const [weekofYearGridData, setWeekofYearGridData] = useState<number[]>([]);
    const totalWeeks = 52;

    useEffect(() => {
        const updateWeekView = () => {
            const now = new Date();
            const weekOfYear = getWeekNumber(now);
            const [weekIndex, weekDay] = getWeekDay(now);
            setCurrentWeek(weekOfYear);
            setCurrentYear(now.getFullYear());
            setWeekDay(weekDay);

            const newGridDataArray: number[] = Array(7).fill(0);
            for (let i = 0; i < 7; i++) {
                if (i < weekIndex) {
                    newGridDataArray[i] = 1; // Past week (white)
                } else if (i === weekIndex) {
                    newGridDataArray[i] = 2; // Current week (orange)
                } else {
                    newGridDataArray[i] = 0; // Future week (gray)
                }
            }
            setWeekGridData(newGridDataArray);

            const newWeekofYearGridData: number[] = Array(totalWeeks).fill(0);
            for (let i = 0; i < totalWeeks; i++) {
                if (i + 1 < weekOfYear) {
                    newWeekofYearGridData[i] = 1; // Past week (white)
                } else if (i + 1 === weekOfYear) {
                    newWeekofYearGridData[i] = 2; // Current week (orange)
                } else {
                    newWeekofYearGridData[i] = 0; // Future week (gray)
                }
            }
            setWeekofYearGridData(newWeekofYearGridData);
        };

        updateWeekView();
        // Update once a day, as week number doesn't change more frequently
        const intervalId = setInterval(updateWeekView, 24 * 60 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    // Determine grid layout (e.g., 9x6 or similar for 52 items)
    // For 52 weeks, a 9x6 grid (54 cells) or 7x8 (56 cells) could work.
    // Let's aim for a layout that's visually balanced.
    // A 7 columns (days of week) by 8 rows layout seems reasonable.
    const numCols = 7; // Or 9 or other factor of a number slightly larger than 52
    const numRows = Math.ceil(totalWeeks / numCols);


    return (
        <TimeDisplayContainer
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab} // You might want to implement tab switching logic
            tabs={tabs}
            hideTimeSpecificElements={true} // Hide time and minute indicators
        >
            <div className="mb-8">
                <h1 className="text-6xl font-light text-white tracking-widest">
                    {weekDay}
                </h1>
            </div>
            <div className="grid grid-cols-7 gap-4 mb-12"> {/* Changed to static class */}
                {weekGridData.map((status, index) => (
                    <div
                        key={index}
                        className={`w-3 h-3 rounded-sm ${status === 0
                            ? "bg-gray-700"
                            : status === 1
                                ? "bg-white"
                                : "bg-orange-500 animate-pulse"
                            }`}
                        title={`Week ${index + 1}`}
                    />
                ))}
            </div>
            {/* Week of year specific content */}
            <h2 className="text-xl mb-4 text-gray-400">
                Week {currentWeek} of {totalWeeks} in {currentYear}
            </h2>
            <div className="grid grid-cols-7 gap-4 mb-12"> {/* Changed to static class */}
                {weekofYearGridData.map((status, index) => (
                    <div
                        key={index}
                        className={`w-3 h-3 rounded-sm ${status === 0
                            ? "bg-gray-700"
                            : status === 1
                                ? "bg-white"
                                : "bg-orange-500 animate-pulse"
                            }`}
                        title={`Week ${index + 1}`}
                    />
                ))}
                {/* Optional: Fill remaining grid cells */}
                {Array.from({ length: numRows * numCols - totalWeeks }).map(
                    (_, index) => (
                        <div
                            key={`empty-${index}`}
                            className="w-3 h-3 rounded-sm bg-black" // Match container background
                        />
                    ),
                )}
            </div>
        </TimeDisplayContainer >
    );
}