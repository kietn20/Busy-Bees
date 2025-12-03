import { PenLine, User } from "lucide-react";
import FavoriteButton from "@/components/ui/FavoriteButton";

const generatePreview = (content: string): string => {
  try {
    // Blocknote content is stored as a JSON string of Block objects
    const blocks = JSON.parse(content);

    // Filter for paragraph blocks and join their text content
    const text = blocks
      .filter((block: any) => block.type === "paragraph" && block.content)
      .map((block: any) =>
        block.content.map((inline: any) => inline.text).join("")
      )
      .join(" ");

    // If there's no text content, return a placeholder
    return text || "No preview available.";
  } catch (e) {
    // If the content is not valid JSON, it might be plain text. Return it directly.
    return content;
  }
};

const NoteCard = ({
  title,
  content,
  date,
  creator,
  onClick,
  isSelected = false,
  favorited,
  onToggleFavorite,
}: {
  title: string;
  content: string;
  date: string;
  creator: string;
  onClick: () => void;
  isSelected?: boolean;
  favorited?: boolean;
  onToggleFavorite?: (newState: boolean) => Promise<void> | void;
}) => {
  const contentPreview = generatePreview(content);
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const isFavorited = Boolean(favorited);

  return (
    <div
      className={`rounded-xl p-4 mx-2 flex flex-col gap-2 cursor-pointer hover:bg-primary/30 transition-all ${
        isSelected
          ? "border-2 border-foreground/40 bg-primary/30"
          : "border-1 border-foreground/10 bg-accent/30"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{title}</h1>
        <FavoriteButton
          isFavorited={isFavorited}
          onClick={async (e) => {
            e.stopPropagation();
            const next = !isFavorited;
            if (onToggleFavorite) await onToggleFavorite(next);
          }}
        />
      </div>
      <p className="text-accent-foreground text-sm line-clamp-3">
        {contentPreview.length > 150
          ? `${contentPreview.substring(0, 150)}...`
          : contentPreview}
      </p>
      <div className="flex items-center gap-2">
        <p
          className={`text-foreground text-xs rounded-xl w-fit px-4 py-2 flex items-center gap-2 my-2 ${
            isSelected ? "bg-primary/50" : "bg-accent/60"
          }`}
        >
          <PenLine className="w-4 h-4" />
          {formattedDate}
        </p>
        <p
          className={`text-foreground text-xs rounded-xl w-fit px-4 py-2 flex items-center gap-2 my-2 ${
            isSelected ? "bg-primary/50" : "bg-accent/60"
          }`}
        >
          <User className="w-4 h-4" />
          {creator}
        </p>
      </div>
    </div>
  );
};

export default NoteCard;
