import React, { useEffect, useState } from "react";
import { getGroupWithMembers, PopulatedCourseGroup } from "@/services/groupApi";

interface GroupMembersListProps {
  groupId: string; // MongoDB ObjectId as string for the CourseGroup
}

const GroupMembersList = ({ groupId }: GroupMembersListProps) => {
  const [group, setGroup] = useState<PopulatedCourseGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true);
        const groupData = await getGroupWithMembers(groupId); // groupId is the CourseGroup's _id
        setGroup(groupData);
      } catch (error) {
        console.error("Error fetching group:", error);
        setError("Failed to load group members");
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [groupId]);

  // Sort members: owner first, then alphabetically by first name
  // even if ownership changes, owner is always first in the
  const sortedMembers = group?.members ? [...group.members].sort((a, b) => {
    // Owner always comes first
    if (a.role === 'owner') return -1;
    if (b.role === 'owner') return 1;
    // Then sort alphabetically by first name
    return a.userId.firstName.localeCompare(b.userId.firstName);
  }) : [];

  if (loading) return <div>Loading members...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!group) return <div>Group not found</div>;

  return (
    <div className="members-list">
      <h3 className="text-xl font-bold mb-4">Group Members</h3>
      {sortedMembers.length > 0 ? (
        <div className="space-y-3">
          {sortedMembers.map((member) => (
            <div key={member.userId._id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="member-info">
                <div className="member-name font-medium">
                  {member.userId.firstName} {member.userId.lastName}
                </div>
                <div className="member-email text-gray-500 text-sm">
                  {member.userId.email}
                </div>
              </div>
              
              {/* Owner/Member Label */}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                member.role === 'owner' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {member.role === 'owner' ? '👑 Owner' : '👤 Member'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No members in this group yet.</p>
      )}
    </div>
  );
};

export default GroupMembersList;