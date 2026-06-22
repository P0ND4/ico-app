import { markdownToHtml, printMarkdownHtml } from './markdown-export.utils';

export async function exportSummaryAsPdf(title: string, summaryText: string): Promise<void> {
  const bodyHtml = `<div class="md-content">${markdownToHtml(summaryText)}</div>`;
  await printMarkdownHtml(title, bodyHtml);
}
