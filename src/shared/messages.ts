/**
 * Mensajes de UI compartidos entre capas.
 *
 * Vive en `src/shared` (kernel compartido) y no en `src/presentation/utils`
 * porque también lo consumen archivos de `src/infrastructure`, y la
 * infraestructura no debe depender de la capa de presentación.
 */
export const RETRY_MESSAGE = 'Inténtalo de nuevo.';
