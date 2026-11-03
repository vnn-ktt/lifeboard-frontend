import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useStoredState } from './useStoredState'

describe('useStoredState', () => {
  it('uses valid data and persists updates', async () => {
    const getItem = vi.fn(() => JSON.stringify([1, 2]))
    const setItem = vi.fn()
    vi.stubGlobal('localStorage', { getItem, setItem })
    const data = useStoredState<number[]>({
      key: 'sample', fallback: () => [],
      decode: value => Array.isArray(value) && value.every(x => typeof x === 'number') ? value : null,
    })
    expect(data.value).toEqual([1, 2])
    data.value.push(3)
    await nextTick()
    expect(setItem).toHaveBeenCalledWith('sample', JSON.stringify([1, 2, 3]))
    vi.unstubAllGlobals()
  })
})
