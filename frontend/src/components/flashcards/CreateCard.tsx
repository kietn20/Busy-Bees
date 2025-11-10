"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
}: CreateCardProps) => {
  return (
    <div className="rounded-xl bg-gray-50  relative px-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-none">
          <div className="flex items-center justify-between">
            <AccordionTrigger className="hover:no-underline text-left font-medium ">
              Flashcard {number}
            </AccordionTrigger>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button>
                  <X className="w-4 h-4 cursor-pointer" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete flashcard?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <button className="btn btn-outline">Cancel</button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <button
                      className="btn btn-destructive"
                      onClick={onDelete}
                    >
                      Delete
                    </button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <AccordionContent className="pt-4">
            <div className="flex gap-4 w-full">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Term
                </label>
                <Textarea
                  placeholder="Enter term"
                  className="min-h-[100px] max-h-40 overflow-auto bg-white rounded-xl w-full break-words"
                  value={term}
                  onChange={(e) => onTermChange(e.target.value)}
                  maxLength={100}
                />
                <div className="text-xs text-gray-400 text-right">{term.length}/100</div>
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Definition
                </label>
                <Textarea
                  placeholder="Enter definition"
                  className="min-h-[100px] max-h-40 overflow-auto bg-white rounded-xl w-full break-words"
                  value={definition}
                  onChange={(e) => onDefinitionChange(e.target.value)}
                  maxLength={300}
                />
                <div className="text-xs text-gray-400 text-right">{definition.length}/300</div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default CreateCard;