import { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { testConnection } from '../../lib/aiService';
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function AISettings() {
  const { aiSettings, setAPIKey, setAIModel, toggleAI } = useAppStore();
  const [showKey, setShowKey] = useState(false);
  const [localKey, setLocalKey] = useState(aiSettings.apiKey || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleSaveKey = () => {
    setAPIKey(localKey.trim() || null);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!localKey.trim()) {
      setTestResult('error');
      return;
    }

    setTesting(true);
    setTestResult(null);

    // Temporarily save the key for testing
    const originalKey = aiSettings.apiKey;
    setAPIKey(localKey.trim());

    try {
      const success = await testConnection();
      setTestResult(success ? 'success' : 'error');
    } catch (error) {
      setTestResult('error');
    } finally {
      // Restore original key if test failed
      if (testResult === 'error' && originalKey !== localKey.trim()) {
        setAPIKey(originalKey);
      }
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">AI Configuration</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure OpenAI API access for AI-powered features like writing improvements and summarization.
        </p>
      </div>

      {/* Enable/Disable AI */}
      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
        <div>
          <h4 className="font-medium">Enable AI Features</h4>
          <p className="text-sm text-muted-foreground">
            Turn AI assistance on or off
          </p>
        </div>
        <button
          onClick={toggleAI}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            aiSettings.enabled ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              aiSettings.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* API Key Input */}
      <div className="space-y-2">
        <label htmlFor="api-key" className="block font-medium">
          OpenAI API Key
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              id="api-key"
              type={showKey ? 'text' : 'password'}
              value={localKey}
              onChange={(e) => {
                setLocalKey(e.target.value);
                setTestResult(null);
              }}
              placeholder="sk-..."
              className="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
            >
              {showKey ? (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <button
            onClick={handleSaveKey}
            disabled={localKey.trim() === aiSettings.apiKey}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Get your API key from{' '}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            OpenAI Platform
          </a>
        </p>
      </div>

      {/* Test Connection */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleTestConnection}
          disabled={!localKey.trim() || testing}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Test Connection'
          )}
        </button>

        {testResult === 'success' && (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm">Connection successful!</span>
          </div>
        )}

        {testResult === 'error' && (
          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <XCircle className="w-4 h-4" />
            <span className="text-sm">Connection failed. Check your API key.</span>
          </div>
        )}
      </div>

      {/* Model Selection */}
      <div className="space-y-2">
        <label htmlFor="ai-model" className="block font-medium">
          AI Model
        </label>
        <select
          id="ai-model"
          value={aiSettings.model}
          onChange={(e) => setAIModel(e.target.value as 'gpt-4o-mini' | 'gpt-4-turbo')}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="gpt-4o-mini">GPT-4o Mini (Recommended - Fast & Affordable)</option>
          <option value="gpt-4-turbo">GPT-4 Turbo (More Powerful)</option>
        </select>
        <p className="text-xs text-muted-foreground">
          {aiSettings.model === 'gpt-4o-mini'
            ? 'Best for most tasks. Fast and cost-effective (~$0.15/$0.60 per 1M tokens).'
            : 'Best for complex tasks. Higher quality but more expensive (~$10/$30 per 1M tokens).'}
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="p-4 bg-muted/50 border border-border rounded-lg">
        <h4 className="font-medium mb-2">Privacy & Security</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Your API key is stored locally in your browser</li>
          <li>• Note content is sent to OpenAI for processing</li>
          <li>• OpenAI may temporarily store data for abuse prevention</li>
          <li>• Consider using API keys with usage limits for added security</li>
        </ul>
      </div>
    </div>
  );
}
