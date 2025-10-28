import { WalletCards, Ellipsis, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, useParams } from "next/navigation";
const FlashcardInfo = ({
  title,
  description,
  creator,
  terms,
  id,
  onClick,
}: {
  title: string;
  description: string;
  creator: string;
  terms: { id: number; term: string; definition: string }[];
  id: string;
  onClick: () => void;
}) => {
  const router = useRouter();
  const { groupId } = useParams();
  return (
    <div
      onClick={onClick}
      className="rounded-xl p-6 bg-gray-50 flex flex-col gap-2 cursor-pointer hover:bg-gray-100"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="rounded-xl bg-gray-200 p-2 flex text-gray-500 ">
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
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Add delete functionality
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <p className="text-gray-600 text-sm line-clamp-3">{description}</p>
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
};

export default FlashcardInfo;
