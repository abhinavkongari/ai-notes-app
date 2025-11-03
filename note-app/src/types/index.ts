export interface Note {
  id: string;
  title: string;
  content: string; // JSON string of TipTap content
  folderId: string | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  isFavorite: boolean;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  color?: string;
  icon?: string;
  createdAt: number;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
}

export interface AISettings {
  apiKey: string | null;
  model: 'gpt-4o-mini' | 'gpt-4-turbo';
  enabled: boolean;
}

export type DateFilter = 'all' | 'today' | 'week' | 'month' | 'year';
export type SortOption = 'modified-desc' | 'modified-asc' | 'created-desc' | 'created-asc' | 'title-asc' | 'title-desc';
export type ViewDensity = 'compact' | 'comfortable';

export interface AppState {
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  currentNoteId: string | null;
  searchQuery: string;
  selectedFolderId: string | null;
  selectedTags: string[];
  dateFilter: DateFilter;
  sortOption: SortOption;
  viewDensity: ViewDensity;
  showSnippets: boolean;
  theme: 'light' | 'dark';
  sidebarVisible: boolean;
  focusMode: boolean;
  aiSettings: AISettings;
}
