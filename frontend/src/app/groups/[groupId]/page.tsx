// Purpose: Displays the details and actions for a single course group

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { InviteModal } from '@/components/InviteModal';
import { generateInvite, getGroupEvents, Event } from '@/services/groupApi';
import { getEventById } from '@/services/eventApi';
import EventList from '@/components/events/EventList';
import EventDetailModal from '@/components/events/EventDetailModal';

export default function GroupPage() {
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

  const params = useParams();
  const groupId = params.groupId as string; // get groupId from URL

  useEffect(() => {
    if (!groupId) return;

    const fetchEvents = async () => {
      try {
        setIsEventsLoading(true);
        const fetchedEvents = await getGroupEvents(groupId);
        setEvents(fetchedEvents);
      } catch (err) {
        setEventsError('Failed to load events.');
      } finally {
        setIsEventsLoading(false);
      }
    };

    fetchEvents();
  }, [groupId]); // Dependency array ensures this runs once when groupId is available

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
  }

  const handleGenerateInvite = async () => {
    setIsModalOpen(true);
    if (inviteCode) return;

    setIsInviteLoading(true);
    setInviteError(null);
    try {
      const response = await generateInvite(groupId);
      setInviteCode(response.data.inviteCode);
    } catch (err) {
      setInviteError('Failed to generate invite code. Please try again.');
    } finally {
      setIsInviteLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Course Group Details</h1>
          <Button onClick={handleGenerateInvite}>Invite Members</Button>
        </div>
        
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
        />
      </div>
    </ProtectedRoute>
  );
}