# Product Requirements Document: Advanced Note-Taking Application

**Version:** 1.0
**Last Updated:** 2025-10-29
**Status:** Draft
**Project Type:** Personal/Learning

---

## Executive Summary

### Vision
Create a beautiful, powerful, and AI-native note-taking application that empowers knowledge workers to capture, organize, and leverage their ideas effortlessly. The app combines the simplicity of Bear with the power of Obsidian and the intelligence of modern AI.

### Problem Statement
Current note-taking applications force users to choose between:
- **Simple but limited** (Bear, Apple Notes): Beautiful but lack advanced features
- **Powerful but complex** (Roam, Obsidian): Steep learning curve, overwhelming for beginners
- **Feature-rich but bloated** (Notion): Slow performance, feature overload

Knowledge workers need a tool that is:
- Beautiful and fast from day one
- Progressively powerful as needs grow
- Intelligently enhanced with AI that assists without overwhelming
- Privacy-conscious with transparent data handling

### Solution Overview
An Electron-based desktop application (with future web support) featuring:
- A gorgeous, responsive TipTap-powered editor
- Intuitive folder-based organization with tags
- AI capabilities: writing assistance, smart organization, summarization, and conversational search
- Local-first architecture with optional cloud sync
- Cross-platform support (Windows, macOS, Linux)

### Target Audience
**Primary:** Knowledge workers (researchers, writers, creatives, PKM enthusiasts)
- Age: 25-45
- Tech-savvy, values productivity tools
- Builds personal knowledge bases
- Writes frequently (articles, research notes, documentation)
- Values privacy and control over data

---

## Product Goals & Success Metrics

### Primary Goals
1. **Delight users with a beautiful, fast editor** that makes writing a joy
2. **Reduce friction in note organization** through AI-powered assistance
3. **Enable knowledge discovery** through intelligent search and connections
4. **Maintain user trust** with privacy-conscious AI features

### Key Results (3-Month Horizon)
- **User Engagement:** 70% of users create at least 10 notes in first week
- **Performance:** Editor latency < 50ms, search results < 200ms
- **AI Adoption:** 50% of users try at least one AI feature within first session
- **Retention:** 60% of users return after 7 days

### Success Metrics

#### Engagement Metrics
- Daily Active Users (DAU) / Monthly Active Users (MAU) ratio
- Notes created per user per week (target: 5+)
- Average session duration (target: 15+ minutes)
- Feature adoption rate by cohort

#### Performance Metrics
- Keystroke latency: < 50ms (P95)
- Search response time: < 200ms (P95)
- App launch time: < 2 seconds
- Sync time (when implemented): < 5 seconds for typical note

#### AI Metrics
- AI feature usage rate (target: 3+ uses per active user per week)
- AI suggestion acceptance rate (target: 60%+)
- Chat-with-notes queries per active user (target: 2+ per week)
- Token usage per user per month (cost monitoring)

#### Quality Metrics
- Crash rate: < 0.1% of sessions
- Data loss incidents: Zero tolerance
- Sync conflicts (when implemented): < 1 per 1000 syncs

---

## User Personas

### Primary Persona: Rebecca - Research Writer

**Demographics:**
- Age: 32
- Occupation: Freelance technology writer and researcher
- Location: Urban, works from home
- Tech proficiency: High

**Goals:**
- Maintain a large repository of research notes and sources
- Quickly find information when writing articles
- Connect ideas across different topics
- Write high-quality content efficiently

**Pain Points:**
- Current tools are either too simple (can't handle complex organization) or too complex (waste time managing the tool itself)
- Finding relevant notes is time-consuming with keyword search alone
- Switching between multiple tools for writing, organizing, and AI assistance
- Worried about privacy when using AI features

**Use Cases:**
1. **Daily Research Capture:** Clips web articles, adds notes, AI auto-suggests tags
2. **Writing Articles:** Uses AI writing assistant for grammar and clarity, searches past notes for relevant information
3. **Knowledge Synthesis:** Asks AI to summarize multiple notes on a topic, discovers connections
4. **Idea Generation:** Uses AI to brainstorm and expand on initial ideas

**Success Scenario:**
Rebecca saves hours per week by quickly finding relevant research through semantic search, letting AI handle routine writing improvements, and discovering connections between notes she'd forgotten about.

---

## Feature Requirements

### P0 Features (MVP - Must Have)

#### 1. Core Editor
**Description:** Beautiful, responsive rich-text editor built on TipTap/ProseMirror

**Requirements:**
- **Text Formatting:**
  - Bold, italic, underline, strikethrough
  - Highlight with color options
  - Inline code
  - Clear formatting option

- **Block Elements:**
  - Headings (H1-H6)
  - Paragraphs
  - Blockquotes
  - Code blocks with syntax highlighting (20+ languages)
  - Horizontal rules
  - Callout/alert boxes (info, warning, success, error)

- **Lists:**
  - Bullet lists
  - Numbered lists
  - Task lists (checkboxes with completion tracking)
  - Nested lists (up to 6 levels)
  - Tab/Shift+Tab for indentation

- **Markdown Support:**
  - Markdown shortcuts (e.g., `**bold**`, `# heading`, `- list`)
  - Import from Markdown files
  - Export to Markdown

- **Media Handling:**
  - Image insertion (drag & drop, paste, upload)
  - Image resizing and alignment
  - File attachments (any type, displayed as cards)
  - Local file storage

- **Links:**
  - External URLs with auto-detection
  - Internal wiki-style links `[[Note Name]]`
  - Backlinks tracking

- **User Experience:**
  - Auto-save (debounced, every 2 seconds after typing stops)
  - Undo/redo (unlimited history during session)
  - Word count (live, bottom status bar)
  - Character count
  - Estimated reading time

**Acceptance Criteria:**
- Editor loads in < 100ms on average hardware
- No perceivable lag during typing (< 50ms latency)
- Markdown shortcuts work instantly
- All formatting persists across save/reload
- Images < 10MB load smoothly

---

#### 2. Note Management
**Description:** Core functionality for creating, editing, and managing notes

**Requirements:**
- **Note Creation:**
  - Quick create (Cmd/Ctrl+N)
  - Auto-generated title from first line or manual entry
  - Timestamp tracking (created, modified)

- **Note Metadata:**
  - Title (editable)
  - Created date
  - Modified date
  - Folder location
  - Tags (multiple)
  - Favorite/pin status

- **Note List View:**
  - Display all notes with titles and snippets
  - Sort by: created date, modified date, title (A-Z, Z-A)
  - Filter by: folder, tags, favorites
  - Card or list view toggle
  - Preview pane option

- **Note Editor View:**
  - Full-screen editing mode
  - Distraction-free focus mode (hides sidebar)
  - Split view (future: view two notes side-by-side)

**Acceptance Criteria:**
- Create new note in < 500ms
- List view scrolls smoothly with 1000+ notes
- Search and filtering are instantaneous (< 100ms)

---

#### 3. Organization System
**Description:** Folder hierarchy and tagging for flexible organization

**Requirements:**
- **Folders:**
  - Hierarchical folder structure (unlimited nesting)
  - Create, rename, delete, move folders
  - Drag & drop notes between folders
  - Folder icons (customizable)
  - Color coding (optional)
  - All Notes, Recent, Favorites as special folders

- **Tags:**
  - Flat tag structure for MVP
  - Create tags on-the-fly while editing
  - Multi-tag support per note
  - Tag autocomplete
  - Tag management (rename, merge, delete)
  - Tag cloud view showing popularity

- **Search:**
  - Full-text keyword search across all notes
  - Search within current folder option
  - Search by tag
  - Search filters (date range, folder, tag)
  - Instant results as-you-type
  - Highlight matches in results

**Acceptance Criteria:**
- Folder operations (create, move) complete in < 200ms
- Search returns results in < 200ms for 1000+ notes
- Tags autocomplete within 50ms
- No limit on folder depth (reasonable performance to 10 levels)

---

#### 4. Basic AI - Writing Assistant
**Description:** AI-powered writing improvements and assistance

**Requirements:**
- **Selection-Based Actions:**
  - User selects text → AI toolbar appears
  - Actions available:
    - **Improve Writing:** Enhance clarity and flow
    - **Fix Grammar:** Correct spelling, grammar, punctuation
    - **Make Shorter:** Condense without losing meaning
    - **Make Longer:** Expand with details
    - **Change Tone:** Professional, casual, friendly, formal
    - **Simplify:** Use simpler language
    - **Translate:** To 20+ languages

- **Implementation:**
  - Replace original text or insert below (user choice)
  - Show diff highlighting (what changed)
  - "Try again" option for alternatives
  - Copy result option

- **UX Requirements:**
  - Response time: < 3 seconds (streaming starts < 1 second)
  - Show loading indicator during processing
  - Cancel option for long requests
  - Error handling with helpful messages

- **Technical Requirements:**
  - API: OpenAI GPT-4-turbo (primary)
  - Context: Selected text + surrounding paragraph for context
  - Cost tracking and rate limiting
  - Secure API key storage (OS keychain)

**Acceptance Criteria:**
- AI suggestions appear within 3 seconds
- Acceptance rate > 50% (track via analytics)
- Zero API key leaks
- Graceful offline mode (show helpful error)

---

#### 5. Application Foundation
**Description:** Core desktop application features

**Requirements:**
- **Platform Support:**
  - Windows 10/11 (x64)
  - macOS 11+ (Intel + Apple Silicon)
  - Linux (Ubuntu 20.04+, other major distros)

- **UI/UX:**
  - Light and dark themes
  - System theme auto-detection
  - Customizable font (serif, sans-serif, mono)
  - Font size adjustment (12-24px)
  - Customizable keyboard shortcuts

- **Data Storage:**
  - Local SQLite database
  - File-based attachments (organized in app data folder)
  - Automatic backups (daily, keep 7 days)
  - Export all notes (Markdown, JSON)

- **Settings:**
  - General (language, theme, font)
  - Editor (default formatting, shortcuts)
  - AI (API key management, enable/disable features)
  - Privacy (data collection preferences)
  - Storage (backup location, cache management)

- **Performance:**
  - App launch: < 2 seconds
  - Handles 10,000+ notes without degradation
  - Memory usage: < 300MB typical
  - Database size: ~1KB per text note (excluding attachments)

**Acceptance Criteria:**
- Passes platform-specific app store guidelines (future)
- Accessibility: keyboard navigation, screen reader support
- Zero data loss on app crash (auto-save + recovery)

---

### P1 Features (High Priority - Post-MVP)

#### 6. AI - Smart Search & Organization
**Description:** Semantic search and intelligent auto-organization

**Requirements:**
- **Semantic Search:**
  - Searches by meaning, not just keywords
  - Example: "productivity tips" finds notes about "getting things done"
  - Hybrid search (combines keyword + semantic)
  - Relevance scoring with explanations

- **Technical Implementation:**
  - Generate embeddings for all notes (OpenAI text-embedding-3-small)
  - Store in vector database (Qdrant or Pinecone)
  - Background processing on note save
  - Incremental updates

- **Auto-Tagging:**
  - AI suggests relevant tags when saving notes
  - Learns from user's tag vocabulary
  - Suggests new tags or existing ones
  - One-click to accept suggestions

- **Related Notes:**
  - Sidebar showing semantically similar notes
  - "You might also be interested in..." suggestions
  - Clustering of similar notes

**Acceptance Criteria:**
- Semantic search returns relevant results 80%+ of the time
- Embedding generation completes within 5 seconds of note save
- Auto-tag suggestions have 60%+ acceptance rate
- Works offline with fallback to keyword search

---

#### 7. AI - Summarization
**Description:** Automatically generate summaries and key points

**Requirements:**
- **Note Summaries:**
  - Trigger: Manual button or auto for notes > 1000 words
  - Output: 3-5 bullet point summary
  - TL;DR: One-sentence version
  - Action items extraction (if applicable)

- **Multi-Note Summaries:**
  - Select multiple notes → Generate combined summary
  - Use case: Summarize all notes in a folder/tag
  - Output as new note option

- **Display:**
  - Summary appears at top of note (collapsible)
  - Cache summaries (regenerate only on major edits)
  - Export summary separately

**Acceptance Criteria:**
- Summary generation: < 10 seconds for 2000-word note
- Summaries are accurate and coherent 90%+ of the time
- Cache hit rate > 80% (avoid regenerating)

---

#### 8. Advanced Editor Features
**Description:** More powerful editing capabilities

**Requirements:**
- **Tables:**
  - Insert tables with custom rows/columns
  - Add/remove rows and columns
  - Merge cells
  - Sort columns
  - Cell formatting

- **Slash Commands:**
  - Type `/` to open command palette
  - Quick insert: headings, lists, tables, code, images, etc.
  - Custom command shortcuts
  - Fuzzy search in commands

- **Block Manipulation:**
  - Drag & drop blocks to reorder
  - Six-dot handle appears on hover
  - Block selection (click handle)
  - Duplicate block
  - Delete block

- **Embeds:**
  - URL rich previews (title, image, description)
  - YouTube video embeds
  - Tweet embeds
  - PDF viewer (inline, basic)

- **Templates:**
  - Pre-built templates (meeting notes, daily log, project plan)
  - Custom template creation
  - Variables in templates (date, title, etc.)

**Acceptance Criteria:**
- Slash command menu opens in < 50ms
- Drag & drop works smoothly with 100+ blocks
- Embeds load asynchronously without blocking editor

---

#### 9. Cloud Sync
**Description:** Synchronize notes across devices

**Requirements:**
- **Architecture:**
  - Backend: RESTful API (Node.js + PostgreSQL)
  - Authentication: Email/password + OAuth (Google, GitHub)
  - End-to-end encryption option

- **Sync Features:**
  - Automatic background sync when online
  - Manual sync trigger
  - Conflict resolution UI (show diff, choose version)
  - Selective sync (choose folders to sync)
  - Sync status indicator

- **Performance:**
  - Initial sync: < 30 seconds for 100 notes
  - Incremental sync: < 5 seconds
  - Bandwidth optimization (only sync changes)

**Acceptance Criteria:**
- Sync success rate > 99.5%
- Conflicts occur < 1% of syncs
- Zero data loss during sync failures
- Works on poor connections (retry logic)

---

### P2 Features (Nice-to-Have - Future)

#### 10. AI - Chat with Notes (RAG)
**Description:** Conversational interface to query all notes

**Requirements:**
- **Chat Interface:**
  - Dedicated panel or modal
  - Ask questions about notes in natural language
  - Receive answers with citations (links to source notes)
  - Multi-turn conversations with context

- **RAG Architecture:**
  - Chunk notes into segments (~500 tokens)
  - Vector search for relevant chunks
  - Feed chunks to LLM as context
  - Generate answer with citations

- **Features:**
  - Suggested questions based on note content
  - Filter chat by folder/tags
  - Export chat to new note
  - Chat history saved

**Acceptance Criteria:**
- Response time: < 5 seconds
- Citations are accurate (correct source note)
- Answers are relevant 85%+ of the time

---

#### 11. Collaboration Features
**Description:** Share and collaborate on notes

**Requirements:**
- **Note Sharing:**
  - Generate shareable links (public or password-protected)
  - Set permissions (view-only or edit)
  - Expiration dates for links

- **Real-Time Collaboration:**
  - Multiple users editing same note simultaneously
  - Cursor positions and selections visible
  - Operational transforms for conflict-free merging

- **Comments:**
  - Inline comments on text selections
  - Comment threads
  - Resolve/unresolve comments

---

#### 12. Extended Organization
**Description:** Advanced organization features

**Requirements:**
- **Graph View:**
  - Visual representation of note connections
  - Based on internal links
  - Interactive (click to open note)
  - Filter by folder/tags
  - Zoom and pan

- **Backlinks Panel:**
  - Show all notes linking to current note
  - Context snippet around link
  - Click to navigate

- **Nested Tags:**
  - Hierarchical tag structure (e.g., `#work/project/alpha`)
  - Tag inheritance

- **Saved Searches:**
  - Save complex search queries
  - Pin to sidebar
  - Smart folders (auto-update based on query)

---

#### 13. Platform Expansion
**Description:** Expand beyond desktop

**Requirements:**
- **Web Application:**
  - Progressive Web App (PWA)
  - Feature parity with desktop (where possible)
  - Responsive design

- **Mobile Apps:**
  - Native iOS and Android apps
  - Optimized mobile editor
  - Quick capture mode
  - Voice notes (with transcription)

- **Browser Extension:**
  - Web clipper
  - Save to existing note
  - Quick note creation

---

## Technical Architecture

### Technology Stack

#### Frontend
- **Framework:** React 18 + TypeScript
- **Editor:** TipTap v2 (built on ProseMirror)
- **State Management:** Zustand (lightweight, performant)
- **Styling:** Tailwind CSS + CSS Modules
- **Component Library:** Radix UI (accessible primitives)
- **Icons:** Lucide React
- **Build Tool:** Vite (fast dev server, optimized builds)

#### Desktop Application
- **Framework:** Electron 28+
- **Build Tool:** electron-builder
- **Auto-updates:** electron-updater
- **Local Database:** better-sqlite3 (synchronous, fast)
- **File System:** Node.js fs with electron APIs

#### Backend (for sync, P1)
- **Runtime:** Node.js 20+
- **Framework:** Fastify (fast, modern) or Hono (edge-ready)
- **Database:** PostgreSQL 15+ with Drizzle ORM
- **Authentication:** JWT + refresh tokens, OAuth providers
- **Storage:** S3-compatible (AWS S3 or Cloudflare R2)
- **API:** RESTful, future GraphQL consideration

#### AI Stack
- **LLM Provider:** OpenAI (GPT-4-turbo, GPT-4o-mini)
- **Embeddings:** text-embedding-3-small (cost-effective)
- **Vector Database:**
  - Option 1: Qdrant (self-hostable, open-source)
  - Option 2: Pinecone (managed, scalable)
- **RAG Framework:** LlamaIndex (flexible, well-documented)
- **Prompt Management:** Custom library with versioning
- **Local AI Option (future):** Ollama + Llama 3 for privacy mode

#### DevOps & Tooling
- **Monorepo:** Turborepo (or Nx)
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Testing:**
  - Unit: Vitest (fast, modern)
  - E2E: Playwright (cross-platform)
  - Integration: Supertest (API testing)
- **Linting:** ESLint + Prettier
- **Type Checking:** TypeScript strict mode

---

### Database Schema

#### Local Database (SQLite)

```sql
-- Notes table
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,  -- TipTap JSON format
  content_text TEXT,       -- Plain text for search
  folder_id TEXT,
  is_favorite INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,      -- Soft delete
  word_count INTEGER DEFAULT 0,
  FOREIGN KEY (folder_id) REFERENCES folders(id)
);

-- Full-text search index
CREATE VIRTUAL TABLE notes_fts USING fts5(
  title, content_text,
  content='notes',
  content_rowid='rowid'
);

-- Folders table
CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT,
  path TEXT NOT NULL,      -- Computed path (e.g., /Work/Projects)
  color TEXT,
  icon TEXT,
  position INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES folders(id)
);

-- Tags table
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT,
  created_at INTEGER NOT NULL
);

-- Note-Tag junction table
CREATE TABLE note_tags (
  note_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Attachments table
CREATE TABLE attachments (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
);

-- Links table (for backlinks)
CREATE TABLE links (
  id TEXT PRIMARY KEY,
  source_note_id TEXT NOT NULL,
  target_note_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (source_note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (target_note_id) REFERENCES notes(id) ON DELETE CASCADE
);

-- Embeddings table (for semantic search, P1)
CREATE TABLE embeddings (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding BLOB NOT NULL,  -- Serialized vector
  created_at INTEGER NOT NULL,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
);

-- Settings table
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Sync metadata (for P1 cloud sync)
CREATE TABLE sync_metadata (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,  -- 'note', 'folder', 'tag'
  entity_id TEXT NOT NULL,
  last_synced_at INTEGER,
  sync_status TEXT,           -- 'pending', 'synced', 'conflict'
  remote_version INTEGER
);
```

#### Cloud Database (PostgreSQL, P1)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),  -- NULL for OAuth users
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notes (cloud version)
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  content_text TEXT,
  folder_id UUID REFERENCES folders(id),
  is_favorite BOOLEAN DEFAULT FALSE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Sync log
CREATE TABLE sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,  -- 'create', 'update', 'delete'
  changes JSONB,
  client_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Data Flow & Architecture Diagrams

#### Editor Architecture
```
User Input
    ↓
TipTap Editor (React Component)
    ↓
ProseMirror State (Document Model)
    ↓
Transactions → Plugins → Update
    ↓
React Re-render
    ↓
Auto-save (debounced 2s)
    ↓
SQLite Database
```

#### AI Writing Assistant Flow
```
User selects text → Click "Improve Writing"
    ↓
Extract selection + context
    ↓
Build prompt with instructions
    ↓
API Request → OpenAI GPT-4-turbo
    ↓
Stream response (SSE)
    ↓
Display in diff view
    ↓
User accepts → Update editor
    ↓
Save to database
```

#### Semantic Search Flow (P1)
```
User types search query
    ↓
Generate query embedding (OpenAI)
    ↓
Parallel search:
  - Vector search (Qdrant) → Top 10 semantic matches
  - SQLite FTS → Top 10 keyword matches
    ↓
Merge & re-rank results
    ↓
Display with relevance scores
```

#### RAG Chat Flow (P2)
```
User asks: "What are my notes about productivity?"
    ↓
Generate query embedding
    ↓
Vector search → Retrieve top 5-10 relevant chunks
    ↓
Build context:
  - System prompt
  - Retrieved chunks with metadata
  - User question
    ↓
Send to LLM (GPT-4-turbo)
    ↓
Stream response with citations
    ↓
Display answer + links to source notes
```

---

### Security & Privacy

#### Data Security
- **Local Storage:**
  - SQLite database encrypted at rest (optional)
  - Use SQLCipher for encryption
  - Encryption key derived from user password

- **API Keys:**
  - Store OpenAI API key in OS keychain
    - macOS: Keychain Access
    - Windows: Credential Manager
    - Linux: libsecret
  - Never log or transmit keys

- **Cloud Sync (P1):**
  - End-to-end encryption option
  - Encrypt note content before upload
  - Server only stores encrypted blobs
  - Encryption keys never leave device

#### Privacy
- **AI Processing:**
  - Clearly communicate when data is sent to OpenAI
  - Option to disable all AI features
  - Local AI mode (future) for complete privacy
  - No data retention by AI providers (OpenAI zero-retention policy)

- **Analytics:**
  - Optional telemetry (opt-in)
  - Anonymized usage statistics
  - No PII collection
  - Open about what's collected

- **Transparency:**
  - Privacy policy in plain language
  - Open-source client code (future consideration)
  - Data export at any time

---

### Performance Requirements

#### Editor Performance
- Keystroke latency: < 50ms (P95)
- Scroll smoothness: 60 FPS with 100+ blocks
- Large document: Handle 100,000 words without lag
- Undo/redo: Instant (< 10ms)

#### Search Performance
- Keyword search: < 100ms for 10,000 notes
- Semantic search: < 500ms (including embedding generation)
- Search-as-you-type: Results update within 200ms of typing stop

#### AI Performance
- Writing assistant: First token in < 1 second, complete in < 3 seconds
- Auto-tagging: < 2 seconds per note
- Summarization: < 10 seconds for 2000-word note
- Chat response: First token in < 1 second, complete in < 5 seconds

#### Application Performance
- Cold start: < 2 seconds to usable
- Note switch: < 100ms to render new note
- Memory usage: < 300MB typical, < 500MB with heavy use
- Database size: ~1KB per text note (excluding attachments)

#### Sync Performance (P1)
- Initial sync: < 1 minute for 1000 notes
- Incremental sync: < 5 seconds
- Conflict detection: Real-time

---

## Implementation Roadmap

### Phase 1: Foundation (Months 1-2)
**Goal:** Build core MVP - editor + organization

**Week 1-2: Project Setup**
- Initialize monorepo with Turborepo
- Set up Electron + React + TypeScript + Vite
- Configure TipTap editor with basic formatting
- Set up SQLite database with initial schema
- Implement basic UI layout (sidebar + editor)

**Week 3-4: Core Editor**
- Implement all P0 editor features
  - Text formatting, headings, lists
  - Code blocks with syntax highlighting
  - Markdown shortcuts
  - Images and attachments
  - Internal links
- Auto-save functionality
- Undo/redo

**Week 5-6: Note Management**
- Note CRUD operations
- Note list view with sorting/filtering
- Metadata tracking
- Focus mode and distraction-free editing

**Week 7-8: Organization**
- Folder hierarchy (create, move, delete)
- Drag & drop notes to folders
- Tagging system with autocomplete
- Full-text search with FTS5
- Search filters

**Deliverable:** Functional desktop app with beautiful editor and solid organization

---

### Phase 2: AI Writing Assistant (Month 3)
**Goal:** Add first AI feature for immediate value

**Week 9-10: AI Infrastructure**
- OpenAI API integration
- API key management (keychain storage)
- Rate limiting and error handling
- Prompt engineering and testing
- Cost tracking

**Week 11: Writing Assistant Features**
- Selection toolbar with AI actions
- Improve writing, fix grammar
- Make shorter/longer
- Change tone
- Translate

**Week 12: UX Polish**
- Diff highlighting for changes
- Streaming responses
- Try again / alternatives
- Usage analytics
- Settings panel for AI

**Deliverable:** AI writing assistant ready for beta testing

---

### Phase 3: Smart Organization (Months 4-5)
**Goal:** Add semantic search and auto-organization

**Week 13-14: Embeddings Infrastructure**
- Set up vector database (Qdrant)
- Implement embedding generation pipeline
- Background job for processing notes
- Hybrid search (keyword + semantic)

**Week 15-16: Semantic Search**
- Integrate vector search into UI
- Relevance scoring and ranking
- Related notes sidebar
- Performance optimization

**Week 17-18: Auto-Tagging**
- AI tag suggestion on save
- Tag learning from user patterns
- Batch tagging for existing notes
- Tag management improvements

**Week 19-20: Polish & Optimization**
- Performance tuning
- Caching strategies
- Offline mode handling
- User testing and feedback

**Deliverable:** Intelligent search and organization that delights users

---

### Phase 4: Advanced Features (Month 6)
**Goal:** Add summarization and advanced editor features

**Week 21-22: Summarization**
- Single note summaries
- Multi-note summaries
- Action item extraction
- Summary caching

**Week 23-24: Advanced Editor**
- Tables with sorting
- Slash commands menu
- Block drag & drop
- URL rich previews
- Templates system

**Deliverable:** Feature-complete v1.0 ready for wider release

---

### Phase 5: Cloud & Sync (Months 7-9)
**Goal:** Enable multi-device sync

**Week 25-28: Backend Development**
- Set up Node.js backend
- PostgreSQL database
- Authentication system
- RESTful API for sync
- Deployment infrastructure

**Week 29-32: Sync Implementation**
- Sync protocol design
- Client-side sync logic
- Conflict resolution
- Selective sync
- End-to-end encryption option

**Week 33-36: Testing & Refinement**
- Sync reliability testing
- Edge case handling
- Performance optimization
- Beta testing with real users

**Deliverable:** Reliable cloud sync for multi-device use

---

### Phase 6: Chat with Notes (Months 10-12)
**Goal:** Implement RAG-based conversational search

**Week 37-40: RAG Infrastructure**
- Note chunking pipeline
- Enhanced vector storage
- Retrieval and ranking
- LlamaIndex integration

**Week 41-44: Chat Interface**
- Chat UI/UX design
- Multi-turn conversation
- Citations and links
- Suggested questions

**Week 45-48: Polish & Launch**
- Performance optimization
- User testing and feedback
- Marketing and launch prep
- v2.0 release

**Deliverable:** Groundbreaking chat-with-notes feature

---

## Competitive Analysis

### Feature Comparison Matrix

| Feature | Our App | Notion | Obsidian | Roam | Bear |
|---------|---------|--------|----------|------|------|
| **Editor Quality** | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★★☆☆ | ★★★★★ |
| **Performance** | ★★★★★ | ★★☆☆☆ | ★★★★★ | ★★★☆☆ | ★★★★★ |
| **Organization** | ★★★★☆ | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★☆☆ |
| **AI Features** | ★★★★★ | ★★★★☆ | ★★☆☆☆ | ★☆☆☆☆ | ☆☆☆☆☆ |
| **Local-First** | ★★★★★ | ☆☆☆☆☆ | ★★★★★ | ☆☆☆☆☆ | ★★★★☆ |
| **Privacy** | ★★★★★ | ★★☆☆☆ | ★★★★★ | ★★☆☆☆ | ★★★★☆ |
| **Extensibility** | ★★★☆☆ | ★★★☆☆ | ★★★★★ | ★★☆☆☆ | ★☆☆☆☆ |
| **Collaboration** | ★★☆☆☆ | ★★★★★ | ★☆☆☆☆ | ★★★★☆ | ★☆☆☆☆ |
| **Mobile Apps** | ★★☆☆☆ | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★★★ |
| **Price** | Free | Freemium | Freemium | $15/mo | Freemium |

### Competitive Advantages

1. **AI-Native from Day One**
   - Not bolted on, but core to the experience
   - More comprehensive AI features than competitors
   - Privacy-conscious AI with local option

2. **Beautiful + Powerful**
   - Combines Bear's elegance with Obsidian's power
   - No compromise on aesthetics or functionality
   - Progressive disclosure: simple by default, powerful when needed

3. **Performance-First**
   - Faster than Notion (local-first)
   - As fast as Obsidian
   - Smooth even with thousands of notes

4. **Privacy-Conscious**
   - Local-first architecture
   - Optional E2E encryption
   - Transparent AI data usage
   - User control over features

5. **Modern Tech Stack**
   - Built with latest technologies
   - Regular updates and improvements
   - Cross-platform from the start

### Differentiation Strategy

**Positioning:** "The AI-native note-taking app for knowledge workers who value both beauty and power"

**Key Messages:**
- "Write better, organize smarter, find faster"
- "Your second brain, enhanced by AI"
- "Beautiful by design, powerful by choice"
- "Privacy-first AI for your notes"

**Target Market:**
- Primary: Knowledge workers leaving Notion (too slow) or Obsidian (too complex)
- Secondary: Current Bear users wanting more power
- Tertiary: Students and researchers needing AI assistance

---

## User Experience Design Principles

### Design Philosophy

1. **Progressive Disclosure**
   - Simple by default
   - Advanced features discoverable but not in the way
   - Keyboard shortcuts for power users

2. **Speed & Responsiveness**
   - Every action feels instant
   - Optimistic updates
   - Smooth animations (60 FPS)

3. **Beautiful & Minimal**
   - Clean interface, plenty of whitespace
   - Typography as a core design element
   - Color used purposefully, not excessively

4. **Smart Defaults**
   - Works well out of the box
   - Sensible settings pre-configured
   - Customizable for those who want it

5. **Delightful Details**
   - Smooth transitions
   - Helpful empty states
   - Encouraging success messages
   - Playful but not childish

### UI Components & Patterns

#### Layout
- **Three-pane layout:** Sidebar (folders/tags) | Note List | Editor
- **Collapsible sidebar:** More space for writing when needed
- **Resizable panes:** Drag dividers to adjust
- **Focus mode:** Hide everything except editor

#### Typography
- **Editor fonts:**
  - Serif: Georgia, Merriweather
  - Sans-serif: Inter, SF Pro, Segoe UI
  - Monospace: JetBrains Mono, Fira Code
- **Font sizes:** 14-18px body, customizable
- **Line height:** 1.6 for readability
- **Paragraph spacing:** 1em

#### Colors
- **Light theme:** White background, dark gray text
- **Dark theme:** True dark background (#1a1a1a), off-white text
- **Accent color:** Customizable (default: blue)
- **Syntax highlighting:** GitHub-inspired palette

#### Animations
- **Duration:** 150-200ms for most transitions
- **Easing:** Ease-out for appearing elements, ease-in-out for transitions
- **No animation:** For critical path (typing, saving)

### Accessibility

- **Keyboard Navigation:**
  - Full keyboard support (no mouse required)
  - Custom keyboard shortcuts
  - Focus indicators always visible

- **Screen Readers:**
  - Semantic HTML
  - ARIA labels where needed
  - Announce dynamic changes

- **Visual:**
  - Minimum 4.5:1 contrast ratio (WCAG AA)
  - Resizable text
  - No color-only information

- **Preferences:**
  - Reduce motion option
  - High contrast mode
  - Font size controls

---

## Risks & Mitigations

### Technical Risks

#### Risk 1: AI Cost Overruns
**Severity:** High
**Probability:** Medium
**Impact:** Unsustainable operating costs

**Mitigation:**
- Implement aggressive caching (same input → cached output)
- Rate limiting per user (e.g., 100 AI requests per day for free tier)
- Use cost-effective models (GPT-4o-mini for simple tasks)
- Monitor costs with alerting
- Plan for paid tier if needed
- Consider local AI models for cost-sensitive operations

#### Risk 2: Performance Degradation with Scale
**Severity:** Medium
**Probability:** Medium
**Impact:** Poor user experience with large databases

**Mitigation:**
- Performance testing with 10K+ note datasets
- Database indexing strategy
- Lazy loading and virtualization
- Background operations (indexing, embeddings) don't block UI
- Profiling and optimization before each release

#### Risk 3: Data Loss or Corruption
**Severity:** Critical
**Probability:** Low
**Impact:** Complete loss of user trust

**Mitigation:**
- Automatic daily backups (keep 7 days)
- Transaction-based database updates (atomic)
- Write-ahead logging in SQLite
- Comprehensive error handling and recovery
- Extensive testing (unit, integration, E2E)
- Beta testing with power users

#### Risk 4: Sync Conflicts
**Severity:** Medium
**Probability:** Medium
**Impact:** User frustration, data inconsistency

**Mitigation:**
- Robust conflict detection and resolution
- Clear UI for manual conflict resolution
- Last-write-wins with user override
- Comprehensive sync testing across devices
- Sync status visibility

### Product Risks

#### Risk 1: Feature Bloat
**Severity:** Medium
**Probability:** High
**Impact:** Becomes another "too complex" tool

**Mitigation:**
- Ruthless prioritization (stick to roadmap)
- Regular user testing and feedback
- "Progressive disclosure" principle
- Kill features that don't deliver value
- Focus on core use cases

#### Risk 2: AI Features Don't Resonate
**Severity:** High
**Probability:** Medium
**Impact:** Differentiation fails, users don't see value

**Mitigation:**
- Extensive user research before building
- Beta test AI features with target users
- Iterate based on acceptance rates
- Make AI features discoverable (onboarding)
- Fallback: Strong core editor still valuable

#### Risk 3: Competitor Response
**Severity:** Medium
**Probability:** High
**Impact:** Notion, Obsidian add similar AI features

**Mitigation:**
- Move fast to establish market position
- Focus on integration quality (AI feels native)
- Emphasize privacy advantage
- Build community and loyalty
- Continue innovating (don't rest)

### Business Risks (Future)

#### Risk 1: Monetization Challenges
**Severity:** Medium
**Probability:** Medium
**Impact:** Can't sustain development

**Mitigation:**
- Start with free tier (build audience)
- Paid tier for cloud sync + advanced AI
- Transparent pricing (know costs upfront)
- Consider one-time purchase option
- Sponsorship/patronage model (open-source approach)

---

## Success Criteria & Launch

### MVP Launch Criteria

**Must Have:**
- ✅ All P0 features implemented and tested
- ✅ Zero critical bugs (data loss, crashes)
- ✅ Performance benchmarks met
- ✅ Runs on Windows, macOS, Linux
- ✅ Onboarding tutorial
- ✅ Comprehensive documentation

**Quality Gates:**
- Crash rate < 0.1% in beta testing
- 80% of beta testers would recommend
- All performance metrics met (P95)
- Accessibility checklist complete
- Security audit passed

### Launch Strategy

**Phase 1: Private Beta (Month 2)**
- Invite 50 target users (knowledge workers)
- Collect detailed feedback
- Focus on core editor and organization
- Iterate rapidly

**Phase 2: Public Beta (Month 3)**
- Announce on Product Hunt, Hacker News, Reddit
- Open beta with AI writing assistant
- Build waitlist for cloud sync
- Community feedback and feature requests

**Phase 3: v1.0 Launch (Month 6)**
- Full public release with all P0-P1 features
- Press outreach (tech blogs, productivity sites)
- Content marketing (blog posts, tutorials)
- Social media campaign
- Early adopter outreach

**Phase 4: Ongoing Growth**
- Regular feature releases (monthly)
- Community building (Discord, forum)
- User-generated content (templates, themes)
- Partnerships with productivity influencers

---

## Appendix

### Glossary

- **RAG (Retrieval Augmented Generation):** AI technique that retrieves relevant context before generating responses
- **Vector Database:** Database optimized for similarity search using embeddings
- **Embeddings:** Numerical representations of text that capture semantic meaning
- **TipTap:** Modern rich-text editor framework built on ProseMirror
- **ProseMirror:** Robust toolkit for building rich-text editors
- **Electron:** Framework for building cross-platform desktop apps with web technologies
- **Local-First:** Architecture where data lives primarily on user's device, not cloud

### References

- [TipTap Documentation](https://tiptap.dev/)
- [ProseMirror Guide](https://prosemirror.net/docs/guide/)
- [Electron Documentation](https://electronjs.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [LlamaIndex Documentation](https://docs.llamaindex.ai/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

### Open Questions

1. **Pricing Model:** Free forever? Freemium? One-time purchase?
2. **Open Source:** Should the client code be open-sourced?
3. **Plugin System:** Should we allow third-party plugins (like Obsidian)?
4. **Mobile Priority:** iOS first or Android first (or simultaneous)?
5. **Team Features:** How much to invest in collaboration features?

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-29 | Initial | First complete draft |

---

**Next Steps:**
1. Review and approve PRD
2. Create detailed UI/UX mockups
3. Set up development environment
4. Begin Phase 1 implementation
5. Recruit beta testers

**Questions or Feedback:** [Your contact info / GitHub discussions / etc.]