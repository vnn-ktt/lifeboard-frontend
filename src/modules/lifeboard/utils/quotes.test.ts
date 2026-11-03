import { describe, expect, it } from 'vitest'
import { normalizeQuoteAssignments, collectArchivedUserQuotes } from './quotes'

describe('quote migration', () => {
  it('keeps only known system quote assignments', () => {
    expect(normalizeQuoteAssignments({ dashboard: 'unknown', review: 'quote-2' }).dashboard).toBeUndefined()
  })
  it('preserves historical user quotes without duplicates', () => {
    const old = { id: 'one', author: 'Author', createdBy: 'user', text: { ru: 'Текст', en: 'Text', de: 'Text' } }
    const result = collectArchivedUserQuotes({ quotes: [old], archivedUserQuotes: [old] })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('one')
  })
})
