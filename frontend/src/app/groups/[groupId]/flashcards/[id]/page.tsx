"use client";

import { useState } from "react";
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

// Mock data - replace with actual data fetching
const flashcardData = {
  title: "Use Cases",
  terms: [
    {
      id: 1,
      term: "Use Case",
      definition:
        "a description of how a user interacts with a product, software, or system to achieve a goal",
    },
    {
      id: 2,
      term: "Flow of Events",
      definition:
        "the sequence of actions the user/system takes to complete the process",
    },
    // Add more terms as needed
  ],
};

export default function FlashcardPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentTerm = flashcardData.terms[currentIndex];
  const totalTerms = flashcardData.terms.length;

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

  return (
    <div className="container mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold ">{flashcardData.title}</h1>
        <div className="rounded-xl bg-gray-200 p-2 flex text-gray-500 ">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis className="w-4 h-4 cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="my-2">
              <DropdownMenuItem
                onClick={() => router.push("/flashcards/[id]/edit")}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mb-8">
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
              <div className="text-center">
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
              <div className="text-center">
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
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {totalTerms} Terms
        </h3>

        <div className="space-y-4">
          {flashcardData.terms.map((term, index) => (
            <div
              key={term.id}
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
                <div className="flex w-full items-center">
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
