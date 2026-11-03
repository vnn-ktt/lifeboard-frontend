import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type GoalEntryMode = 'wizard' | 'quick'

/** Non-sensitive UI preferences only. Personal data and credentials must not go in cookies. */
const COOKIE_PREFIX = 'lb_'
const COOKIE_AGE = 60 * 60 * 24 * 180

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const prefix = `${COOKIE_PREFIX}${name}=`
  const entry = document.cookie.split('; ').find(part => part.startsWith(prefix))
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : undefined
}

function writeCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${COOKIE_PREFIX}${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_AGE}; SameSite=Lax`
}

export const useUiPreferencesStore = defineStore('uiPreferences', () => {
  const goalEntryMode = ref<GoalEntryMode>(readCookie('goal_entry') === 'quick' ? 'quick' : 'wizard')
  const showJakk = ref(readCookie('jakk_visible') !== 'false')

  watch(goalEntryMode, value => writeCookie('goal_entry', value))
  watch(showJakk, value => writeCookie('jakk_visible', String(value)))

  function setGoalEntryMode(mode: GoalEntryMode): void { goalEntryMode.value = mode }
  function setShowJakk(visible: boolean): void { showJakk.value = visible }

  return { goalEntryMode, showJakk, setGoalEntryMode, setShowJakk }
})
