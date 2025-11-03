import { create } from 'zustand';
import type { Note, Folder, Tag, AppState, DateFilter, SortOption, ViewDensity } from '../types/index.js';
import * as db from '../lib/db.js';

interface AppStore extends AppState {
  // Actions
  loadData: () => Promise<void>;

  // Note actions
  createNote: (folderId?: string | null) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setCurrentNote: (id: string | null) => void;

  // Folder actions
  createFolder: (name: string, parentId?: string | null) => Promise<Folder>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  setSelectedFolder: (id: string | null) => void;

  // Tag actions
  createTag: (name: string) => Promise<Tag>;
  renameTag: (id: string, newName: string) => Promise<void>;
  mergeTag: (sourceId: string, targetId: string) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  toggleTagFilter: (tagName: string) => void;
  clearTagFilters: () => void;

  // Search actions
  setSearchQuery: (query: string) => void;
  setDateFilter: (filter: DateFilter) => void;
  
  // View actions
  setSortOption: (option: SortOption) => void;
  setViewDensity: (density: ViewDensity) => void;
  toggleShowSnippets: () => void;

  // Theme actions
  toggleTheme: () => void;

  // UI actions
  toggleSidebar: () => void;
  setSidebarVisible: (visible: boolean) => void;
  toggleFocusMode: () => void;

  // AI actions
  setAPIKey: (apiKey: string | null) => void;
  setAIModel: (model: 'gpt-4o-mini' | 'gpt-4-turbo') => void;
  toggleAI: () => void;
  loadAISettings: () => void;

  // Bulk import/export actions
  bulkImport: (notes: Note[], folders: Folder[], tags: Tag[]) => Promise<void>;

  // Computed getters
  getFilteredNotes: () => Note[];
}

/**
 * Generate a cryptographically secure random ID
 * Uses Web Crypto API for secure random values
 */
const generateId = (): string => {
  // Use crypto.getRandomValues for secure random generation
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);

  // Convert to base36 string for readability
  const randomPart = Array.from(array)
    .map(b => b.toString(36).padStart(2, '0'))
    .join('')
    .substring(0, 16);

  // Add timestamp prefix for sortability (optional but useful)
  const timestamp = Date.now().toString(36);

  return `${timestamp}-${randomPart}`;
};

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  notes: [],
  folders: [],
  tags: [],
  currentNoteId: null,
  searchQuery: '',
  selectedFolderId: null,
  selectedTags: [],
  dateFilter: 'all',
  sortOption: 'modified-desc',
  viewDensity: 'comfortable',
  showSnippets: true,
  theme: 'light',
  sidebarVisible: true,
  focusMode: false,
  aiSettings: {
    apiKey: null,
    model: 'gpt-4o-mini',
    enabled: true,
  },

  // Load data from IndexedDB
  loadData: async () => {
    const [notes, folders, tags] = await Promise.all([
      db.getAllNotes(),
      db.getAllFolders(),
      db.getAllTags(),
    ]);

    // Sort notes by updated date (most recent first)
    notes.sort((a, b) => b.updatedAt - a.updatedAt);

    set({ notes, folders, tags });

    // Set first note as current if none selected
    if (notes.length > 0 && !get().currentNoteId) {
      set({ currentNoteId: notes[0].id });
    }
  },

  // Note actions
  createNote: async (folderId = null) => {
    const now = Date.now();
    const note: Note = {
      id: generateId(),
      title: 'Untitled Note',
      content: '',
      folderId,
      tags: [],
      createdAt: now,
      updatedAt: now,
      isFavorite: false,
    };

    await db.saveNote(note);
    set(state => ({
      notes: [note, ...state.notes],
      currentNoteId: note.id,
    }));

    return note;
  },

  updateNote: async (id, updates) => {
    const note = get().notes.find(n => n.id === id);
    if (!note) return;

    const updatedNote = {
      ...note,
      ...updates,
      updatedAt: Date.now(),
    };

    await db.saveNote(updatedNote);
    set(state => ({
      notes: state.notes.map(n => (n.id === id ? updatedNote : n)),
    }));
  },

  deleteNote: async (id) => {
    await db.deleteNote(id);
    set(state => {
      const remainingNotes = state.notes.filter(n => n.id !== id);
      const newCurrentId = state.currentNoteId === id
        ? (remainingNotes[0]?.id ?? null)
        : state.currentNoteId;

      return {
        notes: remainingNotes,
        currentNoteId: newCurrentId,
      };
    });
  },

  setCurrentNote: (id) => {
    set({ currentNoteId: id });
  },

  // Folder actions
  createFolder: async (name, parentId = null) => {
    const folder: Folder = {
      id: generateId(),
      name,
      parentId,
      createdAt: Date.now(),
    };

    await db.saveFolder(folder);
    set(state => ({
      folders: [...state.folders, folder],
    }));

    return folder;
  },

  updateFolder: async (id, updates) => {
    const folder = get().folders.find(f => f.id === id);
    if (!folder) return;

    const updatedFolder = { ...folder, ...updates };
    await db.saveFolder(updatedFolder);
    set(state => ({
      folders: state.folders.map(f => (f.id === id ? updatedFolder : f)),
    }));
  },

  deleteFolder: async (id) => {
    await db.deleteFolder(id);

    // Move notes from deleted folder to root
    const notesToUpdate = get().notes.filter(n => n.folderId === id);
    await Promise.all(
      notesToUpdate.map(note =>
        db.saveNote({ ...note, folderId: null })
      )
    );

    set(state => ({
      folders: state.folders.filter(f => f.id !== id),
      notes: state.notes.map(n =>
        n.folderId === id ? { ...n, folderId: null } : n
      ),
      selectedFolderId: state.selectedFolderId === id ? null : state.selectedFolderId,
    }));
  },

  setSelectedFolder: (id) => {
    set({ selectedFolderId: id });
  },

  // Tag actions
  createTag: async (name) => {
    // Check if tag already exists
    const existing = get().tags.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const tag: Tag = {
      id: generateId(),
      name,
      createdAt: Date.now(),
    };

    await db.saveTag(tag);
    set(state => ({
      tags: [...state.tags, tag],
    }));

    return tag;
  },

  renameTag: async (id, newName) => {
    const tag = get().tags.find(t => t.id === id);
    if (!tag) return;

    const oldName = tag.name;
    
    // Check if new name already exists (different tag)
    const existing = get().tags.find(t => t.id !== id && t.name.toLowerCase() === newName.toLowerCase());
    if (existing) {
      throw new Error('A tag with this name already exists');
    }

    // Update tag name
    const updatedTag = { ...tag, name: newName };
    await db.saveTag(updatedTag);

    // Update tag name in all notes
    const notesToUpdate = get().notes.filter(n => n.tags.includes(oldName));
    await Promise.all(
      notesToUpdate.map(note =>
        db.saveNote({ 
          ...note, 
          tags: note.tags.map(t => t === oldName ? newName : t) 
        })
      )
    );

    set(state => ({
      tags: state.tags.map(t => t.id === id ? updatedTag : t),
      notes: state.notes.map(n => ({
        ...n,
        tags: n.tags.map(t => t === oldName ? newName : t),
      })),
      selectedTags: state.selectedTags.map(t => t === oldName ? newName : t),
    }));
  },

  mergeTag: async (sourceId, targetId) => {
    const sourceTag = get().tags.find(t => t.id === sourceId);
    const targetTag = get().tags.find(t => t.id === targetId);
    if (!sourceTag || !targetTag) return;

    const sourceName = sourceTag.name;
    const targetName = targetTag.name;

    // Update all notes: replace source tag with target tag
    const notesToUpdate = get().notes.filter(n => n.tags.includes(sourceName));
    await Promise.all(
      notesToUpdate.map(note => {
        const newTags = note.tags
          .map(t => t === sourceName ? targetName : t)
          .filter((t, i, arr) => arr.indexOf(t) === i); // Remove duplicates
        return db.saveNote({ ...note, tags: newTags });
      })
    );

    // Delete source tag
    await db.deleteTag(sourceId);

    set(state => ({
      tags: state.tags.filter(t => t.id !== sourceId),
      notes: state.notes.map(n => {
        if (!n.tags.includes(sourceName)) return n;
        const newTags = n.tags
          .map(t => t === sourceName ? targetName : t)
          .filter((t, i, arr) => arr.indexOf(t) === i);
        return { ...n, tags: newTags };
      }),
      selectedTags: state.selectedTags.filter(t => t !== sourceName),
    }));
  },

  deleteTag: async (id) => {
    const tagName = get().tags.find(t => t.id === id)?.name;
    if (!tagName) return;

    await db.deleteTag(id);

    // Remove tag from all notes
    const notesToUpdate = get().notes.filter(n => n.tags.includes(tagName));
    await Promise.all(
      notesToUpdate.map(note =>
        db.saveNote({ ...note, tags: note.tags.filter(t => t !== tagName) })
      )
    );

    set(state => ({
      tags: state.tags.filter(t => t.id !== id),
      notes: state.notes.map(n => ({
        ...n,
        tags: n.tags.filter(t => t !== tagName),
      })),
      selectedTags: state.selectedTags.filter(t => t !== tagName),
    }));
  },

  toggleTagFilter: (tagName) => {
    set(state => ({
      selectedTags: state.selectedTags.includes(tagName)
        ? state.selectedTags.filter(t => t !== tagName)
        : [...state.selectedTags, tagName],
    }));
  },

  clearTagFilters: () => {
    set({ selectedTags: [] });
  },

  // Search actions
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setDateFilter: (filter) => {
    set({ dateFilter: filter });
  },
  
  // View actions
  setSortOption: (option) => {
    set({ sortOption: option });
    localStorage.setItem('sortOption', option);
  },
  
  setViewDensity: (density) => {
    set({ viewDensity: density });
    localStorage.setItem('viewDensity', density);
  },
  
  toggleShowSnippets: () => {
    set(state => {
      const newValue = !state.showSnippets;
      localStorage.setItem('showSnippets', String(newValue));
      return { showSnippets: newValue };
    });
  },

  // Theme actions
  toggleTheme: () => {
    set(state => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      // Update document class for Tailwind dark mode
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: newTheme };
    });
  },

  // UI actions
  toggleSidebar: () => {
    set(state => {
      const newVisible = !state.sidebarVisible;
      localStorage.setItem('sidebar-visible', String(newVisible));
      return { sidebarVisible: newVisible };
    });
  },

  setSidebarVisible: (visible) => {
    localStorage.setItem('sidebar-visible', String(visible));
    set({ sidebarVisible: visible });
  },

  toggleFocusMode: () => {
    set(state => {
      const newFocusMode = !state.focusMode;
      // Focus mode automatically hides sidebar
      if (newFocusMode) {
        return { focusMode: true, sidebarVisible: false };
      } else {
        return { focusMode: false };
      }
    });
  },

  // AI actions
  setAPIKey: (apiKey) => {
    // Save to localStorage for persistence
    if (apiKey) {
      localStorage.setItem('ai-api-key', apiKey);
    } else {
      localStorage.removeItem('ai-api-key');
    }
    set(state => ({
      aiSettings: { ...state.aiSettings, apiKey },
    }));
  },

  setAIModel: (model) => {
    localStorage.setItem('ai-model', model);
    set(state => ({
      aiSettings: { ...state.aiSettings, model },
    }));
  },

  toggleAI: () => {
    set(state => {
      const newEnabled = !state.aiSettings.enabled;
      localStorage.setItem('ai-enabled', String(newEnabled));
      return {
        aiSettings: { ...state.aiSettings, enabled: newEnabled },
      };
    });
  },

  loadAISettings: () => {
    const apiKey = localStorage.getItem('ai-api-key');
    const model = localStorage.getItem('ai-model') as 'gpt-4o-mini' | 'gpt-4-turbo' | null;
    const enabled = localStorage.getItem('ai-enabled');

    set(() => ({
      aiSettings: {
        apiKey: apiKey || null,
        model: model || 'gpt-4o-mini',
        enabled: enabled === null ? true : enabled === 'true',
      },
    }));
  },

  // Computed getters
  getFilteredNotes: () => {
    const { notes, selectedFolderId, selectedTags, searchQuery, dateFilter, sortOption } = get();

    let filtered = notes;

    // Filter by folder
    if (selectedFolderId !== null) {
      filtered = filtered.filter(n => n.folderId === selectedFolderId);
    }

    // Filter by tags (note must have ALL selected tags)
    if (selectedTags.length > 0) {
      filtered = filtered.filter(n =>
        selectedTags.every(tag => n.tags.includes(tag))
      );
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      let cutoff = now;

      switch (dateFilter) {
        case 'today':
          cutoff = now - day;
          break;
        case 'week':
          cutoff = now - (7 * day);
          break;
        case 'month':
          cutoff = now - (30 * day);
          break;
        case 'year':
          cutoff = now - (365 * day);
          break;
      }

      filtered = filtered.filter(n => n.updatedAt >= cutoff);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(lowerQuery) ||
        n.content.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'modified-desc':
          return b.updatedAt - a.updatedAt;
        case 'modified-asc':
          return a.updatedAt - b.updatedAt;
        case 'created-desc':
          return b.createdAt - a.createdAt;
        case 'created-asc':
          return a.createdAt - b.createdAt;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return filtered;
  },

  // Bulk import data (for restore functionality)
  bulkImport: async (notes, folders, tags) => {
    // Save all data to IndexedDB
    await Promise.all([
      ...notes.map(note => db.saveNote(note)),
      ...folders.map(folder => db.saveFolder(folder)),
      ...tags.map(tag => db.saveTag(tag)),
    ]);

    // Update state
    set({
      notes: notes.sort((a, b) => b.updatedAt - a.updatedAt),
      folders,
      tags,
      currentNoteId: notes.length > 0 ? notes[0].id : null,
    });
  },
}));

// Initialize data on app load
useAppStore.getState().loadData();
useAppStore.getState().loadAISettings();

// Load sidebar visibility preference
const sidebarVisible = localStorage.getItem('sidebar-visible');
if (sidebarVisible !== null) {
  useAppStore.setState({ sidebarVisible: sidebarVisible === 'true' });
}

// Check for pending import from backup restore
const pendingImport = localStorage.getItem('import-pending');
if (pendingImport) {
  try {
    const data = JSON.parse(pendingImport);
    useAppStore.getState().bulkImport(data.notes, data.folders, data.tags);
    localStorage.removeItem('import-pending');
  } catch (error) {
    console.error('Failed to process pending import:', error);
    localStorage.removeItem('import-pending');
  }
}
