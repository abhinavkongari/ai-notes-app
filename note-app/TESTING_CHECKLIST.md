# AI Notes App - Comprehensive Testing Checklist
**Date:** 2025-11-01
**Status:** Ready for Testing
**App URL:** http://localhost:5174

---

## ✅ PHASE 1: PWA Setup & Foundation

### 1.1 PWA Manifest
- [ ] Open DevTools → Application → Manifest
- [ ] Verify app name: "AI Notes"
- [ ] Verify icons (192x192, 512x512) load correctly
- [ ] Verify theme colors match app design

### 1.2 Service Worker
- [ ] DevTools → Application → Service Workers
- [ ] Verify service worker is registered
- [ ] Verify service worker is active

### 1.3 Offline Functionality
- [ ] DevTools → Network → Set to "Offline"
- [ ] Reload page → App should still load
- [ ] Try creating/editing a note offline
- [ ] Go back online → Changes should persist

### 1.4 PWA Installation
- [ ] Chrome/Edge: Look for install icon in address bar
- [ ] Settings → Install App tab → Click "Install App"
- [ ] Verify app installs and opens in standalone window
- [ ] iOS Safari: Share → Add to Home Screen → Verify icon and name

---

## ✅ PHASE 2: Internal Links & Backlinks

### 2.1 Wiki Link Creation
- [ ] Create a new note
- [ ] Type `[[` → Autocomplete dropdown should appear
- [ ] Start typing a note name → Suggestions filter in real-time
- [ ] Use ↑↓ arrows to navigate suggestions
- [ ] Press Enter → Link is inserted as `[[Note Name]]`
- [ ] Link should have dotted underline and hover effect

### 2.2 Wiki Link Navigation
- [ ] Click on a `[[Note Name]]` link
- [ ] Verify it navigates to the correct note
- [ ] Try clicking a link to a non-existent note → Check console for warning

### 2.3 Backlinks System
- [ ] Create links between multiple notes (A → B, C → B)
- [ ] Open Note B
- [ ] Scroll down to "Backlinks" section
- [ ] Verify Notes A and C appear in backlinks
- [ ] Click a backlink → Should navigate to that note
- [ ] Verify context snippets show around the link

### 2.4 Case Insensitivity
- [ ] Create link as `[[My Note]]`
- [ ] Create note as "my note" (different case)
- [ ] Click link → Should still navigate correctly

---

## ✅ PHASE 3: Markdown Import/Export

### 3.1 Single File Import
- [ ] Settings → Data tab → "Import Markdown Files"
- [ ] Select a single .md file
- [ ] Verify note is created with correct:
  - Title (from H1 or filename)
  - Tags (from **Tags:** line)
  - Content (markdown → HTML)
  - Wiki links preserved

### 3.2 Batch Import
- [ ] Import multiple .md files at once
- [ ] Verify all files are imported
- [ ] Check toast shows "X files imported successfully"

### 3.3 Single Note Export
- [ ] Right-click a note → Export as Markdown
- [ ] Open downloaded file → Verify:
  - Metadata (title, tags, dates)
  - Content is proper markdown
  - Wiki links as `[[Note Name]]`

### 3.4 ZIP Export
- [ ] Settings → Data → "Export as ZIP"
- [ ] Extract ZIP file → Verify:
  - Folder structure preserved
  - All notes present
  - Each note is proper markdown

### 3.5 Round-Trip Test
- [ ] Export a note with wiki links
- [ ] Delete the note
- [ ] Re-import the exported file
- [ ] Verify everything is preserved perfectly

---

## ✅ PHASE 4: Better Organization Features

### 4A: Special Folders

#### 4.1 All Notes Folder
- [ ] Verify "ALL NOTES" appears at top of sidebar
- [ ] Click it → Should show all notes regardless of folder
- [ ] Verify it's selected by default on app load

#### 4.2 Favorites Folder
- [ ] Star a note (toolbar star button)
- [ ] Verify "FAVORITES (1)" appears in sidebar
- [ ] Click Favorites → Only starred notes appear
- [ ] Unstar all notes → Favorites section disappears

#### 4.3 Favorite Toggle
- [ ] Click star in editor toolbar
- [ ] Verify star fills yellow
- [ ] Verify toast: "Added to favorites"
- [ ] Click star again → Unfilled
- [ ] Verify toast: "Removed from favorites"

### 4B: Folder Enhancements

#### 4.4 Create Folder with Color & Icon
- [ ] Click "+" next to FOLDERS
- [ ] Enter folder name
- [ ] Select a color from color picker
- [ ] Select an icon from icon picker
- [ ] Click "Create"
- [ ] Verify folder appears with chosen color and icon

#### 4.5 Edit Folder Color & Icon
- [ ] Right-click a folder → "Rename folder"
- [ ] Change color and icon
- [ ] Click "Save"
- [ ] Verify folder updates with new color and icon

#### 4.6 Folder Visual Display
- [ ] Verify each folder shows:
  - Custom icon (or default folder icon)
  - Icon colored with folder color
  - Folder name

### 4C: Tag Management

#### 4.7 Rename Tag
- [ ] Click "..." menu on a tag
- [ ] Select "Rename tag"
- [ ] Enter new name → Click "Rename"
- [ ] Verify tag name updates in sidebar
- [ ] Open notes with that tag → Verify tag is renamed
- [ ] Check toast shows "Renamed tag and updated X notes"

#### 4.8 Merge Tags
- [ ] Click "..." menu on a tag
- [ ] Select "Merge with..."
- [ ] Choose target tag from dropdown
- [ ] Click "Merge"
- [ ] Verify source tag disappears
- [ ] Open notes → Verify tags are merged

#### 4.9 Delete Tag with Confirmation
- [ ] Click "..." menu on a tag
- [ ] Select "Delete tag"
- [ ] Verify confirmation dialog shows:
  - Number of notes using the tag
  - Warning message
- [ ] Click "Delete" → Tag removed from all notes

### 4D: Search Improvements

#### 4.10 Search Result Highlighting
- [ ] Enter search query in search bar
- [ ] Verify matching text in note titles is highlighted
- [ ] Verify results count appears ("X results")

#### 4.11 Date Filters
- [ ] Click date filter dropdown
- [ ] Try each option:
  - All time
  - Today
  - Last 7 days
  - Last 30 days
  - Last year
- [ ] Verify only notes from selected time range appear

#### 4.12 Folder Filter
- [ ] Click folder filter dropdown
- [ ] Select a specific folder
- [ ] Verify only notes from that folder appear in results
- [ ] Verify active filter chip appears

#### 4.13 Tag Filter
- [ ] Click tag filter (multi-select)
- [ ] Select multiple tags
- [ ] Verify only notes with ALL selected tags appear
- [ ] Verify active filter chips appear

#### 4.14 Clear Filters
- [ ] Apply multiple filters
- [ ] Click "Clear search" button
- [ ] Verify all filters are removed
- [ ] Verify all notes are shown again

---

## ✅ PHASE 5: Complete P0 Editor Features

### 5.1 Underline
- [ ] Select text in editor
- [ ] Click underline button (or Ctrl+U)
- [ ] Verify text is underlined
- [ ] Click again → Underline removed

### 5.2 Clear Formatting
- [ ] Apply multiple formats (bold, italic, underline, color)
- [ ] Select formatted text
- [ ] Click "Clear formatting" button (eraser icon)
- [ ] Verify all formatting is removed

### 5.3 Callout/Alert Boxes
- [ ] Click callout dropdown in toolbar
- [ ] Select "Info" → Blue callout inserted
- [ ] Select "Warning" → Yellow callout inserted
- [ ] Select "Success" → Green callout inserted
- [ ] Select "Error" → Red callout inserted
- [ ] Verify each has:
  - Correct icon
  - Correct color
  - Colored left border
  - Can type inside

### 5.4 H4-H6 Headings
- [ ] Click heading dropdown
- [ ] Verify H1, H2, H3, H4, H5, H6 all appear
- [ ] Apply each heading level
- [ ] Verify correct font size and styling for each

### 5.5 Image Upload
- [ ] Click image button in toolbar
- [ ] Select an image file
- [ ] Verify image is inserted in editor
- [ ] Verify image is stored as base64
- [ ] **Drag & Drop:** Drag an image into editor → Inserts
- [ ] **Paste:** Copy image → Paste in editor → Inserts
- [ ] Try uploading large image (>5MB) → Should show error

### 5.6 Table Controls
- [ ] Insert a table (Table dropdown → Insert Table)
- [ ] Click inside table → Bubble menu appears
- [ ] Test each button:
  - [ ] Add row above
  - [ ] Add row below
  - [ ] Add column left
  - [ ] Add column right
  - [ ] Delete row
  - [ ] Delete column
  - [ ] Delete table

---

## ✅ PHASE 6: Complete P0 Note Management

### 6.1 Note Snippets/Previews
- [ ] Verify notes in sidebar show preview text below title
- [ ] Verify snippets are truncated with "..."
- [ ] Verify HTML tags are stripped
- [ ] Toggle "Show Snippets" checkbox → Snippets hide/show

### 6.2 Sort Dropdown
- [ ] Click sort icon (ArrowUpDown) in sidebar header
- [ ] Try each sort option:
  - [ ] Modified Date (Newest) - default
  - [ ] Modified Date (Oldest)
  - [ ] Created Date (Newest)
  - [ ] Created Date (Oldest)
  - [ ] Title (A-Z)
  - [ ] Title (Z-A)
- [ ] Verify notes reorder correctly
- [ ] Reload page → Sort preference persists (localStorage)

### 6.3 List View Density
- [ ] Click density icon (LayoutList) in sidebar header
- [ ] Toggle between Compact and Comfortable
- [ ] **Compact:** Smaller padding, tighter spacing
- [ ] **Comfortable:** Larger padding, more breathing room
- [ ] Reload page → Density preference persists

### 6.4 Focus Mode
- [ ] Click focus mode button in editor toolbar
- [ ] Verify:
  - Editor content is centered
  - Max-width applied
  - Larger font size
  - Increased line height
  - Better reading experience
- [ ] Click again → Exit focus mode

### 6.5 Word Count Display
- [ ] Open any note with text
- [ ] Look at editor footer (bottom)
- [ ] Verify displays:
  - Word count
  - Character count
  - Reading time (minutes)
- [ ] Type new text → Counts update in real-time
- [ ] Verify updates are debounced (not too frequent)

---

## ✅ PHASE 7: Complete P0 AI Features

### 7.1 Simplify Action
- [ ] Select complex/technical text
- [ ] AI bubble menu appears
- [ ] Click "Simplify"
- [ ] Wait for AI result (loading indicator)
- [ ] AI Result Modal opens with:
  - Original text on left
  - Simplified text on right
  - Diff view tab showing changes
- [ ] Verify text is simpler and easier to understand

### 7.2 Translate Action
- [ ] Select any text
- [ ] Click "Translate" dropdown
- [ ] Verify languages appear:
  - Spanish
  - French
  - German
  - Chinese
  - Japanese
  - Italian
  - Portuguese
  - Russian
  - **Legal** ⚖️
- [ ] Select a language → AI translates
- [ ] Try "Legal" → Converts to formal legal language

### 7.3 Diff View
- [ ] Run any AI action
- [ ] AI Result Modal opens
- [ ] Check **Diff View**:
  - [ ] Green highlights = added text
  - [ ] Red strikethrough = removed text
  - [ ] Side-by-side comparison

### 7.4 Try Again Button
- [ ] Run an AI action
- [ ] Click "Try Again" in modal
- [ ] Verify:
  - Loading state shows
  - AI runs same action again
  - New result may be different
  - Can try multiple times

### 7.5 Copy Result Button
- [ ] Run an AI action
- [ ] Click "Copy" button in modal
- [ ] Verify:
  - Toast appears: "AI result copied to clipboard!"
  - Can paste the result elsewhere

### 7.6 Accept/Reject
- [ ] Run an AI action
- [ ] Click "Accept" → Text is replaced in editor
- [ ] Run another action → Click X or Esc → Modal closes, no changes

### 7.7 All AI Actions
- [ ] Test each action:
  - [ ] Improve
  - [ ] Grammar
  - [ ] Shorter
  - [ ] Longer
  - [ ] Simplify
  - [ ] Professional
  - [ ] Translate (all languages)
  - [ ] Summarize
  - [ ] Continue
- [ ] Verify each works and shows modal

---

## ⏳ PHASE 8: Keyboard Shortcuts (Not Implemented Yet)

- [ ] Ctrl+N: Create new note
- [ ] Ctrl+F: Focus search
- [ ] Ctrl+S: Save immediately
- [ ] Ctrl+K: Command palette
- [ ] Ctrl+/: Show shortcuts help
- [ ] Esc: Close modals

---

## ⏳ PHASE 9: Settings & Customization (Not Implemented Yet)

- [ ] Font family picker
- [ ] Font size adjustment
- [ ] Editor width setting
- [ ] Auto-save interval
- [ ] System theme detection

---

## ⏳ PHASE 10: Testing & QA (Not Implemented Yet)

- [ ] Performance with 100+ notes
- [ ] Performance with 1000+ notes
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Accessibility testing
- [ ] Security testing

---

## 🐛 Known Issues / Bugs Found

### Critical (Must Fix)
- _None found yet_

### High Priority
- _None found yet_

### Medium Priority
- _None found yet_

### Low Priority
- _None found yet_

---

## ✅ Test Results Summary

**Date Tested:** ___________
**Tested By:** ___________
**Browser:** ___________
**OS:** ___________

**Phase 1 (PWA):** ☐ Pass ☐ Fail
**Phase 2 (Links):** ☐ Pass ☐ Fail
**Phase 3 (Import):** ☐ Pass ☐ Fail
**Phase 4 (Organization):** ☐ Pass ☐ Fail
**Phase 5 (Editor):** ☐ Pass ☐ Fail
**Phase 6 (Notes):** ☐ Pass ☐ Fail
**Phase 7 (AI):** ☐ Pass ☐ Fail

**Overall Status:** ☐ Ready for Production ☐ Needs Fixes

**Notes:**
_____________________________________
_____________________________________
_____________________________________

