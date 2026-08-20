/**
 * Lightweight helper to format rich text / markdown strings from Keystatic.
 * Supports bold (**text**), italics (*text* or _text_), links ([text](url)),
 * and preserves paragraphs and newlines.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function formatInlineMarkdown(text: string): string {
  if (!text) return ''

  // Escape raw HTML first to prevent injection
  let html = escapeHtml(text)

  // Bold: **text** or __text__
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>')

  // Italic / cursive: *text* or _text_
  html = html.replace(/(^|[^\*])\*([^\*]+)\*([^\*]|$)/g, '$1<em>$2</em>$3')
  html = html.replace(/(^|[^_])_([^_]+)_([^_]|$)/g, '$1<em>$2</em>$3')

  // Links: [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline hover:text-ink-strong">$1</a>',
  )

  // Line breaks within a paragraph
  html = html.replace(/\n/g, '<br />')

  return html
}

export function parseMarkdownParagraphs(content: string): string[] {
  if (!content) return []
  return content
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(formatInlineMarkdown)
}
