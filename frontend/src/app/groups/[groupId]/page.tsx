// Purpose: Displays the details and actions for a single course group

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { InviteModal } from "@/components/InviteModal";
import LeaveModal from "@/components/coursegroup/leave-modal";
import { DoorOpen, DoorClosed } from "lucide-react";
import { generateInvite, getGroupEvents, Event } from "@/services/groupApi";
import { getGroupById, CourseGroup } from "@/services/groupApi";
import { useAuth } from "@/context/AuthContext";

export default function GroupPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isInviteLoading, setIsInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [group, setGroup] = useState<CourseGroup | null>(null);
  const [isLeaveHover, setIsLeaveHover] = useState(false);

  const params = useParams();
  if (!params || !params.groupId) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-8">Invalid group ID</div>
      </ProtectedRoute>
    );
  }
  const groupId = params.groupId as string; // get groupId from URL

  useEffect(() => {
    if (!groupId) return;
    const fetchGroupDetails = async () => {
      try {
        const fetchedGroup = await getGroupById(groupId);
        setGroup(fetchedGroup);
      } catch (err) {
        console.error("Failed to fetch group details", err);
        // We can set an error state for the whole page here
      }
    };
    fetchGroupDetails();
  }, [groupId]);
  const { user } = useAuth();

  // helper to determine whether the current user is the owner
  const isOwner = () => {
    if (!user || !group) return false;
    const owner = (group as any).ownerId;
    if (!owner) return false;
    if (typeof owner === "string") {
      return owner === user.id;
    }
    if (owner._id) return owner._id === user.id;
    if (owner.email) return owner.email === user.email;
    return false;
  };

  const handleGenerateInvite = async () => {
    setIsModalOpen(true);
    if (inviteCode) return;

    setIsInviteLoading(true);
    setInviteError(null);
    try {
      const response = await generateInvite(groupId);
      setInviteCode(response.data.inviteCode);
    } catch (err) {
      setInviteError("Failed to generate invite code. Please try again.");
    } finally {
      setIsInviteLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {group ? group.groupName : "Course Group Details"}
          </h1>
          <div className="flex space-x-2">
            {isOwner() && (
              <Button
                variant="outline"
                onClick={() =>
                  window.location.assign(`/groups/${groupId}/edit`)
                }
              >
                Edit Group
              </Button>
            )}
            
            <Button variant="outline" onClick={() => router.push(`/groups/${groupId}/events`)}>
              View Events
            </Button>

            <Button onClick={handleGenerateInvite}>Invite Members</Button>
            <LeaveModal groupId={groupId}>
              <Button
                variant="outline"
                size="icon"
                title="Leave group"
                onMouseEnter={() => setIsLeaveHover(true)}
                onMouseLeave={() => setIsLeaveHover(false)}
                className={`relative inline-flex items-center justify-center p-2 rounded-md shadow-xs transition-all duration-300 ease-in-out hover:bg-red-600 hover:text-white ${
                  isLeaveHover ? "bg-red-600 text-white opacity-100" : "opacity-60"
                } focus:outline-none`}
              >
                <span className="flex items-center justify-center">
                  <DoorClosed
                    className={`w-5 h-5 transition-opacity duration-500 ease-in-out ${
                      isLeaveHover ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <DoorOpen
                    className={`w-5 h-5 absolute transition-opacity duration-500 ease-in-out ${
                      isLeaveHover ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </span>
              </Button>
            </LeaveModal>
          </div>
        </div>

        <InviteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          inviteCode={inviteCode}
          isLoading={isInviteLoading}
        />

        <Button
          variant="outline"
          onClick={() => router.push(`/groups/${groupId}/flashcards`)}
        >
          Flashcards
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/groups/${groupId}/notes`)}
        >
          Notes
        </Button>
      </div>
    </ProtectedRoute>
  );
}
