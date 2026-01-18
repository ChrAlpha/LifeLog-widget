/**
 * Shared date utility functions for LifeLog-widget
 */

/**
 * Returns the ordinal suffix for a given day number (1st, 2nd, 3rd, 4th, etc.)
 */
export const getDaySuffix = (day: number): string => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
};

/**
 * Gets the ISO week number for a given date.
 * Returns week number (1-53) according to ISO 8601.
 */
export const getISOWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.valueOf() - yearStart.valueOf()) / 86400000) + 1) / 7);
};

/**
 * Gets the total number of ISO weeks in a given year.
 * Most years have 52 weeks, but some have 53.
 */
export const getISOWeeksInYear = (year: number): number => {
  // December 28 is always in the last week of the year
  const dec28 = new Date(year, 11, 28);
  return getISOWeekNumber(dec28);
};

/**
 * Checks if a year is a leap year
 */
export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

/**
 * Gets the total number of days in a year
 */
export const getDaysInYear = (year: number): number => {
  return isLeapYear(year) ? 366 : 365;
};

/**
 * Gets the day of the year (1-365 or 1-366 for leap years)
 */
export const getDayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date.getTime() - start.getTime())
    + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

/**
 * Safely parses JSON from localStorage with error handling
 */
export const safeJSONParse = <T>(value: string | null, fallback: T): T => {
  if (value === null) return fallback;
  try {
    return JSON.parse(value) as T;
  }
  catch {
    console.error("Failed to parse JSON from localStorage");
    return fallback;
  }
};

/**
 * Gets the weekday index and name for a given date
 */
export const getWeekDay = (date: Date): [number, string] => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = date.getDay();
  return [day, days[day]];
};

/**
 * Gets the month name for a given month index (0-11)
 */
export const getMonthName = (monthIndex: number): string => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[monthIndex];
};

/**
 * Gets the number of days in a month
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Gets the starting day of the week for a month (0 for Sunday, 1 for Monday, etc.)
 */
export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};
