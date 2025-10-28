"use client";

import CreateCard from "@/components/flashcards/CreateCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function CreateFlashcard() {
  const [cards, setCards] = useState([{ id: 1, number: 1 }]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleDeleteCard = (id: number) => {
    setCards(cards.filter((card) => card.id !== id));
  };

  const addNewCard = () => {
    const newId =
      cards.length > 0 ? Math.max(...cards.map((c) => c.id)) + 1 : 1;
    setCards([...cards, { id: newId, number: cards.length + 1 }]);
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving flashcard set:", { title, description, cards });
  };

  return (
    <div className="container mx-auto py-12">
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
            onChange={(e) => setTitle(e.target.value)}
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
        {cards.map((card) => (
          <CreateCard
            key={card.id}
            number={card.number}
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
