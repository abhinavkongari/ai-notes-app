import { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore.js';
import { PlusCircle, Moon, Sun, Settings, PanelLeftClose } from 'lucide-react';
import { Search } from './Search.js';
import { Folders } from './Folders.js';
import { Tags } from './Tags.js';
import { NotesList } from './NotesList.js';
import { SettingsModal } from '../settings/SettingsModal.js';

export function Sidebar() {
  const { createNote, selectedFolderId, theme, toggleTheme, toggleSidebar } = useAppStore();
  const [showSettings, setShowSettings] = useState(false);

  const handleNewNote = () => {
    createNote(selectedFolderId);
  };

  return (
    <div className="w-80 border-r border-border flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h1 className="text-xl font-bold">Notes</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-accent rounded transition-colors"
            title="Hide sidebar (Ctrl+B)"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-accent rounded transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-accent rounded transition-colors"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button
            onClick={handleNewNote}
            className="p-2 hover:bg-accent rounded transition-colors"
            title="New note"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <Search />

      {/* Tags */}
      <Tags />

      {/* Folders with inline notes */}
      <div className="flex-1 overflow-y-auto">
        <Folders />
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
