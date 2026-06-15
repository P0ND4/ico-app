import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: true,
});

/** AI sometimes wraps the whole answer in ```markdown ... ``` */
export function unwrapAiMarkdownFence(content: string): string {
  const trimmed = content.trim();
  const fenced = trimmed.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```\s*$/i);
  if (fenced) return fenced[1].trim();
  return trimmed;
}

export function normalizeMarkdownContent(content: string): string {
  return unwrapAiMarkdownFence(content)
    .replace(/\r\n/g, '\n')
    .replace(/([^\n|])\n(\|[^\n]+\|)/g, '$1\n\n$2');
}

export function renderMarkdownToHtml(content: string): string {
  if (!content?.trim()) return '';
  return marked.parse(normalizeMarkdownContent(content)) as string;
}

export const MATH_DELIMITER_RE =
  /\$\$[\s\S]+?\$\$|\$[^$\n]+\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)/;

export function hasMathDelimiters(content: string): boolean {
  const withoutFences = content.replace(/```[\s\S]*?```/g, '');
  return MATH_DELIMITER_RE.test(withoutFences);
}
