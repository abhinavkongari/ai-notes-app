import { useAppStore } from '../../stores/useAppStore.js';
import { Type, Palette, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';

export function AppearanceSettings() {
  const { theme, toggleTheme } = useAppStore();
  
  // Load settings from localStorage
  const [fontFamily, setFontFamily] = useState<string>(
    localStorage.getItem('editor-font-family') || 'system'
  );
  const [fontSize, setFontSize] = useState<string>(
    localStorage.getItem('editor-font-size') || 'medium'
  );
  const [editorWidth, setEditorWidth] = useState<string>(
    localStorage.getItem('editor-width') || 'medium'
  );
  const [autoSaveInterval, setAutoSaveInterval] = useState<string>(
    localStorage.getItem('auto-save-interval') || '2000'
  );
  const [systemTheme, setSystemTheme] = useState<boolean>(
    localStorage.getItem('system-theme') === 'true'
  );

  // Apply font family
  useEffect(() => {
    const fontMap: Record<string, string> = {
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      serif: 'Georgia, "Times New Roman", serif',
      sans: '"Inter", "Helvetica Neue", Arial, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
    };
    
    const editor = document.querySelector('.ProseMirror') as HTMLElement;
    if (editor) {
      editor.style.fontFamily = fontMap[fontFamily] || fontMap.system;
    }
    localStorage.setItem('editor-font-family', fontFamily);
  }, [fontFamily]);

  // Apply font size
  useEffect(() => {
    const sizeMap: Record<string, string> = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px',
    };
    
    const editor = document.querySelector('.ProseMirror') as HTMLElement;
    if (editor) {
      editor.style.fontSize = sizeMap[fontSize] || sizeMap.medium;
    }
    localStorage.setItem('editor-font-size', fontSize);
  }, [fontSize]);

  // Apply editor width
  useEffect(() => {
    const widthMap: Record<string, string> = {
      narrow: '42rem',    // 672px
      medium: '50rem',    // 800px
      wide: '62.5rem',    // 1000px
      full: '100%',
    };
    
    // This will be applied via CSS custom property
    document.documentElement.style.setProperty('--editor-max-width', widthMap[editorWidth] || widthMap.medium);
    localStorage.setItem('editor-width', editorWidth);
  }, [editorWidth]);

  // Auto-save interval (stored but used in Editor.tsx)
  useEffect(() => {
    localStorage.setItem('auto-save-interval', autoSaveInterval);
    // Trigger custom event to notify Editor
    window.dispatchEvent(new CustomEvent('autosave-interval-changed', { detail: autoSaveInterval }));
  }, [autoSaveInterval]);

  // System theme detection
  useEffect(() => {
    localStorage.setItem('system-theme', systemTheme.toString());
    
    if (systemTheme) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
        if (e.matches) {
          // Dark mode
          if (theme !== 'dark') toggleTheme();
        } else {
          // Light mode
          if (theme !== 'light') toggleTheme();
        }
      };
      
      // Initial check
      handleChange(mediaQuery);
      
      // Listen for changes
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [systemTheme, theme, toggleTheme]);

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Theme
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={systemTheme}
              onChange={(e) => setSystemTheme(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <span className="text-sm">Follow system theme</span>
          </label>
          
          {!systemTheme && (
            <div className="flex gap-2">
              <button
                onClick={() => theme === 'dark' && toggleTheme()}
                className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'light'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-accent'
                }`}
              >
                ☀️ Light
              </button>
              <button
                onClick={() => theme === 'light' && toggleTheme()}
                className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-accent'
                }`}
              >
                🌙 Dark
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Font Family */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Type className="w-4 h-4" />
          Font Family
        </h3>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="system">System Default</option>
          <option value="serif">Serif (Georgia)</option>
          <option value="sans">Sans Serif (Inter)</option>
          <option value="mono">Monospace (JetBrains Mono)</option>
        </select>
      </div>

      {/* Font Size */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Font Size</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
            { value: 'xlarge', label: 'X-Large' },
          ].map((size) => (
            <button
              key={size.value}
              onClick={() => setFontSize(size.value)}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                fontSize === size.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-accent'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Width */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Monitor className="w-4 h-4" />
          Editor Width
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 'narrow', label: 'Narrow' },
            { value: 'medium', label: 'Medium' },
            { value: 'wide', label: 'Wide' },
            { value: 'full', label: 'Full' },
          ].map((width) => (
            <button
              key={width.value}
              onClick={() => setEditorWidth(width.value)}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                editorWidth === width.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-accent'
              }`}
            >
              {width.label}
            </button>
          ))}
        </div>
      </div>

      {/* Auto-save Interval */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Auto-save Interval</h3>
        <select
          value={autoSaveInterval}
          onChange={(e) => setAutoSaveInterval(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="1000">1 second (Fast)</option>
          <option value="2000">2 seconds (Default)</option>
          <option value="5000">5 seconds</option>
          <option value="10000">10 seconds</option>
          <option value="0">Off (Manual save only)</option>
        </select>
        {autoSaveInterval === '0' && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            ⚠️ Warning: Auto-save is disabled. Use Ctrl+S to save manually.
          </p>
        )}
      </div>

      {/* Preview */}
      <div className="border border-border rounded-lg p-4 bg-muted/30">
        <p className="text-xs text-muted-foreground mb-2">Preview:</p>
        <div 
          className="prose prose-sm dark:prose-invert"
          style={{
            fontFamily: fontFamily === 'system' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' :
                       fontFamily === 'serif' ? 'Georgia, "Times New Roman", serif' :
                       fontFamily === 'sans' ? '"Inter", "Helvetica Neue", Arial, sans-serif' :
                       '"JetBrains Mono", "Fira Code", Consolas, monospace',
            fontSize: fontSize === 'small' ? '14px' :
                     fontSize === 'medium' ? '16px' :
                     fontSize === 'large' ? '18px' : '20px',
          }}
        >
          <p>The quick brown fox jumps over the lazy dog. This is how your editor text will look.</p>
        </div>
      </div>
    </div>
  );
}

