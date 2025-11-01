"use client";

import Editor from "@/components/notes/editor";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getNoteById, updateNote } from "@/services/noteApi";
import { Note } from "@/services/noteApi";
import { Block } from "@blocknote/core";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function NoteDetailPage() {
	const [note, setNote] = useState<Note | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [isEditing, setIsEditing] = useState(false);
	const [editedTitle, setEditedTitle] = useState("");
	const [editedContent, setEditedContent] = useState<Block[]>([]);
	const [isSaving, setIsSaving] = useState(false);

	const { user } = useAuth();
	const params = useParams();
	const groupId = params.groupId as string;
	const noteId = params.id as string;

	const fetchNote = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await getNoteById(groupId, noteId);
			setNote(response.note);
			setEditedTitle(response.note.title);
			setEditedContent(parseContent(response.note.content) || []);
		} catch (err) {
			setError(
				"Failed to load note. You may not have permission to view it."
			);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (!groupId || !noteId) return;
		fetchNote();
	}, [groupId, noteId]);

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
			// TODO: Add a success toast notification here
		} catch (err) {
			console.error("Failed to save note:", err);
			// TODO: Add an error toast notification here
		} finally {
			setIsSaving(false);
		}
	};

	// Helper to parse the content string
	const parseContent = (content: string): Block[] | undefined => {
		try {
			return JSON.parse(content);
		} catch (e) {
			// If content is not valid JSON, return a single block with the raw text
			return [{ type: "paragraph", content: content }];
		}
	};

	const isAuthor = user && note && user.id === note.userId._id;

	if (isLoading) {
		return <div className="text-center py-12">Loading note...</div>;
	}

	if (error) {
		return <div className="text-center py-12 text-red-500">{error}</div>;
	}

	if (!note) {
		return <div className="text-center py-12">Note not found.</div>;
	}

	return (
		<div className="max-w-4xl mx-auto py-12 px-6">
			{/* --- HEADER SECTION --- */}
			<div className="flex justify-between items-center ml-14 border-b border-gray-200 pb-4 mb-6">
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

				{/* --- EDIT / SAVE / CANCEL BUTTONS --- */}
				{isAuthor && (
					<div className="flex space-x-2">
						{isEditing ? (
							<>
								<Button
									variant="ghost"
									onClick={() => setIsEditing(false)}
								>
									Cancel
								</Button>
								<Button
									onClick={handleSave}
									disabled={isSaving}
								>
									{isSaving ? "Saving..." : "Save"}
								</Button>
							</>
						) : (
							<Button
								variant="outline"
								onClick={() => setIsEditing(true)}
							>
								Edit
							</Button>
						)}
					</div>
				)}
			</div>

			<div className="w-1/3">
				<div className="grid grid-cols-2 mb-2">
					<h4 className="text-gray-500">Created by:</h4>
					<span>
						{note.userId.firstName} {note.userId.lastName}
					</span>
				</div>
				<div className="grid grid-cols-2 mb-2">
					<h4 className="text-gray-500">Last modified:</h4>
					<span>{new Date(note.updatedAt).toLocaleDateString()}</span>
				</div>
			</div>

			<div className="min-h-screen">
				<Editor
					onChange={setEditedContent}
					initialContent={parseContent(note.content)}
					editable={isEditing}
				/>
			</div>
		</div>
	);
}
