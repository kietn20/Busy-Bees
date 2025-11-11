"use client";
import React, { useState } from "react";
import {
  StickyNote,
  BookOpen,
  Calendar,
  MessageCircle,
  Reply,
} from "lucide-react";

const GroupActivity = () => {
  const [activities] = useState([
    {
      id: 1,
      type: "comment",
      categoryLabel: "Comments",
      user: "Sarah Chen",
      content: "commented on Meeting Notes - Q4 Planning",
      timestamp: "12:45 AM",
    },
    {
      id: 2,
      type: "reply",
      categoryLabel: "Comments",
      user: "Mike Rodriguez",
      content: "replied to your comment on Project Ideas",
      timestamp: "Aug 16",
    },
    {
      id: 3,
      type: "flashcard",
      categoryLabel: "Flashcards",
      user: "Emma Davis",
      content: "created flashcard set Spanish Vocabulary",
      timestamp: "Nov 1",
    },
    {
      id: 4,
      type: "note",
      categoryLabel: "Notes",
      user: "Test Test",
      content: "updated note Biology Chapter 5 Notes",
      timestamp: "Nov 1",
    },
    {
      id: 5,
      type: "event",
      categoryLabel: "Events",
      user: "Alex Johnson",
      content: "scheduled event Team Standup",
      timestamp: "Nov 1",
    },
    {
      id: 6,
      type: "comment",
      categoryLabel: "Comments",
      user: "Jordan Lee",
      content: "commented on Book Summary - Atomic Habits",
      timestamp: "Nov 1",
    },
    {
      id: 7,
      type: "flashcard",
      categoryLabel: "Flashcards",
      user: "Taylor Kim",
      content: "created flashcard set History Timeline",
      timestamp: "Nov 1",
    },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case "flashcard":
        return <BookOpen className="w-5 h-5 text-gray-700" />;
      case "note":
        return <StickyNote className="w-5 h-5 text-gray-700" />;
      case "event":
        return <Calendar className="w-5 h-5 text-gray-700" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-gray-700" />;
      case "reply":
        return <Reply className="w-5 h-5 text-gray-700" />;
      default:
        return <StickyNote className="w-5 h-5 text-gray-700" />;
    }
  };

  return (
    <div className="p-4">
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="relative flex items-start gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-2xl bg-white flex items-center justify-center`}
            >
              {getIcon(activity.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-medium text-gray-500">
                  {activity.categoryLabel}
                </span>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {activity.timestamp}
                </span>
              </div>

              <p className="text-sm text-gray-900 leading-snug">
                <span className="font-semibold">{activity.user}</span>{" "}
                {activity.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupActivity;
