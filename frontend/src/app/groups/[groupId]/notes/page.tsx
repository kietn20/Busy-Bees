"use client";
import { Plus } from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import CreateNoteModal from "@/components/notes/CreateNoteModal";
import { getNotesByGroup, getNoteById } from "@/services/noteApi";
import { Note } from "@/services/noteApi";
import SidebarNotes from "@/components/notes/sidebar-notes";
import Editor from "@/components/notes/editor";
import { Block } from "@blocknote/core";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { addRecentlyViewed } from "@/services/recentlyviewedApi";
import SearchFilterBar from "@/components/SearchFilter";
import { checkFavorites, addFavorite, removeFavorite } from "@/services/accountApi";

type SortKey = "recent" | "oldest" | "title-asc" | "title-desc";

export default function NotesList() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const groupId = params.groupId as string;
  const selectedNoteId = searchParams.get("noteId");

  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortKey>("recent");

  const fetchSelectedNote = useCallback(
    async (noteId: string) => {
      setIsNoteLoading(true);
      try {
        const response = await getNoteById(groupId, noteId);
        setSelectedNote(response.note);
      } catch (err) {
        console.error("Failed to load selected note:", err);
      } finally {
        setIsNoteLoading(false);
      }
    },
    [groupId]
  );

  const fetchNotes = useCallback(async () => {
    if (!groupId) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await getNotesByGroup(groupId);
      setNotes(response.notes);
    } catch {
      setError("Failed to load notes.");
      toast.error("Failed to load notes.");
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  const handleNoteSelect = useCallback(
    async (noteId: string) => {
      await addRecentlyViewed({ courseId: groupId, kind: "note", itemId: noteId });

      router.push(`/groups/${groupId}/notes?noteId=${noteId}`);
    },
    [router, groupId]
  );

  useEffect(() => {
    fetchNotes();
  }, [groupId, fetchNotes]);
  const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>({});

  // load favorites for sidebar items after notes load
  useEffect(() => {
    const loadFavorites = async () => {
      if (!groupId || notes.length === 0) return;
      try {
        const itemIds = notes.map((n) => n._id);
        const map = await checkFavorites(groupId, "note", itemIds);
        setNotes((prev) => [...prev]); // trigger re-render if needed
        // store map in ref/state: we'll store in local state for SidebarNotes
        setFavoritesMap(map);
        // Debug: log the itemIds and the resulting map so we can inspect them on reload
        console.debug("checkFavorites (notes) - itemIds:", itemIds, "map:", map);
      } catch (err) {
        // ignore if unauthenticated
      }
    };
    loadFavorites();

  }, [groupId, notes]);

  const toggleFavorite = async (noteId: string, next: boolean) => {
    // optimistic update
    setFavoritesMap((m) => ({ ...m, [noteId]: next }));
    try {
      if (next) {
        await addFavorite(groupId, "note", noteId);
        toast.success("Note Saved to Favorites.");
      } else {
        await removeFavorite(groupId, "note", noteId);
        toast.success("Note removed from favorites.");
      }
    } catch (err) {
      console.error("toggleFavorite error:", err?.response ?? err);
      const msg = err?.response?.data?.message || err?.message || "Failed to update favorites.";
      if (err?.response?.status === 401) {
        toast.error("You must be signed in to save favorites.");
      } else {
        toast.error(msg);
      }
      // revert optimistic update
      setFavoritesMap((m) => ({ ...m, [noteId]: !next }));
      throw err;
    }
  };

  useEffect(() => {
    if (selectedNoteId && notes.length > 0) {
      fetchSelectedNote(selectedNoteId);
    }
  }, [selectedNoteId, notes.length, fetchSelectedNote]);

  const filteredNotes = useMemo(() => {
    let result = [...notes];

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((note) =>
        note.title.toLowerCase().includes(q)
      );
    }

    // Sorting logic
    result.sort((a, b) => {
      const aCreated = new Date(a.createdAt).getTime();
      const bCreated = new Date(b.createdAt).getTime();
      const aUpdated = new Date(a.updatedAt || a.createdAt).getTime();
      const bUpdated = new Date(b.updatedAt || b.createdAt).getTime();

      switch (sortOption) {
        case "oldest":
          // Oldest by creation date
          return aCreated - bCreated;
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "recent":
        default:
          // Most recent by last update
          return bUpdated - aUpdated;
      }
    });

    return result;
  }, [notes, searchQuery, sortOption]);

  // Safer parse that treats empty / null / "[]" as "no content"
  const parseContent = (content: string | null | undefined): Block[] | undefined => {
    if (!content) return undefined;

    const trimmed = content.trim();
    if (!trimmed || trimmed === "[]" || trimmed === "{}") {
      return undefined;
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Block[];
      }
      // parsed but not a non-empty array -> treat as no content
      return undefined;
    } catch {
      // Non-JSON plain text: show as a single paragraph block
      return [
        {
          id: "initial-block",
          type: "paragraph",
          props: {
            textColor: "default",
            backgroundColor: "default",
            textAlignment: "left",
          },
          content: [
            {
              type: "text",
              text: trimmed,
              styles: {},
            },
          ],
          children: [],
        },
      ];
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading notes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  const hasNotes = notes.length > 0;
  const hasFilteredNotes = filteredNotes.length > 0;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-semibold">All Notes</h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="p-2 rounded-lg bg-white hover:bg-gray-100 border cursor-pointer"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <SearchFilterBar
            query={searchQuery}
            onQueryChange={setSearchQuery}
            sortValue={sortOption}
            onSortChange={(value) => setSortOption(value as SortKey)}
            sortOptions={[
              { value: "recent", label: "Most recent" },
              { value: "oldest", label: "Oldest" },
              { value: "title-asc", label: "Title A–Z" },
              { value: "title-desc", label: "Title Z–A" },
            ]}
            placeholder="Search notes..."
          />
        </div>

        {!hasNotes ? (
          <div className="py-6 text-center text-gray-500">
            No notes yet. Create one!
          </div>
        ) : !hasFilteredNotes ? (
          <div className="py-6 text-center text-gray-500">
            No notes match your search.
          </div>
        ) : (
          <SidebarNotes
              notes={filteredNotes}
              selectedNoteId={selectedNoteId}
              onNoteSelect={handleNoteSelect}
              favoritesMap={favoritesMap}
              onToggleFavorite={toggleFavorite}
            />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {selectedNote ? (
          <>
            <div className="p-4 border-b h-16 flex justify-end">
              <Button
                onClick={() =>
                  router.push(`/groups/${groupId}/notes/${selectedNote._id}`)
                }
                variant="outline"
              >
                View in Fullscreen
              </Button>
            </div>
            {/* Note Header */}
            <div className="p-6 border-b bg-white">
              <h1 className="text-3xl font-bold mb-4">
                {selectedNote.title}
              </h1>
              <div className="w-64">
                <div className="grid grid-cols-2 mb-2">
                  <h4 className="text-gray-500">Created by:</h4>
                  <span>
                    {selectedNote.userId.firstName}{" "}
                    {selectedNote.userId.lastName}
                  </span>
                </div>
                <div className="grid grid-cols-2 mb-2">
                  <h4 className="text-gray-500">Last modified:</h4>
                  <span>
                    {new Date(selectedNote.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Note Content */}
            <div className="flex-1 py-4 bg-white overflow-y-auto overflow-x-hidden">
              {isNoteLoading ? (
                <div className="flex items-center justify-center h-32">
                  Loading note content...
                </div>
              ) : (() => {
                  const blocks = parseContent(selectedNote.content);
                  if (!blocks) {
                    return (
                      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                        This note has no content yet.
                      </div>
                    );
                  }
                  return (
                    <Editor
                      initialContent={blocks}
                      editable={false}
                      onChange={() => {}}
                    />
                  );
                })()}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">
                {notes.length > 0
                  ? "Select a note to view"
                  : "No notes available"}
              </h2>
              {notes.length > 0 && (
                <p className="text-sm">
                  Choose a note from the sidebar to start reading
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <CreateNoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        groupId={groupId}
        onNoteCreated={fetchNotes}
      />
    </div>
  );
}
