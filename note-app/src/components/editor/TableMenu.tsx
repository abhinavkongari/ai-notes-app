import { Editor } from '@tiptap/react';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TableMenuProps {
  editor: Editor | null;
}

export function TableMenu({ editor }: TableMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!editor) return;

    const updateMenu = () => {
      const isTable = editor.isActive('table');
      setShowMenu(isTable);

      if (isTable) {
        // Get cursor position
        const { selection } = editor.state;
        const coords = editor.view.coordsAtPos(selection.from);

        setPosition({
          top: coords.top - 50, // Position above the cursor
          left: coords.left,
        });
      }
    };

    // Update on selection change
    editor.on('selectionUpdate', updateMenu);
    editor.on('transaction', updateMenu);

    return () => {
      editor.off('selectionUpdate', updateMenu);
      editor.off('transaction', updateMenu);
    };
  }, [editor]);

  if (!editor || !showMenu) return null;

  return (
    <div
      className="fixed z-50 bg-background border border-border rounded-lg shadow-lg p-1 flex items-center gap-1"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <button
        onClick={() => editor.chain().focus().addRowBefore().run()}
        className="px-2 py-1 text-xs hover:bg-accent rounded transition-colors"
        title="Add Row Above"
      >
        +↑ Row
      </button>
      <button
        onClick={() => editor.chain().focus().addRowAfter().run()}
        className="px-2 py-1 text-xs hover:bg-accent rounded transition-colors"
        title="Add Row Below"
      >
        +↓ Row
      </button>
      <button
        onClick={() => editor.chain().focus().addColumnBefore().run()}
        className="px-2 py-1 text-xs hover:bg-accent rounded transition-colors"
        title="Add Column Left"
      >
        +← Col
      </button>
      <button
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        className="px-2 py-1 text-xs hover:bg-accent rounded transition-colors"
        title="Add Column Right"
      >
        +→ Col
      </button>
      <div className="w-px h-4 bg-border" />
      <button
        onClick={() => editor.chain().focus().deleteRow().run()}
        className="px-2 py-1 text-xs hover:bg-accent rounded transition-colors text-destructive"
        title="Delete Row"
      >
        -↕
      </button>
      <button
        onClick={() => editor.chain().focus().deleteColumn().run()}
        className="px-2 py-1 text-xs hover:bg-accent rounded transition-colors text-destructive"
        title="Delete Column"
      >
        -↔
      </button>
      <button
        onClick={() => editor.chain().focus().deleteTable().run()}
        className="px-2 py-1 text-xs hover:bg-accent rounded transition-colors text-destructive flex items-center gap-1"
        title="Delete Table"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}
