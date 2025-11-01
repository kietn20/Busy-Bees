"use client";

import CreateCard from "@/components/flashcards/CreateCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  editFlashcardSet,
  editFlashcard,
  createFlashcard,
  getFlashcardSetsById,
  getFlashcardById,
  deleteFlashcard,
  Flashcard,
  FlashcardSet,
} from "@/services/flashcardApi";
import { useParams, useRouter } from "next/navigation";

export default function EditFlashcard() {
  const params = useParams();
  const groupId = params.groupId as string;
  const setId = params.id as string;
  const router = useRouter();

  const [setName, setSetName] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [originalCards, setOriginalCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  const isValidMongoId = (id: string) => /^[a-f\d]{24}$/i.test(id);

  // Load initial data
  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const set: FlashcardSet = await getFlashcardSetsById(groupId, setId);
      setSetName(set.setName);
      setDescription(set.description || "");

      // Always treat as array of IDs
      let flashcardObjs: Flashcard[] = [];
      if (Array.isArray(set.flashcards) && set.flashcards.length > 0) {
        const fetched = await Promise.all(
          set.flashcards.map(async (item) => {
            if (typeof item === "string" && isValidMongoId(item)) {
              try {
                return await getFlashcardById(groupId, item);
              } catch {
                return null;
              }
            } else if (typeof item === "object" && item !== null && "_id" in item) {
              // Already a flashcard object
              return item as Flashcard;
            }
            return null;
          })
        );
        flashcardObjs = fetched.filter((c): c is Flashcard => !!c);
      }

      setCards(flashcardObjs);
      setOriginalCards(flashcardObjs);
    } catch (error) {
      alert("Failed to load flashcard set.");
    }
    setLoading(false);
  };
  fetchData();
}, [groupId, setId]);

  // Add new card
  const addNewCard = () => {
    setCards((prev) => [
      ...prev,
      {
        _id: Date.now().toString(), // temp id for new cards
        term: "",
        definition: "",
      },
    ]);
  };

  // Delete card
  const handleDeleteCard = async (id: string) => {
    if (isValidMongoId(id)) {
      await deleteFlashcard(groupId, id);
    }
    setCards(prev => prev.filter(card => card._id !== id));
  };

  // Check if a card has changed
  const isCardChanged = (card: Flashcard) => {
    const original = originalCards.find((c) => c._id === card._id);
    return (
      !original ||
      original.term !== card.term ||
      original.definition !== card.definition
    );
  };

  const handleSave = async () => {
    // Check for empty cards
    const hasEmpty = cards.some(card => !card.term.trim() || !card.definition.trim());
    if (hasEmpty) {
      alert("Failed to save. Remove empty flashcards.");
      return;
    }
    try {
      console.log("setId:", setId, typeof setId);
      // 1. Create new cards and collect their real IDs
      const newCards = cards.filter(card => !isValidMongoId(card._id));
      const createdCards = (await Promise.all(
          newCards.map(card =>
            createFlashcard(groupId, setId, card.term, card.definition)
          )
        )
      ).filter((c): c is Flashcard => !!c);
      console.log("createdCards:", createdCards);
      // 2. Update changed cards
      await Promise.all(
        cards
          .filter(card => isValidMongoId(card._id) && isCardChanged(card))
          .map(card =>
            editFlashcard(groupId, card._id, card.term, card.definition)
          )
      );

      // 3. Build the full list of IDs (existing + new)
      const allIds = [
        ...cards
          .filter(card => isValidMongoId(card._id))
          .map(card => card._id),
        ...createdCards.map(card => card._id)
      ];

      // 4. Update the set with the new list of IDs
      await editFlashcardSet(
        groupId,
        setId,
        setName,
        description,
        allIds
      );

      router.push(`/groups/${groupId}/flashcards/${setId}`);
      alert("Flashcard set and cards updated!");
    } catch (error: any) {
      console.error("Error saving flashcard set:", error?.response?.data || error);
      alert("Failed to save changes.");
    }
};

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-12">
      <div className="flex justify-between my-4">
        <h1 className="text-2xl font-bold mb-4">Edit Flashcard</h1>
        <Button onClick={handleSave} className="rounded-xl cursor-pointer">
          Save Changes
        </Button>
      </div>

      <div className="w-full bg-gray-50 p-6 rounded-xl flex gap-4 my-4">
        <div className="w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Flashcard Name
          </label>
          <Input
            type="text"
            value={setName}
            onChange={(e) => setSetName(e.target.value)}
            className="bg-white rounded-xl"
            placeholder="Enter title"
          />
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
          />
        </div>
      </div>

      <div className="space-y-4">
        {cards.map((card, idx) => (
          <CreateCard
            key={card._id}
            number={idx + 1}
            term={card.term}
            definition={card.definition}
            onTermChange={val => {
              setCards(prev =>
                prev.map(c =>
                  c._id === card._id ? { ...c, term: val } : c
                )
              );
            }}
            onDefinitionChange={val => {
              setCards(prev =>
                prev.map(c =>
                  c._id === card._id ? { ...c, definition: val } : c
                )
              );
            }}
            onDelete={() => handleDeleteCard(card._id)}
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