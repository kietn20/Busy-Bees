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

const CreateCard = ({
  number,
  onDelete,
  term = "",
  definition = "",
}: {
  number: number;
  onDelete?: () => void;
  term?: string;
  definition?: string;
}) => {
  const [termValue, setTermValue] = useState(term);
  const [definitionValue, setDefinitionValue] = useState(definition);

  return (
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
                  value={termValue}
                  onChange={(e) => setTermValue(e.target.value)}
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Definition
                </label>
                <Textarea
                  placeholder="Enter definition"
                  className="min-h-[100px] bg-white rounded-xl"
                  value={definitionValue}
                  onChange={(e) => setDefinitionValue(e.target.value)}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
export default CreateCard;
