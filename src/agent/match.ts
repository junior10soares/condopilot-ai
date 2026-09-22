/**
 * Casamento por substring em vez de regex com `\b`: o `\b` do regex do JS trata
 * letras acentuadas (á, ã, í...) como não-palavra, então padrões como
 * `/\bestá\b/` ou `/\binadimplente\b/` simplesmente não casam com texto real
 * em pt-BR. O `includes()` simples evita essa classe inteira de bug.
 */
export function matchesAny(input: string, phrases: string[]): boolean {
  const normalized = input.toLowerCase();
  return phrases.some((phrase) => normalized.includes(phrase));
}
