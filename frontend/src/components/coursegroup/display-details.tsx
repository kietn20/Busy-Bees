"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface GroupDetailsModalProps {
  open: boolean;
  onClose: () => void;
  group: any;
}

export default function GroupDetailsModal({
  open,
  onClose,
  group,
}: GroupDetailsModalProps) {
  if (!group) return null;

  const name = group.groupName || group.name || "Untitled Group";
  const description = group.description?.trim() || "No description available.";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white rounded-xl shadow-xl animate-in fade-in zoom-in-95">
        <div className="sr-only" aria-hidden="true"></div>

        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            {name}
          </DialogTitle>
        </DialogHeader>

        <DialogDescription className="text-muted-foreground mt-3 whitespace-pre-line">
          {description}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
