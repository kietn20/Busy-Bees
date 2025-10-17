'use client';

import { Event } from '@/services/groupApi';
import EventListItem from './EventListItem';

interface EventListProps {
  events: Event[];
  isLoading: boolean;
  error: string | null;
}

export default function EventList({ events, isLoading, error }: EventListProps) {
  if (isLoading) {
    return <p className="text-center text-gray-500">Loading events...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (events.length === 0) {
    return <p className="text-center text-gray-500">No upcoming events for this group.</p>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {events.map((event) => (
          <EventListItem key={event._id} event={event} />
        ))}
      </div>
    </div>
  );
}