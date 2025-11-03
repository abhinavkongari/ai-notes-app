/**
 * Extract context snippet around a search match
 * @param text Full text content
 * @param query Search query
 * @param contextLength Characters before and after match
 * @returns Array of context snippets with match positions
 */
export function extractSearchContext(
  text: string,
  query: string,
  contextLength = 50
): Array<{ snippet: string; start: number; end: number }> {
  if (!query.trim()) return [];

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const contexts: Array<{ snippet: string; start: number; end: number }> = [];
  
  let pos = 0;
  const maxContexts = 3; // Limit to first 3 matches

  while (pos < lowerText.length && contexts.length < maxContexts) {
    const index = lowerText.indexOf(lowerQuery, pos);
    if (index === -1) break;

    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + query.length + contextLength);
    let snippet = text.substring(start, end);

    // Add ellipsis if not at boundaries
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';

    contexts.push({
      snippet,
      start: index - start + (start > 0 ? 3 : 0), // Adjust for ellipsis
      end: index - start + query.length + (start > 0 ? 3 : 0),
    });

    pos = index + query.length;
  }

  return contexts;
}

/**
 * Highlight search query in text with <mark> tags
 * @param text Text to highlight
 * @param query Search query
 * @returns HTML string with highlighted matches
 */
export function highlightSearchQuery(text: string, query: string): string {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-900/50">$1</mark>');
}

/**
 * Escape special regex characters in search query
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Strip HTML tags to get plain text for search
 * @param html HTML string
 * @returns Plain text
 */
export function stripHtmlTags(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * Extract preview snippet from note content
 * @param content Note content (HTML or JSON)
 * @param maxLength Maximum length of snippet
 * @returns Plain text snippet
 */
export function extractNoteSnippet(content: string, maxLength = 100): string {
  if (!content) return '';
  
  try {
    // Try parsing as JSON (TipTap format)
    const parsed = JSON.parse(content);
    let text = '';
    
    const extractText = (node: any): void => {
      if (node.type === 'text') {
        text += node.text;
      } else if (node.content) {
        node.content.forEach(extractText);
      }
    };
    
    if (parsed.content) {
      parsed.content.forEach(extractText);
    }
    
    text = text.trim();
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  } catch {
    // If not JSON, treat as HTML
    const plainText = stripHtmlTags(content).trim();
    if (plainText.length > maxLength) {
      return plainText.substring(0, maxLength) + '...';
    }
    return plainText;
  }
}

