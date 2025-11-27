"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScanText, Loader2 } from "lucide-react";
import { extractTextFromImage } from "@/services/ocrApi";
import toast from "react-hot-toast";

interface OCRButtonProps {
	onTextExtracted: (text: string) => void;
	disabled?: boolean;
}

export default function OCRButton({
	onTextExtracted,
	disabled,
}: OCRButtonProps) {
	const [isProcessing, setIsProcessing] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// 1. Validation
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file.");
			return;
		}

		if (file.size > 4 * 1024 * 1024) { // 4MB limit
			toast.error("Image must be smaller than 4MB.");
			return;
		}

		setIsProcessing(true);
		const toastId = toast.loading("Scanning image for text...");

		try {
			// 2. convert to Base64
			const base64 = await new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onload = () => resolve(reader.result as string);
				reader.onerror = (error) => reject(error);
			});

			// 3. Call API
			const text = await extractTextFromImage(base64);

			if (!text.trim()) {
				toast.error("No text could be read from this image.", {
					id: toastId,
				});
			} else {
				toast.success("Text extracted successfully!", { id: toastId });
				onTextExtracted(text);
			}
		} catch (error) {
			console.error("OCR Failed:", error);
			toast.error("Failed to process image.", { id: toastId });
		} finally {
			setIsProcessing(false);
			// reset input so the same file can be selected again if needed
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	return (
		<>
			<input
				type="file"
				accept="image/*"
				ref={fileInputRef}
				className="hidden"
				onChange={handleFileChange}
			/>
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={disabled || isProcessing}
				onClick={() => fileInputRef.current?.click()}
				title="Import text from image"
			>
				{isProcessing ? (
					<Loader2 className="h-4 w-4 animate-spin mr-2" />
				) : (
					<ScanText className="h-4 w-4 mr-2" />
				)}
				{isProcessing ? "Scanning..." : "Import Image"}
			</Button>
		</>
	);
}
