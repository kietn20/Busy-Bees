"use client";

import CreateCard from "@/components/flashcards/CreateCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { createFlashcardSet } from "@/services/flashcardApi";
import { toast } from "react-hot-toast";

export default function CreateFlashcard() {

  type Flashcard = {
    term: string;
    definition: string;
  };

  type Card = {
    id: number;
    term: string;
    definition: string;
  };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [hasTitleError, setHasTitleError] = useState(false);
  const router = useRouter();
  const { groupId } = useParams();

  const TOAST_ERR_ID = "create-flashcard-error";

  const searchParams = useSearchParams();
  const generated = searchParams.get("generated");
  const generatedFlashcards: Flashcard[] = generated ? JSON.parse(generated) : [];
  const [cards, setCards] = useState<Card[]>(
    generatedFlashcards.length > 0
    ? generatedFlashcards.map((card, idx) => ({
        id: idx + 1,
        term: card.term,
        definition: card.definition,
      }))
    : [{ id: 1, term: "", definition: "" }]
  );

  const handleDeleteCard = (id: number) => {
    setCards(cards.filter((card) => card.id !== id));
  };

  const addNewCard = () => {
    const newId =
      cards.length > 0 ? Math.max(...cards.map((c) => c.id)) + 1 : 1;
    setCards([...cards, { id: newId, term: "", definition: "" }]);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Flashcard name required.", { id: TOAST_ERR_ID });
      setHasTitleError(true);
      return;
    }
    setHasTitleError(false);

    try {
      // prepare flashcards array for backend (remove id/number, keep term/definition)
      // only allows non-empty term and definition
      const flashcards = cards
        .filter((card) => card.term.trim() && card.definition.trim())
        .map(({ term, definition }) => ({ term, definition }));

      // Call the API
      await createFlashcardSet(
        groupId as string,
        title,
        description,
        flashcards
      );

      // Redirect to the flashcard list page
      router.push(`/groups/${groupId}/flashcards`);
      toast.success("Flashcard set created.");
    } catch (error: any) {
      toast.error("Failed to create flashcard set.", { id: TOAST_ERR_ID });
      console.error("Failed to create flashcard set:", error);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between my-4">
        <h1 className="text-2xl font-bold mb-4">Create Flashcard</h1>
        <Button onClick={handleSave} className="rounded-xl cursor-pointer">
          Create
        </Button>
      </div>

      <div className="w-full bg-gray-50 p-6 rounded-xl flex gap-4 my-4">
        <div className="w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Flashcard Name
          </label>

          <Input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setHasTitleError(false);
            }}
            maxLength={30}
            className={`bg-white rounded-xl ${
              hasTitleError ? "border-red-500 ring-2 ring-red-200" : ""
            }`}
            placeholder="Enter title"
          />
          <div className="text-xs text-gray-400 text-right">
            {title.length}/30
          </div>
        </div>
        <div className="w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Flashcard Description
          </label>
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-white rounded-xl"
            placeholder="Enter description"
            maxLength={150}
          />
          <div className="text-xs text-gray-400 text-right">
            {description.length}/150
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {cards.map((card, idx) => (
          <CreateCard
            key={card.id}
            number={idx + 1}
            term={card.term}
            definition={card.definition}
            onTermChange={(val) => {
              const updated = [...cards];
              updated[idx].term = val;
              setCards(updated);
            }}
            onDefinitionChange={(val) => {
              const updated = [...cards];
              updated[idx].definition = val;
              setCards(updated);
            }}
            onDelete={() => handleDeleteCard(card.id)}
          />
        ))}
      </div>

      <Button
        onClick={addNewCard}
        variant="outline"
        className="p-4 rounded-xl cursor-pointer flex items-center justify-center gap-2 text-sm w-full my-4"
      >
        <Plus className="w-4 h-4" />
        Add Card
      </Button>
    </div>
  );
}
