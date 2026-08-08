/**
 * What counts as an emoji character for every guard in this suite — the source scan in
 * `noRawEmoji` and the translated-copy scan in `i18n`. One definition, so the two can
 * never drift into disagreeing about what a picture is.
 *
 * Pictographs, plus the dingbat, symbol and emoji-arrow blocks. Deliberately excludes
 * the plain arrows (U+2190–U+2193) and geometric shapes that prose and diagrams use as
 * punctuation.
 */
export const EMOJI =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{231A}-\u{23FA}\u{FE0F}\u{2122}\u{2139}\u{24C2}\u{2934}\u{2935}\u{3030}\u{303D}]/u;
