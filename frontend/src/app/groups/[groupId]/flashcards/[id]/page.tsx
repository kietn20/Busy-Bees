"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis } from "lucide-react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { getFlashcardSetsById } from "@/services/flashcardApi";
import type { Flashcard } from "@/services/flashcardApi";

export default function FlashcardPage() {
  const { groupId, id } = useParams();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardSet, setFlashcardSet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // fetch flashcard set data
  useEffect(() => {
  async function fetchData() {
    setLoading(true);
    try {
      const data = await getFlashcardSetsById(groupId as string, id as string);
      setFlashcardSet(data);
    } catch (error) {
      // handle error (optional)
    }
    setLoading(false);
  }
  fetchData();
}, [groupId, id]);

  const hasTerms = flashcardSet?.flashcards && flashcardSet.flashcards.length > 0;
  const currentTerm = hasTerms ? flashcardSet.flashcards[currentIndex] : null;
  const totalTerms = flashcardSet?.flashcards.length || 0;

  const nextCard = () => {
    if (currentIndex < totalTerms - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  if (loading) return <div>Loading...</div>;
  if (!flashcardSet) return <div>Flashcard set not found.</div>;

  return (
    <div className="container mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold ">{flashcardSet?.setName || ""}</h1>
        <div className="rounded-xl bg-gray-200 p-2 flex text-gray-500 ">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis className="w-4 h-4 cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="my-2">
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/groups/${groupId}/flashcards/${id}/edit`)
                }
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mb-8">
        {hasTerms ? (
        <>
        <div
          className="relative w-full h-[300px]"
          style={{ perspective: "1200px" }}
        >
          <div
            onClick={flipCard}
            className="relative w-full h-full cursor-pointer transition-transform duration-850 ease-in-out"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateX(180deg)" : "rotateX(0deg)",
            }}
          >
            <div
              className="absolute inset-0 w-full h-full bg-white border-2 border-gray-200 rounded-2xl p-12 flex items-center justify-center hover:shadow-lg transition-shadow"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="text-center overflow-auto max-h-40 break-words px-2">
                <h2 className="text-2xl text-gray-800">{currentTerm.term}</h2>
              </div>
            </div>

            {/* Back of card */}
            <div
              className="absolute inset-0 w-full h-full border-2 rounded-2xl p-12 flex items-center justify-center hover:shadow-lg transition-shadow"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateX(180deg)",
              }}
            >
              <div className="text-center overflow-auto max-h-40 break-words px-2">
                <h2 className="text-2xl text-gray-800">
                  {currentTerm.definition}
                </h2>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={prevCard}
            disabled={currentIndex === 0}
            className="rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="text-gray-600 font-medium">
            {currentIndex + 1} / {totalTerms}
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={nextCard}
            disabled={currentIndex === totalTerms - 1}
            className="rounded-full"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        </> 
        ) : (
        <div className="text-gray-500 text-center py-12">
          No flashcards in this set yet.
        </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {totalTerms} Terms
        </h3>

        <div className="space-y-4">
          {flashcardSet?.flashcards.map((term: Flashcard, index: number) => (
            <div
              key={term._id}
              className="bg-white border rounded-xl p-6 cursor-pointer border-gray-200 hover:border-gray-300"
              onClick={() => {
                setCurrentIndex(index);
                setIsFlipped(false);
              }}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                  {index + 1}
                </div>
                <div className="flex w-full items-center overflow-auto max-h-40 break-words px-2">
                  <div className="w-1/3">
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {term.term}
                    </h4>
                  </div>
                  <div className="w-2/3 border-l border-gray-200 pl-4">
                    <p className="text-gray-600 text-sm">{term.definition}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
