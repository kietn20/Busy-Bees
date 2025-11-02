"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import EventList from "@/components/events/EventList";
import { getGroupEvents, Event } from "@/services/groupApi";
import { getEventById } from "@/services/eventApi";
import EventDetailModal from "@/components/events/EventDetailModal";
import CreateEventModal from "@/components/events/CreateEventModal";
import { getGroupById, CourseGroup } from "@/services/groupApi";
import { Button } from "@/components/ui/button";

export default function GroupEventsPage() {
	const [events, setEvents] = useState<Event[]>([]);
	const [isEventsLoading, setIsEventsLoading] = useState(true);
	const [eventsError, setEventsError] = useState<string | null>(null);

	const [group, setGroup] = useState<CourseGroup | null>(null);
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [isDetailLoading, setIsDetailLoading] = useState(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

	return (
		<ProtectedRoute>
			<div className="container mx-auto p-8">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold">
						{group ? `${group.groupName}: Events` : "Events"}
					</h1>
					<Button
						variant="outline"
						onClick={() => setIsCreateModalOpen(true)}
					>
						Create Event
					</Button>
				</div>

				<EventList
					events={events}
					isLoading={isEventsLoading}
					error={eventsError}
					onEventClick={handleViewEvent}
				/>

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
