"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import toast from 'react-hot-toast';
import {
  transferCourseGroupOwnership,
  getGroupWithMembers,
  PopulatedCourseGroup
} from '@/services/groupApi';
import { set } from "zod";

interface TransferOwnershipProps {
  groupId: string;
  currentOwnerEmail: string;
}

export default function TransferOwnership({ groupId, currentOwnerEmail }: TransferOwnershipProps) {
  const router = useRouter();
  const [populatedGroup, setPopulatedGroup] = useState<PopulatedCourseGroup | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [selectedMemberName, setSelectedMemberName] = useState<string>("");
  const [selectedMemberEmail, setSelectedMemberEmail] = useState<string>("");
  const [transferring, setTransferring] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const popG = await getGroupWithMembers(groupId);
        setPopulatedGroup(popG);
      } catch (err) {
        console.error('Failed to load group members', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [groupId]);

  const handleMemberSelect = (memberId: string) => {
    setSelectedMemberId(memberId);
    
    // Find the selected member and set their email in the input field
    const member = nonOwnerMembers.find(m => m.userId._id === memberId);
    if (member) {
      setSelectedMemberEmail(member.userId.email);
      setSelectedMemberName(`${member.userId.firstName} ${member.userId.lastName}`);
    }
  };

  const handleTransferOwnership = async () => {
    if (!selectedMemberId) {
      return;
    }
    
    try {
      setTransferring(true);
      const result = await transferCourseGroupOwnership(groupId, selectedMemberId);
      toast.success(result.message, 
        { duration: 2000 } // keeps notif visible for 3 seconds
      );
      
      setShowConfirmDialog(false);
      
      // Redirect to group page since user is no longer owner
      router.push(`/groups/${groupId}`);
    } catch (err: any) {
      
      toast.error(err.response?.data?.message || "Failed to transfer ownership");
      setShowConfirmDialog(false);
    } finally {
      setTransferring(false);
    }
  };

  const handleTransferClick = () => {
    if (!selectedMemberId) {
      toast.error("Please select a member to transfer ownership to.");
      return;
    }
    setShowConfirmDialog(true);
  };


  // Get non-owner members for the dropdown
  const nonOwnerMembers = populatedGroup?.members.filter(m => m.role !== 'owner') || [];

  if (loading) {
    return (
      <div className="space-y-4 mx-4 p-4 border rounded-lg bg-gray-50">
        <p className="text-sm text-gray-500">Loading members...</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Current Owner Display */}
      <div className="space-y-2 mb-4 mx-4">
        <label htmlFor="current-owner" className="block text-sm font-medium text-gray-700">
          Current Owner
        </label>
        <Input 
          id="current-owner" 
          type="text" 
          value={currentOwnerEmail} 
          disabled 
          className="bg-gray-50" 
        />
      </div>

      {/* Transfer Ownership Section */}
      <div className="space-y-4 mx-4 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700">Transfer Ownership</h3>
        
        {nonOwnerMembers.length > 0 ? (
          <>
            {/* Dropdown to select member */}
            <div className="space-y-2">
              <label htmlFor="member-select" className="block text-sm font-medium text-gray-700">
                Select New Owner
              </label>
              <Select value={selectedMemberId} onValueChange={handleMemberSelect}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="-- Select a member --" />
                </SelectTrigger>
                <SelectContent>
                  {nonOwnerMembers.map((member) => (
                    <SelectItem key={member.userId._id} value={member.userId._id}>
                      {member.userId.firstName} {member.userId.lastName} ({member.userId.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Change Owner Button */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleTransferClick}
              disabled={!selectedMemberId || transferring}
            >
              {transferring ? "Transferring..." : "Change Owner"}
            </Button>
          </>
        ) : (
          <p className="text-sm text-gray-500">
            No other members available. Invite members first to transfer ownership.
          </p>
        )}
      </div>
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer Group Ownership?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div>
                  You are about to transfer ownership of this group to:
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="font-semibold text-blue-900">{selectedMemberName}</div>
                  <div className="text-sm text-blue-700">{selectedMemberEmail}</div>
                </div>
                <div className="text-red-600 font-medium pt-2">
                  ⚠️ You will lose ownership privileges and become a regular member.
                </div>
                <div className="text-sm text-gray-600">
                  This action cannot be undone without the new owner transferring it back.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={transferring}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleTransferOwnership}
              disabled={transferring}
              className="bg-red-600 hover:bg-red-700"
            >
              {transferring ? "Transferring..." : "Yes, Transfer Ownership"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}