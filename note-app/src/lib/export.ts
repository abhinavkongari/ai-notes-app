import type { Note, Folder, Tag } from '../types/index.js';

/**
 * Export notes as Markdown files in a ZIP-like structure
 */
export function exportNotesAsMarkdown(notes: Note[], folders: Folder[]): void {
  const folderMap = new Map(folders.map(f => [f.id, f]));
  
  notes.forEach(note => {
    const folderName = note.folderId ? folderMap.get(note.folderId)?.name || 'Unorganized' : 'Unorganized';
    const content = convertHtmlToMarkdown(note.content);
    const markdown = `# ${note.title}

${note.tags.length > 0 ? `**Tags:** ${note.tags.join(', ')}\n\n` : ''}${content}

---
*Created: ${new Date(note.createdAt).toLocaleDateString()}*
*Modified: ${new Date(note.updatedAt).toLocaleDateString()}*
`;
    
    // Download individual markdown file
    downloadFile(
      `${sanitizeFilename(folderName)}_${sanitizeFilename(note.title)}.md`,
      markdown,
      'text/markdown'
    );
  });
}

/**
 * Export all data as JSON
 */
export function exportAsJSON(notes: Note[], folders: Folder[], tags: Tag[]): void {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    notes,
    folders,
    tags,
  };
  
  const json = JSON.stringify(data, null, 2);
  downloadFile(
    `notes-backup-${Date.now()}.json`,
    json,
    'application/json'
  );
}

/**
 * Export a single note as Markdown
 */
export function exportSingleNoteAsMarkdown(note: Note): void {
  const content = convertHtmlToMarkdown(note.content);
  const markdown = `# ${note.title}

${note.tags.length > 0 ? `**Tags:** ${note.tags.join(', ')}\n\n` : ''}${content}

---
*Created: ${new Date(note.createdAt).toLocaleDateString()}*
*Modified: ${new Date(note.updatedAt).toLocaleDateString()}*
`;
  
  downloadFile(
    `${sanitizeFilename(note.title)}.md`,
    markdown,
    'text/markdown'
  );
}

/**
 * Convert HTML content to Markdown
 * Basic conversion - handles common TipTap elements
 */
function convertHtmlToMarkdown(html: string): string {
  let markdown = html;
  
  // Remove wrapping <p> tags and convert to newlines
  markdown = markdown.replace(/<p>/g, '').replace(/<\/p>/g, '\n\n');
  
  // Headers
  markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n');
  markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n');
  markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n');
  markdown = markdown.replace(/<h4>(.*?)<\/h4>/g, '#### $1\n\n');
  markdown = markdown.replace(/<h5>(.*?)<\/h5>/g, '##### $1\n\n');
  markdown = markdown.replace(/<h6>(.*?)<\/h6>/g, '###### $1\n\n');
  
  // Bold, italic, strikethrough
  markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
  markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
  markdown = markdown.replace(/<s>(.*?)<\/s>/g, '~~$1~~');
  
  // Code
  markdown = markdown.replace(/<code>(.*?)<\/code>/g, '`$1`');
  markdown = markdown.replace(/<pre><code>(.*?)<\/code><\/pre>/gs, '```\n$1\n```\n\n');
  
  // Lists
  markdown = markdown.replace(/<ul>/g, '\n').replace(/<\/ul>/g, '\n');
  markdown = markdown.replace(/<ol>/g, '\n').replace(/<\/ol>/g, '\n');
  markdown = markdown.replace(/<li>(.*?)<\/li>/g, '- $1\n');
  
  // Blockquotes
  markdown = markdown.replace(/<blockquote>(.*?)<\/blockquote>/gs, (match, content) => {
    return content.split('\n').map((line: string) => `> ${line}`).join('\n') + '\n\n';
  });
  
  // Horizontal rule
  markdown = markdown.replace(/<hr\s*\/?>/g, '\n---\n\n');
  
  // Highlight
  markdown = markdown.replace(/<mark>(.*?)<\/mark>/g, '==$1==');
  
  // Links
  markdown = markdown.replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)');
  
  // Clean up extra newlines
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  markdown = markdown.trim();
  
  return markdown;
}

/**
 * Sanitize filename for safe file system use
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 50);
}

/**
 * Download file helper
 */
function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

