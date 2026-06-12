export type SummarySourceType = 'text' | 'pdf' | 'docx' | 'txt';
export type SummaryExportFormat = 'pdf' | 'txt' | 'docx';

export interface Summary {
  id: string;
  userId: string;
  originalText: string;
  summaryText: string;
  sourceFilename: string | null;
  sourceType: SummarySourceType | null;
  createdAt: string;
}
