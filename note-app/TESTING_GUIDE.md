# 🧪 AI Notes App - Quick Testing Guide

**Date:** 2025-11-01
**App Status:** 81% MVP Complete (Phases 1-7 Done)
**Dev Server:** Running at http://localhost:5174

---

## 🎯 Quick Start Testing (5 minutes)

### 1. Basic Note Operations ✅
1. Open http://localhost:5174
2. Click **"+ New Note"** → Note should be created
3. Type some text in the editor
4. Check bottom-right → Word count, character count, reading time should appear
5. Star the note (⭐ button in toolbar) → Should turn yellow
6. Check sidebar → "FAVORITES" section appears with your note

### 2. Internal Links ✅
1. Type `[[` in the editor → Autocomplete dropdown appears
2. Start typing a note name → Suggestions filter
3. Press Enter → Link inserted as `[[Note Name]]`
4. Click the link → Navigates to that note
5. Scroll down → "Backlinks" section shows the linking note

### 3. Editor Features ✅
1. **Formatting:**
   - Select text → Click Bold (B), Italic (I), Underline (U)
   - Click "Clear formatting" (eraser icon) → All formatting removed
2. **Headings:**
   - Click heading dropdown → Select H1, H2, H3, H4, H5, H6
3. **Callouts:**
   - Click callout dropdown → Insert Info, Warning, Success, Error boxes
4. **Images:**
   - Click image button → Upload an image
   - Drag & drop an image into editor → Should insert
   - Copy image → Paste in editor → Should insert
5. **Tables:**
   - Click Table → Insert table
   - Click inside table → Bubble menu appears
   - Try: Add row, Add column, Delete row, Delete column

### 4. AI Features ✅
1. Select any text → AI bubble menu appears
2. Click **"Simplify"** → AI Result Modal opens
   - Left side: Original text
   - Right side: Simplified text
   - Diff view shows changes (green=added, red=removed)
3. Click **"Try Again"** → New result
4. Click **"Copy"** → Copied to clipboard
5. Click **"Accept"** → Text replaced in editor
6. Try **"Translate"** dropdown:
   - Select Spanish/French/German/Chinese/Japanese/Italian/Portuguese/Russian
   - Try **"Legal"** → Converts to formal legal language

### 5. Organization Features ✅
1. **Folders:**
   - Click "+" next to FOLDERS → Create folder
   - Choose a color and icon → Click Create
   - Drag a note into the folder
2. **Tags:**
   - Add tags to a note (type #tagname)
   - Click "..." menu on a tag → Try:
     - Rename tag
     - Merge with another tag
     - Delete tag (shows confirmation)
3. **Search:**
   - Type in search bar → Results filter
   - Click date filter → Try "Last 7 days", "Last 30 days"
   - Click folder filter → Select a folder
   - Click tag filter → Select multiple tags
   - See active filters as chips
   - Click "Clear search" (X button)

### 6. View Options ✅
1. Click **sort icon** (ArrowUpDown) → Try different sort options:
   - Modified (Newest/Oldest)
   - Created (Newest/Oldest)
   - Title (A-Z/Z-A)
2. Click **density icon** (LayoutList) → Toggle Compact/Comfortable
3. Toggle **"Show Snippets"** checkbox → Note previews show/hide

### 7. Import/Export ✅
1. Settings → Data tab
2. **Import:**
   - Click "Import Markdown Files" → Select .md files
   - Notes imported with titles, tags, and content
3. **Export:**
   - Right-click a note → "Export as Markdown"
   - Or: "Export as ZIP" to export all notes

### 8. PWA & Offline ✅
1. Settings → Install App tab
2. Click "Install App" (if on Chrome/Edge)
3. DevTools → Network → Set to "Offline"
4. Reload page → App still works!
5. Create/edit notes offline → Changes persist

---

## 📋 Comprehensive Feature Checklist

### ✅ PHASE 1-3: Foundation (Complete)
- [x] PWA installation
- [x] Service worker & offline mode
- [x] Internal links `[[Note]]`
- [x] Backlinks with context
- [x] Wiki link autocomplete
- [x] Markdown import (single & batch)
- [x] Markdown export (single & ZIP)

### ✅ PHASE 4: Organization (Complete)
- [x] All Notes folder
- [x] Favorites folder (auto-hide when empty)
- [x] Folder colors (10 presets)
- [x] Folder icons (16 options)
- [x] Tag rename
- [x] Tag merge
- [x] Tag delete with confirmation
- [x] Search highlighting
- [x] Date filters (Today, 7/30 days, Year)
- [x] Folder filter
- [x] Tag filter (multi-select)
- [x] Active filter chips
- [x] Results count

### ✅ PHASE 5: Editor (Complete)
- [x] Underline (Ctrl+U)
- [x] Clear formatting
- [x] Callouts (Info, Warning, Success, Error)
- [x] H4-H6 headings
- [x] Image upload (button)
- [x] Image drag & drop
- [x] Image paste
- [x] Table: Add row/column (above/below/left/right)
- [x] Table: Delete row/column/table

### ✅ PHASE 6: Note Management (Complete)
- [x] Note snippets/previews
- [x] Sort by Modified/Created/Title
- [x] View density (Compact/Comfortable)
- [x] Improved focus mode
- [x] Word count
- [x] Character count
- [x] Reading time (minutes)

### ✅ PHASE 7: AI Features (Complete)
- [x] Simplify action
- [x] Translate action (9 languages)
- [x] **Legal language option** ⚖️
- [x] AI Result Modal
- [x] Diff view (green/red highlighting)
- [x] Try Again button
- [x] Copy result button
- [x] Accept/Cancel

### ⏳ PHASE 8: Keyboard Shortcuts (Not Yet)
- [ ] Ctrl+N: New note
- [ ] Ctrl+F: Focus search
- [ ] Ctrl+K: Command palette
- [ ] Ctrl+/: Show shortcuts
- [ ] And more...

### ⏳ PHASE 9: Settings (Not Yet)
- [ ] Font family picker
- [ ] Font size adjustment
- [ ] Editor width
- [ ] Auto-save interval
- [ ] System theme detection

### ⏳ PHASE 10: Testing & QA (Not Yet)
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Performance testing
- [ ] Accessibility testing

---

## 🐛 Bug Report Template

If you find any bugs, please note:

**Bug:** [Describe what's wrong]
**Expected:** [What should happen]
**Actual:** [What actually happens]
**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Browser:** [Chrome/Firefox/Safari/Edge]
**OS:** [Windows/Mac/Linux]
**Screenshot:** [If applicable]

---

## ✅ Test Results

Once you've tested, please fill in:

| Phase | Feature | Status | Notes |
|-------|---------|--------|-------|
| 1 | PWA Installation | ☐ Pass ☐ Fail | |
| 2 | Internal Links | ☐ Pass ☐ Fail | |
| 2 | Backlinks | ☐ Pass ☐ Fail | |
| 3 | Import/Export | ☐ Pass ☐ Fail | |
| 4 | Folders & Colors | ☐ Pass ☐ Fail | |
| 4 | Tag Management | ☐ Pass ☐ Fail | |
| 4 | Search Filters | ☐ Pass ☐ Fail | |
| 5 | Editor Features | ☐ Pass ☐ Fail | |
| 5 | Callouts | ☐ Pass ☐ Fail | |
| 5 | Images | ☐ Pass ☐ Fail | |
| 5 | Tables | ☐ Pass ☐ Fail | |
| 6 | Snippets & Sort | ☐ Pass ☐ Fail | |
| 6 | Word Count | ☐ Pass ☐ Fail | |
| 7 | AI Simplify | ☐ Pass ☐ Fail | |
| 7 | AI Translate | ☐ Pass ☐ Fail | |
| 7 | AI Legal | ☐ Pass ☐ Fail | |
| 7 | AI Diff View | ☐ Pass ☐ Fail | |

**Overall Status:** ☐ Ready for Next Phase ☐ Needs Fixes

---

## 📝 Notes

**What's Working Great:**
- 

**What Needs Improvement:**
- 

**Feature Requests:**
- 

**Bugs Found:**
- 

---

**Happy Testing! 🚀**

