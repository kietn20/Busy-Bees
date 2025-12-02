"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import EventList from "@/components/events/EventList";
import { getGroupEvents, Event } from "@/services/groupApi";
import { getEventById } from "@/services/eventApi";
import EventDetailModal from "@/components/events/EventDetailModal";
import CreateEventModal from "@/components/events/CreateEventModal";
import { getGroupById, CourseGroup } from "@/services/groupApi";
import { Button } from "@/components/ui/button";
import EventCalendar from "@/components/events/EventCalendar";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "react-hot-toast";

export default function GroupEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const [group, setGroup] = useState<CourseGroup | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const params = useParams();
  const groupId = params.groupId as string;

  const fetchEventsAndGroup = async () => {
    if (!groupId) return;
    setIsEventsLoading(true);
    setEventsError(null);
    try {
      // Fetch both in parallel
      const [fetchedEvents, fetchedGroup] = await Promise.all([
        getGroupEvents(groupId),
        getGroupById(groupId),
      ]);
      setEvents(fetchedEvents);
      setGroup(fetchedGroup);
    } catch (err) {
      setEventsError("Failed to load events.");
    } finally {
      setIsEventsLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsAndGroup();
  }, [groupId]);

  const eventDays = useMemo(() => {
    return events.map((event) => new Date(event.startTime));
  }, [events]);

  const modifiers = {
    event: eventDays,
  };

  const modifiersStyles = {
    event: {
      backgroundColor: "#FBBF24", // Amber-400
      color: "#1F2937",
      borderRadius: "0.5rem",
    },
  };

  const handleDayClick = (day: Date | undefined) => {
    if (!day) return;
    setSelectedDate(day);

    const eventsOnDay = events.filter((event) => {
      const eventDate = new Date(event.startTime);
      return eventDate.toLocaleDateString() === day.toLocaleDateString();
    });

    if (eventsOnDay.length === 1) {
      handleViewEvent(eventsOnDay[0]._id);
    } else if (eventsOnDay.length > 1) {
      handleViewEvent(eventsOnDay[0]._id);
    }
  };

  const handleViewEvent = async (eventId: string) => {
    setIsDetailModalOpen(true);
    setIsDetailLoading(true);
    try {
      const fetchedEvent = await getEventById(eventId);
      setSelectedEvent(fetchedEvent);
    } catch (err) {
      toast.error("Failed to fetch event details.");
      console.error("Failed to fetch event details", err);
      // Optionally, show an error toast here
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedEvent(null);
    setSelectedDate(undefined);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Events</h1>
          <Button variant="outline" onClick={() => setIsCreateModalOpen(true)}>
            Create Event
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-8 justify-between">
          <div className="w-2/3  flex flex-col h-[calc(100vh-220px)]">
            <div className="overflow-y-auto pr-2 flex-grow">
              <EventList
                events={events}
                isLoading={isEventsLoading}
                error={eventsError}
                onEventClick={handleViewEvent}
              />
            </div>
          </div>

          <div className="w-3/5  flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg shadow-md w-full ">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDayClick}
                className="w-full"
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
              />
            </div>
          </div>
        </div>

        <EventDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          event={selectedEvent}
          isLoading={isDetailLoading}
          groupOwnerId={group?.ownerId || null}
          onEventUpdated={fetchEventsAndGroup}
        />
        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          groupId={groupId}
          onEventCreated={fetchEventsAndGroup}
        />
      </div>
    </ProtectedRoute>
  );
}
