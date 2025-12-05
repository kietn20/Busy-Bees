"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

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
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getFavorites } from "@/services/accountApi";

const workspaceNav = {
  title: "Workspace",
  url: "#",
  items: [
    { title: "Dashboard", url: "/groups/[groupId]" },
    { title: "Notes", url: "/groups/[groupId]/notes" },
    { title: "Flashcards", url: "/groups/[groupId]/flashcards" },
    { title: "Events", url: "/groups/[groupId]/events" },
  ],
};

export function AppSidebar({
  currentGroupId,
  ...props
}: React.ComponentProps<typeof Sidebar> & { currentGroupId?: string }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<
    Array<{ itemId: string; kind: string; titleSnapshot?: string }>
  >([]);
  const [favLoading, setFavLoading] = useState(false);

  // Update navigation items with current group ID
  const navMainWithGroupId = [workspaceNav].map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      url: currentGroupId
        ? item.url.replace("[groupId]", currentGroupId)
        : item.url,
    })),
  }));

  // load favorites for current course
  useEffect(() => {
    if (!currentGroupId || !user) {
      setFavorites([]);
      return;
    }
    let mounted = true;
    const load = async () => {
      setFavLoading(true);
      try {
        const favs = await getFavorites(currentGroupId);
        if (!mounted) return;
        setFavorites(favs || []);
      } catch (err) {
        console.debug("Failed to load favorites for sidebar:", err);
        if (mounted) setFavorites([]);
      } finally {
        if (mounted) setFavLoading(false);
      }
    };
    load();
    // listen for cross-app favorite changes and reload or update local state
    const handleFavChanged = (e: Event) => {
      try {
        const detail: any = (e as CustomEvent).detail;
        console.debug("sidebar received favorites:changed:", detail);
        if (!detail || detail.courseId !== currentGroupId) return;
        // If an item was removed, optimistically remove it from local state
        if (detail.isFavorited === false) {
          setFavorites((prev) =>
            prev.filter(
              (f) => !(f.kind === detail.kind && f.itemId === detail.itemId)
            )
          );
          return;
        }
        // Otherwise reload to pick up new favorites (we don't have titleSnapshot on add)
        load();
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener("favorites:changed", handleFavChanged);
    return () => {
      mounted = false;
      window.removeEventListener("favorites:changed", handleFavChanged);
    };
  }, [currentGroupId, user]);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <CourseSwitcher currentGroupId={currentGroupId} />
      </SidebarHeader>
      <SidebarContent>
        {navMainWithGroupId.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        pathname === item.url ||
                        (item.title !== "Dashboard" &&
                          pathname.startsWith(item.url + "/"))
                      }
                      className="py-5 pl-6"
                    >
                      <a href={item.url}>{item.title}</a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Favorites group (dynamic) */}
        <SidebarGroup>
          <SidebarGroupLabel>Favorites</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {favLoading ? (
                <SidebarMenuItem>
                  <div className="py-4 pl-6 text-sm text-gray-500">
                    Loading favorites...
                  </div>
                </SidebarMenuItem>
              ) : favorites.length === 0 ? (
                <SidebarMenuItem>
                  <div className="py-4 pl-6 text-sm text-gray-500">
                    No favorites yet
                  </div>
                </SidebarMenuItem>
              ) : (
                favorites.map((f) => {
                  const title =
                    f.titleSnapshot ||
                    (f.kind === "note" ? "Note" : "Flashcard Set");
                  const url =
                    f.kind === "note"
                      ? `/groups/${currentGroupId}/notes/${f.itemId}`
                      : `/groups/${currentGroupId}/flashcards/${f.itemId}`;
                  return (
                    <SidebarMenuItem key={`${f.kind}-${f.itemId}`}>
                      <SidebarMenuButton asChild className="py-5 pl-6">
                        <a href={url} title={title}>
                          <span className="block truncate w-44">{title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {user?.firstName} {user?.lastName}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-60">
                <DropdownMenuItem asChild className="cursor-pointer">
                  <a href={"/account"}>Account</a>
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
