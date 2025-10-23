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
  transferCourseGroupOwnership,
  getGroupWithMembers,
  PopulatedCourseGroup
} from '@/services/groupApi';

interface TransferOwnershipProps {
  groupId: string;
  currentOwnerEmail: string;
}

export default function TransferOwnership({ groupId, currentOwnerEmail }: TransferOwnershipProps) {
  const router = useRouter();
  const [populatedGroup, setPopulatedGroup] = useState<PopulatedCourseGroup | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [selectedMemberEmail, setSelectedMemberEmail] = useState<string>("");
  const [transferring, setTransferring] = useState(false);
  const [loading, setLoading] = useState(true);

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
    }
  };

  const handleTransferOwnership = async () => {
    if (!selectedMemberId) {
      alert("Please select a member to transfer ownership to.");
      return;
    }

    const selectedMember = nonOwnerMembers.find(m => m.userId._id === selectedMemberId);
    if (!selectedMember) return;

    const memberName = `${selectedMember.userId.firstName} ${selectedMember.userId.lastName}`;
    
    if (!confirm(`Are you sure you want to transfer ownership to ${memberName} (${selectedMember.userId.email})? You will become a regular member.`)) {
      return;
    }

    try {
      setTransferring(true);
      const result = await transferCourseGroupOwnership(groupId, selectedMemberId);
      alert(result.message);
      
      // Redirect to group page since user is no longer owner
      router.push(`/groups/${groupId}`);
    } catch (err: any) {
      console.error("Transfer failed:", err);
      alert(err.response?.data?.message || "Failed to transfer ownership");
    } finally {
      setTransferring(false);
    }
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

            {/* Input field that shows selected member's email */}
            <div className="space-y-2">
              <label htmlFor="new-owner" className="block text-sm font-medium text-gray-700">
                New Owner Email
              </label>
              <Input 
                id="new-owner" 
                type="text" 
                value={selectedMemberEmail}
                disabled 
                className="bg-white" 
                placeholder="Select a member from dropdown"
              />
            </div>

            {/* Change Owner Button */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleTransferOwnership}
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
    </div>
  );
}