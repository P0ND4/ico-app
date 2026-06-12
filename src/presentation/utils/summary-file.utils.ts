import axios from 'axios';

export const SUMMARY_PICKER_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
] as const;

const SUPPORTED_EXTENSIONS = new Set(['pdf', 'docx', 'txt']);

export function resolveSummaryFileMimeType(name: string, mimeType?: string | null): string {
  if (mimeType && mimeType !== 'application/octet-stream') return mimeType;
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'txt':
      return 'text/plain';
    case 'epub':
      return 'application/epub+zip';
    default:
      return mimeType ?? 'application/octet-stream';
  }
}

export function isSupportedSummaryFile(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase();
  return ext != null && SUPPORTED_EXTENSIONS.has(ext);
}

export function getSummaryFileValidationMessage(name: string): string | null {
  const ext = name.split('.').pop()?.toLowerCase();
  if (!ext) return 'No se pudo identificar el tipo de archivo.';
  if (ext === 'epub') {
    return 'EPUB no está soportado. Exportá el libro como PDF e intentá de nuevo.';
  }
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    return 'Formato no soportado. Usá PDF, DOCX o TXT.';
  }
  return null;
}

export function getSummaryUploadErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    const msg = typeof data?.message === 'string' ? data.message : '';
    if (msg.toLowerCase().includes('unsupported')) {
      return 'Formato no soportado. Usá PDF, DOCX o TXT.';
    }
    if (err.code === 'ECONNABORTED') {
      return 'El archivo tardó demasiado en procesarse. Probá con un PDF más corto.';
    }
    if (err.response?.status === 413) {
      return 'El archivo es demasiado grande.';
    }
  }
  return 'No se pudo procesar el archivo. Verificá que sea PDF, DOCX o TXT.';
}
