// Purpose: Displays the details and actions for a single course group

"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { InviteModal } from '@/components/InviteModal';
import { generateInvite, getGroupEvents, Event } from '@/services/groupApi';
import { getGroupById, CourseGroup } from '@/services/groupApi';
import { useAuth } from '@/context/AuthContext';
import { getEventById  } from '@/services/eventApi';
import EventList from '@/components/events/EventList';
import EventDetailModal from '@/components/events/EventDetailModal';
import CreateEventModal from '@/components/events/CreateEventModal';

export default function GroupPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isInviteLoading, setIsInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [group, setGroup] = useState<CourseGroup | null>(null);

  const params = useParams();
  if (!params || !params.groupId) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-8">Invalid group ID</div>
      </ProtectedRoute>
    );
  }
  const groupId = params.groupId as string; // get groupId from URL

  useEffect(() => {
    if (!groupId) return;
    const fetchGroupDetails = async () => {
      try {
        const fetchedGroup = await getGroupById(groupId);
        setGroup(fetchedGroup);
      } catch (err) {
        console.error("Failed to fetch group details", err);
        // We can set an error state for the whole page here
      }
    };
    fetchGroupDetails();
  }, [groupId]);
  const { user } = useAuth();

  // helper to determine whether the current user is the owner
  const isOwner = () => {
    if (!user || !group) return false;
    const owner = (group as any).ownerId;
    if (!owner) return false;
    if (typeof owner === 'string') {
      return owner === user.id;
    }
    if (owner._id) return owner._id === user.id;
    if (owner.email) return owner.email === user.email;
    return false;
  };

  const fetchEvents = async () => {
    try {
      setIsEventsLoading(true);
      const fetchedEvents = await getGroupEvents(groupId);
      setEvents(fetchedEvents);
    } catch (err) {
      setEventsError("Failed to load events.");
    } finally {
      setIsEventsLoading(false);
    }
  };

  useEffect(() => {
    if (!groupId) return;
    fetchEvents();
  }, [groupId]);

  const handleViewEvent = async (eventId: string) => {
    setIsDetailModalOpen(true);
    setIsDetailLoading(true);
    try {
      const fetchedEvent = await getEventById(eventId);
      setSelectedEvent(fetchedEvent);
    } catch (err) {
      console.error("Failed to fetch event details", err);
      // Optionally, show an error toast here
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedEvent(null); // Clear selection on close
  };

  const handleGenerateInvite = async () => {
    setIsModalOpen(true);
    if (inviteCode) return;

    setIsInviteLoading(true);
    setInviteError(null);
    try {
      const response = await generateInvite(groupId);
      setInviteCode(response.data.inviteCode);
    } catch (err) {
      setInviteError("Failed to generate invite code. Please try again.");
    } finally {
      setIsInviteLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {group ? group.groupName : "Course Group Details"}
          </h1>
          <div className="flex space-x-2">
            {isOwner() && (
              <Button variant="outline" onClick={() => window.location.assign(`/groups/${groupId}/edit`)}>
                Edit Group
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsCreateModalOpen(true)}>
              Create Event
            </Button>
            <Button onClick={handleGenerateInvite}>Invite Members</Button>
          </div>
        </div>

        {/* --- PASS the fetchEvents function to the onEventCreated prop --- */}
        <EventList
          events={events}
          isLoading={isEventsLoading}
          error={eventsError}
          onEventClick={handleViewEvent}
        />

        <InviteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          inviteCode={inviteCode}
          isLoading={isInviteLoading}
        />

        <EventDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          event={selectedEvent}
          isLoading={isDetailLoading}
          groupOwnerId={(() => {
            const owner = (group as any)?.ownerId;
            if (!owner) return null;
            if (typeof owner === 'string') return owner;
            return owner._id || null;
          })()}
          onEventUpdated={() => {
            handleCloseDetailModal();
            fetchEvents();
          }}
        />

        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          groupId={groupId}
          onEventCreated={fetchEvents} // Pass the refetch function
        />
        <Button
          variant="outline"
          onClick={() => router.push(`/groups/${groupId}/flashcards`)}
        >
          Flashcards
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/groups/${groupId}/notes`)}
        >
          Notes
        </Button>
      </div>
    </ProtectedRoute>
  );
}
