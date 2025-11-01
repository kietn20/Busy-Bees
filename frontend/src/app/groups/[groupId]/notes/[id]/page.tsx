"use client";

import Editor from "@/components/notes/editor";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getNoteById } from "@/services/noteApi";
import { Note } from "@/services/noteApi";
import { Block } from "@blocknote/core";

export default function NoteDetailPage() {
	const [note, setNote] = useState<Note | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const params = useParams();
	const groupId = params.groupId as string;
	const noteId = params.id as string;

	useEffect(() => {
		if (!groupId || !noteId) return;

		const fetchNote = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const response = await getNoteById(groupId, noteId);
				setNote(response.note);
			} catch (err) {
				setError(
					"Failed to load note. You may not have permission to view it."
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchNote();
	}, [groupId, noteId]);

	// Helper to parse the content string
	const parseContent = (content: string): Block[] | undefined => {
		try {
			return JSON.parse(content);
		} catch (e) {
			// If content is not valid JSON, return a single block with the raw text
			return [{ type: "paragraph", content: content }];
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

	return (
		<div className="max-w-4xl mx-auto py-12 px-6">
			<div className="ml-14 border-b border-gray-200 pb-4 mb-6">
				<h1 className="text-3xl font-bold mb-6 w-full">{note.title}</h1>

				<div className="w-1/3">
					<div className="grid grid-cols-2 mb-2">
						<h4 className="text-gray-500">Created by:</h4>
						<span>
							{note.userId.firstName} {note.userId.lastName}
						</span>
					</div>
					<div className="grid grid-cols-2 mb-2">
						<h4 className="text-gray-500">Last modified:</h4>
						<span>
							{new Date(note.updatedAt).toLocaleDateString()}
						</span>
					</div>
				</div>
			</div>

			<div className="min-h-screen">
				<Editor
					// pass a dummy onChange because it's required but it does nothing in read-only mode
					onChange={() => {}}
					initialContent={parseContent(note.content)}
					editable={false}
				/>
			</div>
		</div>
	);
}
