import { useState, useRef } from 'react';
import { Download, Upload, Database, AlertCircle, CheckCircle2, FileJson, Loader2 } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import {
  exportAllData,
  downloadBackup,
  getBackupStats,
  parseBackupFile,
  prepareImport,
  formatFileSize,
  type BackupData,
  type ImportOptions,
} from '../../lib/backup';
import { toast } from 'sonner';

export function DataSettings() {
  const { notes, folders, tags } = useAppStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMode, setImportMode] = useState<ImportOptions['mode']>('merge');
  const [duplicateHandling, setDuplicateHandling] = useState<ImportOptions['handleDuplicates']>('skip');
  const [importPreview, setImportPreview] = useState<BackupData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current data stats
  const stats = getBackupStats(notes, folders, tags);

  const handleExport = () => {
    try {
      setIsExporting(true);
      const backup = exportAllData(notes, folders, tags);
      downloadBackup(backup);
      toast.success('Backup downloaded successfully!', {
        description: `${stats.noteCount} notes, ${stats.folderCount} folders, ${stats.tagCount} tags`,
      });
    } catch (error) {
      toast.error('Failed to export data', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const backup = await parseBackupFile(file);

      if (!backup) {
        toast.error('Invalid backup file', {
          description: 'The file format is not recognized',
        });
        return;
      }

      // Show preview
      setImportPreview(backup);
    } catch (error) {
      toast.error('Failed to read backup file', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImport = async () => {
    if (!importPreview) return;

    try {
      setIsImporting(true);

      const options: ImportOptions = {
        mode: importMode,
        handleDuplicates: duplicateHandling,
      };

      const currentData = { notes, folders, tags };
      const { notes: newNotes, folders: newFolders, tags: newTags, result } = prepareImport(
        importPreview,
        options,
        currentData
      );

      if (!result.success) {
        toast.error('Import failed', {
          description: result.errors.join(', '),
        });
        return;
      }

      // Update store with imported data
      // We'll need to add bulk import functions to the store
      // For now, we can use a workaround

      if (importMode === 'replace') {
        // Clear existing data and import new data
        localStorage.setItem('import-pending', JSON.stringify({ notes: newNotes, folders: newFolders, tags: newTags }));
        toast.success('Data imported! Reloading...', {
          description: `Imported ${result.imported.notes} notes, ${result.imported.folders} folders, ${result.imported.tags} tags`,
        });

        // Reload the app to apply changes
        setTimeout(() => window.location.reload(), 1000);
      } else {
        // Merge mode - save to IndexedDB
        localStorage.setItem('import-pending', JSON.stringify({ notes: newNotes, folders: newFolders, tags: newTags }));
        toast.success('Data imported! Reloading...', {
          description: `Imported ${result.imported.notes} notes, ${result.imported.folders} folders, ${result.imported.tags} tags. Skipped ${result.skipped.notes + result.skipped.folders + result.skipped.tags} duplicates.`,
        });

        setTimeout(() => window.location.reload(), 1000);
      }

      setImportPreview(null);
    } catch (error) {
      toast.error('Import failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancelImport = () => {
    setImportPreview(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Data Management</h3>
        <p className="text-sm text-muted-foreground">
          Export and import your notes, folders, and tags for backup or transfer.
        </p>
      </div>

      {/* Storage Stats */}
      <div className="p-4 bg-muted/30 border border-border rounded-lg">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium mb-2">Current Data</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Notes</div>
                <div className="font-medium">{stats.noteCount}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Folders</div>
                <div className="font-medium">{stats.folderCount}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Tags</div>
                <div className="font-medium">{stats.tagCount}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Total Size</div>
                <div className="font-medium">{formatFileSize(stats.totalSize)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="space-y-3">
        <h4 className="font-medium">Export Data</h4>
        <p className="text-sm text-muted-foreground">
          Download all your data as a JSON file. This file can be imported later to restore your data.
        </p>
        <button
          onClick={handleExport}
          disabled={isExporting || stats.noteCount === 0}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export All Data
            </>
          )}
        </button>
        {stats.noteCount === 0 && (
          <p className="text-xs text-muted-foreground">
            No data to export. Create some notes first.
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Import Section */}
      {!importPreview ? (
        <div className="space-y-3">
          <h4 className="font-medium">Import Data</h4>
          <p className="text-sm text-muted-foreground">
            Restore your data from a previously exported backup file.
          </p>

          {/* Import Options */}
          <div className="space-y-3 p-3 bg-muted/20 rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-2">Import Mode</label>
              <select
                value={importMode}
                onChange={(e) => setImportMode(e.target.value as ImportOptions['mode'])}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="merge">Merge with existing data</option>
                <option value="replace">Replace all existing data</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {importMode === 'merge'
                  ? 'Combines imported data with your current data'
                  : '⚠️ This will delete all your current data!'}
              </p>
            </div>

            {importMode === 'merge' && (
              <div>
                <label className="block text-sm font-medium mb-2">Handle Duplicates</label>
                <select
                  value={duplicateHandling}
                  onChange={(e) => setDuplicateHandling(e.target.value as ImportOptions['handleDuplicates'])}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="skip">Skip duplicates</option>
                  <option value="overwrite">Overwrite existing</option>
                  <option value="keepBoth">Keep both (create copies)</option>
                </select>
              </div>
            )}
          </div>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Reading file...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Choose Backup File
              </>
            )}
          </button>
        </div>
      ) : (
        /* Import Preview */
        <div className="space-y-3">
          <h4 className="font-medium">Import Preview</h4>

          {/* File Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <FileJson className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="font-medium text-blue-900 dark:text-blue-100">
                  Backup File Ready
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <div>Exported: {new Date(importPreview.exportedAt).toLocaleString()}</div>
                  <div>Version: {importPreview.version}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded">
                    <div className="text-blue-600 dark:text-blue-300 text-xs">Notes</div>
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      {importPreview.metadata.noteCount}
                    </div>
                  </div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded">
                    <div className="text-blue-600 dark:text-blue-300 text-xs">Folders</div>
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      {importPreview.metadata.folderCount}
                    </div>
                  </div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded">
                    <div className="text-blue-600 dark:text-blue-300 text-xs">Tags</div>
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      {importPreview.metadata.tagCount}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warning for Replace Mode */}
          {importMode === 'replace' && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-medium text-red-900 dark:text-red-100">
                    Warning: Replace Mode
                  </div>
                  <div className="text-sm text-red-800 dark:text-red-200">
                    This will permanently delete all your current data ({stats.noteCount} notes, {stats.folderCount} folders, {stats.tagCount} tags) and replace it with the imported backup.
                  </div>
                  <div className="text-sm text-red-800 dark:text-red-200 font-medium mt-2">
                    Consider exporting your current data first!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Import
                </>
              )}
            </button>
            <button
              onClick={handleCancelImport}
              disabled={isImporting}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 bg-muted/50 border border-border rounded-lg">
        <h4 className="font-medium mb-2 text-sm">Backup Best Practices</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Export your data regularly to prevent data loss</li>
          <li>• Store backup files in a safe location (cloud storage, external drive)</li>
          <li>• Test your backups by importing them to verify they work</li>
          <li>• Keep multiple backup versions from different dates</li>
        </ul>
      </div>
    </div>
  );
}
