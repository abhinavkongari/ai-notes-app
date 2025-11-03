import { useAppStore } from '../../stores/useAppStore.js';
import { Tag, MoreVertical, Edit2, Merge, Trash2, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

export function Tags() {
  const { tags, notes, selectedTags, toggleTagFilter, clearTagFilters, renameTag, mergeTag, deleteTag } = useAppStore();
  const [contextMenuTag, setContextMenuTag] = useState<string | null>(null);
  const [renamingTag, setRenamingTag] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [mergingTag, setMergingTag] = useState<string | null>(null);
  const [deleteConfirmTag, setDeleteConfirmTag] = useState<string | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenuTag(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus rename input when opening
  useEffect(() => {
    if (renamingTag && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingTag]);

  // Count notes per tag
  const tagCounts = tags.map(tag => ({
    ...tag,
    count: notes.filter(note => note.tags.includes(tag.name)).length,
  }));

  const handleRenameStart = (tagId: string, tagName: string) => {
    setRenamingTag(tagId);
    setRenameValue(tagName);
    setContextMenuTag(null);
  };

  const handleRenameSubmit = async (tagId: string) => {
    if (renameValue.trim() && renameValue !== tags.find(t => t.id === tagId)?.name) {
      try {
        const notesCount = notes.filter(n => n.tags.includes(tags.find(t => t.id === tagId)!.name)).length;
        await renameTag(tagId, renameValue.trim());
        toast.success(`Tag renamed. ${notesCount} ${notesCount === 1 ? 'note' : 'notes'} updated.`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to rename tag');
      }
    }
    setRenamingTag(null);
    setRenameValue('');
  };

  const handleMerge = async (sourceId: string, targetId: string) => {
    const sourceTag = tags.find(t => t.id === sourceId);
    const targetTag = tags.find(t => t.id === targetId);
    if (!sourceTag || !targetTag) return;

    const notesCount = notes.filter(n => n.tags.includes(sourceTag.name)).length;
    await mergeTag(sourceId, targetId);
    toast.success(`Merged "${sourceTag.name}" into "${targetTag.name}". ${notesCount} ${notesCount === 1 ? 'note' : 'notes'} updated.`);
    setMergingTag(null);
    setContextMenuTag(null);
  };

  const handleDeleteConfirm = async (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    if (!tag) return;

    const notesCount = notes.filter(n => n.tags.includes(tag.name)).length;
    await deleteTag(tagId);
    toast.success(`Tag deleted. Removed from ${notesCount} ${notesCount === 1 ? 'note' : 'notes'}.`);
    setDeleteConfirmTag(null);
    setContextMenuTag(null);
  };

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="p-2 border-b border-border">
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
          const isShowingContextMenu = contextMenuTag === tag.id;
          
          return (
            <div key={tag.id} className="relative">
              {renamingTag === tag.id ? (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-accent rounded-full">
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(tag.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameSubmit(tag.id);
                      } else if (e.key === 'Escape') {
                        setRenamingTag(null);
                        setRenameValue('');
                      }
                    }}
                    className="w-24 px-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 group">
                  <button
                    onClick={() => toggleTagFilter(tag.name)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-l-full text-xs transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag.name}</span>
                    <span className="opacity-60">({tag.count})</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenuTag(isShowingContextMenu ? null : tag.id);
                    }}
                    className={`px-1 py-1 rounded-r-full text-xs transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                    title="Tag options"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Context Menu */}
              {isShowingContextMenu && (
                <div
                  ref={contextMenuRef}
                  className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 min-w-[160px] py-1"
                >
                  <button
                    onClick={() => handleRenameStart(tag.id, tag.name)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                  >
                    <Edit2 className="w-4 h-4" />
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      setMergingTag(tag.id);
                      setContextMenuTag(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                  >
                    <Merge className="w-4 h-4" />
                    Merge with...
                  </button>
                  <button
                    onClick={() => {
                      setDeleteConfirmTag(tag.id);
                      setContextMenuTag(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-destructive hover:text-destructive-foreground transition-colors text-left text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}

              {/* Merge Modal */}
              {mergingTag === tag.id && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-popover border border-border rounded-lg shadow-xl p-4 max-w-sm w-full mx-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Merge Tag</h3>
                      <button
                        onClick={() => setMergingTag(null)}
                        className="p-1 hover:bg-accent rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Merge "<strong>{tag.name}</strong>" into:
                    </p>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {tags
                        .filter(t => t.id !== tag.id)
                        .map(targetTag => (
                          <button
                            key={targetTag.id}
                            onClick={() => handleMerge(tag.id, targetTag.id)}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent rounded transition-colors text-left"
                          >
                            <span>{targetTag.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({notes.filter(n => n.tags.includes(targetTag.name)).length})
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Confirmation Modal */}
              {deleteConfirmTag === tag.id && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-popover border border-border rounded-lg shadow-xl p-4 max-w-sm w-full mx-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Delete Tag</h3>
                      <button
                        onClick={() => setDeleteConfirmTag(null)}
                        className="p-1 hover:bg-accent rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Are you sure you want to delete "<strong>{tag.name}</strong>"?
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      This tag will be removed from <strong>{tag.count}</strong>{' '}
                      {tag.count === 1 ? 'note' : 'notes'}. This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteConfirm(tag.id)}
                        className="flex-1 px-3 py-2 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmTag(null)}
                        className="flex-1 px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
