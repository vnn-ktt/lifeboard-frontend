import { seedQuotes, defaultQuoteAssignments } from '../data/seed'
import type { QuotePlacement, ArchivedUserQuote } from '../types'

const QUOTE_PLACEMENTS: readonly QuotePlacement[] = ['dashboard', 'review'];
const systemQuoteIds = new Set(seedQuotes.map((quote) => quote.id));
export function normalizeQuoteAssignments(source: unknown): Partial<Record<QuotePlacement, string>> {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return { ...defaultQuoteAssignments };
  const raw = source as Record<string, unknown>;
  const selected: Partial<Record<QuotePlacement, string>> = {};
  for (const placement of QUOTE_PLACEMENTS) {
    if (typeof raw[placement] === 'string' && systemQuoteIds.has(raw[placement] as string)) {
      selected[placement] = raw[placement] as string;
    }
  }
  return selected;
}

export function collectArchivedUserQuotes(input: unknown): ArchivedUserQuote[] {
  if (!input || typeof input !== 'object') return [];
  const state = input as Record<string, unknown>;
  const existing = Array.isArray(state.archivedUserQuotes) ? state.archivedUserQuotes : [];
  const fromOld = Array.isArray(state.quotes) ? state.quotes.filter((item: unknown) =>
    Boolean(item && typeof item === 'object' && (item as { createdBy?: unknown }).createdBy === 'user')) : [];
  const unique = new Map<string, ArchivedUserQuote>();
  for (const unknownQuote of [...existing, ...fromOld]) {
    if (!unknownQuote || typeof unknownQuote !== 'object') continue;
    const quote = unknownQuote as Record<string, unknown>;
    const text = quote.text;
    if (typeof quote.id !== 'string' || typeof quote.author !== 'string' ||
      !text || typeof text !== 'object' ||
      !['ru', 'en', 'de'].every((key) => typeof (text as Record<string, unknown>)[key] === 'string')) continue;
    const normalized = { id: quote.id, author: quote.author, text: text as ArchivedUserQuote['text'] };
    unique.set(quote.id, normalized);
  }
  return [...unique.values()];
}

