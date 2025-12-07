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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [filteredEvents, setFilteredEvents] = useState<Event[] | null>(null);

  const [timeFilter, setTimeFilter] = useState<"all" | "week" | "month">("all");

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

      if (selectedDate) {
        setFilteredEvents(filterEventsByDate(fetchedEvents, selectedDate));
      } else {
        setFilteredEvents(null); // Show all events
      }
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
      backgroundColor: "#FEE27d", // Amber-400
      color: "#624134",
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

    setFilteredEvents(eventsOnDay);
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
    //setSelectedDate(undefined);
  };

  function filterEventsByDate(events: Event[], date: Date | undefined) {
    if (!date) return events;
    return events.filter((event) => {
      const eventDate = new Date(event.startTime);
      return eventDate.toLocaleDateString() === date.toLocaleDateString();
    });
  }

  function filterEventsByTimeRange(
    events: Event[],
    range: "all" | "week" | "month"
  ) {
    if (range === "all") return events;

    const now = new Date();
    const end = new Date(now);

    if (range === "week") {
      end.setDate(end.getDate() + 7); // next 7 days
    } else {
      end.setMonth(end.getMonth() + 1); // next month
    }

    return events.filter((event) => {
      const start = new Date(event.startTime);
      return start >= now && start <= end;
    });
  }

  const displayedEvents = useMemo(() => {
    // Base events: either date-filtered or all events
    const base = filteredEvents !== null ? filteredEvents : events;

    // If a specific date is selected (filteredEvents not null),
    // ignore the time filter and just show that day's events.
    const effectiveFilter = filteredEvents !== null ? "all" : timeFilter;

    return filterEventsByTimeRange(base, effectiveFilter);
  }, [events, filteredEvents, timeFilter]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Events</h1>

          <div className="flex flex-row items-start gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Event
            </Button>

            {selectedDate ? (
              // When a date is selected: show "Show All Events" button
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDate(undefined);
                  setFilteredEvents(null);
                  setTimeFilter("all");
                }}
              >
                Show All Events
              </Button>
            ) : (
              // When NO date is selected: show the time-range dropdown
              <select
                value={timeFilter}
                onChange={(e) =>
                  setTimeFilter(e.target.value as "all" | "week" | "month")
                }
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-gray-400"
              >
                <option value="all">All</option>
                <option value="week">Within next week</option>
                <option value="month">Within next month</option>
              </select>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 justify-between">
          <div className="md:w-2/3 w-full flex flex-col h-[calc(100vh-220px)]">
            <div className="overflow-y-auto pr-2 flex-grow">
              <EventList
                events={displayedEvents}
                isLoading={isEventsLoading}
                error={eventsError}
                onEventClick={handleViewEvent}
                selectedDate={selectedDate}
              />
            </div>
          </div>

          <div className="md:w-1/3 w-full flex justify-center items-start flex-shrink-0">
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
