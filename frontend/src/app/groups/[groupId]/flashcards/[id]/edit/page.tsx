"use client";

import CreateCard from "@/components/flashcards/CreateCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function EditFlashcard() {
  const [cards, setCards] = useState([
    {
      id: 1,
      number: 1,
      term: "Use Case",
      definition:
        "a description of how a user interacts with a product, software, or system to achieve a goal",
    },
    {
      id: 2,
      number: 2,
      term: "Flow of Events",
      definition:
        "the sequence of actions the user/system takes to complete the process",
    },
  ]);
  const [title, setTitle] = useState("Use Cases");
  const [description, setDescription] = useState(
    "Software engineering flashcard set"
  );

  const handleDeleteCard = (id: number) => {
    setCards(cards.filter((card) => card.id !== id));
  };

  const addNewCard = () => {
    const newId = cards.length > 0 ? Math.max(...cards.map((c) => c.id)) + 1 : 1;
    setCards([
      ...cards,
      {
        id: newId,
        number: cards.length + 1,
        term: "",
        definition: "",
      },
    ]);
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving flashcard set:", { title, description, cards });
  };

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
            term={card.term}
            definition={card.definition}
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
