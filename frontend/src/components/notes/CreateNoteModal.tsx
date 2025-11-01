"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Editor from "./editor";
import { Block } from "@blocknote/core";
import { createNote } from "@/services/noteApi";

interface CreateNoteModalProps {
	isOpen: boolean;
	onClose: () => void;
	groupId: string;
	onNoteCreated: () => void; // to refresh the list after creation
}

export default function CreateNoteModal({
	isOpen,
	onClose,
	groupId,
	onNoteCreated,
}: CreateNoteModalProps) {

	const [title, setTitle] = useState("");
	const [content, setContent] = useState<Block[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async () => {
		if (!title) {
			setError("Title is required.");
			return;
		}
		setIsLoading(true);
		setError(null);

		try {
			// Blocknote's content is a JSON object so stringify it to store in the DB
			const contentAsString = JSON.stringify(content);

			await createNote(groupId, {
				title,
				content: contentAsString,
			});

			onNoteCreated();
			handleClose();
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to create note.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		setTitle("");
		setContent([]);
		setError(null);
		onClose();
	};


	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>Create a New Note</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4 flex-grow flex flex-col">
					<div>
						<Label htmlFor="title" className="sr-only">
							Note Title
						</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Note Title"
							required
							className="text-2xl font-bold border-none shadow-none focus-visible:ring-0"
						/>
					</div>
					<div className="flex-grow min-h-0">
						<Editor onChange={setContent} />
					</div>
				</div>

				{error && <p className="text-sm text-red-500">{error}</p>}

				<DialogFooter>
					<Button type="button" variant="ghost" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isLoading}>
						{isLoading ? "Saving..." : "Save Note"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
