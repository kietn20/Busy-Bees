'use client';

import { useMemo } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Event } from '@/services/groupApi';

interface EventCalendarProps {
  events: Event[];
}

export default function EventCalendar({ events }: EventCalendarProps) {
  const eventDates = useMemo(() => {
    return events.map(event => new Date(event.startTime));
  }, [events]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Calendar
        mode="multiple"
        selected={eventDates}
        className="rounded-md"
        modifiers={{ highlighted: eventDates }}
        modifiersClassNames={{
          highlighted: 'bg-yellow-400 text-black rounded-full',
        }}
      />
    </div>
  );
}