/**
 * Wiki-link parser for [[Note Name]] syntax
 *
 * Supports:
 * - [[Note Name]] - Link to note by title
 * - Case-insensitive matching
 * - Extracts all wiki links from content
 */

export interface WikiLink {
  /** The full match including brackets: [[Note Name]] */
  raw: string;
  /** The note title without brackets: Note Name */
  title: string;
  /** Start index in the content */
  start: number;
  /** End index in the content */
  end: number;
}

/**
 * Regular expression to match [[wiki links]]
 * Matches: [[text]] where text doesn't contain brackets
 */
const WIKI_LINK_REGEX = /\[\[([^\]]+)\]\]/g;

/**
 * Parse all wiki links from content
 */
export function parseWikiLinks(content: string): WikiLink[] {
  const links: WikiLink[] = [];
  let match: RegExpExecArray | null;

  // Reset regex state
  WIKI_LINK_REGEX.lastIndex = 0;

  while ((match = WIKI_LINK_REGEX.exec(content)) !== null) {
    links.push({
      raw: match[0],
      title: match[1].trim(),
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return links;
}

/**
 * Check if content contains any wiki links
 */
export function hasWikiLinks(content: string): boolean {
  return WIKI_LINK_REGEX.test(content);
}

/**
 * Extract all unique note titles referenced in content
 */
export function extractLinkedNoteTitles(content: string): string[] {
  const links = parseWikiLinks(content);
  const uniqueTitles = new Set(links.map(link => link.title.toLowerCase()));
  return Array.from(uniqueTitles);
}

/**
 * Replace all instances of a note title in wiki links
 * Used when renaming notes to update all references
 */
export function replaceWikiLinkTitle(
  content: string,
  oldTitle: string,
  newTitle: string
): string {
  const regex = new RegExp(`\\[\\[${escapeRegex(oldTitle)}\\]\\]`, 'gi');
  return content.replace(regex, `[[${newTitle}]]`);
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if a string is a valid wiki link format
 */
export function isValidWikiLink(text: string): boolean {
  return /^\[\[.+\]\]$/.test(text);
}

/**
 * Convert a note title to wiki link format
 */
export function toWikiLink(title: string): string {
  return `[[${title}]]`;
}

/**
 * Extract title from wiki link format
 */
export function fromWikiLink(wikiLink: string): string | null {
  const match = wikiLink.match(/^\[\[(.+)\]\]$/);
  return match ? match[1].trim() : null;
}
