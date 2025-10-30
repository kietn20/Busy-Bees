"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useState } from "react";

type CreateCardProps = {
  number: number;
  term: string;
  definition: string;
  onTermChange: (val: string) => void;
  onDefinitionChange: (val: string) => void;
  onDelete: () => void;
};

const CreateCard = ({
  number,
  term,
  definition,
  onTermChange,
  onDefinitionChange,
  onDelete,
}: CreateCardProps) => (
  <div className="rounded-xl bg-gray-50  relative px-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-none">
          <div className="flex items-center justify-between">
            <AccordionTrigger className="hover:no-underline text-left font-medium ">
              Flashcard {number}
            </AccordionTrigger>
            <button onClick={onDelete}>
              <X className="w-4 h-4 cursor-pointer" />
            </button>
          </div>
          <AccordionContent className="pt-4">
            <div className="flex gap-4 w-full">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Term
                </label>
                <Textarea
                  placeholder="Enter term"
                  className="min-h-[100px] bg-white rounded-xl"
                  value={term}
                  onChange={(e) => onTermChange(e.target.value)}
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Definition
                </label>
                <Textarea
                  placeholder="Enter definition"
                  className="min-h-[100px] bg-white rounded-xl"
                  value={definition}
                  onChange={(e) => onDefinitionChange(e.target.value)}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
);
export default CreateCard;
