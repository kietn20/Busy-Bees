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
import toast from "react-hot-toast";

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
      toast.success("You have left the group.");
      router.push("/");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to leave group.";
      setError(message);
      toast.error(message);
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
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                If you leave this course group, the content you created that is
                associated with this group may be deleted, including:
              </p>
              <ul className="list-disc list-inside pl-4">
                <li>Your notes in this course group</li>
                <li>Your flashcard sets for this course group</li>
                <li>Any events you created for this course group</li>
              </ul>
              <p className="font-medium">
                This action cannot be undone. You will leave the group and lose
                access until you&apos;re reinvited. Are you sure you want to
                leave?
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleLeave}
              disabled={isLeaving}
            >
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
