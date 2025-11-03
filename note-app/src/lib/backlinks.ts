/**
 * Backlinks utility for tracking note-to-note relationships
 */

import type { Note } from '../types/index.js';
import { parseWikiLinks } from './wikiLinkParser.js';

/**
 * Find all notes that link to the given note
 */
export function getBacklinks(targetNote: Note, allNotes: Note[]): Note[] {
  const targetTitle = targetNote.title.toLowerCase();

  return allNotes.filter(note => {
    if (note.id === targetNote.id) return false; // Don't include self

    const links = parseWikiLinks(note.content);
    return links.some(link => link.title.toLowerCase() === targetTitle);
  });
}

/**
 * Get all notes that this note links to (outbound links)
 */
export function getOutboundLinks(sourceNote: Note, allNotes: Note[]): Note[] {
  const links = parseWikiLinks(sourceNote.content);
  const linkedTitles = new Set(links.map(link => link.title.toLowerCase()));

  return allNotes.filter(note =>
    linkedTitles.has(note.title.toLowerCase())
  );
}

/**
 * Get count of backlinks for a note
 */
export function getBacklinkCount(targetNote: Note, allNotes: Note[]): number {
  return getBacklinks(targetNote, allNotes).length;
}

/**
 * Check if noteA links to noteB
 */
export function hasLinkTo(sourceNote: Note, targetTitle: string): boolean {
  const links = parseWikiLinks(sourceNote.content);
  return links.some(link =>
    link.title.toLowerCase() === targetTitle.toLowerCase()
  );
}

/**
 * Get all orphan notes (notes with no backlinks and no outbound links)
 */
export function getOrphanNotes(allNotes: Note[]): Note[] {
  return allNotes.filter(note => {
    const hasBacklinks = getBacklinks(note, allNotes).length > 0;
    const hasOutboundLinks = getOutboundLinks(note, allNotes).length > 0;
    return !hasBacklinks && !hasOutboundLinks;
  });
}
