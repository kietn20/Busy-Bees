"use client";

import { useEffect, useState } from "react";
import AddGroup from "@/components/coursegroup/add-group";
import { getUserGroups } from "@/services/groupApi";
import type { CourseGroup } from "@/services/groupApi";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import GroupDetailsModal from "@/components/coursegroup/display-details";
import { MessageCircle, Calendar, Mail } from "lucide-react";

export default function HomePage() {
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();

  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      setGroups([]);
      return;
    }

    const fetchGroups = async () => {
      try {
        setLoading(true);
        const fetched = await getUserGroups();
        setGroups(fetched || []);
      } catch (err) {
        console.error("Error fetching groups:", err);
        setError("Failed to load groups. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user, authLoading]);

  const pickName = (g: any) =>
    g.groupName || g.courseName || g.name || g._id || "Untitled Group";

  const pickId = (g: any) => g._id || g.courseId || g.id || "";

  const openDetails = async (group: any) => {
    try {
      const id = pickId(group);

      const res = await fetch(`http://localhost:8080/api/groups/${id}`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!data?.group) {
        setSelectedGroup({
          groupName: pickName(group),
          description: "No description available.",
        });
      } else {
        setSelectedGroup(data.group);
      }

      setDetailsOpen(true); // ✅ Open modal AFTER setting real data

    } catch (err) {
      console.error("Failed to load group details:", err);
      setSelectedGroup({
        groupName: pickName(group),
        description: "Failed to load details.",
      });
      setDetailsOpen(true);
    }
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedGroup(null);
  };

  const Card = ({ g }: { g: any }) => {
    const id = pickId(g);
    const name = pickName(g);

    return (
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all">
        <Link href={`/groups/${id}`}>
          <div className="h-44 bg-[url('/beige.jpg')] bg-cover bg-center" />
        </Link>

        <div className="p-4">
          <Link href={`/groups/${id}`}>
            <h3 className="text-base font-semibold text-gray-800 truncate hover:underline">
              {name}
            </h3>
          </Link>

          <div className="mt-3 flex items-center space-x-4 text-gray-600">
            <button
              aria-label="Group Details"
              title="View Group Details"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedGroup(g); 
                openDetails(g); 
              }}
              className="text-gray-600 hover:text-black transition"
            >
              <MessageCircle className="w-5 h-5" />
            </button>

            <button
              aria-label="events"
              className="hover:text-black transition opacity-50 cursor-not-allowed"
              title="Group Events (coming soon)"
            >
              <Calendar className="w-5 h-5" />
            </button>

            <button
              aria-label="mail"
              className="hover:text-black transition opacity-50 cursor-not-allowed"
              title="Group Messaging (coming soon)"
            >
              <Mail className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="w-full h-[2px] bg-gray-200 shadow-sm" />

      <main className="min-h-screen px-8 md:px-16 lg:px-24 py-12 bg-white">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              My Groups
            </h1>
            <p className="mt-2 text-gray-600">
              Quick access to the course groups you belong to.
            </p>
          </div>
          {user && groups.length > 0 && (
            <div className="flex items-center mt-1">
              <AddGroup />
            </div>
          )}
        </div>

        {!user || authLoading ? (
          <p className="text-center mt-12 text-gray-600">Loading authentication...</p>
        ) : loading ? (
          <p className="text-center mt-12 text-gray-600">Loading your groups...</p>
        ) : error ? (
          <p className="text-center mt-12 text-red-600">{error}</p>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-gray-700 text-xl mb-6">
              You are not a member of any course group.
            </p>
            <AddGroup />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {groups.map((g) => (
              <Card key={pickId(g)} g={g} />
            ))}
          </div>
        )}

        {selectedGroup && (
          <GroupDetailsModal
            open={detailsOpen}
            onClose={closeDetails}
            group={selectedGroup}
          />
        )}
      </main>
    </>
  );
}
