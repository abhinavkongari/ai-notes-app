# Phase 2: Data Protection & Backups - Implementation Plan

## Overview

Phase 2 focuses on data management, optional encryption, and production preparation. This phase ensures users can protect and backup their data.

**Estimated Time**: 1-2 weeks
**Status**: Planning → Implementation
**Date Started**: October 30, 2025

---

## Goals

1. ✅ Implement data export/backup system
2. ✅ Add data import/restore functionality
3. ✅ Optional client-side encryption for sensitive notes
4. ✅ Improve ID generation (already done in Phase 1)
5. ✅ Add DOMPurify sanitization (already done in Phase 1)
6. ⏭️ HTTPS for development (optional - can skip for now)

---

## Task Breakdown

### Task 2.1: Data Export/Backup System ⭐ HIGH PRIORITY

**Goal**: Allow users to export all their data as JSON for backup purposes.

**Features**:
- Export all notes, folders, and tags as JSON
- Include metadata (creation dates, tags, etc.)
- Download as timestamped file
- Export UI in Settings

**Implementation**:

#### 1. Create Export Utility (`src/lib/backup.ts`)
```typescript
export interface BackupData {
  version: string;
  exportedAt: string;
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
}

export function exportAllData(): BackupData
export function downloadBackup(): void
export function getBackupStats(): { noteCount, folderCount, tagCount, totalSize }
```

#### 2. Add Export UI (`src/components/settings/DataSettings.tsx`)
- New settings tab for "Data Management"
- Export button with stats preview
- Shows: X notes, Y folders, Z tags
- Download progress indicator

#### 3. Update Settings Modal
- Add "Data" tab alongside "AI Settings"
- Tabbed interface for organization

**Files to Create**:
- `src/lib/backup.ts` - Export logic
- `src/components/settings/DataSettings.tsx` - Export UI

**Files to Modify**:
- `src/components/settings/SettingsModal.tsx` - Add tabs

---

### Task 2.2: Data Import/Restore System ⭐ HIGH PRIORITY

**Goal**: Allow users to import backup files and restore their data.

**Features**:
- Import JSON backup files
- Validate backup format and version
- Merge or replace existing data
- Conflict resolution options
- Progress indicator for large imports

**Implementation**:

#### 1. Add Import Functions to `src/lib/backup.ts`
```typescript
export interface ImportOptions {
  mode: 'merge' | 'replace';
  handleDuplicates: 'skip' | 'overwrite' | 'keepBoth';
}

export function validateBackup(data: unknown): BackupData | null
export function importBackup(backup: BackupData, options: ImportOptions): Promise<ImportResult>
export interface ImportResult {
  success: boolean;
  imported: { notes, folders, tags };
  skipped: { notes, folders, tags };
  errors: string[];
}
```

#### 2. Add Import UI to `DataSettings.tsx`
- File upload button
- Drag & drop support
- Import mode selection (merge/replace)
- Duplicate handling options
- Preview before import
- Progress indicator
- Results summary

#### 3. Safety Features
- Backup validation (check version, structure)
- Dry-run preview
- Undo option (export current data first)
- Warning for replace mode

**Files to Modify**:
- `src/lib/backup.ts` - Add import functions
- `src/components/settings/DataSettings.tsx` - Add import UI

---

### Task 2.3: Optional Client-Side Encryption 🔒 MEDIUM PRIORITY

**Goal**: Allow users to encrypt their notes with a password for additional security.

**Features**:
- Password-based encryption
- Encrypt/decrypt notes transparently
- Encryption toggle per note or globally
- Master password setup
- Password change functionality
- Warning about password loss

**Implementation**:

#### 1. Create Encryption Service (`src/lib/encryption.ts`)
```typescript
export class EncryptionService {
  async initialize(password: string): Promise<void>
  async encrypt(text: string): Promise<string>
  async decrypt(encryptedText: string): Promise<string>
  async changePassword(oldPassword: string, newPassword: string): Promise<void>
  isInitialized(): boolean
  lock(): void
}

export const encryptionService = new EncryptionService();
```

**Technology**: Web Crypto API (AES-GCM)

#### 2. Update Note Type
```typescript
interface Note {
  // ... existing fields
  encrypted?: boolean;
  encryptionVersion?: string;
}
```

#### 3. Add Encryption UI (`src/components/settings/EncryptionSettings.tsx`)
- Enable/disable encryption
- Set master password
- Change password
- Encrypt existing notes
- Decrypt all notes
- Status indicator (locked/unlocked)

#### 4. Update Store
- Encrypt before saving to IndexedDB
- Decrypt when loading into editor
- Session-based password (auto-lock on timeout)
- Re-authentication modal

#### 5. Warnings & UX
- ⚠️ Password loss = data loss (cannot recover)
- Password strength indicator
- Confirmation dialog for enabling
- Export unencrypted option for backup

**Files to Create**:
- `src/lib/encryption.ts` - Encryption service
- `src/components/settings/EncryptionSettings.tsx` - Encryption UI
- `src/components/PasswordPrompt.tsx` - Password entry modal

**Files to Modify**:
- `src/types/index.ts` - Add encryption fields to Note
- `src/stores/useAppStore.ts` - Encrypt/decrypt in CRUD operations
- `src/lib/backup.ts` - Handle encrypted notes in export/import

---

### Task 2.4: Auto-Backup Feature 🔄 LOW PRIORITY

**Goal**: Automatically backup data periodically.

**Features**:
- Auto-backup to browser's Downloads folder
- Configurable interval (daily, weekly)
- Keep last N backups
- Background operation
- Notification on completion

**Implementation**:

#### 1. Add to Settings
- Enable/disable auto-backup
- Backup frequency (daily/weekly)
- Number of backups to keep
- Last backup timestamp

#### 2. Background Service
- Check on app load
- Trigger based on last backup time
- Silent download
- Toast notification

**Files to Create**:
- `src/lib/autoBackup.ts` - Auto-backup service

**Files to Modify**:
- `src/components/settings/DataSettings.tsx` - Auto-backup settings
- `src/App.tsx` - Initialize auto-backup on load

---

### Task 2.5: Storage Usage Statistics 📊 LOW PRIORITY

**Goal**: Show users how much storage they're using.

**Features**:
- Total storage used
- Storage by type (notes, folders, tags)
- Average note size
- Largest notes
- Storage quota (if available)

**Implementation**:

#### 1. Add Stats Utility (`src/lib/stats.ts`)
```typescript
export function getStorageStats(): Promise<StorageStats>
export interface StorageStats {
  totalBytes: number;
  noteCount: number;
  folderCount: number;
  tagCount: number;
  averageNoteSize: number;
  largestNotes: Array<{ id, title, size }>;
  quotaUsed?: number;
  quotaRemaining?: number;
}
```

#### 2. Add Stats UI to DataSettings
- Visual storage bar
- Breakdown by type
- List of largest notes
- Clear cache button

**Files to Create**:
- `src/lib/stats.ts` - Storage statistics

**Files to Modify**:
- `src/components/settings/DataSettings.tsx` - Stats display

---

## Priority Order

### Week 1 (High Priority):
1. ✅ **Data Export** (Task 2.1) - 1-2 days
2. ✅ **Data Import** (Task 2.2) - 1-2 days
3. ✅ **UI for Export/Import** - 1 day

### Week 2 (Medium/Low Priority):
4. 🔒 **Client-Side Encryption** (Task 2.3) - 2-3 days (optional)
5. 📊 **Storage Stats** (Task 2.5) - 1 day (optional)
6. 🔄 **Auto-Backup** (Task 2.4) - 1 day (optional)

---

## Implementation Strategy

### Step-by-step Approach:

1. **Start Simple**: Export/Import without encryption
2. **Test Thoroughly**: Ensure data integrity
3. **Add Encryption**: Optional layer on top
4. **Polish UX**: Progress indicators, confirmations
5. **Documentation**: User guide for backup/restore

### Code Quality:
- ✅ TypeScript strict mode
- ✅ Comprehensive error handling
- ✅ Input validation
- ✅ Unit tests (optional)
- ✅ User-friendly error messages

---

## User Stories

### As a user, I want to...

1. **Export my data** so I can back it up safely
2. **Import my data** so I can restore it on another device
3. **Encrypt my notes** so they're protected if my device is lost
4. **See storage stats** so I know how much space I'm using
5. **Auto-backup** so I don't lose data if I forget

---

## Technical Considerations

### Export/Import:
- JSON format for portability
- Version field for future compatibility
- Validate on import to prevent corruption
- Handle large datasets (100+ notes)

### Encryption:
- Web Crypto API (AES-GCM 256-bit)
- PBKDF2 for password derivation
- Random IV per encryption
- No password recovery (user must remember)

### Storage:
- IndexedDB quota limits
- Browser-specific variations
- Clear error messages

---

## Success Criteria

### Must Have (MVP):
- ✅ Export all data as JSON
- ✅ Download backup file
- ✅ Import backup file
- ✅ Merge or replace data
- ✅ Validation and error handling

### Nice to Have:
- 🔒 Client-side encryption
- 📊 Storage statistics
- 🔄 Auto-backup
- 🎨 Beautiful UI
- 📱 Mobile-friendly

### Testing Checklist:
- [ ] Export with 0 notes (empty state)
- [ ] Export with 1 note
- [ ] Export with 100+ notes
- [ ] Import valid backup
- [ ] Import invalid JSON
- [ ] Import wrong version
- [ ] Merge mode (no conflicts)
- [ ] Merge mode (with conflicts)
- [ ] Replace mode with confirmation
- [ ] Encryption/decryption cycle
- [ ] Password change
- [ ] Wrong password error

---

## File Structure

```
src/
├── lib/
│   ├── backup.ts          ⭐ NEW - Export/Import
│   ├── encryption.ts      🔒 NEW - Encryption service (optional)
│   ├── stats.ts           📊 NEW - Storage stats (optional)
│   └── autoBackup.ts      🔄 NEW - Auto-backup (optional)
│
├── components/
│   ├── settings/
│   │   ├── SettingsModal.tsx      ✏️ MODIFY - Add tabs
│   │   ├── DataSettings.tsx       ⭐ NEW - Export/Import UI
│   │   ├── EncryptionSettings.tsx 🔒 NEW - Encryption UI (optional)
│   │   └── AISettings.tsx         ✅ EXISTING
│   │
│   └── PasswordPrompt.tsx         🔒 NEW - Password modal (optional)
│
├── types/
│   └── index.ts                   ✏️ MODIFY - Add encryption fields
│
└── stores/
    └── useAppStore.ts              ✏️ MODIFY - Encryption integration
```

---

## Dependencies

### Required:
- None! All features use built-in Web APIs

### Optional (for better UX):
- `file-saver` - Better file download experience
- `jszip` - Compress backups (for large datasets)

---

## Documentation to Create

1. **USER_GUIDE.md** - How to backup/restore data
2. **ENCRYPTION_GUIDE.md** - How to use encryption (if implemented)
3. **PHASE2_COMPLETE.md** - Implementation summary

---

## Risks & Mitigations

### Risk: Password Loss
- **Impact**: User loses all encrypted data
- **Mitigation**:
  - Clear warnings in UI
  - Export unencrypted backup option
  - Password strength requirements

### Risk: Data Corruption on Import
- **Impact**: User loses data
- **Mitigation**:
  - Validate before import
  - Dry-run preview
  - Auto-export before replace mode
  - Error rollback

### Risk: Large Dataset Performance
- **Impact**: Slow export/import
- **Mitigation**:
  - Progress indicators
  - Streaming/chunked processing
  - Web Workers (if needed)

---

## Next Steps

**Ready to begin implementation!**

1. Start with Task 2.1 (Data Export)
2. Then Task 2.2 (Data Import)
3. Add UI (DataSettings component)
4. Test thoroughly
5. Decide on encryption (optional)

---

**Let's start with the export functionality!** 🚀
