import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { Sidebar } from './components/sidebar/Sidebar.js';
import { Editor } from './components/editor/Editor.js';
import { useAppStore } from './stores/useAppStore.js';
import { PanelLeft, Maximize2, Minimize2 } from 'lucide-react';

function App() {
  const theme = useAppStore(state => state.theme);
  const sidebarVisible = useAppStore(state => state.sidebarVisible);
  const focusMode = useAppStore(state => state.focusMode);
  const toggleSidebar = useAppStore(state => state.toggleSidebar);
  const toggleFocusMode = useAppStore(state => state.toggleFocusMode);

  // Apply theme class to document root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Sidebar toggle: Ctrl/Cmd + B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      // Focus mode toggle: F11
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFocusMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, toggleFocusMode]);

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        {sidebarVisible && <Sidebar />}
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
      <Toaster position="bottom-right" theme={theme} richColors />
    </>
  );
}

export default App;
