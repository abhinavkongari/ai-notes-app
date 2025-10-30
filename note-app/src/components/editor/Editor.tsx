import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useEffect } from 'react';
import { EditorToolbar } from './EditorToolbar.js';
import { TagInput } from './TagInput.js';
import { AIAssistant } from './AIAssistant.js';
import { useAppStore } from '../../stores/useAppStore.js';
import { useDebounce } from '../../lib/useDebounce.js';

export function Editor() {
  const { notes, currentNoteId, updateNote } = useAppStore();
  const currentNote = notes.find(n => n.id === currentNoteId);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      Highlight,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none',
      },
    },
  });

  // Load note content when current note changes
  useEffect(() => {
    if (editor && currentNote) {
      const content = currentNote.content || '';
      if (editor.getHTML() !== content) {
        editor.commands.setContent(content);
      }
    }
  }, [currentNote?.id, editor]);

  // Auto-save with debounce
  const debouncedContent = useDebounce(editor?.getHTML() || '', 2000);

  useEffect(() => {
    if (currentNoteId && debouncedContent && editor) {
      const content = editor.getHTML();
      // Extract title from first line or use default
      const text = editor.getText();
      const firstLine = text.split('\n')[0].trim();
      const title = firstLine || 'Untitled Note';

      updateNote(currentNoteId, {
        content,
        title: title.substring(0, 100), // Limit title length
      });
    }
  }, [debouncedContent, currentNoteId, editor, updateNote]);

  if (!currentNote) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Select a note or create a new one to start writing</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <EditorToolbar editor={editor} />
      <TagInput noteId={currentNote.id} />
      <div className="flex-1 overflow-auto relative">
        <EditorContent editor={editor} />
        <AIAssistant editor={editor} />
      </div>
    </div>
  );
}
