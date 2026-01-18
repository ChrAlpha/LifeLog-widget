"use client";

import TimeDisplayContainer from "@/components/main-container";
import { StatusDot, GRID_STATUS } from "@/components/status-dot";
import { safeJSONParse } from "@/lib/date-utils";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocalStorage } from "foxact/use-local-storage";
import { useIsMountedState } from "@/hooks/use-is-mounted";

// Types
interface AgeDetails {
  age: number;
  percentageLived: number;
}

// Constants
const TABS = ["Today", "Week", "Month", "Year", "Life"];
const DEFAULT_TAB = "Life";

const LifePage = () => {
  const isMounted = useIsMountedState();
  // State
  const [selectedTab, setSelectedTab] = useState(DEFAULT_TAB);
  const [showInputs, setShowInputs] = useState(true);
  // Persistent storage
  const [birthday, setBirthday] = useLocalStorage<string>("user-birthday", "");
  const [lifeExpectancy, setLifeExpectancy] = useLocalStorage<number>("user-life-expectancy", 0);
  // Temporary form values (for editing)
  const [tempBirthday, setTempBirthday] = useState<string>("");
  const [tempLifeExpectancy, setTempLifeExpectancy] = useState<number>(0);
  // UI state
  const [ageDetails, setAgeDetails] = useState<AgeDetails>({ age: 0, percentageLived: 0 });
  const [lifeGridData, setLifeGridData] = useState<number[]>([]);

  // Ref for tracking yearly update timeout
  const yearlyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Calculate and update the age details and life grid visualization
   */
  const updateLifeView = useCallback(() => {
    // Validate inputs
    if (!birthday || typeof birthday !== "string" || !lifeExpectancy || typeof lifeExpectancy !== "number" || lifeExpectancy <= 0) {
      return;
    }

    try {
      // Parse birthday and calculate age
      const birthDate = new Date(birthday);

      // Validate birthdate is valid
      if (isNaN(birthDate.getTime())) {
        console.error("Invalid birth date");
        return;
      }

      const today = new Date();

      // Calculate age accurately considering month and day
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      // Calculate percentage with proper rounding and bounds checking
      const percentageLived = Math.min(
        100,
        parseFloat(((age / Math.max(1, lifeExpectancy)) * 100).toFixed(2)),
      );

      // Update age details state
      setAgeDetails({ age, percentageLived });

      // Generate life grid data
      const lifeGrid = Array.from({ length: lifeExpectancy }, (_, index) => {
        if (index < age) return GRID_STATUS.PAST;
        if (index === age) return GRID_STATUS.CURRENT;
        return GRID_STATUS.FUTURE;
      });

      setLifeGridData(lifeGrid);
    }
    catch (error: unknown) {
      console.error("Error updating life view:", error);
    }
  }, [birthday, lifeExpectancy]);

  // Initialize component and check for saved data
  useEffect(() => {
    // Check if user data exists in localStorage
    const hasSavedData = Boolean(
      localStorage.getItem("user-birthday")
      && localStorage.getItem("user-life-expectancy"),
    );

    if (hasSavedData) {
      setShowInputs(false);

      // Initialize with stored values using safe parsing
      const storedBirthday = localStorage.getItem("user-birthday");
      const storedLifeExpectancy = localStorage.getItem("user-life-expectancy");

      if (storedBirthday) {
        setBirthday(safeJSONParse(storedBirthday, ""));
      }

      if (storedLifeExpectancy) {
        setLifeExpectancy(Number(safeJSONParse(storedLifeExpectancy, 0)));
      }

      updateLifeView();
    }
    else {
      setShowInputs(true);
    }

    // Setup yearly update with self-rescheduling timeout (avoids drift)
    const scheduleNextYearUpdate = () => {
      const now = new Date();
      const nextYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
      const msUntilNextYear = nextYear.getTime() - now.getTime();

      yearlyTimeoutRef.current = setTimeout(() => {
        updateLifeView();
        scheduleNextYearUpdate();
      }, msUntilNextYear);
    };

    scheduleNextYearUpdate();

    // Cleanup function
    return () => {
      if (yearlyTimeoutRef.current) {
        clearTimeout(yearlyTimeoutRef.current);
      }
    };
  }, [updateLifeView, setBirthday, setLifeExpectancy]);

  // Update life view only when saved data changes
  useEffect(() => {
    if (birthday && lifeExpectancy && lifeExpectancy > 0 && !showInputs) {
      updateLifeView();
    }
  }, [birthday, lifeExpectancy, updateLifeView, showInputs]);

  /**
   * Validate and save user inputs
   */
  const handleSave = () => {
    // Validate inputs
    if (!tempBirthday) {
      alert("Please enter your birthday.");
      return;
    }

    // Validate birthday is a valid date
    const birthDate = new Date(tempBirthday);
    if (isNaN(birthDate.getTime())) {
      alert("Please enter a valid birthday.");
      return;
    }

    // Validate life expectancy
    if (!tempLifeExpectancy || tempLifeExpectancy <= 0) {
      alert("Please enter a valid life expectancy greater than 0.");
      return;
    }

    // Validate birth date is in the past
    if (birthDate > new Date()) {
      alert("Birthday cannot be in the future.");
      return;
    }

    // Save temporary values to persistent storage
    setBirthday(tempBirthday);
    setLifeExpectancy(tempLifeExpectancy);

    // Hide input form
    setShowInputs(false);
  };

  if (!isMounted) {
    return (
      <TimeDisplayContainer
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        tabs={TABS}
        hideTimeSpecificElements={true}
      >
        <div className="container mx-auto my-40 p-4 text-center">
          <p className="text-lg text-white">Loading...</p>
        </div>
      </TimeDisplayContainer>
    );
  }

  if (showInputs) {
    return (
      <TimeDisplayContainer
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        tabs={TABS}
        hideTimeSpecificElements={true}
      >
        <div className="container mx-auto p-4">
          <h1 className="mb-4 text-2xl text-white">Life Progress</h1>
          <div className="space-y-4">
            <div>
              <label htmlFor="birthday" className="block text-sm font-medium text-gray-300">
                Your Birthday:
              </label>
              <input
                type="date"
                id="birthday"
                value={tempBirthday || ""}
                onChange={e => setTempBirthday(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-700 bg-slate-700 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                required
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="lifeExpectancy" className="block text-sm font-medium text-gray-300">
                Life Expectancy (years):
              </label>
              <input
                type="number"
                id="lifeExpectancy"
                value={tempLifeExpectancy || ""}
                onChange={e => setTempLifeExpectancy(parseInt(e.target.value, 10) || 0)}
                min="1"
                max="150"
                className="mt-1 block w-full rounded-md border border-gray-700 bg-slate-700 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                required
                aria-required="true"
              />
            </div>
            <button
              onClick={handleSave}
              className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Save your birthday and life expectancy"
            >
              Save
            </button>
          </div>
        </div>
      </TimeDisplayContainer>
    );
  }

  if (!birthday || lifeExpectancy === null || lifeExpectancy <= 0) {
    return (
      <TimeDisplayContainer
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        tabs={TABS}
        hideTimeSpecificElements={true}
      >
        <div className="container mx-auto p-4 text-center">
          <p className="text-lg text-white">No valid data available.</p>
          <button
            onClick={() => setShowInputs(true)}
            className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Enter Your Information
          </button>
        </div>
      </TimeDisplayContainer>
    );
  }

  return (
    <TimeDisplayContainer
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      tabs={TABS}
      hideTimeSpecificElements={true}
    >
      <div className="mb-8 flex flex-col">
        <h1 className="text-6xl font-light tracking-widest text-white" aria-label={`Current age: ${ageDetails.age} years old`}>
          {ageDetails.age}
          {" "}
          y.o.
        </h1>
        <p className="text-lg text-gray-400">
          <span aria-label={`${ageDetails.percentageLived}% of life expectancy completed`}>
            {ageDetails.percentageLived}
            % of life expectancy
          </span>
        </p>
      </div>

      <div className="mb-8">
        <h2 className="sr-only mb-2 text-xl text-gray-300">Life Timeline</h2>
        <div className="mb-8 grid grid-cols-6 gap-4" aria-label="Life timeline visualization, each square represents one year">
          {lifeGridData.map((status, index) => (
            <StatusDot
              key={`life-year-${index}`}
              status={status as 0 | 1 | 2}
              title={`Age ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => {
            setTempBirthday(birthday);
            setTempLifeExpectancy(lifeExpectancy);
            setShowInputs(true);
          }}
          className="rounded-md bg-gray-700 px-4 py-2 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          aria-label="Edit your information"
        >
          Edit Information
        </button>
      </div>
    </TimeDisplayContainer>
  );
};

export default LifePage;
