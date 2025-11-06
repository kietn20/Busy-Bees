"use client";
import FlashcardInfo from "@/components/flashcards/FlashcardInfo";
//import flashcardsData from "@/lib/flashcardsdata";
import { Plus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { getFlashcardSetsByGroup, FlashcardSet } from "@/services/flashcardApi";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function FlashcardsList() {
  const router = useRouter();
  const { groupId } = useParams();
  const [flashcardsData, setFlashcardsData] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false); 
  
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

  return (
    <div className="container mx-auto py-12">
      <div className="flex items-center justify-between mb-4 items-centers">
        <h1 className="text-2xl font-bold mb-4">All Flashcards</h1>
        <button
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 cursor-pointer"
          onClick={() => router.push(`/groups/${groupId}/flashcards/create`)}
        >
          <Plus className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : flashcardsData.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No flashcard sets found for this group.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcardsData.map((flashcard) => (
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
              onClick={() =>
                router.push(`/groups/${groupId}/flashcards/${flashcard._id}`)
              }
              onDelete={() => setFlashcardsData(prev => prev.filter(set => set._id !== flashcard._id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}