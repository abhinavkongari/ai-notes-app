import { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Sparkles, Loader2, Languages, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../../stores/useAppStore.js';
import * as aiService from '../../lib/aiService';
import type { AIError } from '../../lib/aiService';
import { AIResultModal } from './AIResultModal.js';

interface AIAssistantProps {
  editor: Editor | null;
}

export function AIAssistant({ editor }: AIAssistantProps) {
  const { aiSettings } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultText, setResultText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [lastAction, setLastAction] = useState<(() => Promise<void>) | null>(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(e.target as Node)) {
        setShowLanguageMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    aiFunction: (text: string) => Promise<string>,
    showModal = true
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
      
      if (showModal) {
        setOriginalText(selectedText);
        setResultText(result);
        setShowResultModal(true);
        setLastAction(() => async () => {
          await handleAIAction(action, aiFunction, true);
        });
      } else {
        replaceSelection(result);
        toast.success(`${action} complete!`);
      }
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
          toast.error(aiError.message || 'Rate limit exceeded. Please try again later.');
          break;
        case 'VALIDATION_ERROR':
          toast.error(aiError.message || 'Invalid input. Please check your selection.');
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

  const handleAcceptResult = () => {
    replaceSelection(resultText);
    setShowResultModal(false);
    toast.success('Changes applied!');
  };

  const handleRetry = async () => {
    setShowResultModal(false);
    if (lastAction) {
      await lastAction();
    }
  };

  const handleTranslate = (language: string) => {
    handleAIAction(
      `Translate to ${language.charAt(0).toUpperCase() + language.slice(1)}`,
      (text) => aiService.translateText(text, language),
      true
    );
    setShowLanguageMenu(false);
  };

  const languages = [
    { code: 'spanish', label: 'Spanish' },
    { code: 'french', label: 'French' },
    { code: 'german', label: 'German' },
    { code: 'chinese', label: 'Chinese' },
    { code: 'japanese', label: 'Japanese' },
    { code: 'hindi', label: 'Hindi' },
    { code: 'italian', label: 'Italian' },
    { code: 'portuguese', label: 'Portuguese' },
    { code: 'russian', label: 'Russian' },
    { code: 'legal', label: 'Legal Language' },
    { code: 'medical', label: 'Medical Language' },
  ];

  const aiActions = [
    {
      label: 'Improve',
      description: 'Enhance clarity and flow',
      action: () => handleAIAction('Improve Writing', aiService.improveWriting),
    },
    {
      label: 'Grammar',
      description: 'Correct errors',
      action: () => handleAIAction('Fix Grammar', aiService.fixGrammar),
    },
    {
      label: 'Shorter',
      description: 'Condense text',
      action: () => handleAIAction('Make Shorter', aiService.makeShorter),
    },
    {
      label: 'Longer',
      description: 'Expand with details',
      action: () => handleAIAction('Make Longer', aiService.makeLonger),
    },
    {
      label: 'Simplify',
      description: 'Make easier to understand',
      action: () => handleAIAction('Simplify', aiService.simplifyText),
    },
    {
      label: 'Professional',
      description: 'Make it formal',
      action: () => handleAIAction('Professional Tone', (text) => aiService.changeTone(text, 'professional')),
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
          <div className="flex items-center gap-0.5 px-2 border-r border-border">
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

          {/* Translate with Language Menu */}
          <div className="relative" ref={languageMenuRef}>
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              disabled={isProcessing}
              className="px-2 py-1.5 text-xs hover:bg-accent rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1"
              title="Translate to another language"
            >
              <Languages className="w-3 h-3" />
              Translate
              <ChevronDown className="w-3 h-3" />
            </button>
            {showLanguageMenu && (
              <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 min-w-[160px] py-1">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => handleTranslate(lang.code)}
                    className="w-full flex items-center px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
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

      {/* Result Modal */}
      <AIResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        originalText={originalText}
        resultText={resultText}
        actionName={currentAction || 'AI'}
        onAccept={handleAcceptResult}
        onRetry={handleRetry}
      />
    </>
  );
}
