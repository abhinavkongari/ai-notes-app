import { useAppStore } from '../../stores/useAppStore.js';
import { FileText, Star, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from '../../lib/dateUtils.js';
import { useState } from 'react';

export function NotesList() {
  const { currentNoteId, setCurrentNote, deleteNote, updateNote, getFilteredNotes } = useAppStore();
  const filteredNotes = getFilteredNotes();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteTitle, setEditingNoteTitle] = useState('');

  const handleDelete = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(noteId);
    }
  };

  const toggleFavorite = (e: React.MouseEvent, noteId: string, isFavorite: boolean) => {
    e.stopPropagation();
    updateNote(noteId, { isFavorite: !isFavorite });
  };

  const handleStartEdit = (e: React.MouseEvent, noteId: string, noteTitle: string) => {
    e.stopPropagation();
    setEditingNoteId(noteId);
    setEditingNoteTitle(noteTitle);
  };

  const handleSaveEdit = async (noteId: string, originalTitle: string) => {
    if (editingNoteTitle.trim() && editingNoteTitle !== originalTitle) {
      await updateNote(noteId, { title: editingNoteTitle.trim() });
    }
    setEditingNoteId(null);
    setEditingNoteTitle('');
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingNoteTitle('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, noteId: string, originalTitle: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit(noteId, originalTitle);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  if (filteredNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
        <FileText className="w-12 h-12 mb-2 opacity-50" />
        <p className="text-sm">No notes found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="overflow-y-auto flex-1">
        {filteredNotes.map(note => (
          <div
            key={note.id}
            onClick={() => {
              // Prevent note selection when in edit mode
              if (editingNoteId !== note.id) {
                setCurrentNote(note.id);
              }
            }}
            className={`p-3 border-b border-border cursor-pointer hover:bg-accent transition-colors ${
              currentNoteId === note.id ? 'bg-accent' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {editingNoteId === note.id ? (
                  <input
                    type="text"
                    value={editingNoteTitle}
                    onChange={(e) => setEditingNoteTitle(e.target.value)}
                    onBlur={() => handleSaveEdit(note.id, note.title)}
                    onKeyDown={(e) => handleEditKeyDown(e, note.id, note.title)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    className="w-full px-1 py-0 text-sm font-medium border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring mb-1"
                  />
                ) : (
                  <h3 
                    className="font-medium text-sm truncate mb-1 cursor-text"
                    onDoubleClick={(e) => handleStartEdit(e, note.id, note.title)}
                  >
                    {note.title}
                  </h3>
                )}
                <p className="text-xs text-muted-foreground mb-2">
                  {formatDistanceToNow(note.updatedAt)}
                </p>
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => toggleFavorite(e, note.id, note.isFavorite)}
                  className="p-1 hover:bg-background rounded transition-colors"
                  title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star
                    className={`w-4 h-4 ${
                      note.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                    }`}
                  />
                </button>
                <button
                  onClick={(e) => handleDelete(e, note.id)}
                  className="p-1 hover:bg-background rounded transition-colors"
                  title="Delete note"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
