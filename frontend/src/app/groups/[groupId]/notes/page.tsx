"use client";
import { Plus } from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import CreateNoteModal from "@/components/notes/CreateNoteModal";
import { getNotesByGroup, getNoteById } from "@/services/noteApi";
import { Note } from "@/services/noteApi";
import SidebarNotes from "@/components/notes/sidebar-notes";
import Editor from "@/components/notes/editor";
import { Block } from "@blocknote/core";
import { Button } from "@/components/ui/button";

export default function NotesList() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const groupId = params.groupId as string;
  const selectedNoteId = searchParams.get("noteId");

  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchSelectedNote = useCallback(
    async (noteId: string) => {
      setIsNoteLoading(true);
      try {
        const response = await getNoteById(groupId, noteId);
        setSelectedNote(response.note);
      } catch (err) {
        console.error("Failed to load selected note:", err);
      } finally {
        setIsNoteLoading(false);
      }
    },
    [groupId]
  );

  const fetchNotes = useCallback(async () => {
    if (!groupId) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await getNotesByGroup(groupId);
      setNotes(response.notes);
    } catch {
      setError("Failed to load notes.");
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  const handleNoteSelect = useCallback(
    (noteId: string) => {
      router.push(`/groups/${groupId}/notes?noteId=${noteId}`);
    },
    [router, groupId]
  );

  useEffect(() => {
    fetchNotes();
  }, [groupId, fetchNotes]);

  useEffect(() => {
    if (selectedNoteId && notes.length > 0) {
      fetchSelectedNote(selectedNoteId);
    }
  }, [selectedNoteId, notes.length, fetchSelectedNote]);

  const parseContent = (content: string): Block[] | undefined => {
    try {
      return JSON.parse(content);
    } catch {
      return [
        {
          id: "initial-block",
          type: "paragraph",
          props: {
            textColor: "default",
            backgroundColor: "default",
            textAlignment: "left",
          },
          content: [
            {
              type: "text",
              text: content,
              styles: {},
            },
          ],
          children: [],
        },
      ];
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading notes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 border-r bg-gray-50">
        <div className="p-4 border-b h-16">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">All Notes</h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="p-2 rounded-lg bg-white hover:bg-gray-100 border cursor-pointer"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {notes.length === 0 ? (
          <div className="py-6 text-center text-gray-500">
            No notes yet. Create one!
          </div>
        ) : (
          <SidebarNotes
            notes={notes}
            selectedNoteId={selectedNoteId}
            onNoteSelect={handleNoteSelect}
          />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {selectedNote ? (
          <>
            <div className="p-4 border-b h-16 flex justify-end">
              <Button
                onClick={() =>
                  router.push(`/groups/${groupId}/notes/${selectedNote._id}`)
                }
                variant="outline"
              >
                View in Fullscreen
              </Button>
            </div>
            {/* Note Header */}
            <div className="p-6 border-b bg-white">
              <h1 className="text-3xl font-bold mb-4">{selectedNote.title}</h1>
              <div className="w-64">
                <div className="grid grid-cols-2 mb-2">
                  <h4 className="text-gray-500">Created by:</h4>
                  <span>
                    {selectedNote.userId.firstName}{" "}
                    {selectedNote.userId.lastName}
                  </span>
                </div>
                <div className="grid grid-cols-2 mb-2">
                  <h4 className="text-gray-500">Last modified:</h4>
                  <span>
                    {new Date(selectedNote.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Note Content */}
            <div className="flex-1 py-4 bg-white overflow-y-auto overflow-x-hidden">
              {isNoteLoading ? (
                <div className="flex items-center justify-center h-32">
                  Loading note content...
                </div>
              ) : (
                <Editor
                  initialContent={parseContent(selectedNote.content)}
                  editable={false}
                  onChange={() => {}}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">
                {notes.length > 0
                  ? "Select a note to view"
                  : "No notes available"}
              </h2>
              {notes.length > 0 && (
                <p className="text-sm">
                  Choose a note from the sidebar to start reading
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <CreateNoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        groupId={groupId}
        onNoteCreated={fetchNotes}
      />
    </div>
  );
}
