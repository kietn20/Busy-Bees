"use client";

import * as React from "react";
import { Check, ChevronsUpDown, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { getUserGroups } from "@/services/groupApi";
import { useAuth } from "@/context/AuthContext";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  const [groups, setGroups] = React.useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  React.useEffect(() => {
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
          setSelectedGroup(currentGroup || userGroups[0] || null);
        } else {
          setSelectedGroup(userGroups[0] || null);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [currentGroupId, user, authLoading]);

  const handleGroupChange = (group: any) => {
    setSelectedGroup(group);
    router.push(`/groups/${group.courseId}`);
  };

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <BookOpen className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-medium">Loading...</span>
              <span className="text-xs text-muted-foreground">Course</span>
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

  if (groups.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <BookOpen className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-medium">No Groups</span>
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
              <div className="">
                <span className="font-medium">{selectedGroup.courseName}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) bg-white"
            align="start"
          >
            {groups.map((group) => (
              <DropdownMenuItem
                key={group._id}
                onSelect={() => handleGroupChange(group)}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{group.courseName}</span>
                </div>
                {group._id === selectedGroup._id && (
                  <Check className="ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
