"use client";

import { cn } from "@/lib/utils";

/**
 * Grid status constants
 * 0 = Future (gray)
 * 1 = Past (white)
 * 2 = Current (orange with pulse animation)
 */
export const GRID_STATUS = {
  FUTURE: 0,
  PAST: 1,
  CURRENT: 2,
} as const;

export type GridStatus = typeof GRID_STATUS[keyof typeof GRID_STATUS];

interface StatusDotProps {
  status: GridStatus;
  title?: string;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Reusable status dot component for grid visualizations.
 * Displays a colored dot based on the status: past (white), current (orange), or future (gray).
 */
export const StatusDot = ({
  status,
  title,
  size = "md",
  className,
}: StatusDotProps) => {
  const sizeClass = size === "sm" ? "size-1.5" : "size-3";

  const statusClass
    = status === GRID_STATUS.FUTURE
      ? "bg-gray-700"
      : status === GRID_STATUS.PAST
        ? "bg-white"
        : "animate-pulse bg-orange-500";

  return (
    <div
      className={cn(sizeClass, "rounded-sm", statusClass, className)}
      title={title}
    />
  );
};

/**
 * Generates grid data array based on current position in a range
 * @param totalItems - Total number of items in the grid
 * @param currentIndex - Current position (1-indexed by default)
 * @param isZeroIndexed - Whether currentIndex is 0-indexed (like months)
 */
export const generateGridData = (
  totalItems: number,
  currentIndex: number,
  isZeroIndexed: boolean = false,
): GridStatus[] => {
  const adjustedCurrent = isZeroIndexed ? currentIndex : currentIndex - 1;

  return Array.from({ length: totalItems }, (_, i) => {
    if (i < adjustedCurrent) return GRID_STATUS.PAST;
    if (i === adjustedCurrent) return GRID_STATUS.CURRENT;
    return GRID_STATUS.FUTURE;
  });
};
