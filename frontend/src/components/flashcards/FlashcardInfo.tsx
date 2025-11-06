import { WalletCards, Ellipsis, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, useParams } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { deleteFlashcardSet } from "@/services/flashcardApi";
import { toast } from "react-hot-toast";

const FlashcardInfo = ({
  title,
  description,
  creator,
  terms,
  id,
  onClick,
  onDelete
}: {
  title: string;
  description: string;
  creator: string;
  terms: { id: number; term: string; definition: string }[];
  id: string;
  onClick: () => void;
  onDelete: () => void;
}) => {
  const router = useRouter();
  const { groupId } = useParams();
  return (
  <div
    onClick={onClick}
    className="relative rounded-xl p-6 bg-gray-50 flex flex-col gap-2 cursor-pointer hover:bg-gray-100"
  >
    {/* Static 3-dot menu in top-right, keeping your bubble styling */}
    <div className="absolute top-4 right-4 rounded-xl bg-gray-200 p-2 flex text-gray-500 z-10">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Ellipsis className="w-4 h-4 cursor-pointer" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="my-2">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/groups/${groupId}/flashcards/${id}/edit`);
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async (e) => {
              e.stopPropagation();
              if (confirm("Are you sure you want to delete this flashcard set? This will delete all associated flashcards.")) {
                try {
                  await deleteFlashcardSet(groupId as string, id);
                  onDelete();
                } catch (error: any) {
                  if (error?.response?.status === 403) {
                    toast.error("Failed to delete: you are not the owner of this set.");
                  } else {
                    toast.error("Failed to delete set.");
                  }
                }
              }
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div className="flex items-center overflow-auto max-h-40 break-words px-2">
      <h1 className="text-lg font-semibold">{title}</h1>
    </div>
    {description.length > 124 ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <p className="text-gray-600 text-sm line-clamp-3 cursor-pointer">
          {description}
        </p>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs p-3 whitespace-pre-line break-words">
        <span className="whitespace-pre-line">{description}</span>
      </TooltipContent>
    </Tooltip>
    ) : (
      <p className="text-gray-600 text-sm">{description}</p>
    )}

    <div className="flex items-center gap-2">
      <p className="text-gray-500 text-xs rounded-xl bg-gray-200 w-fit px-4 py-2 flex items-center gap-2 my-2">
        <WalletCards className="w-4 h-4" />
        {terms.length} Terms
      </p>
      <p className="text-gray-500 text-xs rounded-xl bg-gray-200 w-fit px-4 py-2 flex items-center gap-2 my-2">
        <User className="w-4 h-4" />
        {creator}
      </p>
    </div>
  </div>
);
}

export default FlashcardInfo;
