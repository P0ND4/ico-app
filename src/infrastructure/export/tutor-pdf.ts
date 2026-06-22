import type { TutorMessage } from '../../domain/entities/tutor.entity';
import { markdownToHtml, printMarkdownHtml } from './markdown-export.utils';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildMessagesHtml(messages: TutorMessage[]): string {
  return messages
    .map((msg) => {
      const label = msg.role === 'user' ? 'Tú' : 'Tutor';
      const time = new Date(msg.createdAt).toLocaleString('es-AR');
      const body =
        msg.role === 'model'
          ? `<div class="md-content">${markdownToHtml(msg.content)}</div>`
          : `<p class="user-text">${escapeHtml(msg.content).replace(/\n/g, '<br/>')}</p>`;

      return `<section class="message message-${msg.role}">
        <p class="message-meta"><strong>${label}</strong> · ${escapeHtml(time)}</p>
        ${body}
      </section>`;
    })
    .join('');
}

export async function exportConversationAsPdf(
  title: string | null,
  messages: TutorMessage[],
): Promise<void> {
  const docTitle = title?.trim() || 'Conversación con el Tutor';
  const bodyHtml = `
    <style>
      .message { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
      .message-meta { font-size: 11px; color: #6b7280; margin: 0 0 8px; }
      .user-text { font-size: 14px; margin: 0; color: #1a202c; }
      .message-model .md-content { margin-top: 4px; }
    </style>
    ${buildMessagesHtml(messages)}
  `;
  await printMarkdownHtml(docTitle, bodyHtml);
}
