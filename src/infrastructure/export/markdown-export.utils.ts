import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { marked } from 'marked';
import { normalizeMarkdownContent } from '../../presentation/utils/markdown-html.utils';
import { preprocessMarkdownMathDisplay } from '../../presentation/utils/math.utils';

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function markdownToHtml(text: string | null | undefined): string {
  if (!text?.trim()) return '';
  const normalized = preprocessMarkdownMathDisplay(normalizeMarkdownContent(text));
  return marked.parse(normalized) as string;
}

export const PDF_MARKDOWN_STYLES = `
  .md-content { font-size: 14px; line-height: 1.65; color: #1a202c; }
  .md-content p { margin: 0 0 10px; }
  .md-content h1 { font-size: 20px; font-weight: 700; margin: 16px 0 8px; color: #047857; }
  .md-content h2 { font-size: 17px; font-weight: 700; margin: 14px 0 6px; color: #047857; }
  .md-content h3 { font-size: 15px; font-weight: 700; margin: 12px 0 4px; color: #374151; }
  .md-content h4 { font-size: 14px; font-weight: 700; margin: 10px 0 4px; color: #374151; }
  .md-content ul, .md-content ol { margin: 8px 0 12px; padding-left: 22px; }
  .md-content li { margin-bottom: 4px; }
  .md-content strong { font-weight: 700; }
  .md-content em { font-style: italic; }
  .md-content code {
    font-family: Menlo, Monaco, Consolas, monospace;
    background: #ecfdf5;
    color: #065f46;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
  }
  .md-content pre {
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px 14px;
    overflow-x: auto;
    margin: 10px 0 14px;
  }
  .md-content pre code {
    background: none;
    padding: 0;
    color: #1f2937;
    font-size: 12px;
  }
  .md-content blockquote {
    border-left: 4px solid #059669;
    margin: 12px 0;
    padding: 4px 0 4px 14px;
    color: #4b5563;
  }
  .md-content table {
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0 16px;
    font-size: 13px;
  }
  .md-content th, .md-content td {
    border: 1px solid #d1d5db;
    padding: 8px 10px;
    text-align: left;
    vertical-align: top;
  }
  .md-content th {
    background: #f0fdf4;
    font-weight: 700;
    color: #047857;
  }
  .md-content tr:nth-child(even) td { background: #f9fafb; }
  .md-content hr { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
  .md-content a { color: #059669; text-decoration: underline; }
  .md-content img { max-width: 100%; height: auto; margin: 8px 0; border-radius: 6px; }
`;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildPdfDocumentHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: -apple-system, Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px 24px; color: #1a202c; line-height: 1.6; }
  h1.doc-title { color: #059669; border-bottom: 2px solid #059669; padding-bottom: 8px; font-size: 22px; margin-bottom: 24px; }
  ${PDF_MARKDOWN_STYLES}
</style>
</head>
<body>
  <h1 class="doc-title">${escapeHtml(title)}</h1>
  ${bodyHtml}
</body>
</html>`;
}

export async function printMarkdownHtml(title: string, bodyHtml: string): Promise<void> {
  const html = buildPdfDocumentHtml(title, bodyHtml);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  }
}
