// Purpose: Displays the details and actions for a single course group

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { InviteModal } from '@/components/InviteModal';
import { generateInvite } from '@/services/groupApi';

export default function GroupPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const groupId = params.groupId as string; // get groupId from URL

  const handleGenerateInvite = async () => {
    setIsModalOpen(true);
    if (inviteCode) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await generateInvite(groupId);
      setInviteCode(response.data.inviteCode);
    } catch (err) {
      setError('Failed to generate invite code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Course Group Details</h1>
          <Button onClick={handleGenerateInvite}>
            Invite Members
          </Button>
        </div>







        <div className="bg-white p-6 rounded-lg shadow-md">
          <p>Group ID: {groupId}</p>
          <p>This is where the group&apos;s notes, flashcards, and events will be displayed.</p>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>

        <InviteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          inviteCode={inviteCode}
          isLoading={isLoading}
        />
      </div>
    </ProtectedRoute>
  );
}