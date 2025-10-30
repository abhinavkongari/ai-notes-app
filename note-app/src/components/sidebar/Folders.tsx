import { useAppStore } from '../../stores/useAppStore.js';
import { Folder, FolderPlus, Trash2, Home, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function Folders() {
  const { folders, notes, selectedFolderId, setSelectedFolder, createFolder, deleteFolder, updateFolder, updateNote, setCurrentNote, currentNoteId } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      await createFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreating(false);
    }
  };

  const handleDeleteFolder = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    if (confirm('Delete this folder? Notes will be moved to root.')) {
      deleteFolder(folderId);
    }
  };

  const handleStartEdit = (e: React.MouseEvent, folderId: string, folderName: string) => {
    e.stopPropagation();
    setEditingFolderId(folderId);
    setEditingFolderName(folderName);
  };

  const handleSaveEdit = async (folderId: string) => {
    if (editingFolderName.trim() && editingFolderName !== folders.find(f => f.id === folderId)?.name) {
      await updateFolder(folderId, { name: editingFolderName.trim() });
    }
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  const handleCancelEdit = () => {
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, folderId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit(folderId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const getFolderNotes = (folderId: string) => {
    return notes.filter(note => note.folderId === folderId);
  };

  const getUnorganizedNotes = () => {
    return notes.filter(note => note.folderId === null);
  };

  const handleDragStart = (e: React.DragEvent, noteId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('noteId', noteId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnFolder = async (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const noteId = e.dataTransfer.getData('noteId');
    if (noteId) {
      await updateNote(noteId, { folderId });
    }
  };

  const handleDropOnUnorganized = async (e: React.DragEvent) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData('noteId');
    if (noteId) {
      await updateNote(noteId, { folderId: null });
    }
  };

  const renderNote = (note: typeof notes[0]) => (
    <div
      key={note.id}
      draggable
      onDragStart={(e) => handleDragStart(e, note.id)}
      onClick={() => setCurrentNote(note.id)}
      className={`pl-8 pr-2 py-1.5 text-sm cursor-move hover:bg-accent/50 transition-colors flex items-center gap-2 ${
        currentNoteId === note.id ? 'bg-accent text-accent-foreground' : ''
      }`}
    >
      <span className="flex-1 truncate text-xs">{note.title}</span>
    </div>
  );

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase">Folders</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 hover:bg-accent rounded transition-colors"
          title="New folder"
        >
          <FolderPlus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        {/* All Notes */}
        <button
          onClick={() => setSelectedFolder(null)}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
            selectedFolderId === null
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent/50'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>All Notes</span>
        </button>

        {/* Folder list */}
        {folders.map(folder => {
          const folderNotes = getFolderNotes(folder.id);
          const isExpanded = expandedFolders.has(folder.id);
          
          return (
            <div key={folder.id}>
              {/* Folder row */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnFolder(e, folder.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors group ${
                  selectedFolderId === folder.id
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50'
                }`}
              >
                <button
                  onClick={() => toggleFolderExpansion(folder.id)}
                  className="p-0 hover:bg-background rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                <div
                  onClick={() => setSelectedFolder(folder.id)}
                  className="flex items-center gap-2 flex-1 cursor-pointer"
                >
                  <Folder className="w-4 h-4" />
                  {editingFolderId === folder.id ? (
                    <input
                      type="text"
                      value={editingFolderName}
                      onChange={(e) => setEditingFolderName(e.target.value)}
                      onBlur={() => handleSaveEdit(folder.id)}
                      onKeyDown={(e) => handleEditKeyDown(e, folder.id)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="flex-1 px-1 py-0 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  ) : (
                    <span 
                      className="flex-1 truncate" 
                      onDoubleClick={(e) => handleStartEdit(e, folder.id, folder.name)}
                    >
                      {folder.name}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">({folderNotes.length})</span>
                </div>
                <button
                  onClick={(e) => handleDeleteFolder(e, folder.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-background rounded transition-all"
                  title="Delete folder"
                >
                  <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
              
              {/* Notes in folder */}
              {isExpanded && (
                <div className="ml-2">
                  {folderNotes.length === 0 ? (
                    <div className="pl-8 pr-2 py-1.5 text-xs text-muted-foreground italic">
                      No notes in this folder
                    </div>
                  ) : (
                    folderNotes.map(renderNote)
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Unorganized Notes */}
        {getUnorganizedNotes().length > 0 && (
          <div 
            className="mt-2 pt-2 border-t border-border"
            onDragOver={handleDragOver}
            onDrop={handleDropOnUnorganized}
          >
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
              Unorganized ({getUnorganizedNotes().length})
            </div>
            <div>
              {getUnorganizedNotes().map(note => (
                <div
                  key={note.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, note.id)}
                  onClick={() => setCurrentNote(note.id)}
                  className={`pl-4 pr-2 py-1.5 text-sm cursor-move hover:bg-accent/50 transition-colors flex items-center gap-2 ${
                    currentNoteId === note.id ? 'bg-accent text-accent-foreground' : ''
                  }`}
                >
                  <span className="flex-1 truncate text-xs">{note.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New folder form */}
      {isCreating && (
        <form onSubmit={handleCreateFolder} className="mt-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onBlur={() => !newFolderName && setIsCreating(false)}
            placeholder="Folder name"
            autoFocus
            className="w-full px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </form>
      )}
    </div>
  );
}
