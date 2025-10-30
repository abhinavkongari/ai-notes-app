import { useAppStore } from '../../stores/useAppStore.js';
import { Tag } from 'lucide-react';

export function Tags() {
  const { tags, notes, selectedTags, toggleTagFilter, clearTagFilters } = useAppStore();

  // Count notes per tag
  const tagCounts = tags.map(tag => ({
    ...tag,
    count: notes.filter(note => note.tags.includes(tag.name)).length,
  }));

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase">Tags</h3>
        {selectedTags.length > 0 && (
          <button
            onClick={clearTagFilters}
            className="text-xs text-primary hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {tagCounts.map(tag => {
          const isSelected = selectedTags.includes(tag.name);
          return (
            <button
              key={tag.id}
              onClick={() => toggleTagFilter(tag.name)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              <Tag className="w-3 h-3" />
              <span>{tag.name}</span>
              <span className="opacity-60">({tag.count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
