import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { EMOJI } from './support/emojiPattern';

/**
 * The project ships no emoji anywhere it has markup to hang an icon on — not in a
 * component, not in a prop, not inside a translation string. A picture is chosen by
 * name from the vocabulary in `components/ui/EmojiIcon`, which is the only place a
 * glyph is decided, and where it is a `react-icons` component rather than a character.
 *
 * The Telegram bot is the exception, and the only one: a bot message is text, so an
 * icon cannot be drawn into it and the emoji stays.
 */

const ROOT = join(__dirname, '..');

/** Every directory this project's own code lives in. */
const SCANNED_DIRS = ['components', 'app', 'lib', '__tests__'];

/** The surfaces with no markup of their own, where an emoji is the only picture available. */
const TEXT_ONLY_SURFACES = ['lib/engine/bot.ts', '__tests__/bot.test.ts'];

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
        if (TEXT_ONLY_SURFACES.includes(rel)) continue;

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

  /* The exemption is a deliberate carve-out, not a hole: if the bot ever loses its
     emoji, that is a regression in the one place a picture cannot be drawn. */
  it('keeps the emoji in the Telegram bot, which has no markup to draw an icon in', () => {
    expect(EMOJI.test(readFileSync(join(ROOT, 'lib/engine/bot.ts'), 'utf8'))).toBe(true);
  });
});
