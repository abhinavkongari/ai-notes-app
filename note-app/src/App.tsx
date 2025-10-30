import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { Sidebar } from './components/sidebar/Sidebar.js';
import { Editor } from './components/editor/Editor.js';
import { useAppStore } from './stores/useAppStore.js';

function App() {
  const theme = useAppStore(state => state.theme);

  // Apply theme class to document root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Editor />
        </main>
      </div>
      <Toaster position="bottom-right" theme={theme} richColors />
    </>
  );
}

export default App;
