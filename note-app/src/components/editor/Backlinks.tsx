import { useMemo } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore.js';
import { getBacklinks } from '../../lib/backlinks.js';

export function Backlinks() {
  const { notes, currentNoteId, setCurrentNote } = useAppStore();
  const currentNote = notes.find(n => n.id === currentNoteId);

  const backlinks = useMemo(() => {
    if (!currentNote) return [];
    return getBacklinks(currentNote, notes);
  }, [currentNote, notes]);

  if (!currentNote) return null;

  if (backlinks.length === 0) {
    return (
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground">
            Backlinks
          </h3>
          <span className="text-xs text-muted-foreground">
            (0)
          </span>
        </div>
        <p className="text-sm text-muted-foreground italic">
          No notes link to this one yet
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Use <code className="bg-muted px-1 rounded">[[{currentNote.title}]]</code> in other notes to create backlinks
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">
          Backlinks
        </h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {backlinks.length}
        </span>
      </div>

      <div className="space-y-2">
        {backlinks.map((note) => (
          <button
            key={note.id}
            onClick={() => setCurrentNote(note.id)}
            className="w-full text-left p-3 rounded-lg border border-border bg-muted/30 hover:bg-accent hover:border-primary/50 transition-all group cursor-pointer shadow-sm hover:shadow-md"
          >
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 mt-0.5 text-primary group-hover:text-primary flex-shrink-0 transition-transform group-hover:scale-110" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors underline decoration-transparent group-hover:decoration-primary decoration-1 underline-offset-2">
                  {note.title}
                </p>
                {note.content && (
                  <p className="text-xs text-muted-foreground truncate mt-1 group-hover:text-foreground/80">
                    {extractBacklinkContext(note.content, currentNote.title)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Updated {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Extract context around the wiki link for preview
 */
function extractBacklinkContext(content: string, targetTitle: string): string {
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  // Find the wiki link
  const regex = new RegExp(`\\[\\[${escapeRegex(targetTitle)}\\]\\]`, 'i');
  const match = plainText.match(regex);

  if (!match) return plainText.substring(0, 100) + '...';

  const matchIndex = match.index || 0;
  const before = plainText.substring(Math.max(0, matchIndex - 50), matchIndex);
  const after = plainText.substring(matchIndex + match[0].length, matchIndex + match[0].length + 50);

  return `...${before}[[${targetTitle}]]${after}...`;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
