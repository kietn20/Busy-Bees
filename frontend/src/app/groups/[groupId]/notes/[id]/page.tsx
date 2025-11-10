"use client";

import Editor from "@/components/notes/editor";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { deleteNote, getNoteById, updateNote } from "@/services/noteApi";
import { getGroupById } from "@/services/groupApi";
import { Note } from "@/services/noteApi";
import { CourseGroup } from "@/services/groupApi";
import { Block } from "@blocknote/core";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
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

export default function NoteDetailPage() {
	const [note, setNote] = useState<Note | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [isEditing, setIsEditing] = useState(false);
	const [editedTitle, setEditedTitle] = useState("");
	const [editedContent, setEditedContent] = useState<Block[]>([]);
	const [isSaving, setIsSaving] = useState(false);

	const [group, setGroup] = useState<CourseGroup | null>(null); // <-- NEW
	const [isDeleting, setIsDeleting] = useState(false); // <-- NEW

	const { user } = useAuth();
	const params = useParams();
	const router = useRouter();
	const groupId = params.groupId as string;
	const noteId = params.id as string;

	const fetchNote = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const [noteResponse, groupResponse] = await Promise.all([
				getNoteById(groupId, noteId),
				getGroupById(groupId),
			]);
			setNote(noteResponse.note);
			setGroup(groupResponse);
			setEditedTitle(noteResponse.note.title);
			setEditedContent(parseContent(noteResponse.note.content) || []);
		} catch (err) {
			setError("Failed to load note data. You may not have permission.");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (!groupId || !noteId) return;
		fetchNote();
	}, [groupId, noteId]);

	useEffect(() => {
		if (!groupId || !noteId) return;

		const fetchData = async () => {
			setIsLoading(true);
			setError(null);

			try {
				// fetch note and group data in parallel
				const [noteResponse, groupResponse] = await Promise.all([
					getNoteById(groupId, noteId),
					getGroupById(groupId),
				]);

				setNote(noteResponse.note);
				setGroup(groupResponse);

				setEditedTitle(noteResponse.note.title);
				setEditedContent(parseContent(noteResponse.note.content) || []);
			} catch (err) {
				setError(
					"Failed to load note data. You may not have permission."
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
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

	const handleDelete = async () => {
		if (!note) return;

		setIsDeleting(true);

		try {
			await deleteNote(groupId, noteId);
			router.push(`/groups/${groupId}/notes`); // redirect to main notes page after deletion

			// TODO: Add a success toast notification here
		} catch (err) {
			console.error("Failed to delete note:", err);

			// TODO: Add an error toast notification here
		} finally {
			setIsDeleting(false);
		}
	};

	const isAuthor = user && note && user.id === note.userId._id;
	const isGroupOwner = user && group && user.id === group.ownerId;
	const canModify = isAuthor || isGroupOwner;

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
				<div className="flex items-center space-x-2">
					{canModify && !isEditing && (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive">Delete</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>
										Are you absolutely sure?
									</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. This will
										permanently delete this note.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>
										Cancel
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleDelete}
										disabled={isDeleting}
									>
										{isDeleting ? "Deleting..." : "Delete"}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)}

					{isAuthor &&
						(isEditing ? (
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
						))}
				</div>
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
