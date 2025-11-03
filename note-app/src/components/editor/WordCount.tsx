import { Editor } from '@tiptap/react';
import { useState, useEffect } from 'react';

interface WordCountProps {
  editor: Editor;
}

export function WordCount({ editor }: WordCountProps) {
  const [stats, setStats] = useState({ words: 0, characters: 0, readingTime: 0 });

  useEffect(() => {
    const updateStats = () => {
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
      const characters = text.length;
      const readingTime = Math.ceil(words / 200); // Average reading speed: 200 words/minute

      setStats({ words, characters, readingTime });
    };

    // Initial calculation
    updateStats();

    // Update on content change
    editor.on('update', updateStats);

    return () => {
      editor.off('update', updateStats);
    };
  }, [editor]);

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border px-4 py-2 mt-8">
      <div className="flex items-center justify-end gap-4 text-xs text-muted-foreground">
        <span>{stats.words} {stats.words === 1 ? 'word' : 'words'}</span>
        <span>•</span>
        <span>{stats.characters} {stats.characters === 1 ? 'character' : 'characters'}</span>
        <span>•</span>
        <span>{stats.readingTime} min read</span>
      </div>
    </div>
  );
}

