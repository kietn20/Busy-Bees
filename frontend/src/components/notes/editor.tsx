"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { Block } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import "./blocknote-custom.css";

interface SelectionInfo {
  blockIds: string[];
  firstBlockId: string | null;
  textPreview: string; // small snippet of the selected text/blocks
}

interface EditorProps {
  initialContent?: Block[]; // initial note content
  onChange: (blocks: Block[]) => void; // send content changes up
  editable?: boolean; // read-only toggle
  onSelectionChange?: (selection: SelectionInfo | null) => void; // ➕ NEW
}

// helper: best-effort conversion of a Block's content to plain text
const blockToPlainText = (block: Block): string => {
  const anyBlock: any = block as any;
  const content = anyBlock.content;

  if (!content) return "";

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    // Inline nodes usually have a `text` property
    return content
      .map((node: any) =>
        typeof node?.text === "string" ? node.text : ""
      )
      .join("");
  }

  return "";
};

const Editor = ({
  onChange,
  initialContent,
  editable = true,
  onSelectionChange,
}: EditorProps) => {
  const editor = useCreateBlockNote({
    initialContent,
  });

  return (
    <div className="blocknote-editor w-full max-w-full overflow-hidden">
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme="light"
        onChange={() => {
          onChange(editor.document);
        }}
        // ➕ NEW: track what the user has selected
        onSelectionChange={() => {
          if (!onSelectionChange) return;

          const selection = editor.getSelection();
          let blocks: Block[] = [];

          if (selection && selection.blocks.length > 0) {
            blocks = selection.blocks;
          } else {
            // no selection: fall back to block with cursor
            const cursorPos = editor.getTextCursorPosition();
            if (cursorPos?.block) {
              blocks = [cursorPos.block];
            }
          }

          if (blocks.length === 0) {
            onSelectionChange(null);
            return;
          }

          const blockIds = blocks.map((b) => b.id);
          const textPreview = blocks
            .map(blockToPlainText)
            .join("\n")
            .slice(0, 200); // short preview for comment sidebar

          onSelectionChange({
            blockIds,
            firstBlockId: blockIds[0] ?? null,
            textPreview,
          });
        }}
      />
    </div>
  );
};

export default Editor;
