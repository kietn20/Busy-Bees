// File: /frontend/src/components/notes/CollaboratorModal.tsx (Corrected)

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PopulatedCourseGroup } from "@/services/groupApi";
import { Note, updateCollaborators } from "@/services/noteApi";
import { Checkbox } from "@/components/ui/checkbox";

interface UserObject {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
  group: PopulatedCourseGroup;
  isAuthor: boolean | null;
  onUpdate: (updatedNote: Note) => void;
}

export default function CollaboratorModal({
  isOpen,
  onClose,
  note,
  group,
  isAuthor,
  onUpdate,
}: CollaboratorModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && note) {
      // Pre-select existing collaborators
      // Ensure we check if collaborators exists and is an array
      const existingIds = (note.collaborators || [])
        .filter((user) => user !== null) // Check for null
        .map((user) => user._id);

      setSelectedIds(existingIds);
    }
  }, [isOpen, note]);

  const handleToggle = (userId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId); // Remove
      } else {
        return [...prev, userId]; // Add
      }
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedNote = await updateCollaborators(
        note.groupId,
        note._id,
        selectedIds
      );
      onUpdate(updatedNote);
      onClose();
    } catch (error) {
      console.error("Failed to update collaborators", error);
      alert("Failed to update collaborators. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out the note author from the list
  const potentialCollaborators = group.members.filter((member) => {
    // --- TYPE GUARD FIX ---
    // If userId is just a string (unpopulated ID), skip it.
    if (typeof member.userId === "string") {
      return false;
    }
    // Now TypeScript knows member.userId is the object form
    return member.userId._id !== note.userId._id;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isAuthor ? "Manage Collaborators" : "View Collaborators"}
          </DialogTitle>
          <DialogDescription>
            {isAuthor
              ? "Select group members to grant editing access to this note."
              : "These members have editing access to this note."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 max-h-[60vh] overflow-y-auto space-y-4">
          {potentialCollaborators.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">
              No other members in this group yet.
            </p>
          ) : (
            potentialCollaborators.map((member) => {
              const user = member.userId as UserObject;

              return (
                <div
                  key={user._id}
                  className="flex items-center space-x-3 p-2 hover:bg-accent/50 rounded-md"
                >
                  <Checkbox
                    id={user._id}
                    checked={selectedIds.includes(user._id)}
                    disabled={!isAuthor}
                    onCheckedChange={() => handleToggle(user._id)}
                  />
                  <Label
                    htmlFor={user._id}
                    className="flex-grow cursor-pointer flex flex-col"
                  >
                    <span className="font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </Label>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            {isAuthor ? "Cancel" : "Close"}
          </Button>
          {isAuthor && (
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
