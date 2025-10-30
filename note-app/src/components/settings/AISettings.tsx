import { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { testConnection } from '../../lib/aiService';
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';

export function AISettings() {
  const { aiSettings, setAPIKey, setAIModel, toggleAI } = useAppStore();
  const [showKey, setShowKey] = useState(false);
  const [localKey, setLocalKey] = useState(aiSettings.apiKey ?? '');
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
    } catch {
      setTestResult('error');
    } finally {
      // Restore original key if test failed
      if (testResult === 'error' && originalKey !== localKey.trim()) {
        setAPIKey(originalKey ?? '');
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

      {/* Security Warning */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
              Security Notice: API Key Storage
            </h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Your API key is stored in plain text in your browser's local storage. This means:
            </p>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
              <li>• Any malicious script or browser extension could potentially access it</li>
              <li>• The key is visible in browser DevTools</li>
              <li>• It's not encrypted or protected</li>
            </ul>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
              Recommended: Use an API key with usage limits and monitor your OpenAI usage regularly.
            </p>
          </div>
        </div>
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
        <h4 className="font-medium mb-2">Privacy & Data Handling</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Selected note content is sent to OpenAI for processing</li>
          <li>• OpenAI may temporarily store data according to their privacy policy</li>
          <li>• Do not use AI features on highly sensitive or confidential information</li>
          <li>• Rate limit: 10 AI requests per minute to prevent abuse</li>
        </ul>
      </div>

      {/* Best Practices */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Security Best Practices</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Create a dedicated API key for this app (not your main key)</li>
          <li>• Set monthly spending limits in your OpenAI account</li>
          <li>• Monitor your API usage at platform.openai.com/usage</li>
          <li>• Rotate your API key periodically</li>
          <li>• If you suspect your key is compromised, revoke it immediately</li>
        </ul>
      </div>
    </div>
  );
}
