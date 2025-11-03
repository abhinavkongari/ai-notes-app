import { X, Copy, RotateCcw, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import * as Diff from 'diff';

interface AIResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  resultText: string;
  actionName: string;
  onAccept: () => void;
  onRetry: () => void;
}

export function AIResultModal({
  isOpen,
  onClose,
  originalText,
  resultText,
  actionName,
  onAccept,
  onRetry,
}: AIResultModalProps) {
  const [showDiff, setShowDiff] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  // Generate diff
  const diff = Diff.diffWords(originalText, resultText);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-popover border border-border rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-lg">{actionName} Result</h3>
            <p className="text-sm text-muted-foreground">Review and apply changes</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
          <button
            onClick={() => setShowDiff(false)}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              !showDiff ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
          >
            Result
          </button>
          <button
            onClick={() => setShowDiff(true)}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              showDiff ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
          >
            Diff View
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {!showDiff ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Original:</h4>
                <div className="p-3 bg-muted/50 rounded border border-border text-sm whitespace-pre-wrap">
                  {originalText}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Result:</h4>
                <div className="p-3 bg-accent/50 rounded border border-primary/20 text-sm whitespace-pre-wrap">
                  {resultText}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Changes:</h4>
              <div className="p-3 bg-muted/50 rounded border border-border text-sm font-mono whitespace-pre-wrap">
                {diff.map((part, index) => (
                  <span
                    key={index}
                    className={
                      part.added
                        ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                        : part.removed
                        ? 'bg-red-500/20 text-red-700 dark:text-red-300 line-through'
                        : ''
                    }
                  >
                    {part.value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded hover:bg-accent transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded hover:bg-accent transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onAccept}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Accept Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

