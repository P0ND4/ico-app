import type { Summary, SummaryExportFormat } from '../entities/summary.entity';

export interface SummaryRepository {
  getAll(): Promise<Summary[]>;
  getById(id: string): Promise<Summary>;
  generateFromText(text: string): Promise<Summary>;
  generateFromFile(file: { uri: string; name: string; type: string }): Promise<Summary>;
  delete(id: string): Promise<void>;
  export(id: string, format: SummaryExportFormat): Promise<ArrayBuffer>;
}
