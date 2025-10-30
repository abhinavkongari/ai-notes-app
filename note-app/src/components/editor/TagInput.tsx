import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../stores/useAppStore.js';
import { Tag, X, Plus } from 'lucide-react';

interface TagInputProps {
  noteId: string;
}

export function TagInput({ noteId }: TagInputProps) {
  const { notes, tags, updateNote, createTag } = useAppStore();
  const note = notes.find(n => n.id === noteId);
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  if (!note) return null;

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagName = inputValue.trim();
    if (!tagName) return;

    // Create tag if it doesn't exist
    if (!tags.find(t => t.name.toLowerCase() === tagName.toLowerCase())) {
      await createTag(tagName);
    }

    // Add tag to note if not already present
    if (!note.tags.includes(tagName)) {
      await updateNote(noteId, {
        tags: [...note.tags, tagName],
      });
    }

    setInputValue('');
    setIsAdding(false);
  };

  const handleRemoveTag = async (tagName: string) => {
    await updateNote(noteId, {
      tags: note.tags.filter(t => t !== tagName),
    });
  };

  const availableTags = tags.filter(t => !note.tags.includes(t.name));

  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center gap-2 flex-wrap">
        <Tag className="w-4 h-4 text-muted-foreground" />
        {note.tags.map(tagName => (
          <span
            key={tagName}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
          >
            {tagName}
            <button
              onClick={() => handleRemoveTag(tagName)}
              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-muted-foreground hover:bg-accent transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add tag
          </button>
        ) : (
          <form onSubmit={handleAddTag} className="inline-flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={() => {
                if (!inputValue) setIsAdding(false);
              }}
              placeholder="Tag name..."
              list="available-tags"
              className="w-32 px-2 py-1 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <datalist id="available-tags">
              {availableTags.map(tag => (
                <option key={tag.id} value={tag.name} />
              ))}
            </datalist>
          </form>
        )}
      </div>
    </div>
  );
}
