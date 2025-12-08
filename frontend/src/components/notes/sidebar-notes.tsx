import { Note } from "@/services/noteApi";
import NoteCard from "./NoteCard";

interface SidebarNotesProps {
  notes: Note[];
  selectedNoteId: string | null;
  onNoteSelect: (noteId: string) => void;
  favoritesMap?: Record<string, boolean>;
  onToggleFavorite?: (noteId: string, next: boolean) => Promise<void> | void;
}

const SidebarNotes = ({
  notes,
  selectedNoteId,
  onNoteSelect,
  favoritesMap = {},
  onToggleFavorite,
}: SidebarNotesProps) => {
  return (
    <div className="flex flex-col h-full">
      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            No notes available
          </div>
        ) : (
          <div className="flex flex-col gap-2 my-2">
            {notes.map((note) => (
              <NoteCard
                key={note._id}
                title={note.title}
                content={note.content}
                date={note.createdAt}
                creator={note.userId.firstName + " " + note.userId.lastName}
                onClick={() => onNoteSelect(note._id)}
                isSelected={selectedNoteId === note._id}
                favorited={Boolean(favoritesMap[note._id])}
                onToggleFavorite={(next) =>
                  onToggleFavorite && onToggleFavorite(note._id, next)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarNotes;
