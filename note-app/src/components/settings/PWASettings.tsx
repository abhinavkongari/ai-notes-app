import { useEffect, useState } from 'react';
import { Download, Smartphone, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWASettings() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;

      setIsStandalone(isStandaloneMode || isIOSStandalone);
      setIsInstalled(isStandaloneMode || isIOSStandalone);
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      console.log('App installed');
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success('App installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.error('Installation is not available on this device/browser');
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        toast.success('App installation started!');
      } else {
        toast.info('Installation cancelled');
      }

      // Clear the prompt
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during installation:', error);
      toast.error('Failed to install app');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Progressive Web App (PWA)</h3>
        <p className="text-sm text-muted-foreground">
          Install AI Notes as a standalone app for offline access and a native app experience.
        </p>
      </div>

      {isInstalled ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          <div className="flex-1">
            <p className="font-medium text-green-900 dark:text-green-100">
              App is installed!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              {isStandalone
                ? "You're currently using the installed app"
                : 'Open from your app drawer or home screen'}
            </p>
          </div>
        </div>
      ) : deferredPrompt ? (
        <div className="space-y-3">
          <button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <Download className="w-5 h-5" />
            Install App
          </button>
          <p className="text-xs text-muted-foreground text-center">
            Works offline • Faster loading • Native app experience
          </p>
        </div>
      ) : (
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-medium mb-1">Installation not available</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                To install this app:
              </p>
              <ul className="list-disc list-inside text-muted-foreground text-xs space-y-1 mt-2">
                <li>Use Chrome, Edge, or Safari browser</li>
                <li>Visit over HTTPS or localhost</li>
                <li>The app may already be installed</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-border">
        <h4 className="font-medium mb-2 text-sm">PWA Features</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
            <span>Works offline - Access your notes without internet</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
            <span>Fast loading - Cached resources for instant startup</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
            <span>App-like experience - No browser UI, full screen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
            <span>Auto-updates - Always get the latest version</span>
          </li>
        </ul>
      </div>

      <div className="pt-4 border-t border-border">
        <h4 className="font-medium mb-2 text-sm">Install Instructions</h4>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground mb-1">Desktop (Chrome/Edge):</p>
            <p className="text-xs">
              Click the install button above, or look for the install icon in the address bar
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">iOS (Safari):</p>
            <p className="text-xs">
              Tap Share → Add to Home Screen → Add
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">Android (Chrome):</p>
            <p className="text-xs">
              Tap menu (⋮) → Add to Home Screen → Install
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
