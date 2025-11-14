"use client";

import { Event } from "@/services/groupApi";
import EventListItem from "./EventListItem";

interface EventListProps {
	events: Event[];
	isLoading: boolean;
	error: string | null;
	onEventClick: (eventId: string) => void;
}

export default function EventList({
	events,
	isLoading,
	error,
	onEventClick,
}: EventListProps) {
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

	return (
		<div className="w-full max-w-xl mx-auto">
			<div className="bg-white p-6 rounded-lg divide-y divide-gray-200 flex flex-col gap-2">
				{events.map((event) => (
					<EventListItem
						key={event._id}
						event={event}
						onClick={() => onEventClick(event._id)}
					/>
				))}
			</div>
		</div>
	);
}