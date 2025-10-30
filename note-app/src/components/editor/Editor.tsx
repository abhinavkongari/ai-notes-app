import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { useEffect, useState, useRef } from 'react';
import DOMPurify from 'dompurify';
import { EditorToolbar } from './EditorToolbar.js';
import { TagInput } from './TagInput.js';
import { AIAssistant } from './AIAssistant.js';
import { useAppStore } from '../../stores/useAppStore.js';
import { useDebounce } from '../../lib/useDebounce.js';
import { logger } from '../../lib/logger.js';

export function Editor() {
  const { notes, currentNoteId, updateNote, focusMode } = useAppStore();
  const currentNote = notes.find(n => n.id === currentNoteId);
  const [title, setTitle] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const previousNoteIdRef = useRef<string | null>(null);

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
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none',
      },
    },
  });

  // Load note content and title when current note changes
  useEffect(() => {
    if (editor && currentNote) {
      const content = currentNote.content || '';

      // Sanitize HTML content before loading into editor
      // This provides defense-in-depth against XSS, even though TipTap sanitizes by default
      const sanitized = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li',
          'blockquote',
          'a', 'img',
          'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'colgroup', 'col',
          'mark', 'span', 'div',
        ],
        ALLOWED_ATTR: [
          'href', 'target', 'rel',
          'src', 'alt', 'title',
          'class', 'style',
          'colspan', 'rowspan', // Table attributes
          'data-type', 'data-checked', // TipTap attributes
        ],
        ALLOW_DATA_ATTR: true, // Allow data-* attributes for TipTap
      });

      // Log if content was sanitized (different from original)
      if (sanitized !== content && content.length > 0) {
        logger.security('HTML content sanitized on load', {
          noteId: currentNote.id,
          originalLength: content.length,
          sanitizedLength: sanitized.length,
        });
      }

      if (editor.getHTML() !== sanitized) {
        editor.commands.setContent(sanitized);
      }

      // Load title
      setTitle(currentNote.title || 'Untitled Note');

      // Auto-focus title for newly created notes
      const isNewNote = previousNoteIdRef.current !== currentNote.id && 
                        currentNote.title === 'Untitled Note' && 
                        !currentNote.content;
      
      if (isNewNote && titleInputRef.current) {
        titleInputRef.current.focus();
        titleInputRef.current.select();
      }

      previousNoteIdRef.current = currentNote.id;
    }
  }, [currentNote?.id, currentNote, editor]);

  // Auto-save with debounce
  const debouncedContent = useDebounce(editor?.getHTML() || '', 2000);
  const debouncedTitle = useDebounce(title, 1000);

  useEffect(() => {
    if (currentNoteId && debouncedContent && editor) {
      const content = editor.getHTML();
      updateNote(currentNoteId, { content });
    }
  }, [debouncedContent, currentNoteId, editor, updateNote]);

  useEffect(() => {
    if (currentNoteId && debouncedTitle && currentNote) {
      // Only update if title has changed AND is not empty
      const trimmedTitle = debouncedTitle.trim();
      if (trimmedTitle && debouncedTitle !== currentNote.title) {
        updateNote(currentNoteId, { 
          title: debouncedTitle.substring(0, 100) // Limit title length
        });
      }
    }
  }, [debouncedTitle, currentNoteId, currentNote, updateNote]);

  if (!currentNote) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Select a note or create a new one to start writing</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {!focusMode && (
        <>
          <div className="px-6 pt-6 pb-2 border-b border-border">
            <input
              key={currentNote.id}
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Note"
              className="w-full text-3xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
            />
          </div>
          <EditorToolbar editor={editor} />
          <TagInput noteId={currentNote.id} />
        </>
      )}
      <div className={`flex-1 overflow-auto relative ${focusMode ? 'p-12' : 'px-6'}`}>
        <EditorContent editor={editor} />
        {!focusMode && <AIAssistant editor={editor} />}
      </div>
    </div>
  );
}
