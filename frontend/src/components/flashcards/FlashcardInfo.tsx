import { WalletCards, Ellipsis, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FavoriteButton from "@/components/ui/FavoriteButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter, useParams } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deleteFlashcardSet } from "@/services/flashcardApi";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const FlashcardInfo = ({
  title,
  description,
  creator,
  terms,
  id,
  onClick,
  onDelete,
  favorited,
  onToggleFavorite,
}: {
  title: string;
  description: string;
  creator: string;
  terms: { id: number; term: string; definition: string }[];
  id: string;
  onClick: () => void;
  onDelete: () => void;
  favorited?: boolean;
  onToggleFavorite?: (next: boolean) => Promise<void> | void;
}) => {
  const router = useRouter();
  const { groupId } = useParams();

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isFavorited = Boolean(favorited);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteFlashcardSet(groupId as string, id);
      onDelete();
      router.push(`/groups/${groupId}/flashcards`);
      toast.success("Flashcard set deleted.");
      setShowDeleteDialog(false);
    } catch (error: any) {
      if (error?.response?.status === 403) {
        toast.error("Failed to delete: you are not the owner of this set.");
      } else {
        toast.error("Failed to delete set.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      onClick={onClick}
      className="relative rounded-xl p-6 flex flex-col gap-2 cursor-pointer border-foreground/10 bg-primary/30 hover:bg-primary/40"
    >
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div className="flex items-center">
          <FavoriteButton
            isFavorited={isFavorited}
            onClick={async (e) => {
              e.stopPropagation();
              const next = !isFavorited;
              if (onToggleFavorite) await onToggleFavorite(next);
            }}
          />
        </div>

        <div className="rounded-xl bg-primary/50 p-2 flex text-foreground/40 z-10">
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
                  setShowDeleteDialog(true);
                }}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete flashcard set</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete this
              flashcard set? All associated flashcards will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center overflow-auto max-h-40 break-words px-2">
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      {description.length > 124 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-accent-foreground text-sm line-clamp-3 cursor-pointer ml-2">
              {description}
            </p>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-3 whitespace-pre-line break-words">
            <span className="whitespace-pre-line">{description}</span>
          </TooltipContent>
        </Tooltip>
      ) : (
        <p className="text-accent-foreground text-sm ml-2">{description}</p>
      )}

      <div className="flex items-center gap-2">
        <p className="text-xs rounded-xl bg-primary/50 w-fit px-4 py-2 flex items-center gap-2 my-2">
          <WalletCards className="w-4 h-4" />
          {terms.length} Terms
        </p>
        <p className="text-xs rounded-xl bg-primary/50 w-fit px-4 py-2 flex items-center gap-2 my-2">
          <User className="w-4 h-4" />
          {creator}
        </p>
      </div>
    </div>
  );
};

export default FlashcardInfo;
