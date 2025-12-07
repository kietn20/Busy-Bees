"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { deleteAccount } from "@/services/accountApi";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const DeleteAccountButton = () => {
  const { logout } = useAuth();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      toast.success("Account deleted successfully.");
      await logout();
      router.push("/login");
    } catch (error: any) {
      console.error("Delete account error:", error);

      if (error.ownedGroupsCount) {
        // User owns groups - show error with link
        toast.error(
          <div>
            <p className="font-semibold mb-2">{error.message}</p>
          </div>,
          { duration: 8000 }
        );
      } else {
        toast.error(error.message || "Failed to delete account.");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="cursor-pointer bg-red-500 hover:bg-red-600 text-white"
          disabled={deleting}
        >
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                This action{" "}
                <span className="font-semibold text-red-600">
                  cannot be undone
                </span>
                . This will permanently delete your account and remove all your
                data.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800 font-medium mb-2">
                  This will:
                </p>
                <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                  <li>Permanently delete your account</li>
                  <li>Remove you from all groups</li>
                  <li>Erase all your data</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Note:</span> If you own any
                groups, you must transfer ownership before deleting your
                account.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleting ? "Deleting..." : "Yes, Delete My Account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountButton;
