"use client";

import Editor from "@/components/notes/editor";
import { useState } from "react";

export default function NotesPage() {
  const [title, setTitle] = useState("Untitled");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="ml-14 border-b border-gray-200 pb-4 mb-6">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          className="text-3xl font-bold mb-6 w-full bg-transparent border-none outline-none resize-none placeholder-gray-400 focus:placeholder-gray-300"
        />

        {/* Metadata */}
        <div className="w-1/3">
          <div className="grid grid-cols-2 mb-2">
            <h4 className="text-gray-500 ">Created by:</h4>
            {/* TODO: Make dynamic */}
            <span className="">John Doe</span>
          </div>
          <div className="grid grid-cols-2 mb-2">
            <h4 className="text-gray-500">Last modified:</h4>
            {/* TODO: Make dynamic */}
            <span className="">2025-10-27</span>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="min-h-screen">
        <Editor />
      </div>
    </div>
  );
}
