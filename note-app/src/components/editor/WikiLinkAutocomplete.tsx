import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import type { Note } from '../../types/index.js';
import { FileText } from 'lucide-react';

export interface WikiLinkAutocompleteProps {
  suggestions: Note[];
  onSelect: (noteTitle: string) => void;
}

export interface WikiLinkAutocompleteHandle {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

export const WikiLinkAutocomplete = forwardRef<
  WikiLinkAutocompleteHandle,
  WikiLinkAutocompleteProps
>(({ suggestions, onSelect }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  // Scroll selected item into view
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const selectedItem = container.children[selectedIndex] as HTMLElement;
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  useImperativeHandle(ref, () => ({
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        return true;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        return true;
      }

      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        if (suggestions[selectedIndex]) {
          onSelect(suggestions[selectedIndex].title);
        }
        return true;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        return true; // Will close the menu
      }

      return false;
    },
  }));

  if (suggestions.length === 0) {
    return (
      <div className="fixed z-50 bg-background border border-border rounded-lg shadow-lg p-3 max-w-xs">
        <p className="text-sm text-muted-foreground">No notes found</p>
        <p className="text-xs text-muted-foreground mt-1">
          Type to search or continue typing to create a new link
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed z-50 bg-background border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto min-w-[300px]"
    >
      {suggestions.map((note, index) => (
        <button
          key={note.id}
          onClick={() => onSelect(note.title)}
          className={`w-full text-left px-3 py-2 flex items-start gap-2 transition-colors ${
            index === selectedIndex
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent/50'
          } ${index === 0 ? 'rounded-t-lg' : ''} ${
            index === suggestions.length - 1 ? 'rounded-b-lg' : 'border-b border-border'
          }`}
        >
          <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{note.title}</p>
            {note.content && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {note.content.replace(/<[^>]*>/g, '').substring(0, 60)}
                {note.content.length > 60 ? '...' : ''}
              </p>
            )}
          </div>
        </button>
      ))}
      <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/30 border-t border-border">
        ↑↓ Navigate • Enter to select • Esc to cancel
      </div>
    </div>
  );
});

WikiLinkAutocomplete.displayName = 'WikiLinkAutocomplete';
