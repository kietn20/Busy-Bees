"use client";
import NoteCard from "@/components/notes/NoteCard";
import { Plus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import CreateNoteModal from "@/components/notes/CreateNoteModal";
import { getNotesByGroup } from "@/services/noteApi";
import { Note } from "@/services/noteApi";

export default function NotesList() {
	const router = useRouter();
	const params = useParams();
	const groupId = params.groupId as string;

	const [notes, setNotes] = useState<Note[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	const fetchNotes = async () => {
		if (!groupId) return;
		setIsLoading(true);
		setError(null);

		try {
			const response = await getNotesByGroup(groupId);
			setNotes(response.notes);
		} catch (err) {
			setError("Failed to load notes.");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchNotes();
	}, [groupId]);

	return (
		<div className="container mx-auto py-12">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-2xl font-bold">All Notes</h1>
				<button
					onClick={() => setIsCreateModalOpen(true)}
					className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 cursor-pointer"
				>
					<Plus className="w-4 h-4 text-gray-500" />
				</button>
			</div>

			{isLoading && <p>Loading notes...</p>}

			{error && <p className="text-red-500">{error}</p>}

			{!isLoading && !error && notes.length === 0 && (
				<p>No notes yet. Create one!</p>
			)}

			{notes.map((note) => (
				<div key={note._id} className="my-4">
					<NoteCard
						title={note.title}
						content={note.content}
						date={new Date(note.createdAt).toLocaleDateString()}
						creator={`${note.userId.firstName} ${note.userId.lastName}`}
						onClick={() =>
							router.push(`/groups/${groupId}/notes/${note._id}`)
						}
					/>
				</div>
			))}

			<CreateNoteModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				groupId={groupId}
				onNoteCreated={fetchNotes}
			/>
		</div>
	);
}
