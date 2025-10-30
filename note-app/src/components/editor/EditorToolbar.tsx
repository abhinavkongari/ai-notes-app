import { Editor } from '@tiptap/react';
import { useState } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  CodeSquare,
  Minus,
  Undo,
  Redo,
  Highlighter,
  Table,
  Smile,
  Trash2,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore.js';
import { toast } from 'sonner';

interface EditorToolbarProps {
  editor: Editor | null;
}

const COMMON_EMOJIS = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💡', '📝', '✅', '❌', '⚠️', '📌', '🚀', '💪', '🌟'];

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const { currentNoteId, deleteNote } = useAppStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  if (!editor) return null;

  const handleDeleteNote = () => {
    if (!currentNoteId) return;
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(currentNoteId);
      toast.success('Note deleted');
    }
  };

  const insertEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run();
    setShowEmojiPicker(false);
  };

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-accent transition-colors ${
        isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border-b border-border bg-background sticky top-0 z-10">
      <div className="flex items-center gap-1 p-2 flex-wrap">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 pr-2 border-r border-border">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Text formatting */}
        <div className="flex items-center gap-1 pr-2 border-r border-border">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive('highlight')}
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 pr-2 border-r border-border">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 pr-2 border-r border-border">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={editor.isActive('taskList')}
            title="Task List"
          >
            <ListTodo className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Block elements */}
        <div className="flex items-center gap-1 pr-2 border-r border-border">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <CodeSquare className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <Minus className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Table */}
        <div className="flex items-center gap-1 pr-2 border-r border-border">
          <ToolbarButton
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            title="Insert Table"
          >
            <Table className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Emoji */}
        <div className="flex items-center gap-1 pr-2 border-r border-border relative">
          <ToolbarButton
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            isActive={showEmojiPicker}
            title="Insert Emoji"
          >
            <Smile className="w-4 h-4" />
          </ToolbarButton>
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-background border border-border rounded-lg shadow-lg z-50 grid grid-cols-8 gap-1">
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => insertEmoji(emoji)}
                  className="text-xl hover:bg-accent rounded p-1 transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Delete Note */}
        <div className="flex items-center gap-1 ml-auto">
          <ToolbarButton
            onClick={handleDeleteNote}
            title="Delete Note"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </ToolbarButton>
        </div>
      </div>
    </div>
  );
}
