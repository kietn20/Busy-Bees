"use client";
import FlashcardInfo from "@/components/flashcards/FlashcardInfo";
import flashcardsData from "@/lib/flashcardsdata";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
export default function FlashcardsList() {
  const router = useRouter();
  return (
    <div className="container mx-auto py-12">
      <div className="flex items-center justify-between mb-4 items-centers">
        <h1 className="text-2xl font-bold mb-4">All Flashcards</h1>
        <button
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 cursor-pointer"
          onClick={() => router.push("/flashcards/create")}
        >
          <Plus className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flashcardsData.map((flashcard) => (
          <FlashcardInfo
            key={flashcard.id}
            title={flashcard.title}
            description={flashcard.description}
            creator={flashcard.creator}
            terms={flashcard.terms}
          />
        ))}
      </div>
    </div>
  );
}
