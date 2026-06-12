export type ChatMarkdownPart =
  | { type: 'text'; content: string }
  | { type: 'mermaid'; content: string };

const MERMAID_FENCE_RE = /```mermaid[^\n]*\n([\s\S]*?)```/gi;

export function splitChatMarkdown(text: string): ChatMarkdownPart[] {
  const parts: ChatMarkdownPart[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(MERMAID_FENCE_RE)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      const chunk = text.slice(lastIndex, start).trim();
      if (chunk) parts.push({ type: 'text', content: chunk });
    }
    parts.push({ type: 'mermaid', content: match[1]?.trim() ?? '' });
    lastIndex = start + match[0].length;
  }

  const tail = text.slice(lastIndex).trim();
  if (tail) parts.push({ type: 'text', content: tail });

  if (parts.length === 0 && text.trim()) {
    parts.push({ type: 'text', content: text.trim() });
  }

  return parts;
}
