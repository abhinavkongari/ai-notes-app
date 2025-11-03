import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  // Core shortcuts
  { keys: ['Ctrl', 'N'], description: 'Create new note', category: 'Core' },
  { keys: ['Ctrl', 'F'], description: 'Focus search', category: 'Core' },
  { keys: ['Ctrl', 'S'], description: 'Save immediately', category: 'Core' },
  { keys: ['Ctrl', 'K'], description: 'Open command palette', category: 'Core' },
  { keys: ['Ctrl', ','], description: 'Open settings', category: 'Core' },
  { keys: ['Ctrl', 'B'], description: 'Toggle sidebar', category: 'Core' },
  { keys: ['F11'], description: 'Toggle focus mode', category: 'Core' },
  { keys: ['Esc'], description: 'Close modals', category: 'Core' },
  
  // Navigation
  { keys: ['Ctrl', '↑'], description: 'Previous note', category: 'Navigation' },
  { keys: ['Ctrl', '↓'], description: 'Next note', category: 'Navigation' },
  { keys: ['Ctrl', '1-9'], description: 'Jump to note 1-9', category: 'Navigation' },
  
  // Editor
  { keys: ['Ctrl', 'B'], description: 'Bold', category: 'Editor' },
  { keys: ['Ctrl', 'I'], description: 'Italic', category: 'Editor' },
  { keys: ['Ctrl', 'U'], description: 'Underline', category: 'Editor' },
  { keys: ['Ctrl', 'D'], description: 'Duplicate line', category: 'Editor' },
  { keys: ['Ctrl', 'L'], description: 'Select line', category: 'Editor' },
  { keys: ['Ctrl', '/'], description: 'Toggle comment', category: 'Editor' },
  { keys: ['Ctrl', ']'], description: 'Indent', category: 'Editor' },
  { keys: ['Ctrl', '['], description: 'Outdent', category: 'Editor' },
  { keys: ['Ctrl', 'Z'], description: 'Undo', category: 'Editor' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo', category: 'Editor' },
];

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const categories = Array.from(new Set(SHORTCUTS.map(s => s.category)));

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background border border-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Command className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {SHORTCUTS.filter(s => s.category === category).map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded shadow-sm">
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground text-xs">+</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-2 py-0.5 bg-background border border-border rounded text-xs font-mono">Ctrl</kbd> + <kbd className="px-2 py-0.5 bg-background border border-border rounded text-xs font-mono">/</kbd> or <kbd className="px-2 py-0.5 bg-background border border-border rounded text-xs font-mono">?</kbd> to show this panel
          </p>
        </div>
      </div>
    </div>
  );
}

