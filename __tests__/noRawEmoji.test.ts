import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * The project ships no emoji at all — not in markup, not in a prop, not inside a
 * translation string or a Telegram message. A picture is chosen by name from the
 * vocabulary in `components/ui/EmojiIcon`, which is the only place a glyph is
 * decided, and where it is a `react-icons` component rather than a character.
 */

const ROOT = join(__dirname, '..');

/** Every directory this project's own code lives in. */
const SCANNED_DIRS = ['components', 'app', 'lib', '__tests__'];

/**
 * Pictographs, plus the dingbat, symbol and emoji-arrow blocks. Deliberately
 * excludes the plain arrows (U+2190–U+2193) and geometric shapes that prose and
 * diagrams use as punctuation.
 */
const EMOJI =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{231A}-\u{23FA}\u{FE0F}\u{2122}\u{2139}\u{24C2}\u{2934}\u{2935}\u{3030}\u{303D}]/u;

function sourceFiles(dir: string): string[] {
  const found: string[] = [];

  for (const entry of readdirSync(join(ROOT, dir))) {
    const path = join(ROOT, dir, entry);
    if (statSync(path).isDirectory()) {
      found.push(...sourceFiles(join(dir, entry)));
    } else if (/\.tsx?$/.test(entry)) {
      found.push(path);
    }
  }

  return found;
}

describe('icon vocabulary', () => {
  it('no source file anywhere contains a raw emoji character', () => {
    const offenders: string[] = [];

    for (const dir of SCANNED_DIRS) {
      for (const file of sourceFiles(dir)) {
        const rel = relative(ROOT, file).split('\\').join('/');

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
