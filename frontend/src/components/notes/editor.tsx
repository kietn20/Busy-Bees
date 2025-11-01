"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { Block } from "@blocknote/core"; // Import the Block type
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import "./blocknote-custom.css";

interface EditorProps {
  initialContent?: Block[]; // maybe for initial content
  onChange: (blocks: Block[]) => void; // send content changes up to the parent
  editable?: boolean; // to make the editor read-only (if we choose to implement view only mode)
}

const Editor = ({ onChange, initialContent, editable = true }: EditorProps) => {
  
  const editor = useCreateBlockNote({
    initialContent: initialContent,
  });

  return (
    <div>
      <BlockNoteView
        editor={editor}
        editable={editable}
        onChange={() => {
          onChange(editor.document);
        }}
      />
    </div>
  );
};

export default Editor;