"use client";
import NoteCard from "@/components/notes/NoteCard";
import notesData from "@/lib/notesdata";
import { Plus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
export default function NotesList() {
  const router = useRouter();
  const { groupId } = useParams();
  return (
    <div className="container mx-auto py-12">
      <div className="flex items-center justify-between mb-4 items-centers">
        <h1 className="text-2xl font-bold mb-4">All Notes</h1>
        <button className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 cursor-pointer">
          <Plus className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      {notesData.map((note) => (
        <div key={note.id} className="my-4">
          <NoteCard
            title={note.title}
            content={note.content}
            date={note.date}
            creator={note.creator}
            onClick={() => router.push(`/groups/${groupId}/notes/${note.id}`)}
          />
        </div>
      ))}
    </div>
  );
}
