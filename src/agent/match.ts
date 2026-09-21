/**
 * Substring matching instead of `\b`-based regex: JS regex `\b` treats
 * accented letters (á, ã, í...) as non-word characters, so patterns like
 * `/\bestá\b/` or `/\binadimplente\b/` silently fail to match real pt-BR
 * text. Plain `includes()` sidesteps that whole bug class.
 */
export function matchesAny(input: string, phrases: string[]): boolean {
  const normalized = input.toLowerCase();
  return phrases.some((phrase) => normalized.includes(phrase));
}
