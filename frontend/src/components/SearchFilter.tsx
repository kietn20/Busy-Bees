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
}

export default function SearchFilterBar({
  query,
  onQueryChange,
  sortValue,
  onSortChange,
  sortOptions,
  placeholder = "Search…",
  className = "",
}: SearchFilterBarProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Search input */}
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-400"
      />

      {/* Sort dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 whitespace-nowrap">Sort by</span>
        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-gray-400"
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
