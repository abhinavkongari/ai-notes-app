import { useAppStore } from '../../stores/useAppStore.js';
import { Search as SearchIcon, X, Filter, Calendar, Folder as FolderIcon, Tag } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { DateFilter } from '../../types/index.js';

const DATE_FILTER_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'year', label: 'Last Year' },
];

export function Search() {
  const { 
    searchQuery, 
    setSearchQuery, 
    dateFilter, 
    setDateFilter,
    selectedFolderId,
    setSelectedFolder,
    selectedTags,
    toggleTagFilter,
    clearTagFilters,
    folders,
    tags,
    getFilteredNotes
  } = useAppStore();
  
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const filteredNotes = getFilteredNotes();
  const activeFiltersCount = (dateFilter !== 'all' ? 1 : 0) + (selectedFolderId !== null ? 1 : 0) + selectedTags.length;

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearAllFilters = () => {
    setDateFilter('all');
    setSelectedFolder(null);
    clearTagFilters();
    setSearchQuery('');
  };

  const hasActiveFilters = searchQuery || activeFiltersCount > 0;

  return (
    <div className="p-2 border-b border-border relative overflow-visible">
      <div className="relative" ref={searchContainerRef}>
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-9 pr-20 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="hover:bg-accent rounded p-1 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`hover:bg-accent rounded p-1 transition-colors relative ${
              activeFiltersCount > 0 ? 'text-primary' : 'text-muted-foreground'
            }`}
            title="Filters"
          >
            <Filter className="w-4 h-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div
            ref={filterRef}
            className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-[9999] p-3 space-y-3 max-h-96 overflow-y-auto"
          >
            {/* Date Filter */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                <Calendar className="w-3 h-3" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-1">
                {DATE_FILTER_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setDateFilter(option.value)}
                    className={`px-2 py-1.5 text-xs rounded transition-colors ${
                      dateFilter === option.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-accent'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Folder Filter */}
            {folders.length > 0 && (
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                  <FolderIcon className="w-3 h-3" />
                  Folder
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  <button
                    onClick={() => setSelectedFolder(null)}
                    className={`w-full px-2 py-1.5 text-xs rounded transition-colors text-left ${
                      selectedFolderId === null
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-accent'
                    }`}
                  >
                    All Folders
                  </button>
                  {folders.map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolder(folder.id)}
                      className={`w-full px-2 py-1.5 text-xs rounded transition-colors text-left ${
                        selectedFolderId === folder.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-accent'
                      }`}
                    >
                      {folder.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tag Filter */}
            {tags.length > 0 && (
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                  <Tag className="w-3 h-3" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-1">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTagFilter(tag.name)}
                      className={`px-2 py-1 rounded-full text-xs transition-colors ${
                        selectedTags.includes(tag.name)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-accent'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clear All Button */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="w-full px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Search Results Summary */}
      {hasActiveFilters && (
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {filteredNotes.length} {filteredNotes.length === 1 ? 'result' : 'results'}
          </span>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-primary hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {dateFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
              <Calendar className="w-3 h-3" />
              {DATE_FILTER_OPTIONS.find(o => o.value === dateFilter)?.label}
              <button
                onClick={() => setDateFilter('all')}
                className="hover:bg-primary/20 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedFolderId !== null && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
              <FolderIcon className="w-3 h-3" />
              {folders.find(f => f.id === selectedFolderId)?.name}
              <button
                onClick={() => setSelectedFolder(null)}
                className="hover:bg-primary/20 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedTags.map(tagName => (
            <span
              key={tagName}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs"
            >
              <Tag className="w-3 h-3" />
              {tagName}
              <button
                onClick={() => toggleTagFilter(tagName)}
                className="hover:bg-primary/20 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
