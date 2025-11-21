import React from "react";

export interface NoteComment {
  _id: string;
  text: string;
  highlightedText?: string;
  blockId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface CommentSidebarProps {
  comments: NoteComment[];
  loading: boolean;
  onAddComment: () => void;
  onDeleteComment: (commentId: string) => void;
}

export default function CommentSidebar({
  comments,
  loading,
  onAddComment,
  onDeleteComment,
}: CommentSidebarProps) {
  return (
    <div className="w-80 border-l bg-white p-4 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Comments</h2>

      {loading && <p>Loading comments...</p>}

      {!loading && comments.length === 0 && (
        <p className="text-gray-500">No comments yet.</p>
      )}

      <div className="space-y-4">
        {comments.map((c) => (
          <div
            key={c._id}
            className="border rounded-md p-3 bg-gray-50"
          >
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {c.text}
            </p>

            {c.highlightedText && (
              <p className="text-xs text-gray-500 mt-1 italic">
                ↳ {c.highlightedText}
              </p>
            )}

            <div className="flex justify-end mt-2">
              <button
                className="text-red-600 text-xs hover:underline"
                onClick={() => onDeleteComment(c._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        className="mt-6 w-full bg-yellow-400 text-black py-2 rounded-md font-medium"
        onClick={onAddComment}
      >
        Add Comment
      </button>
    </div>
  );
}
