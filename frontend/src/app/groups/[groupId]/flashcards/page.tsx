"use client";
import FlashcardInfo from "@/components/flashcards/FlashcardInfo";
//import flashcardsData from "@/lib/flashcardsdata";
import { Plus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { getFlashcardSetsByGroup, FlashcardSet } from "@/services/flashcardApi";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { checkFavorites, addFavorite, removeFavorite } from "@/services/accountApi";
import { addRecentlyViewed } from "@/services/recentlyviewedApi";

import SearchFilterBar from "@/components/SearchFilter";

type SortKey = "recent" | "oldest" | "title-asc" | "title-desc";

export default function FlashcardsList() {
  const router = useRouter();
  const { groupId } = useParams();
  const [flashcardsData, setFlashcardsData] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortKey>("recent");

  // Handler for clicking a flashcard set
  const handleFlashcardSetClick = async (flashcardId: string) => {
    // Add to recently viewed
    await addRecentlyViewed({
      courseId: groupId as string,
      kind: "flashcardSet",
      itemId: flashcardId,
    });
    // Navigate to the flashcard set page
    router.push(`/groups/${groupId}/flashcards/${flashcardId}`);
  };

  useEffect(() => {
    if (!groupId) return;

    const fetchSets = async () => {
      setLoading(true);
      setNotFound(false); // reset on new fetch
      try {
        const response = await getFlashcardSetsByGroup(groupId as string);

        setFlashcardsData(response.flashcardSets);
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          setNotFound(true);
        } else {
          console.error("Failed to fetch flashcard sets:", error);
          toast.error("Failed to load flashcard sets.");
        }
      }
      setLoading(false);
    };
    fetchSets();
  }, [groupId]);

  // Favorites map for flashcard sets
  const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadFavorites = async () => {
      if (!groupId || flashcardsData.length === 0) return;
      try {
        const itemIds = flashcardsData.map((f) => f._id);
        const map = await checkFavorites(groupId as string, "flashcardSet", itemIds);
        setFavoritesMap(map);
        // Debug: log the itemIds and map for troubleshooting persisted favorite rendering
        console.debug("checkFavorites (flashcards) - itemIds:", itemIds, "map:", map);
      } catch (err) {
        // ignore if unauthenticated
      }
    };
    loadFavorites();
  }, [groupId, flashcardsData]);

  const toggleFavorite = async (setId: string, next: boolean) => {
    try {
      if (next) await addFavorite(groupId as string, "flashcardSet", setId);
      else await removeFavorite(groupId as string, "flashcardSet", setId);
      setFavoritesMap((m) => ({ ...m, [setId]: next }));
      if (next) toast.success("Flashcard Set Saved to Favorites.");
      else toast.success("Flashcard Set removed from favorites.");
    } catch (err) {
      console.error("toggleFavorite (flashcard) error:", err?.response ?? err);
      const msg = err?.response?.data?.message || err?.message || "Failed to update favorites.";
      if (err?.response?.status === 401) {
        toast.error("You must be signed in to save favorites.");
      } else {
        toast.error(msg);
      }
      throw err;
    }
  };

  const filteredSets = useMemo(() => {
    let result = [...flashcardsData];

    // Search only by setName
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((set) => set.setName.toLowerCase().includes(q));
    }

    // Sort
    result.sort((a, b) => {
      const anyA = a as any;
      const anyB = b as any;

      const aDate = new Date(anyA.updatedAt || anyA.createdAt || 0).getTime();
      const bDate = new Date(anyB.updatedAt || anyB.createdAt || 0).getTime();

      switch (sortOption) {
        case "oldest":
          return aDate - bDate; // oldest first
        case "title-asc":
          return a.setName.localeCompare(b.setName);
        case "title-desc":
          return b.setName.localeCompare(a.setName);
        case "recent":
        default:
          return bDate - aDate; // newest first
      }
    });

    return result;
  }, [flashcardsData, searchQuery, sortOption]);

  const hasSets = flashcardsData.length > 0;
  const hasFilteredSets = filteredSets.length > 0;

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold mb-4">All Flashcards</h1>
        <button
          className="p-2 rounded-xl border-foreground bg-primary hover:bg-primary/70 cursor-pointer"
          onClick={() => router.push(`/groups/${groupId}/flashcards/create`)}
        >
          <Plus className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Search + sort bar (horizontal layout) */}
      <div className="mb-6">
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
          placeholder="Search flashcard sets..."
          layout="horizontal"
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : notFound ? (
        <div className="text-gray-500 text-center py-8">
          No flashcard sets found for this group.
        </div>
      ) : !hasSets ? (
        <div className="text-gray-500 text-center py-8">
          No flashcard sets yet. Create one!
        </div>
      ) : !hasFilteredSets ? (
        <div className="text-gray-500 text-center py-8">
          No flashcard sets match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSets.map((flashcard) => (
            <FlashcardInfo
              key={flashcard._id}
              id={flashcard._id}
              title={flashcard.setName}
              description={flashcard.description || ""}
              creator={
                flashcard.userId
                  ? `${flashcard.userId.firstName} ${flashcard.userId.lastName}`
                  : "Deleted User"
              }
              terms={Array.from(
                { length: flashcard.flashcards.length },
                (_, i) => ({ id: i, term: "", definition: "" })
              )}
              onClick={() => handleFlashcardSetClick(flashcard._id)}
              onDelete={() =>
                setFlashcardsData((prev) =>
                  prev.filter((set) => set._id !== flashcard._id)
                )
              }
              favorited={Boolean(favoritesMap[flashcard._id])}
              onToggleFavorite={(next) => toggleFavorite(flashcard._id, next)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
