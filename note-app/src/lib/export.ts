import type { Note, Folder, Tag } from '../types/index.js';
import JSZip from 'jszip';

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
  markdown = markdown.replace(/<blockquote>(.*?)<\/blockquote>/gs, (_match, content) => {
    return content.split('\n').map((line: string) => `> ${line}`).join('\n') + '\n\n';
  });
  
  // Horizontal rule
  markdown = markdown.replace(/<hr\s*\/?>/g, '\n---\n\n');
  
  // Highlight
  markdown = markdown.replace(/<mark>(.*?)<\/mark>/g, '==$1==');
  
  // Links
  markdown = markdown.replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)');

  // Wiki links - convert data-wiki-link spans to [[Note Title]]
  markdown = markdown.replace(/<span[^>]*data-wiki-link[^>]*data-title="([^"]*)"[^>]*>.*?<\/span>/g, '[[$1]]');

  // Tables - basic support
  markdown = markdown.replace(/<table>/g, '\n');
  markdown = markdown.replace(/<\/table>/g, '\n');
  markdown = markdown.replace(/<tr>/g, '| ');
  markdown = markdown.replace(/<\/tr>/g, ' |\n');
  markdown = markdown.replace(/<td>(.*?)<\/td>/g, '$1 | ');
  markdown = markdown.replace(/<th>(.*?)<\/th>/g, '$1 | ');

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
 * Export all notes as a ZIP file containing markdown files
 */
export async function exportNotesAsZip(notes: Note[], folders: Folder[]): Promise<void> {
  const zip = new JSZip();
  const folderMap = new Map(folders.map(f => [f.id, f]));

  // Group notes by folder
  const notesByFolder = new Map<string, Note[]>();
  notes.forEach(note => {
    const folderName = note.folderId
      ? folderMap.get(note.folderId)?.name || 'Unorganized'
      : 'Unorganized';

    if (!notesByFolder.has(folderName)) {
      notesByFolder.set(folderName, []);
    }
    notesByFolder.get(folderName)!.push(note);
  });

  // Create folders and add markdown files
  notesByFolder.forEach((folderNotes, folderName) => {
    const folder = zip.folder(sanitizeFilename(folderName));
    if (!folder) return;

    folderNotes.forEach(note => {
      const content = convertHtmlToMarkdown(note.content);
      const markdown = `# ${note.title}

${note.tags.length > 0 ? `**Tags:** ${note.tags.join(', ')}\n\n` : ''}${content}

---
*Created: ${new Date(note.createdAt).toLocaleDateString()}*
*Modified: ${new Date(note.updatedAt).toLocaleDateString()}*
`;

      folder.file(`${sanitizeFilename(note.title)}.md`, markdown);
    });
  });

  // Generate and download ZIP
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `notes-export-${Date.now()}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import markdown file and convert to Note
 */
export function importMarkdownFile(file: File): Promise<Partial<Note>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const markdown = e.target?.result as string;
        const note = convertMarkdownToNote(markdown, file.name);
        resolve(note);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Convert markdown to HTML for TipTap
 */
function convertMarkdownToNote(markdown: string, filename: string): Partial<Note> {
  let content = markdown;
  let title = filename.replace(/\.md$/i, '');
  let tags: string[] = [];

  // Extract title from first H1
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    title = titleMatch[1].trim();
    content = content.replace(/^#\s+.+$/m, '').trim();
  }

  // Extract tags
  const tagsMatch = content.match(/^\*\*Tags:\*\*\s+(.+)$/m);
  if (tagsMatch) {
    tags = tagsMatch[1].split(',').map(t => t.trim());
    content = content.replace(/^\*\*Tags:\*\*\s+.+$/m, '').trim();
  }

  // Remove metadata footer
  content = content.replace(/---\n\*Created:.*\n\*Modified:.*$/s, '').trim();

  // Convert markdown to HTML
  const html = convertMarkdownToHtml(content);

  return {
    title,
    content: html,
    tags,
  };
}

/**
 * Convert Markdown to HTML for TipTap
 */
function convertMarkdownToHtml(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Bold, italic, strikethrough
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<s>$1</s>');

  // Code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/```\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>');

  // Wiki links
  html = html.replace(/\[\[(.+?)\]\]/g, '<span data-wiki-link data-title="$1">$1</span>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Lists (simple implementation)
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // Highlight
  html = html.replace(/==(.+?)==/g, '<mark>$1</mark>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr>');

  // Paragraphs - wrap text that's not already in tags
  html = html.split('\n\n').map(para => {
    para = para.trim();
    if (!para) return '';
    if (para.startsWith('<')) return para;
    return `<p>${para}</p>`;
  }).join('\n');

  return html;
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

