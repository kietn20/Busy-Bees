// Purpose: A modal dialog to display and copy a group invite code

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode: string | null;
  isLoading: boolean;
}

export function InviteModal({ isOpen, onClose, inviteCode, isLoading }: InviteModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  const inviteLink = inviteCode ? `${window.location.origin}/join?code=${inviteCode}` : '';

  const handleCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
          <DialogDescription>
            Share this link with others to invite them to your group. The link expires in 7 days.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4">
          <Input id="invite-link" value={isLoading ? "Generating..." : inviteLink} readOnly />
          <Button type="button" size="sm" onClick={handleCopy} disabled={!inviteCode || isCopied}>
            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}