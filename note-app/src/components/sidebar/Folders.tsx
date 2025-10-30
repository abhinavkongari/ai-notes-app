import { useAppStore } from '../../stores/useAppStore.js';
import { Folder, FolderPlus, Trash2, Home } from 'lucide-react';
import { useState } from 'react';

export function Folders() {
  const { folders, selectedFolderId, setSelectedFolder, createFolder, deleteFolder } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

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
        {folders.map(folder => (
          <div
            key={folder.id}
            onClick={() => setSelectedFolder(folder.id)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors cursor-pointer group ${
              selectedFolderId === folder.id
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent/50'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span className="flex-1 truncate">{folder.name}</span>
            <button
              onClick={(e) => handleDeleteFolder(e, folder.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-background rounded transition-all"
              title="Delete folder"
            >
              <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        ))}
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
