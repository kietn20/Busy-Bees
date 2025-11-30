"use client";

import Editor from "@/components/notes/editor";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { deleteNote, getNoteById, updateNote } from "@/services/noteApi";
import { getGroupById, getGroupWithMembers } from "@/services/groupApi";
import { Note } from "@/services/noteApi";
import { CourseGroup, PopulatedCourseGroup } from "@/services/groupApi";
import { Block } from "@blocknote/core";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import CollaboratorModal from "@/components/notes/CollaboratorModal";
import OCRButton from "@/components/notes/OCRButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";
import { generateFlashcardsFromNote } from "@/services/flashcardApi";
import CommentSidebar, { NoteComment } from "@/components/notes/comment-sidebar";
import { CommentInputModal } from "@/components/notes/CommentModal";

export default function NoteDetailPage() {
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState<Block[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [group, setGroup] = useState<PopulatedCourseGroup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [numFlashcards, setNumFlashcards] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [commentModalOpen, setCommentModalOpen] = useState(false);

  // comment state
  const [comments, setComments] = useState<NoteComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);

  // delete-confirmation state for comments
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);

  // ⬇️ changed: also grab token from auth context
  const { user, token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const noteId = params.id as string;

  const parseContent = (content: string | Block[] | null | undefined) => {
    if (!content) return [];
    if (Array.isArray(content)) return content;
    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (err) {
      console.error("Failed to parse content", err);
      return [];
    }
  };

  const fetchNote = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [noteResponse, groupResponse] = await Promise.all([
        getNoteById(groupId, noteId),
        getGroupWithMembers(groupId),
      ]);
      setNote(noteResponse.note);
      setGroup(groupResponse);
      setEditedTitle(noteResponse.note.title);
      setEditedContent(parseContent(noteResponse.note.content) || []);
    } catch (err) {
      toast.error("Failed to load note data. You may not have permission.");
      setError("Failed to load note data. You may not have permission.");
    } finally {
      setIsLoading(false);
    }
  };

  // Attach Authorization header if a JWT token is present
  const buildAuthHeaders = (extra: HeadersInit = {}) => {
    const headers: Record<string, string> = {
      ...(extra as Record<string, string>),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchComments = async () => {
    if (!groupId || !noteId) return;
    try {
      setCommentsLoading(true);

      const res = await fetch(
        `http://localhost:8080/api/groups/${groupId}/notes/${noteId}/comments`,
        {
          credentials: "include",
          headers: buildAuthHeaders(),
        }
      );

      if (!res.ok) {
        console.error("Failed to fetch comments", await res.text());
        return;
      }

      const data = await res.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (!groupId || !noteId) return;

    const fetchData = async () => {
      try {
        // fetch note and group data in parallel
        const [noteResponse, groupResponse] = await Promise.all([
          getNoteById(groupId, noteId),
          getGroupWithMembers(groupId),
        ]);

        setNote(noteResponse.note);
        setGroup(groupResponse);

        setEditedTitle(noteResponse.note.title);
        setEditedContent(parseContent(noteResponse.note.content) || []);
      } catch (err) {
        toast.error("Failed to load note data. You may not have permission.");
        setError("Failed to load note data. You may not have permission.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, noteId]);

  // Logic to check if current user is a collaborator
  const isCollaborator = note?.collaborators?.some(
    (collab) => collab._id === user?.id
  );

  const isAuthor = user && note && user.id === note.userId._id;

  const isGroupOwner =
    user &&
    group &&
    (typeof group.ownerId === "string"
      ? user.id === group.ownerId
      : user.id === group.ownerId._id);

  // Permission for DELETING (Strict: Author or Group Owner only)
  const canDelete = isAuthor || isGroupOwner;

  // Permission for EDITING (Broad: Author OR Collaborator)
  const canEdit = isAuthor || !!isCollaborator;

  const handleSave = async () => {
    if (!note) return;

    setIsSaving(true);

    try {
      await updateNote(groupId, noteId, {
        title: editedTitle,
        content: JSON.stringify(editedContent),
      });

      setIsEditing(false); // back to view mode
      fetchNote(); // refetch the note to show the saved data
      toast.success("Changes saved.");
    } catch (err) {
      console.error("Failed to save note:", err);
      toast.error("Failed to save note.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!note) return;

    setIsDeleting(true);

    try {
      await deleteNote(groupId, noteId);
      router.push(`/groups/${groupId}/notes`);
      toast.success("Note deleted.");
    } catch (err) {
      console.error("Failed to delete note:", err);
      toast.error("Failed to delete note.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!note) return;

    // reset to original note content
    setEditedTitle(note.title);
    setEditedContent(parseContent(note.content) || []);
    setEditorKey((prev) => prev + 1); // force editor to re-render with original content
    setIsEditing(false);
  };

  const handleGenerate = async () => {
    if (!note) return;

    setIsGenerating(true);

    try {
      const response = await generateFlashcardsFromNote(
        groupId,
        noteId,
        numFlashcards
      );

      setIsGenerating(false);

      if (!response || !Array.isArray(response.flashcards)) {
        toast.error("Failed to generate flashcards.");
        return;
      }

      router.push(
        `/groups/${groupId}/flashcards/create?generated=${encodeURIComponent(
          JSON.stringify(response.flashcards)
        )}`
      );
    } catch (err: any) {
      setIsGenerating(false);
      toast.dismiss();
      toast.error(
        "Generation failed. Add more notes or reduce number of flashcards."
      );
    }
  };

  // Handler for OCR result (original version, with safe cast)
  const handleOCRResult = (text: string) => {
    // 1. Parse the raw text into BlockNote blocks
    // We split by newlines to preserve some structure
    const newBlocks = text
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => ({
        id: Date.now().toString() + Math.random().toString(), // Temp ID
        type: "paragraph",
        props: {
          textColor: "default",
          backgroundColor: "default",
          textAlignment: "left",
        },
        content: [{ type: "text", text: line, styles: {} }],
        children: [],
      }));

    // 2. Append new blocks to existing content
    setEditedContent((prev) => [...prev, ...newBlocks] as any[]);

    // 3. Force Editor to re-render with new content
    setEditorKey((prev) => prev + 1);
  };

  const handleAddComment = () => {
    setCommentModalOpen(true);
  };

  // submit handler for the modal
  const handleSubmitComment = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/groups/${groupId}/notes/${noteId}/comments`,
        {
          method: "POST",
          credentials: "include",
          headers: buildAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ content: trimmed }),
        }
      );

      if (!res.ok) {
        console.error("Failed to create comment", await res.text());
        toast.error("Failed to create comment.");
        return;
      }

      await fetchComments();
      toast.success("Comment created.");
    } catch (err) {
      console.error("Error creating comment:", err);
      toast.error("Failed to create comment.");
    }
  };

  const handleEditComment = async (commentId: string, newText: string) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/groups/${groupId}/notes/${noteId}/comments/${commentId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: buildAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ content: newText }),
        }
      );
      if (!res.ok) {
        console.error("Failed to update comment", await res.text());
        toast.error("Failed to update comment.");
        return;
      }
      await fetchComments();
      toast.success("Comment updated.");
    } catch (err) {
      console.error("Error updating comment:", err);
      toast.error("Failed to update comment.");
    }
  };

  const handleReplyComment = async (parentId: string, text: string) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/groups/${groupId}/notes/${noteId}/comments`,
        {
          method: "POST",
          credentials: "include",
          headers: buildAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ content: text, parentCommentId: parentId }),
        }
      );
      if (!res.ok) {
        console.error("Failed to create reply", await res.text());
        toast.error("Failed to create reply.");
        return;
      }
      await fetchComments();
      toast.success("Reply added.");
    } catch (err) {
      console.error("Error creating reply:", err);
      toast.error("Failed to create reply.");
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    setIsDeletingComment(true);

    try {
      const res = await fetch(
        `http://localhost:8080/api/groups/${groupId}/notes/${noteId}/comments/${commentToDelete}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: buildAuthHeaders(),
        }
      );

      if (!res.ok) {
        console.error("Failed to delete comment", await res.text());
        toast.error("Failed to delete comment.");
        return;
      }

      // refresh comments after deletion
      await fetchComments();
      toast.success("Comment deleted.");
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast.error("Failed to delete comment.");
    } finally {
      setIsDeletingComment(false);
      setCommentToDelete(null);
    }
  };

  // resolve userId -> "First Last" using PopulatedCourseGroup
  const resolveUserName = async (userId: string): Promise<string | null> => {
    if (!group) return null;
    if (!userId) return null;

    // Owner (PopulatedCourseGroup.ownerId is a populated user object)
    if (group.ownerId && group.ownerId._id === userId) {
      return `${group.ownerId.firstName} ${group.ownerId.lastName}`;
    }

    // Members: each member has userId populated with user fields
    const member = group.members?.find(
      (m) => m.userId && m.userId._id === userId
    );
    if (member) {
      return `${member.userId.firstName} ${member.userId.lastName}`;
    }

    // Fallback: try backend /api/users/:id if available
    try {
      const res = await fetch(
        `http://localhost:8080/api/users/${userId}`,
        { credentials: "include" }
      );
      if (!res.ok) return null;
      const data = await res.json();

      if (data?.firstName && data?.lastName) {
        return `${data.firstName} ${data.lastName}`;
      }
      if (data?.user?.firstName && data?.user?.lastName) {
        return `${data.user.firstName} ${data.user.lastName}`;
      }
      return data?.email ?? data?.user?.email ?? null;
    } catch (err) {
      console.error("Failed to resolve user name", err);
      return null;
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading note...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  if (!note) {
    return <div className="text-center py-12">Note not found.</div>;
  }

  const isOwner =
    user &&
    group &&
    (typeof group.ownerId === "string"
      ? user.id === group.ownerId
      : user.id === group.ownerId._id);

  return (
    <div className="w-full py-12 px-6">
      {/* --- HEADER SECTION --- */}
      <div className="flex justify-between items-center ml-14 pb-4 mb-6">
        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="text-3xl font-bold w-full bg-transparent border-none outline-none"
          />
        ) : (
          <h1 className="text-3xl font-bold">{note.title}</h1>
        )}
        <div className="flex items-center space-x-2">
          {!isEditing && (
            <>
              {isAuthor && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsShareModalOpen(true)}
                  title="Manage Collaborators"
                >
                  <Users className="h-4 w-4" />
                </Button>
              )}

              {/* Edit button: Author or Collaborator */}
              {canEdit && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  disabled={isSaving}
                >
                  Edit
                </Button>
              )}

              {/* Generate flashcards button */}
              <AlertDialog
                open={showGenerateDialog}
                onOpenChange={setShowGenerateDialog}
              >
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={isGenerating}>
                    Generate Flashcards
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Generate Flashcards</AlertDialogTitle>
                    <AlertDialogDescription>
                      Enter how many flashcards you want to generate from this
                      note.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium">
                      Number of Flashcards
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={numFlashcards}
                      onChange={(e) =>
                        setNumFlashcards(Number(e.target.value))
                      }
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleGenerate}
                      disabled={isGenerating}
                    >
                      {isGenerating ? "Generating..." : "Generate"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <OCRButton onOCRResult={handleOCRResult} />
            </>
          )}

          {/* Save / Cancel buttons while editing */}
          {isEditing && (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-yellow-400 hover:bg-yellow-500 text-black"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </>
          )}

          {/* Delete button: Author or Group Owner */}
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the note.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* --- META INFO SECTION --- */}
      <div className="ml-14 mb-4 text-gray-500">
        <p>
          <span className="font-semibold">Created by:</span>{" "}
          {note.userId?.firstName} {note.userId?.lastName}
        </p>
        <p>
          <span className="font-semibold">Last modified:</span>{" "}
          {note.updatedAt
            ? new Date(note.updatedAt).toLocaleDateString()
            : "Unknown"}
        </p>
      </div>

      {/* --- MAIN CONTENT: Editor + Comment Sidebar --- */}
      <div className="min-h-screen pt-6 border-t border-gray-200 flex">
        {/* Editor keeps same styling theme, just gets flex-1 */}
        <div className="flex-1 pr-6">
          <Editor
            key={editorKey}
            onChange={setEditedContent}
            initialContent={isEditing ? editedContent : parseContent(note.content)}
            editable={isEditing}
          />
        </div>

        {/* Comment sidebar on the right */}
        <CommentSidebar
          comments={comments}
          loading={commentsLoading}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onEditComment={handleEditComment}
          onReplyComment={handleReplyComment}
          currentUserId={user?.id}
          groupOwnerId={
            group?.ownerId
              ? typeof group.ownerId === "string"
                ? group.ownerId
                : group.ownerId._id
              : undefined
          }
          resolveUserName={resolveUserName}
        />
      </div>

      {/* Comment input modal (for creating a new top-level comment) */}
      <CommentInputModal
        open={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        onSubmit={async (value) => {
          await handleSubmitComment(value);
          setCommentModalOpen(false);
        }}
      />

      {/* Delete comment confirmation dialog */}
      <AlertDialog
        open={!!commentToDelete}
        onOpenChange={(open) => {
          if (!open) setCommentToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteComment} disabled={isDeletingComment}>
              {isDeletingComment ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {note && group && (
        <CollaboratorModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          note={note}
          group={group}
          onUpdate={(updatedNote) => setNote(updatedNote)}
        />
      )}
    </div>
  );
}
