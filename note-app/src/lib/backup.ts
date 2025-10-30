/**
 * Data backup and restore utilities
 * Allows users to export and import their notes, folders, and tags
 */

import type { Note, Folder, Tag } from '../types/index.js';
import { logger } from './logger.js';

/**
 * Current backup format version
 * Increment when making breaking changes to format
 */
export const BACKUP_VERSION = '1.0.0';

/**
 * Backup data structure
 */
export interface BackupData {
  version: string;
  exportedAt: string;
  appVersion: string;
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  metadata: {
    noteCount: number;
    folderCount: number;
    tagCount: number;
    totalSize: number; // Approximate size in bytes
  };
}

/**
 * Import result information
 */
export interface ImportResult {
  success: boolean;
  imported: {
    notes: number;
    folders: number;
    tags: number;
  };
  skipped: {
    notes: number;
    folders: number;
    tags: number;
  };
  errors: string[];
}

/**
 * Import options
 */
export interface ImportOptions {
  mode: 'merge' | 'replace';
  handleDuplicates: 'skip' | 'overwrite' | 'keepBoth';
}

/**
 * Export all data from the store
 * @param notes - All notes
 * @param folders - All folders
 * @param tags - All tags
 * @returns Backup data object
 */
export function exportAllData(
  notes: Note[],
  folders: Folder[],
  tags: Tag[]
): BackupData {
  // Calculate total size (approximate)
  const jsonString = JSON.stringify({ notes, folders, tags });
  const totalSize = new Blob([jsonString]).size;

  const backup: BackupData = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: '1.0.0', // TODO: Get from package.json
    notes,
    folders,
    tags,
    metadata: {
      noteCount: notes.length,
      folderCount: folders.length,
      tagCount: tags.length,
      totalSize,
    },
  };

  logger.info('Data exported', {
    noteCount: notes.length,
    folderCount: folders.length,
    tagCount: tags.length,
    totalSize,
  });

  return backup;
}

/**
 * Download backup as a JSON file
 * @param backup - Backup data to download
 */
export function downloadBackup(backup: BackupData): void {
  try {
    // Create JSON blob
    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `notes-backup-${timestamp}.json`;

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    logger.info('Backup downloaded', {
      filename,
      size: blob.size,
    });
  } catch (error) {
    logger.error('Failed to download backup', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error('Failed to download backup file');
  }
}

/**
 * Get backup statistics
 * @param notes - All notes
 * @param folders - All folders
 * @param tags - All tags
 * @returns Statistics object
 */
export function getBackupStats(
  notes: Note[],
  folders: Folder[],
  tags: Tag[]
): BackupData['metadata'] {
  const jsonString = JSON.stringify({ notes, folders, tags });
  const totalSize = new Blob([jsonString]).size;

  return {
    noteCount: notes.length,
    folderCount: folders.length,
    tagCount: tags.length,
    totalSize,
  };
}

/**
 * Validate backup data structure
 * @param data - Data to validate
 * @returns Validated backup data or null if invalid
 */
export function validateBackup(data: unknown): BackupData | null {
  try {
    // Check if data is an object
    if (!data || typeof data !== 'object') {
      logger.warn('Backup validation failed: not an object');
      return null;
    }

    const backup = data as Partial<BackupData>;

    // Check required fields
    if (!backup.version || !backup.exportedAt || !backup.notes || !backup.folders || !backup.tags) {
      logger.warn('Backup validation failed: missing required fields');
      return null;
    }

    // Check arrays
    if (!Array.isArray(backup.notes) || !Array.isArray(backup.folders) || !Array.isArray(backup.tags)) {
      logger.warn('Backup validation failed: invalid array types');
      return null;
    }

    // Check version compatibility
    if (backup.version !== BACKUP_VERSION) {
      logger.warn('Backup validation warning: version mismatch', {
        backupVersion: backup.version,
        currentVersion: BACKUP_VERSION,
      });
      // Still allow - we can handle minor version differences
    }

    // Validate notes structure (basic check)
    for (const note of backup.notes) {
      if (!note.id || !note.title || typeof note.content !== 'string') {
        logger.warn('Backup validation failed: invalid note structure', { noteId: note.id });
        return null;
      }
    }

    // Validate folders structure
    for (const folder of backup.folders) {
      if (!folder.id || !folder.name) {
        logger.warn('Backup validation failed: invalid folder structure', { folderId: folder.id });
        return null;
      }
    }

    // Validate tags structure
    for (const tag of backup.tags) {
      if (!tag.id || !tag.name) {
        logger.warn('Backup validation failed: invalid tag structure', { tagId: tag.id });
        return null;
      }
    }

    logger.info('Backup validated successfully', {
      version: backup.version,
      noteCount: backup.notes.length,
      folderCount: backup.folders.length,
      tagCount: backup.tags.length,
    });

    return backup as BackupData;
  } catch (error) {
    logger.error('Backup validation error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

/**
 * Format file size for display
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Parse backup file from file input
 * @param file - File object from input
 * @returns Promise with backup data or null if invalid
 */
export async function parseBackupFile(file: File): Promise<BackupData | null> {
  try {
    // Check file type
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      logger.warn('Invalid backup file type', { type: file.type, name: file.name });
      throw new Error('File must be a JSON file');
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      logger.warn('Backup file too large', { size: file.size, maxSize });
      throw new Error(`File is too large (max ${formatFileSize(maxSize)})`);
    }

    // Read file content
    const text = await file.text();
    const data = JSON.parse(text);

    // Validate backup data
    const backup = validateBackup(data);
    if (!backup) {
      throw new Error('Invalid backup file format');
    }

    logger.info('Backup file parsed successfully', {
      filename: file.name,
      size: file.size,
    });

    return backup;
  } catch (error) {
    logger.error('Failed to parse backup file', {
      error: error instanceof Error ? error.message : 'Unknown error',
      filename: file.name,
    });

    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON file');
    }

    throw error;
  }
}

/**
 * Generate unique ID for duplicate items
 * @param originalId - Original ID
 * @returns New unique ID
 */
function generateUniqueId(originalId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${originalId}-copy-${timestamp}-${random}`;
}

/**
 * Import backup data
 * @param backup - Validated backup data
 * @param options - Import options
 * @param currentData - Current data in the store
 * @returns Import result
 */
export function prepareImport(
  backup: BackupData,
  options: ImportOptions,
  currentData: { notes: Note[]; folders: Folder[]; tags: Tag[] }
): {
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  result: ImportResult;
} {
  const result: ImportResult = {
    success: true,
    imported: { notes: 0, folders: 0, tags: 0 },
    skipped: { notes: 0, folders: 0, tags: 0 },
    errors: [],
  };

  let notes: Note[] = [];
  let folders: Folder[] = [];
  let tags: Tag[] = [];

  try {
    // Replace mode - use backup data directly
    if (options.mode === 'replace') {
      notes = backup.notes;
      folders = backup.folders;
      tags = backup.tags;

      result.imported.notes = backup.notes.length;
      result.imported.folders = backup.folders.length;
      result.imported.tags = backup.tags.length;

      logger.info('Import prepared (replace mode)', result.imported);
      return { notes, folders, tags, result };
    }

    // Merge mode - combine current and backup data
    const existingNoteIds = new Set(currentData.notes.map(n => n.id));
    const existingFolderIds = new Set(currentData.folders.map(f => f.id));
    const existingTagIds = new Set(currentData.tags.map(t => t.id));

    // Process notes
    notes = [...currentData.notes];
    for (const note of backup.notes) {
      if (existingNoteIds.has(note.id)) {
        // Handle duplicate
        if (options.handleDuplicates === 'skip') {
          result.skipped.notes++;
        } else if (options.handleDuplicates === 'overwrite') {
          const index = notes.findIndex(n => n.id === note.id);
          notes[index] = note;
          result.imported.notes++;
        } else {
          // keepBoth - generate new ID
          const newNote = { ...note, id: generateUniqueId(note.id) };
          notes.push(newNote);
          result.imported.notes++;
        }
      } else {
        notes.push(note);
        result.imported.notes++;
      }
    }

    // Process folders
    folders = [...currentData.folders];
    for (const folder of backup.folders) {
      if (existingFolderIds.has(folder.id)) {
        if (options.handleDuplicates === 'skip') {
          result.skipped.folders++;
        } else if (options.handleDuplicates === 'overwrite') {
          const index = folders.findIndex(f => f.id === folder.id);
          folders[index] = folder;
          result.imported.folders++;
        } else {
          const newFolder = { ...folder, id: generateUniqueId(folder.id) };
          folders.push(newFolder);
          result.imported.folders++;
        }
      } else {
        folders.push(folder);
        result.imported.folders++;
      }
    }

    // Process tags
    tags = [...currentData.tags];
    for (const tag of backup.tags) {
      if (existingTagIds.has(tag.id)) {
        if (options.handleDuplicates === 'skip') {
          result.skipped.tags++;
        } else if (options.handleDuplicates === 'overwrite') {
          const index = tags.findIndex(t => t.id === tag.id);
          tags[index] = tag;
          result.imported.tags++;
        } else {
          const newTag = { ...tag, id: generateUniqueId(tag.id) };
          tags.push(newTag);
          result.imported.tags++;
        }
      } else {
        tags.push(tag);
        result.imported.tags++;
      }
    }

    logger.info('Import prepared (merge mode)', {
      imported: result.imported,
      skipped: result.skipped,
    });

    return { notes, folders, tags, result };
  } catch (error) {
    result.success = false;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(errorMessage);

    logger.error('Import preparation failed', {
      error: errorMessage,
      mode: options.mode,
    });

    return { notes: currentData.notes, folders: currentData.folders, tags: currentData.tags, result };
  }
}
