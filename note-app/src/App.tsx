import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { Sidebar } from './components/sidebar/Sidebar.js';
import { Editor } from './components/editor/Editor.js';
import { ShortcutsModal } from './components/shortcuts/ShortcutsModal.js';
import { CommandPalette } from './components/shortcuts/CommandPalette.js';
import { SettingsModal } from './components/settings/SettingsModal.js';
import { useAppStore } from './stores/useAppStore.js';
import { PanelLeft, Maximize2, Minimize2 } from 'lucide-react';
import { toast } from 'sonner';

function App() {
  const theme = useAppStore(state => state.theme);
  const sidebarVisible = useAppStore(state => state.sidebarVisible);
  const focusMode = useAppStore(state => state.focusMode);
  const toggleSidebar = useAppStore(state => state.toggleSidebar);
  const toggleFocusMode = useAppStore(state => state.toggleFocusMode);
  const createNote = useAppStore(state => state.createNote);
  const selectedFolderId = useAppStore(state => state.selectedFolderId);
  const notes = useAppStore(state => state.notes);
  const currentNoteId = useAppStore(state => state.currentNoteId);
  const setCurrentNote = useAppStore(state => state.setCurrentNote);
  const updateNote = useAppStore(state => state.updateNote);

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Apply theme class to document root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Comprehensive keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      
      // Escape: Close modals
      if (e.key === 'Escape') {
        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }
        if (showCommandPalette) {
          setShowCommandPalette(false);
          return;
        }
        if (showSettings) {
          setShowSettings(false);
          return;
        }
      }
      
      // Ctrl+K: Command Palette
      if (isCtrl && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
        return;
      }
      
      // Ctrl+/: Shortcuts Modal
      if (isCtrl && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(true);
        return;
      }
      
      // ?: Shortcuts Modal (shift+/)
      if (e.key === '?' && !isCtrl) {
        e.preventDefault();
        setShowShortcuts(true);
        return;
      }
      
      // Ctrl+N: New Note
      if (isCtrl && e.key === 'n') {
        e.preventDefault();
        createNote(selectedFolderId);
        toast.success('New note created');
        return;
      }
      
      // Ctrl+F: Focus Search
      if (isCtrl && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('input[placeholder="Search notes..."]');
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }
      
      // Ctrl+S: Save immediately
      if (isCtrl && e.key === 's') {
        e.preventDefault();
        if (currentNoteId) {
          const note = notes.find(n => n.id === currentNoteId);
          if (note) {
            // Force immediate save by updating with current data
            updateNote(currentNoteId, { 
              title: note.title, 
              content: note.content 
            }).then(() => {
              toast.success('Note saved');
            });
          }
        }
        return;
      }
      
      // Ctrl+,: Open Settings
      if (isCtrl && e.key === ',') {
        e.preventDefault();
        setShowSettings(true);
        return;
      }
      
      // Ctrl+B: Toggle Sidebar
      if (isCtrl && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }
      
      // F11: Toggle Focus Mode
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFocusMode();
        return;
      }
      
      // Note Navigation: Ctrl+↑/↓
      if (isCtrl && currentNoteId) {
        const currentIndex = notes.findIndex(n => n.id === currentNoteId);
        
        if (e.key === 'ArrowUp' && currentIndex > 0) {
          e.preventDefault();
          setCurrentNote(notes[currentIndex - 1].id);
          toast.success(`Switched to: ${notes[currentIndex - 1].title || 'Untitled'}`);
          return;
        }
        
        if (e.key === 'ArrowDown' && currentIndex < notes.length - 1) {
          e.preventDefault();
          setCurrentNote(notes[currentIndex + 1].id);
          toast.success(`Switched to: ${notes[currentIndex + 1].title || 'Untitled'}`);
          return;
        }
      }
      
      // Ctrl+1 to Ctrl+9: Jump to note
      if (isCtrl && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (notes[index]) {
          setCurrentNote(notes[index].id);
          toast.success(`Jumped to: ${notes[index].title || 'Untitled'}`);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    toggleSidebar,
    toggleFocusMode,
    createNote,
    selectedFolderId,
    notes,
    currentNoteId,
    setCurrentNote,
    updateNote,
    showShortcuts,
    showCommandPalette,
    showSettings,
  ]);

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        {sidebarVisible && <Sidebar onOpenSettings={() => setShowSettings(true)} />}
        <main className="flex-1 overflow-hidden flex flex-col">
          {!sidebarVisible && !focusMode && (
            <div className="px-6 py-4 border-b border-border bg-background flex items-center gap-2">
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-accent rounded-lg transition-colors border border-border"
                title="Show sidebar (Ctrl+B)"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
              <button
                onClick={toggleFocusMode}
                className="p-2 hover:bg-accent rounded-lg transition-colors border border-border"
                title="Focus mode (F11)"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          )}
          {focusMode && (
            <button
              onClick={toggleFocusMode}
              className="absolute top-4 right-4 z-50 p-2 hover:bg-accent rounded-lg transition-colors bg-background/80 backdrop-blur-sm border border-border shadow-lg"
              title="Exit focus mode (F11)"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 overflow-hidden">
            <Editor />
          </div>
        </main>
      </div>
      
      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
      
      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onOpenSettings={() => {
          setShowCommandPalette(false);
          setShowSettings(true);
        }}
        onOpenShortcuts={() => {
          setShowCommandPalette(false);
          setShowShortcuts(true);
        }}
      />
      
      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
      
      <Toaster position="bottom-right" theme={theme} richColors />
    </>
  );
}

export default App;
