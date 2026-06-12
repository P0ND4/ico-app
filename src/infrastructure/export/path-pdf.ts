import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { LearningPath, Chapter, Lesson } from '../../domain/entities/path.entity';
import { markdownToHtml, PDF_MARKDOWN_STYLES } from './markdown-export.utils';

interface PathExportData {
  path: LearningPath;
  chapters: Chapter[];
  lessonsByChapter: Record<string, Lesson[]>;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtml({ path, chapters, lessonsByChapter }: PathExportData): string {
  const chaptersHtml = chapters
    .map((chapter, idx) => {
      const lessons = lessonsByChapter[chapter.id] ?? [];
      const lessonsHtml = lessons
        .map((lesson) => {
          if (lesson.type === 'theory' || lesson.type === 'concept' || lesson.type === 'example') {
            return `<div class="lesson reading">
              ${lesson.title ? `<h4>${escapeHtml(lesson.title)}</h4>` : ''}
              <div class="md-content">${markdownToHtml(lesson.content)}</div>
            </div>`;
          }
          if (lesson.type === 'multiple_choice' && lesson.question) {
            const opts = (lesson.options ?? [])
              .map((o, i) => `<li class="${i === lesson.correctIndex ? 'correct' : ''}">${escapeHtml(o)}</li>`)
              .join('');
            return `<div class="lesson question">
              <div class="md-content question-text">${markdownToHtml(lesson.question)}</div>
              <ol>${opts}</ol>
            </div>`;
          }
          if (lesson.type === 'true_false' && lesson.question) {
            return `<div class="lesson question">
              <div class="md-content question-text">${markdownToHtml(lesson.question)}</div>
              <p>Respuesta: <strong>${lesson.correctAnswer ? 'Verdadero' : 'Falso'}</strong></p>
            </div>`;
          }
          if (lesson.type === 'open_ended' && lesson.question) {
            return `<div class="lesson question">
              <div class="md-content question-text">${markdownToHtml(lesson.question)}</div>
            </div>`;
          }
          return '';
        })
        .join('');

      return `<section class="chapter">
        <h2>${idx + 1}. ${escapeHtml(chapter.title)}</h2>
        ${lessonsHtml}
      </section>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtml(path.title)}</title>
<style>
  body { font-family: -apple-system, Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px 24px; color: #1a202c; line-height: 1.6; }
  h1 { color: #059669; border-bottom: 2px solid #059669; padding-bottom: 8px; }
  h2 { color: #047857; margin-top: 32px; border-left: 4px solid #059669; padding-left: 12px; }
  h4 { color: #374151; margin-bottom: 4px; }
  .chapter { margin-bottom: 32px; }
  .lesson { margin: 16px 0; padding: 12px 16px; border-radius: 8px; }
  .lesson.reading { background: #f0fdf4; border: 1px solid #bbf7d0; }
  .lesson.question { background: #eff6ff; border: 1px solid #bfdbfe; }
  .question-text { margin-bottom: 8px; }
  ol { padding-left: 20px; }
  li.correct { color: #059669; font-weight: 700; }
  .meta { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
  ${PDF_MARKDOWN_STYLES}
</style>
</head>
<body>
  <h1>${escapeHtml(path.title)}</h1>
  <p class="meta">${path.topic ? escapeHtml(path.topic) : ''} · ${chapters.length} capítulos · ${path.totalXp} XP total</p>
  ${chaptersHtml}
</body>
</html>`;
}

export async function exportPathAsPdf(data: PathExportData): Promise<void> {
  const html = buildHtml(data);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  }
}
