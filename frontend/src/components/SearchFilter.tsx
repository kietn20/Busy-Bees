"use client";

import React from "react";

export type SortOption = {
  value: string;
  label: string;
};

interface SearchFilterBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  sortValue: string;
  onSortChange: (value: string) => void;
  sortOptions: SortOption[];
  placeholder?: string;
  className?: string;
  /** "vertical" (stacked) for narrow sidebars, "horizontal" to put them side by side */
  layout?: "vertical" | "horizontal";
}

export default function SearchFilterBar({
  query,
  onQueryChange,
  sortValue,
  onSortChange,
  sortOptions,
  placeholder = "Search…",
  className = "",
  layout = "vertical",
}: SearchFilterBarProps) {
  const isHorizontal = layout === "horizontal";

  return (
    <div
      className={
        isHorizontal
          ? `flex flex-col gap-2 md:flex-row md:items-center md:justify-between ${className}`
          : `space-y-2 ${className}`
      }
    >
      {/* Search input */}
      <div className={isHorizontal ? "w-full md:max-w-xs" : "w-full"}>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-foreground/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Sort dropdown */}
      <div className="flex items-center gap-2 md:w-auto">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Sort by
        </span>
        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-md border border-foreground/20 px-2 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-primary"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
