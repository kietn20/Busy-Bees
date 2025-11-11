"use client";
import QuickLinks from "@/components/dashboard/quick-links";
import RecentView from "@/components/dashboard/recent-view";
import GroupActivity from "@/components/dashboard/group-activity";
import UpcomingEvents from "@/components/dashboard/upcoming-events";
import { useState, useEffect } from "react";
import { getGroupEvents, Event } from "@/services/groupApi";
import { useParams } from "next/navigation";

export default function GroupPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //make this only for the next 2 weeks or smth.
  const fetchEvents = async () => {
    if (!groupId) return;
    setIsLoading(true);
    setError(null);
    try {
      const fetchedEvents = await getGroupEvents(groupId);
      setEvents(fetchedEvents);
    } catch (err) {
      setError("Failed to load events.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [groupId]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="flex gap-4">
        <div className="w-2/3">
          <div className="w-full overflow-y-auto py-6">
            <h2 className="text-xl font-semibold text-gray-900 px-4">
              Recently Viewed
            </h2>
            <RecentView />
          </div>

          <div className="w-full overflow-y-auto pb-6">
            <h2 className="text-xl font-semibold text-gray-900 p-4">
              Upcoming Events
            </h2>
            <div className="px-4">
              <UpcomingEvents
                events={events}
                isLoading={isLoading}
                error={error}
                onEventClick={() => {}}
              />
            </div>
          </div>
        </div>
        <div className="w-1/3 max-h-[750px] overflow-y-auto border rounded-3xl py-6">
          <h2 className="text-xl font-semibold text-gray-900 px-4">
            Group Activity
          </h2>
          <GroupActivity />
        </div>
      </div>
    </div>
  );
}
