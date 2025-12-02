"use client";

import { useEffect, useState } from "react";
import AddGroup from "@/components/coursegroup/add-group";
import { getUserGroups } from "@/services/groupApi";
import type { CourseGroup } from "@/services/groupApi";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import GroupDetailsModal from "@/components/coursegroup/display-details";
import { MessageCircle, Calendar, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import GoogleSignInToast from "@/components/GoogleSignInToast";
import { Description } from "@radix-ui/react-dialog";

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
        setError("Failed to load groups. Please try again later.");
        toast.error("Failed to load groups. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user, authLoading]);

  const pickName = (g: any) =>
    g.groupName || g.courseName || g.name || g._id || "Untitled Group";

  const pickId = (g: any) => g._id;

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedGroup(null);
  };

  const Card = ({ g }: { g: any }) => {
    const id = pickId(g);
    const name = pickName(g);

    if (groups.length > 0) {
      const ids = groups.map((g) => g._id);
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) {
        console.warn("Duplicate courseId detected!", ids);
      }
    }

    console.log(g);

    return (
      <>
        <GoogleSignInToast />
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all">
          <Link href={`/groups/${id}`}>
            <div className="h-44 bg-[url('/beige.jpg')] bg-cover bg-center" />
          </Link>

          <div className="p-4">
            <Link href={`/groups/${id}`}>
              <h3 className="text-base font-semibold text-gray-800 truncate hover:underline">
                {name}
              </h3>
              <p className="text-sm">{g.description}</p>
            </Link>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <main className="py-12 container mx-auto px-6">
        {user && (
          <div className="flex items-start justify-between mb-8 animate-in fade-in slide-in-from-top-3 duration-300">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                My Groups
              </h1>
              <p className="mt-2 text-gray-600">
                Quick access to the course groups you belong to.
              </p>
            </div>

            {/* Hide Add Group button if user has no groups */}
            {groups.length > 0 && (
              <div className="mt-2">
                <AddGroup />
              </div>
            )}
          </div>
        )}

        {authLoading ? (
          <p className="text-center mt-12 animate-pulse text-gray-600">
            Loading authentication...
          </p>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center py-24 text-center w-3/5 mx-auto">
            <h1 className="text-6xl font-medium  tracking-wide">
              Study Smarter. Together.
            </h1>
            <h3 className="mt-3  text-lg py-4">
              Create groups, drop notes, build flashcards, and plan your next
              session—all in one sleek workspace.
            </h3>
            <Button
              asChild
              className="mt-6 px-6 py-6 text-lg text-[#fff6e6] font-medium rounded-3xl"
            >
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        ) : loading ? (
          <p className="text-center mt-12 animate-pulse text-gray-600">
            Loading your groups...
          </p>
        ) : error ? (
          <p className="text-center mt-12 text-red-600">{error}</p>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-gray-700 text-xl mb-6">
              You are not a member of any course group.
            </p>
            <AddGroup />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 animate-in fade-in duration-300">
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
