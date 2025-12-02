"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, useParams } from "next/navigation";
import { getFlashcardSetsById } from "@/services/flashcardApi";
import { FlashcardSet, Flashcard } from "@/services/flashcardApi";
import toast from "react-hot-toast";

export default function FlashcardPage() {
  const { groupId, id: setId } = useParams();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [loading, setLoading] = useState(true);

  // fetch flashcard set data
  useEffect(() => {
    async function fetchData() {
      if (!groupId || !setId) return;
      setLoading(true);
      try {
        const data = await getFlashcardSetsById(
          groupId as string,
          setId as string
        );
        setFlashcardSet(data);
      } catch (error) {
        toast.error("Failed to load flashcard set.");
        console.error("Failed to load flashcard set:", error);
      }
      setLoading(false);
    }
    fetchData();
  }, [groupId, setId]);

  const hasTerms =
    flashcardSet?.flashcards && flashcardSet.flashcards.length > 0;
  const currentCard: Flashcard | null =
    hasTerms && typeof flashcardSet.flashcards[currentIndex] === "object"
      ? (flashcardSet.flashcards[currentIndex] as Flashcard)
      : null;

  const totalTerms = flashcardSet?.flashcards.length || 0;

  const goToNext = useCallback(() => {
    if (currentIndex < totalTerms - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, totalTerms]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const flipCard = () => setIsFlipped((prev) => !prev);

  // KEYBOARD NAVIGATION
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "ArrowRight") goToNext();
      if (event.code === "ArrowLeft") goToPrev();
      if (event.code === "Space") {
        event.preventDefault();
        flipCard();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  if (loading)
    return <div className="text-center py-12">Loading Study Mode...</div>;
  if (!flashcardSet)
    return <div className="text-center py-12">Flashcard set not found.</div>;

  return (
    <div className="container mx-auto p-8 justify-center">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold ">{flashcardSet.setName}</h1>
        <div className="rounded-xl bg-gray-200 p-2 flex text-gray-500 mr-6">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis className="w-4 h-4 cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="my-2">
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/groups/${groupId}/flashcards/${setId}/edit`)
                }
                className="cursor-pointer"
              >
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-28 flex justify-center flex-col items-center justify-center">
        {hasTerms && currentCard ? (
          <div className="w-full max-w-2xl">
            <div
              className="relative w-full h-[400px]"
              style={{ perspective: "1200px" }}
            >
              <div
                onClick={flipCard}
                className="relative w-full h-full cursor-pointer transition-transform duration-500 ease-in-out"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateX(180deg)" : "rotateX(0deg)",
                }}
              >
                <div
                  className="absolute inset-0 w-full h-full bg-white border-2 border-gray-200 rounded-2xl p-12 flex items-center justify-center hover:shadow-lg transition-shadow"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="text-center">
                    <h2 className="text-3xl text-gray-800">
                      {currentCard.term}
                    </h2>
                  </div>
                </div>

                <div
                  className="absolute inset-0 w-full h-full bg-white border-2 rounded-2xl p-12 flex items-center justify-center hover:shadow-lg transition-shadow"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateX(180deg)",
                  }}
                >
                  <div className="text-center">
                    <h2 className="text-3xl text-gray-800">
                      {currentCard.definition}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrev}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-gray-600 font-medium">
                {currentIndex + 1} / {totalTerms}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                disabled={currentIndex === totalTerms - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-center text-gray-400 text-sm mt-4">
              Use ← → arrow keys to navigate & Press Space to flip
            </p>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            This flashcard set has no terms yet. Add some to start studying!
          </div>
        )}
      </div>

      {/* Terms List Section */}
      {hasTerms && (
        <div className="container mx-auto px-8 pb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            {totalTerms} Terms
          </h2>
          <div className="space-y-4">
            {(flashcardSet.flashcards as Flashcard[]).map(
              (card: Flashcard, index: number) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                      {index + 1}
                    </div>
                    <div className="flex w-full">
                      <div className="flex items-center w-1/3 border-r border-gray-300">
                        <h3 className="font-medium text-gray-900">
                          {card.term}
                        </h3>
                      </div>
                      <div className="pl-6 md:pl-6 flex items-center w-2/3">
                        <p className="text-gray-600">{card.definition}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
