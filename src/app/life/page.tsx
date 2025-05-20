"use client";

import TimeDisplayContainer from "@/components/main-container";
import React, { useState, useEffect, useCallback } from "react";
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
const LIFE_GRID_STATUS = {
  FUTURE: 0,
  PAST: 1,
  CURRENT: 2,
};

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
  const [lifeGridData, setLifeGridData] = useState<number[]>([]); // 0: future, 1: past, 2: current

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
        if (index < age) return LIFE_GRID_STATUS.PAST; // Past years
        if (index === age) return LIFE_GRID_STATUS.CURRENT; // Current year
        return LIFE_GRID_STATUS.FUTURE; // Future years
      });

      setLifeGridData(lifeGrid);
    }
    catch (error) {
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
      console.log("Birthday and life expectancy found in local storage.");
      setShowInputs(false);

      // Initialize temporary form values with stored values
      const storedBirthday = localStorage.getItem("user-birthday");
      const storedLifeExpectancy = localStorage.getItem("user-life-expectancy");

      if (storedBirthday) {
        setBirthday(JSON.parse(storedBirthday));
      }

      if (storedLifeExpectancy) {
        setLifeExpectancy(Number(JSON.parse(storedLifeExpectancy)));
      }

      // Only update view if we have saved data
      updateLifeView();
    }
    else {
      // If no saved data, show the input form with empty values
      setShowInputs(true);
    }

    // Setup yearly update timer (only affects display when data is saved)
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const setupYearlyUpdate = () => {
      const now = new Date();
      // Calculate time until next year
      const nextYear = new Date(now.getFullYear() + 1, 0, 1); // January 1st of next year
      const millisecondsUntilNextYear = Math.max(0, nextYear.getTime() - now.getTime());

      console.log(`Setting up yearly update. Next update in ${Math.floor(millisecondsUntilNextYear / (1000 * 60 * 60 * 24))} days`);

      // Set timeout for next year's first update
      const timeoutId = setTimeout(() => {
        // Update view at the start of the new year
        updateLifeView();

        // Then set interval for subsequent yearly updates
        intervalId = setInterval(() => {
          console.log("Yearly update triggered");
          updateLifeView();
        }, 1000 * 60 * 60 * 24 * 365); // Approximately one year
      }, millisecondsUntilNextYear);

      return timeoutId;
    };

    const timeoutId = setupYearlyUpdate();

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [updateLifeView]); // Depend on updateLifeView

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
        hideTimeSpecificElements={true} // Hide time and minute indicators
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
                onChange={e => setTempLifeExpectancy(parseInt(e.target.value, 10))}
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
          {lifeGridData.map((status, index) => {
            // Determine CSS class based on status
            const statusClass = status === LIFE_GRID_STATUS.FUTURE
              ? "bg-gray-700"
              : status === LIFE_GRID_STATUS.PAST
                ? "bg-white"
                : "animate-pulse bg-orange-500";

            return (
              <div
                key={`life-year-${index}`}
                className={`size-3 rounded-sm ${statusClass}`}
                title={`Age ${index + 1}`}
                aria-label={`Age ${index + 1}: ${status === LIFE_GRID_STATUS.FUTURE
                  ? "Future"
                  : status === LIFE_GRID_STATUS.PAST
                    ? "Past"
                    : "Current"
                }`}
              />
            );
          })}
        </div>

        <button
          onClick={() => {
            // Load current values into temporary state for editing
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
