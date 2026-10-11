/** Tramo de texto de un párrafo; `bold` viene de `**…**`. */
export type TextSegment = { text: string; bold: boolean };

export type MarkdownBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; segments: TextSegment[] }
  | { type: 'item'; segments: TextSegment[] }
  | { type: 'row'; label: string; value: string };

export type MarkdownDocument = {
  title: string;
  /** Texto de «**Última actualización:** …», ej. «11 de octubre de 2026». */
  updated: string;
  blocks: MarkdownBlock[];
  readingMinutes: number;
};

const WORDS_PER_MINUTE = 200;

/** Separa las negritas y descarta los asteriscos de las cursivas, que la app no muestra. */
function segmentsOf(line: string): TextSegment[] {
  return line
    .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1$2')
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((part) =>
      part.startsWith('**') ? { text: part.slice(2, -2), bold: true } : { text: part, bold: false },
    );
}

function plainText(line: string): string {
  return segmentsOf(line)
    .map((segment) => segment.text)
    .join('');
}

/**
 * Lee el subconjunto de Markdown que usan los textos legales: título, fecha de
 * actualización, subtítulos, párrafos, listas y tablas de dos columnas.
 */
export function parseMarkdown(source: string): MarkdownDocument {
  const doc: MarkdownDocument = { title: '', updated: '', blocks: [], readingMinutes: 1 };
  let inTable = false;

  for (const raw of source.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      inTable = false;
      continue;
    }

    if (line.startsWith('# ')) {
      doc.title = line.slice(2);
      continue;
    }

    const updated = line.match(/^\*\*Última actualización:\*\*\s*(.+)$/);
    if (updated) {
      doc.updated = updated[1];
      continue;
    }

    if (line.startsWith('## ')) {
      doc.blocks.push({ type: 'heading', text: line.slice(3) });
    } else if (line.startsWith('- ')) {
      doc.blocks.push({ type: 'item', segments: segmentsOf(line.slice(2)) });
    } else if (line.startsWith('|')) {
      const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
      if (cells.every((cell) => /^-+$/.test(cell))) continue;
      // La primera fila es el encabezado de la tabla y no se muestra.
      if (!inTable) {
        inTable = true;
        continue;
      }
      doc.blocks.push({ type: 'row', label: plainText(cells[0] ?? ''), value: plainText(cells[1] ?? '') });
    } else {
      doc.blocks.push({ type: 'paragraph', segments: segmentsOf(line) });
    }
  }

  doc.readingMinutes = Math.max(1, Math.round(source.split(/\s+/).length / WORDS_PER_MINUTE));
  return doc;
}
