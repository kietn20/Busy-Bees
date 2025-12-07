"use client";
import React, { useEffect, useState } from "react";
import {
  StickyNote,
  BookOpen,
  Calendar,
  MessageCircle,
  Reply,
} from "lucide-react";
import { formatDistanceToNow, differenceInDays, format } from "date-fns";
import { useParams } from "next/navigation";
import { getGroupActivity, GroupActivityItem } from "@/services/groupApi";

const GroupActivity = () => {
  const params = useParams();
  const groupId = params?.groupId as string | undefined;

  const [activities, setActivities] = useState<GroupActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!groupId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getGroupActivity(groupId);
        setActivities(data || []);
      } catch (err: any) {
        console.error("Error fetching group activity", err);
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load activity"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [groupId]);

  const getIcon = (kind: string) => {
    switch (kind) {
      case "flashcardSet":
        return <BookOpen className="w-5 h-5 text-foreground" />;
      case "note":
        return <StickyNote className="w-5 h-5 text-foreground" />;
      case "event":
        return <Calendar className="w-5 h-5 text-foreground" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-foreground" />;
      default:
        return <MessageCircle className="w-5 h-5 text-foreground" />;
    }
  };

  const getVerb = (activity: GroupActivityItem) => {
    if (activity.kind === "comment") {
      if (activity.isEdited)
        return activity.isReply ? "edited a reply on" : "edited a comment on";
      return activity.isReply ? "replied to a comment on" : "commented on";
    }

    if (activity.isEdited) return "edited";
    switch (activity.kind) {
      case "flashcardSet":
        return "added";
      case "note":
        return "created";
      case "event":
        return "created";
      default:
        return "updated";
    }
  };

  const truncateText = (text?: string, max = 80) => {
    if (!text) return "";
    if (text.length <= max) return text;
    return text.slice(0, max - 1).trimEnd() + "…";
  };

  const renderTimestamp = (ts?: string) => {
    if (!ts) return "";
    try {
      const d = new Date(ts);
      const now = new Date();
      const days = differenceInDays(now, d);
      if (days < 7) {
        return formatDistanceToNow(d, { addSuffix: true });
      }

      // older than a week: show short date, include year if not current year
      if (d.getFullYear() !== now.getFullYear()) {
        return format(d, "MMM d, yyyy");
      }
      return format(d, "MMM d");
    } catch {
      return ts;
    }
  };

  return (
    <div className="p-4">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl animate-pulse"
            >
              <div className="w-10 h-10 rounded-2xl bg-white" />
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="relative flex items-start gap-4 p-4 bg-accent/40 rounded-2xl hover:bg-accent/60 transition-colors cursor-pointer"
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-2xl bg-white flex items-center justify-center`}
              >
                {activity.isReply ? (
                  <Reply className="w-5 h-5" />
                ) : (
                  getIcon(activity.kind)
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {activity.categoryLabel}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {renderTimestamp(activity.timestamp)}
                  </span>
                </div>

                <p className="text-sm  leading-snug min-w-0 overflow-hidden">
                  <span className="inline-block font-semibold align-middle">
                    {activity.user
                      ? `${activity.user.firstName || ""} ${
                          activity.user.lastName || ""
                        }`.trim()
                      : "Someone"}
                  </span>{" "}
                  <span className="inline-block align-middle">
                    {getVerb(activity)}
                  </span>{" "}
                  <span
                    className="inline-block align-middle truncate max-w-full"
                    title={activity.content}
                  >
                    {truncateText(activity.content, 90)}
                  </span>
                </p>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No recent activity
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupActivity;
