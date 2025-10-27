"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import "./blocknote-custom.css";

const Editor = () => {
  const editor = useCreateBlockNote();
  return (
    <div>
      <BlockNoteView editor={editor} />
    </div>
  );
};

export default Editor;
