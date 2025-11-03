import { Editor } from '@tiptap/react';
import { useState } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
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
  Star,
  RemoveFormatting,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  Image as ImageIcon,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore.js';
import { toast } from 'sonner';

interface EditorToolbarProps {
  editor: Editor | null;
}

const COMMON_EMOJIS = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💡', '📝', '✅', '❌', '⚠️', '📌', '🚀', '💪', '🌟'];

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const { currentNoteId, notes, deleteNote, updateNote } = useAppStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCalloutMenu, setShowCalloutMenu] = useState(false);

  const currentNote = notes.find(n => n.id === currentNoteId);

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        editor?.chain().focus().setImage({ src: base64 }).run();
        toast.success('Image inserted');
      };
      reader.onerror = () => {
        toast.error('Failed to read image');
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  if (!editor) return null;

  const handleDeleteNote = () => {
    if (!currentNoteId) return;
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(currentNoteId);
      toast.success('Note deleted');
    }
  };

  const handleToggleFavorite = () => {
    if (!currentNoteId || !currentNote) return;
    updateNote(currentNoteId, { isFavorite: !currentNote.isFavorite });
    toast.success(currentNote.isFavorite ? 'Removed from favorites' : 'Added to favorites');
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
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
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
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-4 h-4" />
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
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            isActive={editor.isActive('heading', { level: 4 })}
            title="Heading 4"
          >
            <Heading4 className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
            isActive={editor.isActive('heading', { level: 5 })}
            title="Heading 5"
          >
            <Heading5 className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
            isActive={editor.isActive('heading', { level: 6 })}
            title="Heading 6"
          >
            <Heading6 className="w-3.5 h-3.5" />
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
          
          {/* Callout Dropdown */}
          <div className="relative">
            <ToolbarButton
              onClick={() => setShowCalloutMenu(!showCalloutMenu)}
              isActive={editor.isActive('callout')}
              title="Insert Callout"
            >
              <Info className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </ToolbarButton>
            {showCalloutMenu && (
              <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 min-w-[160px] py-1">
                <button
                  onClick={() => {
                    editor.chain().focus().setCallout('info').run();
                    setShowCalloutMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                >
                  <Info className="w-4 h-4 text-blue-500" />
                  Info
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().setCallout('warning').run();
                    setShowCalloutMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                >
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Warning
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().setCallout('success').run();
                    setShowCalloutMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                >
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Success
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().setCallout('error').run();
                    setShowCalloutMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                >
                  <XCircle className="w-4 h-4 text-red-500" />
                  Error
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Media */}
        <div className="flex items-center gap-1 pr-2 border-r border-border">
          <ToolbarButton
            onClick={handleImageUpload}
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Table */}
        <div className="flex items-center gap-1 pr-2 border-r border-border">
          <ToolbarButton
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            title="Insert Table (3x3)"
          >
            <Table className="w-4 h-4" />
          </ToolbarButton>

          {/* Table controls - only show when inside a table */}
          {editor.isActive('table') && (
            <>
              <ToolbarButton
                onClick={() => editor.chain().focus().addRowBefore().run()}
                title="Add Row Above"
              >
                <span className="text-xs font-bold">+↑</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().addRowAfter().run()}
                title="Add Row Below"
              >
                <span className="text-xs font-bold">+↓</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                title="Add Column Left"
              >
                <span className="text-xs font-bold">+←</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                title="Add Column Right"
              >
                <span className="text-xs font-bold">+→</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().deleteRow().run()}
                title="Delete Row"
              >
                <span className="text-xs font-bold text-destructive">-↕</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().deleteColumn().run()}
                title="Delete Column"
              >
                <span className="text-xs font-bold text-destructive">-↔</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().deleteTable().run()}
                title="Delete Table"
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </ToolbarButton>
            </>
          )}
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
            <div className="absolute top-full left-0 mt-1 p-3 bg-background border border-border rounded-lg shadow-lg z-50 grid grid-cols-8 gap-2 min-w-[280px]">
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => insertEmoji(emoji)}
                  className="text-2xl hover:bg-accent rounded p-2 transition-colors w-10 h-10 flex items-center justify-center"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Note Actions */}
        <div className="flex items-center gap-1 ml-auto">
          <ToolbarButton
            onClick={handleToggleFavorite}
            isActive={currentNote?.isFavorite}
            title={currentNote?.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${currentNote?.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </ToolbarButton>
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
