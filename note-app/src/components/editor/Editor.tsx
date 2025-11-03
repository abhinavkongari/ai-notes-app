import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import DOMPurify from 'dompurify';
import { EditorToolbar } from './EditorToolbar.js';
import { TagInput } from './TagInput.js';
import { AIAssistant } from './AIAssistant.js';
import { WikiLinkAutocomplete, type WikiLinkAutocompleteHandle } from './WikiLinkAutocomplete.js';
import { Backlinks } from './Backlinks.js';
import { TableMenu } from './TableMenu.js';
import { WordCount } from './WordCount.js';
import { useAppStore } from '../../stores/useAppStore.js';
import { useDebounce } from '../../lib/useDebounce.js';
import { logger } from '../../lib/logger.js';
import { WikiLink } from '../../extensions/WikiLink.js';
import { WikiLinkSuggestion } from '../../extensions/WikiLinkSuggestion.js';
import { Callout } from '../../extensions/Callout.js';
import type { Note } from '../../types/index.js';

export function Editor() {
  const { notes, currentNoteId, updateNote, focusMode, setCurrentNote } = useAppStore();
  const currentNote = notes.find(n => n.id === currentNoteId);
  const [title, setTitle] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const previousNoteIdRef = useRef<string | null>(null);
  const isTypingTitleRef = useRef(false);

  // Wiki link autocomplete state
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<Note[]>([]);
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 });
  const autocompleteRef = useRef<WikiLinkAutocompleteHandle>(null);

  // Handle wiki link clicks
  const handleWikiLinkClick = useCallback((noteTitle: string) => {
    const targetNote = notes.find(
      n => n.title.toLowerCase() === noteTitle.toLowerCase()
    );

    if (targetNote) {
      setCurrentNote(targetNote.id);
      logger.info('Navigated to linked note', { title: noteTitle });
    } else {
      logger.warn('Linked note not found', { title: noteTitle });
    }
  }, [notes, setCurrentNote]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        link: {
          openOnClick: false,
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing... Type [[ to link to another note',
      }),
      Underline,
      Highlight,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
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
      Callout,
      WikiLink.configure({
        onLinkClick: handleWikiLinkClick,
      }),
      WikiLinkSuggestion.configure({
        notes,
        onSelect: (noteTitle: string) => {
          if (!editor) return;

          // Replace the [[ trigger with the selected note title
          const { from } = editor.state.selection;
          const textBefore = editor.state.doc.textBetween(
            Math.max(0, from - 50),
            from
          );
          const match = textBefore.match(/\[\[([^\]]*)?$/);

          if (match) {
            const startPos = from - match[0].length;
            editor
              .chain()
              .focus()
              .deleteRange({ from: startPos, to: from })
              .insertContent(`[[${noteTitle}]]`)
              .run();
          }

          setShowAutocomplete(false);
        },
        render: () => ({
          onStart: (props) => {
            setAutocompleteSuggestions(props.suggestions);
            setShowAutocomplete(true);

            // Calculate position for autocomplete dropdown
            if (editor) {
              const { view } = editor;
              const coords = view.coordsAtPos(props.range.from);
              setAutocompletePosition({
                top: coords.bottom + 5,
                left: coords.left,
              });
            }
          },
          onUpdate: (props) => {
            setAutocompleteSuggestions(props.suggestions);
          },
          onExit: () => {
            setShowAutocomplete(false);
          },
          onKeyDown: ({ event }) => {
            if (autocompleteRef.current) {
              return autocompleteRef.current.onKeyDown(event);
            }
            return false;
          },
        }),
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none',
      },
      handleDrop: (view, event, _slice, moved) => {
        // Handle image drops
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          const fileType = file.type;

          // Check if it's an image
          if (fileType.startsWith('image/')) {
            event.preventDefault();

            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
              logger.warn('Image too large', { size: file.size });
              return true;
            }

            const reader = new FileReader();
            reader.onload = (readerEvent) => {
              const base64 = readerEvent.target?.result as string;
              const { schema } = view.state;
              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });

              if (coordinates) {
                const node = schema.nodes.image.create({ src: base64 });
                const transaction = view.state.tr.insert(coordinates.pos, node);
                view.dispatch(transaction);
                logger.info('Image inserted via drag & drop');
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        // Handle image pastes
        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (!file) continue;

            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
              logger.warn('Image too large', { size: file.size });
              return true;
            }

            const reader = new FileReader();
            reader.onload = (readerEvent) => {
              const base64 = readerEvent.target?.result as string;
              const { schema } = view.state;
              const { from } = view.state.selection;
              const node = schema.nodes.image.create({ src: base64 });
              const transaction = view.state.tr.insert(from, node);
              view.dispatch(transaction);
              logger.info('Image inserted via paste');
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  // Reset title only when switching to a different note (not on updates to the same note)
  useEffect(() => {
    if (currentNote && currentNote.id !== previousNoteIdRef.current) {
      setTitle(currentNote.title || 'Untitled Note');
      isTypingTitleRef.current = false;
      previousNoteIdRef.current = currentNote.id;
    }
  }, [currentNoteId]);

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

      // Auto-focus title for newly created notes
      if (currentNote.title === 'Untitled Note' && !currentNote.content && titleInputRef.current) {
        titleInputRef.current.focus();
        titleInputRef.current.select();
      }
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
        // Clear the typing flag after save
        isTypingTitleRef.current = false;
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
    <>
      <div className="h-full flex flex-col">
        {!focusMode && (
          <>
            <div className="px-6 pt-6 pb-2 border-b border-border">
              <input
                key={currentNote.id}
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => {
                  isTypingTitleRef.current = true;
                  setTitle(e.target.value);
                }}
                placeholder="Untitled Note"
                className="w-full text-3xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
              />
            </div>
            <EditorToolbar editor={editor} />
            <TagInput noteId={currentNote.id} />
          </>
        )}
        <div className={`flex-1 overflow-auto relative ${focusMode ? 'p-12' : 'px-6'}`}>
          <div className={focusMode ? 'max-w-4xl mx-auto' : 'max-w-5xl mx-auto'}>
            <EditorContent editor={editor} className={focusMode ? 'focus-mode-content' : ''} />
            {!focusMode && <AIAssistant editor={editor} />}
            {!focusMode && <Backlinks />}
          </div>
          {!focusMode && editor && (
            <WordCount editor={editor} />
          )}
        </div>
      </div>

      {/* Wiki link autocomplete */}
      {showAutocomplete && createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${autocompletePosition.top}px`,
            left: `${autocompletePosition.left}px`,
          }}
        >
          <WikiLinkAutocomplete
            ref={autocompleteRef}
            suggestions={autocompleteSuggestions}
            onSelect={(noteTitle) => {
              if (!editor) return;

              // Replace the [[ trigger with the selected note title
              const { from } = editor.state.selection;
              const textBefore = editor.state.doc.textBetween(
                Math.max(0, from - 50),
                from
              );
              const match = textBefore.match(/\[\[([^\]]*)?$/);

              if (match) {
                const startPos = from - match[0].length;
                editor
                  .chain()
                  .focus()
                  .deleteRange({ from: startPos, to: from })
                  .insertContent(`[[${noteTitle}]]`)
                  .run();
              }

              setShowAutocomplete(false);
            }}
          />
        </div>,
        document.body
      )}

      {/* Floating table menu */}
      <TableMenu editor={editor} />
    </>
  );
}
