"use client";

import { useEffect, useState } from "react";
import CourseList from "@/components/coursegroup/course-list";
import AddGroup from "@/components/coursegroup/add-group";
import { getUserGroups } from "@/services/groupApi";
import type { CourseGroup } from "@/services/groupApi";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Only fetch groups if user is authenticated
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      setGroups([]);
      return;
    }

    const fetchGroups = async () => {
      try {
        setLoading(true);
        const fetchedGroups = await getUserGroups();
        setGroups(fetchedGroups);
      } catch (err) {
        console.error("Error fetching groups:", err);
        setError("Failed to load groups. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user, authLoading]);

  // Transform CourseGroup data to Course format for CourseList component
  const courses = groups.map((group) => ({
    id: group._id,
    name: group.groupName,
    link: `/groups/${group._id}`,
    image: "/beige.jpg", // default image
  }));

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Welcome to Busy Bee</h1>
        <p className="mt-4 text-lg text-gray-600">
          Your collaborative study platform.
        </p>
      </div>

      {!user ? (
        <div className="mt-8 text-center">
          <p className="text-gray-600">Please log in to view your groups.</p>
        </div>
      ) : loading ? (
        <p className="mt-8 text-gray-600">Loading your groups...</p>
      ) : error ? (
        <p className="mt-8 text-red-600">{error}</p>
      ) : (
        <CourseList courses={courses} />
      )}

      {/* Temporary hardcoded groups - commented out */}
      {/* <CourseList
        courses={[
          {
            id: "1",
            name: "CECS 329: Computer Theory",
            link: "https://example.com/course1",
            image: "/beige.jpg",
          },
          {
            id: "2",
            name: "Course 2",
            link: "https://example.com/course2",
            image: "/beige.jpg",
          },
        ]}
      /> */}

      {user && <AddGroup />}
    </main>
  );
}
