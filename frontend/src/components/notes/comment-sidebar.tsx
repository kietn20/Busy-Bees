"use client";

import React, { useEffect, useRef, useState } from "react";

export interface NoteComment {
  id?: string;
  _id?: string;
  content: string;
  highlightedText?: string;
  blockId?: string | null;
  userId: string | { _id?: string }; // author id (backend uses userId)
  authorName?: string; // optional prefilled name
  createdAt?: string; // ISO date string
  replies?: NoteComment[];
  parentCommentId?: string | null; // used to thread replies under parents
}

interface CommentSidebarProps {
  comments: NoteComment[];
  loading: boolean;
  onAddComment: () => void;
  onDeleteComment: (commentId: string) => void;
  onEditComment?: (commentId: string, newText: string) => Promise<void>;
  onReplyComment?: (parentCommentId: string, text: string) => Promise<void>;
  currentUserId?: string | null;
  groupOwnerId?: string | null; // for delete permission
  /**
   * Optional: if your backend doesn't expose /api/users/:id, pass a function that
   * takes a userId and returns { displayName } or null. If omitted we'll try /api/users/:id.
   */
  resolveUserName?: (userId: string) => Promise<string | null>;
}

// Internal threaded type (same fields, but replies are also ThreadedComment)
type ThreadedComment = NoteComment & { replies?: ThreadedComment[] };

export default function CommentSidebar({
  comments,
  loading,
  onAddComment,
  onDeleteComment,
  onEditComment,
  onReplyComment,
  currentUserId,
  groupOwnerId,
  resolveUserName,
}: CommentSidebarProps) {
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [nameCache, setNameCache] = useState<Record<string, string>>({});
  const replyInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<
    Record<string, boolean>
  >({});

  // helper to get stable id
  const getId = (c: NoteComment) => c.id ?? c._id ?? "";

  // Get author id string from comment (handles object or string)
  const getAuthorId = (c: NoteComment) =>
    typeof c.userId === "string" ? c.userId : c.userId?._id ?? "";

  // Flatten all comments + replies for name preloading
  const flattenComments = (items: NoteComment[]): NoteComment[] => {
    const result: NoteComment[] = [];
    const traverse = (c: NoteComment) => {
      result.push(c);
      if (c.replies && c.replies.length) {
        c.replies.forEach(traverse);
      }
    };
    items.forEach(traverse);
    return result;
  };

  // fetch user display name if missing. caches results
  const fetchAuthorName = async (userId: string) => {
    if (!userId) return null;
    if (nameCache[userId]) return nameCache[userId];

    // If a custom resolver was passed, use it
    if (resolveUserName) {
      try {
        const resolved = await resolveUserName(userId);
        if (resolved) {
          setNameCache((s) => ({ ...s, [userId]: resolved }));
          return resolved;
        }
      } catch (e) {
        // ignore and fallback to local fetch
      }
    }

    // Default fetch: attempt /api/users/:id (adjust if your endpoint differs)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        credentials: "include",
      });
      if (!res.ok) return null;
      const data = await res.json();
      const name =
        data?.user?.firstName && data?.user?.lastName
          ? `${data.user.firstName} ${data.user.lastName}`
          : data?.user?.email ?? null;
      if (name) setNameCache((s) => ({ ...s, [userId]: name }));
      return name;
    } catch (err) {
      // ignore
      return null;
    }
  };

  // Preload missing author names for all comments and replies.
  useEffect(() => {
    (async () => {
      const all = flattenComments(comments);
      const missingIds = all
        .map(getAuthorId)
        .filter((id) => id && !nameCache[id]) as string[];
      const unique = Array.from(new Set(missingIds));
      for (const id of unique) {
        await fetchAuthorName(id);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments]);

  const formatAuthorAndDate = (c: NoteComment) => {
    const authorId = getAuthorId(c);
    // Prefer cached name (from userId) over authorName to avoid stale/misassigned names
    const nameFromCache = authorId ? nameCache[authorId] : undefined;
    const name = nameFromCache ?? c.authorName ?? "Busy Bees";
    if (!c.createdAt) return `${name}`;
    try {
      const d = new Date(c.createdAt);
      const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };
      const s = d.toLocaleDateString(undefined, options);
      return `${name} on ${s}`;
    } catch {
      return name;
    }
  };

  // Permission helpers
  const isAuthor = (c: NoteComment) => {
    const authorId = getAuthorId(c);
    return currentUserId && authorId && currentUserId === authorId;
  };
  const canDeleteComment = (c: NoteComment) =>
    isAuthor(c) || (groupOwnerId && currentUserId === groupOwnerId);

  const startEdit = (c: NoteComment) => {
    setEditingId(getId(c));
    setEditingText(c.content);
    setOpenMenuFor(null);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };
  const saveEdit = async () => {
    if (!editingId || !onEditComment) return;
    const t = editingText.trim();
    if (!t) return;
    try {
      await onEditComment(editingId, t);
      setEditingId(null);
      setEditingText("");
    } catch (err) {
      console.error("Edit failed", err);
    }
  };

  const startReply = (c: NoteComment) => {
    setReplyingTo(getId(c));
    setReplyText("");
    setOpenMenuFor(null);
    setTimeout(() => replyInputRef.current?.focus(), 50);
  };
  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
  };
  const sendReply = async (parentCommentId: string) => {
    const t = replyText.trim();
    if (!t || !onReplyComment) return;
    try {
      await onReplyComment(parentCommentId, t);
      setReplyingTo(null);
      setReplyText("");
    } catch (err) {
      console.error("Reply failed", err);
    }
  };

  // ---- Helper: flatten all descendants of a root into a single list and sort by createdAt ----
  const collectReplies = (root: ThreadedComment): ThreadedComment[] => {
    const result: ThreadedComment[] = [];

    const traverse = (node: ThreadedComment) => {
      if (node.replies && node.replies.length > 0) {
        for (const child of node.replies) {
          result.push(child);
          traverse(child);
        }
      }
    };

    traverse(root);

    result.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return ta - tb;
    });

    return result;
  };

  // ---- Renderer for a single comment row (no recursive nesting) ----
  const renderComment = (c: ThreadedComment, depth = 0) => {
    const id = getId(c) || Math.random().toString();
    const authorLine = formatAuthorAndDate(c);
    const editable = isAuthor(c);
    const deletable = canDeleteComment(c);

    // one visual indent level for any reply (depth > 0)
    const visualDepth = depth > 0 ? 1 : 0;

    const containerClasses =
      "border rounded-md p-3 bg-gray-50" +
      (visualDepth === 1 ? " mt-2 ml-4" : "");

    return (
      <div key={id} className={containerClasses}>
        {/* header */}
        <div className="flex items-start justify-between">
          <div className="text-xs text-gray-600 font-medium break-words">
            {authorLine}
          </div>

          <div className="relative">
            <button
              onClick={() =>
                setOpenMenuFor((prev) => (prev === id ? null : id))
              }
              className="p-1 rounded hover:bg-gray-100"
              aria-label="comment options"
            >
              <svg
                className="w-4 h-4 text-gray-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>

            {openMenuFor === id && (
              <div
                className="absolute right-0 mt-2 w-36 bg-white border rounded shadow-md z-20"
                onMouseLeave={() => setOpenMenuFor(null)}
              >
                {editable && (
                  <button
                    onClick={() => startEdit(c)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Edit
                  </button>
                )}

                {onReplyComment && (
                  <button
                    onClick={() => startReply(c)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Reply
                  </button>
                )}

                {deletable && (
                  <button
                    onClick={() => onDeleteComment(id)}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* content / edit UI */}
        <div className="mt-2">
          {editingId === id ? (
            <div className="space-y-2">
              <textarea
                className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                rows={4}
                value={editingText}
                onChange={(e) => setEditingText(e.target.value.slice(0, 250))}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="px-3 py-1 text-sm rounded bg-yellow-400 hover:bg-yellow-300 text-black"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
              {c.content}
            </p>
          )}
        </div>

        {/* reply editor */}
        {replyingTo === id && (
          <div className="mt-3 space-y-2">
            <textarea
              ref={replyInputRef}
              className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
              rows={3}
              value={replyText}
              onChange={(e) =>
                setReplyText(e.target.value.slice(0, 250))
              }
              placeholder="Write a reply..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelReply}
                className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => sendReply(id)}
                className="px-3 py-1 text-sm rounded bg-yellow-400 hover:bg-yellow-300 text-black"
              >
                Reply
              </button>
            </div>
          </div>
        )}

        {/* NOTE: replies are rendered in a flat list per thread, not recursively here. */}
      </div>
    );
  };

  return (
    <aside
      className="flex-none w-80 md:w-96 border-l bg-white h-[calc(100vh-4rem)] overflow-hidden flex flex-col"
      style={{ minWidth: 280 }}
      aria-label="Comments Sidebar"
    >
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Comments</h2>
        </div>

        <button
          type="button"
          onClick={onAddComment}
          className="bg-yellow-400 text-black px-3 py-1.5 rounded-md text-sm font-medium hover:bg-yellow-300"
        >
          Add Comment
        </button>
      </div>

      <div className="px-4 py-3 overflow-y-auto flex-1 space-y-3">
        {loading && (
          <p className="text-sm text-gray-500">Loading comments.</p>
        )}
        {!loading && comments.length === 0 && (
          <p className="text-sm text-gray-500">No comments yet.</p>
        )}

        {!loading &&
          (comments as ThreadedComment[]).map((root) => {
            const rootId = getId(root) || Math.random().toString();
            const flatReplies = collectReplies(root);
            const replyCount = flatReplies.length;
            const isExpanded = expandedThreads[rootId] ?? false;

            const toggleThread = () => {
              setExpandedThreads((prev) => ({
                ...prev,
                [rootId]: !isExpanded,
              }));
            };

            return (
              <div key={rootId} className="space-y-2">
                {/* Parent comment (thread root) */}
                {renderComment(root, 0)}

                {/* Toggle button for replies, if any exist */}
                {replyCount > 0 && (
                  <button
                    type="button"
                    onClick={toggleThread}
                    className="ml-4 mt-1 text-xs text-blue-600 hover:underline"
                  >
                    {isExpanded
                      ? "Hide replies"
                      : `Show ${replyCount} repl${
                          replyCount === 1 ? "y" : "ies"
                        }`}
                  </button>
                )}

                {/* All replies for this thread:
                    one indent level, chronological order — only when expanded */}
                {isExpanded &&
                  flatReplies.map((reply) => renderComment(reply, 1))}
              </div>
            );
          })}
      </div>
    </aside>
  );
}
