"use client";

import { Event } from "@/services/groupApi";

interface UpcomingEventsProps {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  onEventClick: (eventId: string) => void;
}

export default function UpcomingEvents({
  events,
  isLoading,
  error,
  onEventClick,
}: UpcomingEventsProps) {
  if (isLoading) {
    return <p className="text-center text-gray-500">Loading events...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (events.length === 0) {
    return (
      <p className="text-center text-gray-500">
        No upcoming events for this group.
      </p>
    );
  }

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const eventDate = new Date(event.startTime);
    const dateKey = eventDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
    const dayOfWeek = eventDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    if (!acc[dateKey]) {
      acc[dateKey] = { dayOfWeek, events: [] };
    }
    acc[dateKey].events.push(event);
    return acc;
  }, {} as Record<string, { dayOfWeek: string; events: Event[] }>);

  // Check if date is today
  const isToday = (dateStr: string) => {
    const today = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
    return dateStr === today;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 h-[343px] overflow-y-auto ">
      <div className="space-y-6">
        {Object.entries(groupedEvents).map(
          ([date, { dayOfWeek, events: dateEvents }]) => (
            <div key={date} className="flex gap-6">
              {/* Date on left */}
              <div className="flex-shrink-0 w-32 pt-4">
                <p
                  className={`text-sm font-medium ${
                    isToday(date) ? "text-red-500" : "text-gray-500"
                  }`}
                >
                  {isToday(date) ? "Today " : dayOfWeek}
                </p>
                <p className="text-sm text-gray-500">{date}</p>
              </div>

              {/* Events on right */}
              <div className="flex-1 space-y-3">
                {dateEvents.map((event) => {
                  const startTime = new Date(event.startTime);
                  const timeStr = startTime.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  });

                  return (
                    <div
                      key={event._id}
                      onClick={() => onEventClick(event._id)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-3 -mx-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0 mt-2" />
                        <div className="flex-1">
                          <h4 className="text-gray-900 font-medium text-base">
                            {event.title}
                          </h4>
                          <p className="text-gray-500 text-sm mt-0.5">
                            {timeStr}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
