"use client";

import RecentView from "@/components/dashboard/recent-view";
import GroupActivity from "@/components/dashboard/group-activity";
import UpcomingEvents from "@/components/dashboard/upcoming-events";
import { useState, useEffect, useCallback } from "react";
import {
  getGroupEvents,
  getGroupById,
  Event,
  CourseGroup,
} from "@/services/groupApi";
import { useParams } from "next/navigation";
import { Tally1 } from "lucide-react";

export default function GroupPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const [events, setEvents] = useState<Event[]>([]);
  const [group, setGroup] = useState<CourseGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //make this only for the next 2 weeks or smth.
  const fetchData = useCallback(async () => {
    if (!groupId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedEvents, fetchedGroup] = await Promise.all([
        getGroupEvents(groupId),
        getGroupById(groupId),
      ]);
      setEvents(fetchedEvents);
      setGroup(fetchedGroup);
    } catch (err) {
      setError("Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="container mx-auto p-8">
      <div className="mb-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {group?.description && (
          <div className="flex items-center ">
            <Tally1 className="inline text-[#efc576] " />
            <p className="text-[#efc576] py-1 text-[.95rem]">
              {group.description}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <div className="w-2/3">
          <div className="w-full overflow-y-auto py-6">
            <h2 className="text-xl font-semibold px-4">Recently Viewed</h2>
            <RecentView courseId={groupId} />
          </div>

          <div className="w-full overflow-y-auto pb-6">
            <h2 className="text-xl font-semibold p-4">Upcoming Events</h2>
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
        <div className="w-1/3 max-h-[750px] overflow-y-auto border border-foreground/10 rounded-3xl py-6 bg-[#ead4aa]/3">
          <h2 className="text-xl font-semibold px-4">Group Activity</h2>
          <GroupActivity />
        </div>
      </div>
    </div>
  );
}
