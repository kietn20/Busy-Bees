import React from "react";
import { Heart } from "lucide-react";

type FavoriteButtonProps = {
  isFavorited: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
};

export default function FavoriteButton({
  isFavorited,
  onClick,
  className = "",
  ariaLabel,
  disabled = false,
}: FavoriteButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isFavorited}
      aria-label={ariaLabel ?? (isFavorited ? "Unfavorite" : "Favorite")}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-full p-2 bg-transparent hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-3)] ${className}`}
    >
      <Heart
        className={`w-5 h-5 transform ${isFavorited ? "scale-110 text-red-500" : "scale-100 text-gray-600"} transition-transform duration-150 ease-out`}
        fill={isFavorited ? "currentColor" : "none"}
        aria-hidden="true"
      />
    </button>
  );
}
