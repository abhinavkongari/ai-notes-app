import { useState, useEffect, useRef } from 'react';
import { Search, FileText, FolderPlus, Settings as SettingsIcon, Keyboard } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore.js';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
}

interface Command {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'Notes' | 'Navigation' | 'Settings' | 'AI';
}

export function CommandPalette({ isOpen, onClose, onOpenSettings, onOpenShortcuts }: CommandPaletteProps) {
  const {
    createNote,
    notes,
    setCurrentNote,
    selectedFolderId,
  } = useAppStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build commands list
  const commands: Command[] = [
    // Core actions
    {
      id: 'new-note',
      label: 'Create New Note',
      description: 'Create a new note in the current folder',
      icon: <FileText className="w-4 h-4" />,
      action: () => {
        createNote(selectedFolderId);
        onClose();
      },
      category: 'Notes',
    },
    {
      id: 'new-folder',
      label: 'Create New Folder',
      description: 'Create a new folder',
      icon: <FolderPlus className="w-4 h-4" />,
      action: () => {
        // This would open a folder creation dialog
        onClose();
      },
      category: 'Notes',
    },
    // Settings
    {
      id: 'open-settings',
      label: 'Open Settings',
      description: 'Open application settings',
      icon: <SettingsIcon className="w-4 h-4" />,
      action: () => {
        onOpenSettings();
        onClose();
      },
      category: 'Settings',
    },
    {
      id: 'shortcuts',
      label: 'Keyboard Shortcuts',
      description: 'View all keyboard shortcuts',
      icon: <Keyboard className="w-4 h-4" />,
      action: () => {
        onOpenShortcuts();
        onClose();
      },
      category: 'Settings',
    },
    // Recent notes (up to 10)
    ...notes.slice(0, 10).map(note => ({
      id: `note-${note.id}`,
      label: note.title || 'Untitled',
      description: `Open "${note.title || 'Untitled'}"`,
      icon: <FileText className="w-4 h-4" />,
      action: () => {
        setCurrentNote(note.id);
        onClose();
      },
      category: 'Navigation' as const,
    })),
  ];

  // Filter commands based on query
  const filteredCommands = query.trim()
    ? commands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.description.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  // Reset selected index when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Command Palette */}
      <div className="relative bg-background border border-border rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[60vh]">
        {/* Search Input */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
          />
          <kbd className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No commands found
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                    index === selectedIndex
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  <div className={index === selectedIndex ? 'text-primary-foreground' : 'text-muted-foreground'}>
                    {cmd.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{cmd.label}</div>
                    <div className={`text-xs truncate ${index === selectedIndex ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {cmd.description}
                    </div>
                  </div>
                  <div className={`text-xs ${index === selectedIndex ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                    {cmd.category}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded font-mono">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded font-mono">Enter</kbd>
              Select
            </span>
          </div>
          <span>{filteredCommands.length} commands</span>
        </div>
      </div>
    </div>
  );
}

