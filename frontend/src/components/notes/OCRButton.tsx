"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScanText, Loader2 } from "lucide-react";
import { extractTextFromImage } from "@/services/ocrApi";
import toast from "react-hot-toast";

interface OCRButtonProps {
  onOCRResult?: (text: string) => void;        // NEW
  onTextExtracted?: (text: string) => void;    // OLD — still supported
  disabled?: boolean;
}

export default function OCRButton({
  onOCRResult,
  onTextExtracted,
  disabled,
}: OCRButtonProps) {

  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendResult = (text: string) => {
    if (onOCRResult) onOCRResult(text);
    else if (onTextExtracted) onTextExtracted(text);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be smaller than 4MB.");
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Scanning image for text...");

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      const text = await extractTextFromImage(base64);

      if (!text.trim()) {
        toast.error("No text could be read from this image.", { id: toastId });
      } else {
        toast.success("Text extracted successfully!", { id: toastId });
        sendResult(text);   // <-- Unified callback here
      }
    } catch (error) {
      console.error("OCR Failed:", error);
      toast.error("Failed to process image.", { id: toastId });
    } finally {
      setIsProcessing(false);
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
