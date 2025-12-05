"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronsUpDown,
  BookOpen,
  Settings,
  UserPlus,
  LogOut,
  Users,
  Home,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getUserGroups,
  getGroupById,
  type CourseGroup,
} from "@/services/groupApi";
import { useAuth } from "@/context/AuthContext";
import { generateInvite } from "@/services/groupApi";
import { InviteModal } from "@/components/InviteModal";
import LeaveModal from "@/components/coursegroup/leave-modal";
import { toast } from "react-hot-toast";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function CourseSwitcher({
  currentGroupId,
}: {
  currentGroupId?: string;
}) {
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CourseGroup | null>(null);
  const [fullGroupData, setFullGroupData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isInviteLoading, setIsInviteLoading] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      if (authLoading) {
        return;
      }

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userGroups = await getUserGroups();
        setGroups(userGroups);

        // Set selected group based on currentGroupId or default to first group
        if (currentGroupId) {
          const currentGroup = userGroups.find((g) => g._id === currentGroupId);
          if (currentGroup) {
            setSelectedGroup(currentGroup);
          } else {
            setSelectedGroup(userGroups[0] || null);
            // If currentGroupId doesn't exist in user's groups, redirect to first available group
            if (userGroups.length > 0) {
              router.replace(`/groups/${userGroups[0]._id}`);
            }
          }
        } else {
          setSelectedGroup(userGroups[0] || null);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        toast.error("Failed to load groups.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [currentGroupId, user, authLoading, router]);

  // Fetch full group data when selectedGroup changes
  useEffect(() => {
    const fetchFullGroupData = async () => {
      if (!selectedGroup?._id) {
        setFullGroupData(null);
        return;
      }

      try {
        const fullGroup = await getGroupById(selectedGroup._id);
        setFullGroupData(fullGroup);
      } catch (error) {
        console.error("Error fetching full group data:", error);
        setFullGroupData(null);
      }
    };

    fetchFullGroupData();
  }, [selectedGroup]);

  const handleGroupChange = (group: CourseGroup) => {
    if (group._id === selectedGroup?._id) return;

    setSelectedGroup(group);
    router.push(`/groups/${group._id}`);
    toast.success(`Switched to ${group.groupName}.`);
  };

  const handleGenerateInvite = async () => {
    if (!selectedGroup) {
      toast.error("No group selected.");
      return;
    }

    setIsModalOpen(true);
    if (inviteCode) return;

    setIsInviteLoading(true);
    try {
      const response = await generateInvite(selectedGroup._id);
      setInviteCode(response.data.inviteCode);
      toast.success("Invite code generated.");
    } catch (err) {
      console.error("Failed to generate invite code:", err);
      toast.error("Failed to generate invite code.");
      setIsModalOpen(false); // Close modal on error
    } finally {
      setIsInviteLoading(false);
    }
  };

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg animate-pulse">
              <BookOpen className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-medium">Loading groups...</span>
              <span className="text-xs text-muted-foreground">Please wait</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <BookOpen className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-medium">Not Logged In</span>
              <span className="text-xs text-muted-foreground">Course</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!selectedGroup) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <BookOpen className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-medium">No Selection</span>
              <span className="text-xs text-muted-foreground">Course</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <>
      <InviteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        inviteCode={inviteCode}
        isLoading={isInviteLoading}
      />
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <BookOpen className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium truncate">
                    {selectedGroup.groupName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {groups.length} group{groups.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-64" align="start">
              <DropdownMenuItem
                onClick={() => router.push("/")}
                className="cursor-pointer"
              >
                <Home className="mr-2 h-4 w-4" />
                <span>All Groups</span>
              </DropdownMenuItem>
              {user &&
                fullGroupData?.members?.find(
                  (member: { userId: { _id: string }; role: string }) =>
                    member.userId._id === user.id && member.role === "owner"
                ) && (
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/groups/${selectedGroup._id}/edit`)
                    }
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Group Settings</span>
                  </DropdownMenuItem>
                )}
              <DropdownMenuItem
                onClick={handleGenerateInvite}
                className="cursor-pointer"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Invite People</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <LeaveModal groupId={selectedGroup._id}>
                  <div className="flex items-center cursor-pointer">
                    <LogOut className="mr-4 h-4 w-4" />
                    <span>Leave Group</span>
                  </div>
                </LeaveModal>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <div className="px-2 py-1">
                <span className="text-[0.70rem] font-medium text-muted-foreground uppercase tracking-wider">
                  Switch Group
                </span>
              </div>
              {groups.map((group) => (
                <DropdownMenuItem
                  key={group._id}
                  onSelect={() => handleGroupChange(group)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">{group.groupName}</span>
                    </div>
                  </div>
                  {group._id === selectedGroup._id && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
