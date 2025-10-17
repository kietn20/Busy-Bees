'use client';

import { Event } from '@/services/groupApi';
import { Calendar, UserCircle } from 'lucide-react';

interface EventListItemProps {
  event: Event;
}

export default function EventListItem({ event }: EventListItemProps) {
  const eventDate = new Date(event.startTime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const eventTime = new Date(event.startTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="border-b border-gray-200 py-4">
      <h3 className="font-semibold text-lg">{event.title}</h3>
      <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1.5" />
          <span>{eventDate} at {eventTime}</span>
        </div>
        <div className="flex items-center">
          <UserCircle className="h-4 w-4 mr-1.5" />
          <span>Hosted by {event.createdBy.firstName}</span>
        </div>
      </div>
      {event.description && <p className="mt-2 text-gray-600">{event.description}</p>}
    </div>
  );
}