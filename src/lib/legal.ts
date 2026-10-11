import privacySource from '../../legal/politica-de-privacidad.md';
import termsSource from '../../legal/terminos-y-condiciones.md';
import { parseMarkdown, type MarkdownDocument } from './markdown';

export const LEGAL_DOC_IDS = ['terminos', 'privacidad'] as const;

export type LegalDocId = (typeof LEGAL_DOC_IDS)[number];

export type LegalDoc = MarkdownDocument & {
  id: LegalDocId;
  /** Nombre corto para tarjetas y listas. */
  name: string;
  acceptLabel: string;
};

/** Los textos salen de los .md de legal/: si se editan, la app muestra la versión nueva. */
export const LEGAL_DOCS: Record<LegalDocId, LegalDoc> = {
  terminos: {
    ...parseMarkdown(termsSource),
    id: 'terminos',
    name: 'Términos y Condiciones',
    acceptLabel: 'Acepto los Términos y Condiciones',
  },
  privacidad: {
    ...parseMarkdown(privacySource),
    id: 'privacidad',
    name: 'Política de Privacidad',
    acceptLabel: 'Acepto la Política de Privacidad',
  },
};

/**
 * Versión vigente, armada con las fechas de actualización. Si cambia la fecha de
 * alguno de los documentos, se vuelve a pedir la aceptación.
 */
export const LEGAL_VERSION = LEGAL_DOC_IDS.map((id) => LEGAL_DOCS[id].updated).join(' | ');

export function isLegalDocId(value: unknown): value is LegalDocId {
  return LEGAL_DOC_IDS.some((id) => id === value);
}
