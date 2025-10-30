# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **advanced note-taking web application** built as a personal/learning project. The goal is to create a beautiful, powerful editor with AI capabilities for knowledge workers. Currently in MVP phase with fully functional AI features.

**Vision**: Combine the simplicity of Bear with the power of Obsidian, enhanced with AI assistance.

**Current Status**: Web-based demo with fully functional AI features powered by OpenAI. Includes 6 text transformation capabilities and comprehensive settings UI. Future plans include Electron desktop app.

## Development Commands

```bash
# Start development server (runs on http://localhost:5174 or next available port)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm preview
```

## Architecture & Key Patterns

### AI Integration (OpenAI)

The app features real AI-powered text transformation capabilities:

**AI Service** (`src/lib/aiService.ts`):
- Centralized OpenAI API integration using the official `openai` SDK
- API key management: Checks localStorage first, falls back to environment variable
- 6 text transformation functions:
  - `improveWriting()` - Enhance clarity and flow
  - `fixGrammar()` - Correct grammatical errors
  - `makeShorter()` - Condense text while preserving meaning
  - `makeLonger()` - Expand with additional details
  - `changeTone()` - Adjust tone (professional, casual, friendly)
  - `summarizeNote()` - Generate concise summaries (not yet exposed in UI)
  - `continueWriting()` - Generate continuation text (not yet exposed in UI)
- Error handling: Custom `AIError` type with specific error codes (NO_API_KEY, INVALID_API_KEY, NETWORK_ERROR, RATE_LIMIT, UNKNOWN)
- Model selection: Supports gpt-4o-mini (default, cost-effective) and gpt-4-turbo

**AI Settings State** (in Zustand store):
```typescript
aiSettings: {
  apiKey: string | null;        // Persisted to localStorage
  model: 'gpt-4o-mini' | 'gpt-4-turbo';  // Persisted to localStorage
  enabled: boolean;             // Global AI feature toggle
}
```

**AI Assistant Component** (`src/components/editor/AIAssistant.tsx`):
- Uses TipTap's `BubbleMenu` for selection-based UI
- Appears when text is selected in the editor
- Directly manipulates editor content via TipTap commands
- Selection handling: `editor.state.doc.textBetween(from, to, ' ')`
- Text replacement: `editor.chain().focus().deleteRange({ from, to }).insertContent(newText).run()`
- Loading states with processing overlay
- Toast notifications for success/error feedback using `sonner`

**Settings UI** (`src/components/settings/`):
- `SettingsModal.tsx` - Modal wrapper with backdrop
- `AISettings.tsx` - API key input (with show/hide), model selector, enable/disable toggle, test connection button
- API key stored in localStorage (with security notice for users)
- Test connection validates API key before saving

**User Flow**:
1. User opens Settings and adds OpenAI API key
2. User selects text in editor
3. BubbleMenu appears with AI action buttons
4. User clicks action (e.g., "Improve Writing")
5. Processing overlay shows while API request is in flight
6. Text is replaced with AI-generated result
7. Toast notification confirms success or shows error

**Cost Optimization**:
- Default model is gpt-4o-mini (~$0.0002 per operation)
- Users can switch to gpt-4-turbo for higher quality
- Estimated cost: $0.01-0.02/month for typical usage (50 operations)

### State Management (Zustand)

The app uses a single Zustand store (`src/stores/useAppStore.ts`) as the source of truth for all application state:

- **Notes, Folders, Tags**: All entities stored in IndexedDB and synced to Zustand
- **Auto-initialization**: The store automatically calls `loadData()` on import to hydrate from IndexedDB
- **Computed getters**: `getFilteredNotes()` provides filtered/searched notes based on current state
- **Debounced saves**: Editor auto-saves with 2-second debounce using `useDebounce` hook

**Important**: All CRUD operations go through the store, which handles both in-memory state and IndexedDB persistence.

### Data Persistence (IndexedDB)

Located in `src/lib/db.ts`:

- **Three object stores**: `notes`, `folders`, `tags`
- **Indexes**: Notes have `by-folder` and `by-updated` indexes for efficient queries
- **Type safety**: Uses `idb` library wrapper with TypeScript types
- **Import pattern**: Always use `import type { IDBPDatabase } from 'idb'` for types (not named import)

**Critical**: The `idb` library exports must be imported correctly:
```typescript
import { openDB } from 'idb';              // Value import
import type { IDBPDatabase } from 'idb';   // Type import only
```

### Editor (TipTap/ProseMirror)

The rich text editor is built with TipTap (a ProseMirror wrapper):

- **Configuration**: `src/components/editor/Editor.tsx` initializes with StarterKit + extensions
- **Extensions enabled**: Placeholder, Link, Highlight, TaskList, TaskItem
- **Auto-save flow**: Editor content → debounce (2s) → extract title from first line → update store
- **Title extraction**: First non-empty line becomes note title (max 100 chars)
- **Toolbar**: `EditorToolbar.tsx` provides formatting controls, reads editor state via `editor.isActive()`

**Note**: TipTap stores content as HTML. The editor uses `editor.getHTML()` and `editor.getText()` methods.

### Component Organization

```
components/
├── editor/
│   ├── Editor.tsx          # Main TipTap editor with auto-save
│   ├── EditorToolbar.tsx   # Formatting toolbar
│   ├── TagInput.tsx        # Inline tag management
│   └── AIAssistant.tsx     # Selection-based AI BubbleMenu (real OpenAI integration)
├── sidebar/
│   ├── Sidebar.tsx         # Main container with theme toggle and settings button
│   ├── Search.tsx          # Search input (filters via store)
│   ├── Folders.tsx         # Folder tree with create/delete
│   ├── Tags.tsx            # Tag cloud with filter toggles
│   └── NotesList.tsx       # Filtered notes list
└── settings/
    ├── SettingsModal.tsx   # Modal wrapper for settings
    └── AISettings.tsx      # AI configuration UI (API key, model, enable/disable)
```

**Pattern**: Components consume store via hooks, don't manage local state for data entities.

### Styling (Tailwind CSS v3)

- **CSS Variables**: Theme colors defined as HSL in `index.css` using CSS custom properties
- **Dark mode**: Toggled via `class` strategy on `<html>` element
- **Design system**: Uses custom color palette (primary, secondary, muted, accent) that adapts to theme
- **Editor styles**: ProseMirror prose styles in `index.css` under `.ProseMirror` class

**Important**: This project uses **Tailwind CSS v3**, not v4. The PostCSS config expects standard Tailwind v3 setup.

## Critical Implementation Details

### ID Generation
```typescript
const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
```
All entities (notes, folders, tags) use timestamp + random string IDs.

### Note Filtering Logic

The `getFilteredNotes()` function applies filters in order:
1. Folder filter (if `selectedFolderId` is set)
2. Tag filter (note must have ALL selected tags)
3. Search query (case-insensitive, searches title + content)

### Tag Management

- Tags are stored as **arrays of strings** on notes: `note.tags: string[]`
- Global tag list stored separately with metadata (id, name, createdAt)
- Tag creation is idempotent: attempting to create existing tag returns existing
- Deleting a tag removes it from all notes that reference it

### Theme Persistence

Theme state lives in Zustand store but is also applied to DOM:
```typescript
// In toggleTheme action:
if (newTheme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}
```
The theme is NOT persisted across sessions (localStorage) - this is intentional for MVP.

## Known Patterns & Conventions

### File Extensions in Imports

Due to ESM module configuration (`"type": "module"` in package.json), some imports may include `.js` extensions even for `.ts`/`.tsx` files. This is handled by the build tooling and is intentional.

### Async Operations

All IndexedDB operations are async. The store methods handle this via:
1. Optimistic updates (update in-memory state immediately)
2. Persist to IndexedDB asynchronously
3. No loading states (assumes IndexedDB is fast enough for demo)

### Error Handling

**AI Operations**: Comprehensive error handling with custom `AIError` type:
- `NO_API_KEY` - Prompts user to add key in settings
- `INVALID_API_KEY` - Directs user to check settings
- `NETWORK_ERROR` - Suggests checking connection
- `RATE_LIMIT` - Asks user to try again later
- All errors displayed via toast notifications with actionable guidance

**IndexedDB Operations**: Currently minimal error handling (learning/demo project). IndexedDB errors will propagate and cause visible failures.

## Future Migration Path

**AI Enhancements**: Current AI features are production-ready. Future enhancements could include:
- Streaming responses (show AI output as it's generated)
- Diff view (show original vs AI-modified text before accepting)
- Custom prompts (allow users to create custom AI actions)
- Auto-tagging (AI-suggested tags based on content)
- Semantic search (embeddings for smart search)
- Chat with notes (RAG implementation)

**Electron Migration**: The codebase is structured to work in Electron:
- Replace IndexedDB with SQLite (using better-sqlite3)
- File system APIs for attachments
- Native menus and keyboard shortcuts

**Backend Sync**: When adding cloud sync:
- Keep IndexedDB as local cache
- Add sync state tracking to notes/folders/tags
- Implement conflict resolution UI
- See PRD.md for detailed sync architecture

## Reference Documentation

- **Full PRD**: `../PRD.md` contains comprehensive product requirements, architecture plans, and feature roadmap
- **Tech Stack**: React 18 + TypeScript + Vite + TipTap + Zustand + IndexedDB + Tailwind CSS v3 + OpenAI SDK + Sonner
- **Target Users**: Knowledge workers (researchers, writers, creatives building personal knowledge bases)

## Critical Dependencies

**AI Functionality**:
- `openai` - Official OpenAI SDK for API integration
- `sonner` - Toast notification library (theme-aware, rich colors)

**Editor**:
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-*` - Rich text editor framework

**State & Data**:
- `zustand` - Lightweight state management
- `idb` - IndexedDB wrapper with Promises

**UI**:
- `tailwindcss@^3` - CSS framework (v3, not v4)
- `lucide-react` - Icon library

**Environment Variables**:
- `VITE_OPENAI_API_KEY` - Optional fallback API key (not recommended for production)
- Users are encouraged to add their own API key via Settings UI (stored in localStorage)

## Other notes

1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the [todo.md](http://todo.md/) file with a summary of the changes you made and any other relevant information.
8. DO NOT BE LAZY. NEVER BE LAZY. IF THERE IS A BUG FIND THE ROOT CAUSE AND FIX IT. NO TEMPORARY FIXES. YOU ARE A SENIOR DEVELOPER. NEVER BE LAZY
9. MAKE ALL FIXES AND CODE CHANGES AS SIMPLE AS HUMANLY POSSIBLE. THEY SHOULD ONLY IMPACT NECESSARY CODE RELEVANT TO THE TASK AND NOTHING ELSE. IT SHOULD IMPACT AS LITTLE CODE AS POSSIBLE. YOUR GOAL IS TO NOT INTRODUCE ANY BUGS. IT'S ALL ABOUT SIMPLICITY

Critical - when debugging, you MUST trace through the ENTIRE code flow step by step. No assumption. No shortcuts