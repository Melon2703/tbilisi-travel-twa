import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Named icons only: a glyph typed straight into JSX is a glyph nobody can rename,
 * restyle, or swap in one place. The icon vocabulary in `components/ui/EmojiIcon`
 * is the single place a picture is allowed to be chosen.
 */

const ROOT = join(__dirname, '..');
const SCANNED_DIRS = ['components', 'app'];

/** The vocabulary itself is where glyph choices are allowed to live. */
const EXEMPT = new Set(['components/ui/EmojiIcon.tsx']);

/**
 * Pictographs and the dingbat/symbol ranges emoji are commonly drawn from —
 * wide enough to catch `★`, `✕`, `↺` and `🗺️`, narrow enough to leave prose
 * punctuation (`—`, `•`, `−`) alone.
 */
const EMOJI =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{2190}-\u{21FF}\u{2122}\u{2139}\u{24C2}\u{3030}\u{303D}]/u;

function sourceFiles(dir: string): string[] {
  const absolute = join(ROOT, dir);
  const found: string[] = [];

  for (const entry of readdirSync(absolute)) {
    const path = join(absolute, entry);
    if (statSync(path).isDirectory()) {
      found.push(...sourceFiles(join(dir, entry)));
    } else if (/\.tsx?$/.test(entry)) {
      found.push(path);
    }
  }

  return found;
}

describe('icon vocabulary', () => {
  it('no component draws a raw emoji character in its markup', () => {
    const offenders: string[] = [];

    for (const dir of SCANNED_DIRS) {
      for (const file of sourceFiles(dir)) {
        const rel = relative(ROOT, file).split('\\').join('/');
        if (EXEMPT.has(rel)) continue;

        readFileSync(file, 'utf8')
          .split('\n')
          .forEach((line, index) => {
            if (EMOJI.test(line)) {
              offenders.push(`${rel}:${index + 1}  ${line.trim()}`);
            }
          });
      }
    }

    expect(offenders).toEqual([]);
  });
});
