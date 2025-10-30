import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../../stores/useAppStore.js';
import * as aiService from '../../lib/aiService';
import type { AIError } from '../../lib/aiService';

interface AIAssistantProps {
  editor: Editor | null;
}

export function AIAssistant({ editor }: AIAssistantProps) {
  const { aiSettings } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  if (!editor || !aiSettings.enabled) {
    return null;
  }

  const getSelectedText = (): string => {
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to, ' ');
  };

  const replaceSelection = (newText: string) => {
    const { from, to } = editor.state.selection;
    editor
      .chain()
      .focus()
      .deleteRange({ from, to })
      .insertContent(newText)
      .run();
  };

  const handleAIAction = async (
    action: string,
    aiFunction: (text: string) => Promise<string>
  ) => {
    const selectedText = getSelectedText();

    if (!selectedText.trim()) {
      toast.error('Please select some text first');
      return;
    }

    if (!aiSettings.apiKey) {
      toast.error('Please add your OpenAI API key in settings', {
        action: {
          label: 'Open Settings',
          onClick: () => {
            // This will be handled by parent component
            document.querySelector<HTMLButtonElement>('[title="Settings"]')?.click();
          },
        },
      });
      return;
    }

    setIsProcessing(true);
    setCurrentAction(action);

    try {
      const result = await aiFunction(selectedText);
      replaceSelection(result);
      toast.success(`${action} complete!`);
    } catch (error) {
      const aiError = error as AIError;

      switch (aiError.code) {
        case 'NO_API_KEY':
          toast.error('No API key found. Please add your key in settings.');
          break;
        case 'INVALID_API_KEY':
          toast.error('Invalid API key. Please check your settings.');
          break;
        case 'NETWORK_ERROR':
          toast.error('Network error. Please check your connection.');
          break;
        case 'RATE_LIMIT':
          toast.error('Rate limit exceeded. Please try again later.');
          break;
        default:
          toast.error(aiError.message || 'An error occurred. Please try again.');
      }

      console.error('AI Error:', aiError);
    } finally {
      setIsProcessing(false);
      setCurrentAction(null);
    }
  };

  const aiActions = [
    {
      label: 'Improve Writing',
      description: 'Enhance clarity and flow',
      action: () => handleAIAction('Improve Writing', aiService.improveWriting),
    },
    {
      label: 'Fix Grammar',
      description: 'Correct errors',
      action: () => handleAIAction('Fix Grammar', aiService.fixGrammar),
    },
    {
      label: 'Make Shorter',
      description: 'Condense text',
      action: () => handleAIAction('Make Shorter', aiService.makeShorter),
    },
    {
      label: 'Make Longer',
      description: 'Expand with details',
      action: () => handleAIAction('Make Longer', aiService.makeLonger),
    },
    {
      label: 'Professional Tone',
      description: 'Make it formal',
      action: () => handleAIAction('Professional Tone', (text) => aiService.changeTone(text, 'professional')),
    },
    {
      label: 'Casual Tone',
      description: 'Make it relaxed',
      action: () => handleAIAction('Casual Tone', (text) => aiService.changeTone(text, 'casual')),
    },
  ];

  return (
    <>
      <BubbleMenu
        editor={editor}
        options={{
          placement: 'top',
        }}
        shouldShow={({ state }) => {
          const { from, to } = state.selection;
          const selectedText = state.doc.textBetween(from, to, ' ');
          return selectedText.trim().length > 0 && !isProcessing;
        }}
      >
        <div className="flex items-center gap-1 bg-background border border-border rounded-lg shadow-lg p-1">
          <div className="flex items-center gap-0.5 px-1 border-r border-border">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">AI</span>
          </div>

          {aiActions.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              disabled={isProcessing}
              className="px-2 py-1.5 text-xs hover:bg-accent rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              title={item.description}
            >
              {item.label}
            </button>
          ))}
        </div>
      </BubbleMenu>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-background border border-border rounded-lg shadow-lg p-3">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm">
            {currentAction}...
          </span>
        </div>
      )}
    </>
  );
}
