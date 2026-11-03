import { ref, watch, type Ref } from 'vue'

/**
 * Generic browser-local reactive state. Data is validated before use;
 * unavailable/quota-exhausted storage never crashes the UI.
 * Prefer API-backed Pinia stores after the backend is available.
 */
export function useStoredState<T>(options: {
  key: string
  fallback: () => T
  decode: (raw: unknown) => T | null
  encode?: (value: T) => unknown
}): Ref<T> {
  function read(): T {
    if (typeof localStorage === 'undefined') return options.fallback()
    try {
      const raw = localStorage.getItem(options.key)
      if (raw === null) return options.fallback()
      return options.decode(JSON.parse(raw)) ?? options.fallback()
    } catch { return options.fallback() }
  }

  const state = ref<T>(read()) as Ref<T>
  watch(state, value => {
    if (typeof localStorage === 'undefined') return
    try { localStorage.setItem(options.key, JSON.stringify(options.encode ? options.encode(value) : value)) }
    catch { /* Keep state in memory if browser storage is full/blocked. */ }
  }, { deep: true })
  return state
}
