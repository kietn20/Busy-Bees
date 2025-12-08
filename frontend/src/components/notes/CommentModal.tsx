"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentInputModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void> | void;
  initialValue?: string;
}

const MAX_LENGTH = 250; // maximum characters allowed in a comment

export const CommentInputModal = ({
  open,
  onClose,
  onSubmit,
  initialValue = "",
}: CommentInputModalProps) => {
  const [value, setValue] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset text whenever the modal is opened fresh
  useEffect(() => {
    if (open) {
      setValue(initialValue);
      setError(null);
      setSubmitting(false);
    }
  }, [open, initialValue]);

  const handleSubmit = async () => {
    const trimmed = value.trim();

    if (!trimmed) {
      setError("Comment cannot be empty.");
      return;
    }

    if (trimmed.length > MAX_LENGTH) {
      setError(`Comment cannot exceed ${MAX_LENGTH} characters.`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(trimmed);
    } catch (err) {
      console.error("Error submitting comment:", err);
      setError("Failed to submit comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    const input = e.target.value;

    if (input.length > MAX_LENGTH) {
      setValue(input.slice(0, MAX_LENGTH));
      setError(`Comment cannot exceed ${MAX_LENGTH} characters.`);
    } else {
      setValue(input);
      // Clear length-related error if the user goes back under the limit
      if (error && error.toLowerCase().includes("exceed")) {
        setError(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add Comment
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Share your thoughts about this note. You can edit or delete your
            comment later.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          <Textarea
            autoFocus
            rows={5}
            value={value}
            onChange={handleChange}
            placeholder="Type your comment here..."
            className="w-full resize-none text-sm whitespace-pre-wrap break-all"
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              {value.length}/{MAX_LENGTH} characters
            </p>
            {error && (
              <p className="text-xs text-red-500 mt-1 text-right">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : "Add Comment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
