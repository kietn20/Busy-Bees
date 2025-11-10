import * as React from "react";

import { CourseSwitcher } from "@/components/course-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronUp, User2 } from "lucide-react";
import LogoutButton from "./logout-button";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Workspace",
      url: "#",
      items: [
        {
          title: "Notes",
          url: "/groups/[groupId]/notes",
        },
        {
          title: "Flashcards",
          url: "/groups/[groupId]/flashcards",
        },
        {
          title: "Events",
          url: "/groups/[groupId]/events",
        },
      ],
    },
    {
      title: "Favorites",
      url: "#",
      items: [
        {
          title: "Notes 1",
          url: "#",
        },
        {
          title: "Notes 2",
          url: "#",
          isActive: true,
        },
      ],
    },
  ],
};

export function AppSidebar({ currentGroupId, ...props }: React.ComponentProps<typeof Sidebar> & { currentGroupId?: string }) {
  // Update navigation items with current group ID
  const navMainWithGroupId = data.navMain.map(section => ({
    ...section,
    items: section.items.map(item => ({
      ...item,
      url: currentGroupId ? item.url.replace('[groupId]', currentGroupId) : item.url
    }))
  }))

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <CourseSwitcher currentGroupId={currentGroupId} />
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {navMainWithGroupId.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>{item.title}</a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> Username
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-60">
                <DropdownMenuItem>
                  <a href={"/account"}>Account</a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <a href={"#"}>Billing</a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogoutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
