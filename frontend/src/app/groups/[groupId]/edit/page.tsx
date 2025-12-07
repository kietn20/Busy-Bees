"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import EditGroupForm from "@/components/coursegroup/edit-group";
import DeleteModal from "@/components/coursegroup/delete-modal";
import TransferOwnership from "@/components/coursegroup/transfer-ownership";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getGroupById,
  updateCourseGroup,
  CourseGroup,
} from "@/services/groupApi";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function EditGroupPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  if (!params || !params.groupId) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-8">Invalid group ID</div>
      </ProtectedRoute>
    );
  }
  const groupId = params.groupId as string;

  const [group, setGroup] = useState<CourseGroup | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // prevent members from accesing edit page here using a useEffect
  // redirect them to 403 page if they are not owners

  useEffect(() => {
    const checkOwnership = async () => {
      if (!groupId || !user) return;

      try {
        const g = await getGroupById(groupId);

        // Check if current user is the owner using role from members array
        const ownerMember = g.members?.find(
          (member: any) =>
            member.userId._id === user.id && member.role === "owner"
        );

        if (!ownerMember) {
          // User is not the owner - redirect to 403 page
          router.push("/403");
        }
      } catch (error) {
        router.push("/403");
      }
    };

    checkOwnership();
  }, [groupId, user, router]);

  useEffect(() => {
    if (!groupId) return;
    const fetch = async () => {
      try {
        const g = await getGroupById(groupId);
        setGroup(g);
        setName(g.groupName || "");
        setDescription(g.description || "");
      } catch (err) {
        setError("Failed to load group.");
      }
    };
    fetch();
  }, [groupId]);

  if (!group) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-8">Loading group...</div>
      </ProtectedRoute>
    );
  }

  // Get current owner email for TransferOwnership component
  const currentOwnerEmail =
    typeof group.ownerId === "string"
      ? group.ownerId
      : (group.ownerId as any)?.email || "";

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <h1 className="text-xl font-bold mb-4">Edit Group</h1>

        <EditGroupForm
          groupId={groupId}
          onSaved={() => router.push(`/groups/${groupId}`)}
        />

        <div className="p-6">
          <h2 className="text-lg font-semibold mb-6 border-b pb-2">Security</h2>

          <TransferOwnership
            groupId={groupId}
            currentOwnerEmail={currentOwnerEmail}
          />

          <div className="flex justify-between items-center w-full py-4">
            <div className="space-y-1 mx-4">
              <h4 className="font-medium">Delete Group</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete the group and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <DeleteModal groupId={groupId} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
