import React, { useEffect, useState } from "react";
import { getGroupWithMembers, PopulatedCourseGroup } from "@/services/groupApi";

interface GroupMembersListProps {
  groupId: string;
}

const MEMBER_ROW_HEIGHT = 78; // px, adjust as needed
const VISIBLE_ROWS = 5;

const GroupMembersList = ({ groupId }: GroupMembersListProps) => {
  const [group, setGroup] = useState<PopulatedCourseGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true);
        const groupData = await getGroupWithMembers(groupId);
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

  const sortedMembers = group?.members ? [...group.members].sort((a, b) => {
    if (a.role === 'owner') return -1;
    if (b.role === 'owner') return 1;
    return a.userId.firstName.localeCompare(b.userId.firstName);
  }) : [];

  const owner = sortedMembers.find(m => m.role === "owner");
  const otherMembers = sortedMembers.filter(m => m.role !== "owner");

  if (loading) return <div>Loading members...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!group) return <div>Group not found</div>;

  return (
    <div className="members-list">
      <h3 className="text-xl font-bold mb-4">Group Members</h3>
      {owner && (
        <div className="flex items-center justify-between p-4 border rounded-lg mb-2">
          <div>
            <div className="font-medium">{owner.userId.firstName} {owner.userId.lastName}</div>
            <div className="text-gray-500 text-sm">{owner.userId.email}</div>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            👑 Owner
          </span>
        </div>
      )}

      {otherMembers.length > 0 && (
        <div>
          <button
            className="text-blue-600 hover:underline mb-2"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "Show members" : "Hide members"}
          </button>
          {!collapsed && (
            <div
              className="space-y-3 overflow-y-auto"
              style={{
                maxHeight: `${MEMBER_ROW_HEIGHT * VISIBLE_ROWS}px`
              }}
            >
              {otherMembers.map(member => (
                <div key={member.userId._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{member.userId.firstName} {member.userId.lastName}</div>
                    <div className="text-gray-500 text-sm">{member.userId.email}</div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    👤 Member
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {otherMembers.length === 0 && <p className="text-gray-500">No other members in this group yet.</p>}
    </div>
  );
};

export default GroupMembersList;