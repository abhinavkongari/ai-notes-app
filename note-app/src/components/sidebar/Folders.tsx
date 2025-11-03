import { useAppStore } from '../../stores/useAppStore.js';
import { FolderPlus, Trash2, Home, ChevronRight, ChevronDown, Star, Settings, ArrowUpDown, LayoutList } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ColorPicker } from '../shared/ColorPicker.js';
import { IconPicker } from '../shared/IconPicker.js';
import { getFolderIcon } from '../../lib/folderIcons.js';
import { highlightSearchQuery, extractNoteSnippet } from '../../lib/searchHighlight.js';

export function Folders() {
  const { folders, notes, selectedFolderId, setSelectedFolder, createFolder, deleteFolder, updateFolder, updateNote, setCurrentNote, currentNoteId, deleteNote, searchQuery, viewDensity, showSnippets, sortOption, setSortOption, setViewDensity, toggleShowSnippets } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState<string>('#6b7280');
  const [newFolderIcon, setNewFolderIcon] = useState<string>('Folder');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [editingFolderColor, setEditingFolderColor] = useState<string>('#6b7280');
  const [editingFolderIcon, setEditingFolderIcon] = useState<string>('Folder');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showingCustomization, setShowingCustomization] = useState<string | null>(null);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const viewMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
      if (viewMenuRef.current && !viewMenuRef.current.contains(e.target as Node)) {
        setShowViewMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      const folder = await createFolder(newFolderName.trim());
      // Update folder with color and icon
      if (folder) {
        await updateFolder(folder.id, { 
          color: newFolderColor,
          icon: newFolderIcon
        });
      }
      setNewFolderName('');
      setNewFolderColor('#6b7280');
      setNewFolderIcon('Folder');
      setIsCreating(false);
      setShowingCustomization(null);
    }
  };

  const handleDeleteFolder = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    if (confirm('Delete this folder? Notes will be moved to root.')) {
      deleteFolder(folderId);
    }
  };

  const handleStartEdit = (e: React.MouseEvent, folderId: string, folderName: string, folderColor?: string, folderIcon?: string) => {
    e.stopPropagation();
    setEditingFolderId(folderId);
    setEditingFolderName(folderName);
    setEditingFolderColor(folderColor || '#6b7280');
    setEditingFolderIcon(folderIcon || 'Folder');
  };

  const handleSaveEdit = async (folderId: string) => {
    if (editingFolderName.trim()) {
      await updateFolder(folderId, { 
        name: editingFolderName.trim(),
        color: editingFolderColor,
        icon: editingFolderIcon
      });
    }
    setEditingFolderId(null);
    setEditingFolderName('');
    setShowingCustomization(null);
  };

  const handleCancelEdit = () => {
    setEditingFolderId(null);
    setEditingFolderName('');
    setShowingCustomization(null);
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

  const getFavoriteNotes = () => {
    return notes.filter(note => note.isFavorite);
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

  const handleDeleteNote = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (confirm('Delete this note? This action cannot be undone.')) {
      deleteNote(noteId);
    }
  };

  const renderNote = (note: typeof notes[0]) => {
    const highlightedTitle = searchQuery ? highlightSearchQuery(note.title, searchQuery) : note.title;
    const snippet = showSnippets && viewDensity === 'comfortable' ? extractNoteSnippet(note.content) : '';
    const padding = viewDensity === 'compact' ? 'py-1' : 'py-1.5';
    
    return (
      <div
        key={note.id}
        draggable
        onDragStart={(e) => handleDragStart(e, note.id)}
        onClick={() => setCurrentNote(note.id)}
        className={`pl-8 pr-2 ${padding} text-sm cursor-move hover:bg-accent/50 transition-colors group ${
          currentNoteId === note.id ? 'bg-accent text-accent-foreground' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <div 
              className="truncate text-xs font-medium"
              dangerouslySetInnerHTML={{ __html: highlightedTitle }}
            />
            {snippet && (
              <div className="text-xs text-muted-foreground truncate mt-0.5">
                {snippet}
              </div>
            )}
          </div>
          <button
            onClick={(e) => handleDeleteNote(e, note.id)}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-background rounded transition-all flex-shrink-0"
            title="Delete note"
          >
            <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>
    );
  };

  const sortOptions = [
    { value: 'modified-desc', label: 'Modified (Newest)' },
    { value: 'modified-asc', label: 'Modified (Oldest)' },
    { value: 'created-desc', label: 'Created (Newest)' },
    { value: 'created-asc', label: 'Created (Oldest)' },
    { value: 'title-asc', label: 'Title (A-Z)' },
    { value: 'title-desc', label: 'Title (Z-A)' },
  ];

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase">Folders</h3>
        <div className="flex items-center gap-1">
          {/* Sort Menu */}
          <div className="relative" ref={sortMenuRef}>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="p-1 hover:bg-accent rounded transition-colors"
              title="Sort notes"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
            {showSortMenu && (
              <div className="absolute top-full right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 min-w-[180px] py-1">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortOption(option.value as any);
                      setShowSortMenu(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm hover:bg-accent transition-colors text-left ${
                      sortOption === option.value ? 'bg-accent' : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative" ref={viewMenuRef}>
            <button
              onClick={() => setShowViewMenu(!showViewMenu)}
              className="p-1 hover:bg-accent rounded transition-colors"
              title="View options"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            {showViewMenu && (
              <div className="absolute top-full right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 min-w-[160px] py-1">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase border-b border-border">
                  Density
                </div>
                <button
                  onClick={() => {
                    setViewDensity('compact');
                    setShowViewMenu(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm hover:bg-accent transition-colors text-left ${
                    viewDensity === 'compact' ? 'bg-accent' : ''
                  }`}
                >
                  Compact
                </button>
                <button
                  onClick={() => {
                    setViewDensity('comfortable');
                    setShowViewMenu(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm hover:bg-accent transition-colors text-left ${
                    viewDensity === 'comfortable' ? 'bg-accent' : ''
                  }`}
                >
                  Comfortable
                </button>
                <div className="border-t border-border my-1"></div>
                <button
                  onClick={() => {
                    toggleShowSnippets();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                >
                  Show Snippets
                  <input
                    type="checkbox"
                    checked={showSnippets}
                    readOnly
                    className="ml-2"
                  />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="p-1 hover:bg-accent rounded transition-colors"
            title="New folder"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>
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

        {/* Favorites */}
        {getFavoriteNotes().length > 0 && (
          <div className="mt-2 pt-2 border-t border-border">
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              FAVORITES ({getFavoriteNotes().length})
            </div>
            <div>
              {getFavoriteNotes().map(renderNote)}
            </div>
          </div>
        )}

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
                  {(() => {
                    const FolderIcon = getFolderIcon(folder.icon);
                    return <FolderIcon className="w-4 h-4" style={{ color: folder.color }} />;
                  })()}
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
                      onDoubleClick={(e) => handleStartEdit(e, folder.id, folder.name, folder.color, folder.icon)}
                    >
                      {folder.name}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">({folderNotes.length})</span>
                </div>
                {editingFolderId === folder.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowingCustomization(showingCustomization === folder.id ? null : folder.id);
                    }}
                    className="p-0.5 hover:bg-background rounded transition-all"
                    title="Customize folder"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={(e) => handleDeleteFolder(e, folder.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-background rounded transition-all"
                  title="Delete folder"
                >
                  <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
              
              {/* Folder customization */}
              {editingFolderId === folder.id && showingCustomization === folder.id && (
                <div className="ml-6 mr-2 mt-2 p-3 bg-accent/50 rounded border border-border space-y-3">
                  <ColorPicker 
                    selectedColor={editingFolderColor}
                    onColorSelect={setEditingFolderColor}
                  />
                  <IconPicker 
                    selectedIcon={editingFolderIcon}
                    onIconSelect={setEditingFolderIcon}
                    color={editingFolderColor}
                  />
                </div>
              )}
              
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
                  className={`pl-4 pr-2 py-1.5 text-sm cursor-move hover:bg-accent/50 transition-colors flex items-center gap-2 group ${
                    currentNoteId === note.id ? 'bg-accent text-accent-foreground' : ''
                  }`}
                >
                  <span className="flex-1 truncate text-xs">{note.title}</span>
                  <button
                    onClick={(e) => handleDeleteNote(e, note.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-background rounded transition-all"
                    title="Delete note"
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New folder form */}
      {isCreating && (
        <form onSubmit={handleCreateFolder} className="mt-2 p-3 bg-accent/50 rounded border border-border space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Folder Name</label>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name"
              autoFocus
              className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring mt-1"
            />
          </div>
          
          <ColorPicker 
            selectedColor={newFolderColor}
            onColorSelect={setNewFolderColor}
          />
          
          <IconPicker 
            selectedIcon={newFolderIcon}
            onIconSelect={setNewFolderIcon}
            color={newFolderColor}
          />
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewFolderName('');
                setNewFolderColor('#6b7280');
                setNewFolderIcon('Folder');
              }}
              className="flex-1 px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
