"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { leaveCourseGroup } from "@/services/groupApi";
import { Button } from "@/components/ui/button";

const LeaveModal = ({
  groupId,
  children,
}: {
  groupId: string;
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLeave = async () => {
    setIsLeaving(true);
    setError(null);
    try {
      await leaveCourseGroup(groupId);
      // After leaving, navigate back to groups list
      router.push("/groups");
    } catch (err: any) {
      console.error("Failed to leave group", err);
      setError(err?.response?.data?.message || "Failed to leave group");
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave course group</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. You will leave the group and lose
            access until you're reinvited. Are you sure you want to leave?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleLeave} disabled={isLeaving}>
              {isLeaving ? "Leaving..." : "Leave"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LeaveModal;
