import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export type GoalEntryMode = 'wizard' | 'quick';
const COOKIE = 'lb_goal_entry';

function readPreference(): GoalEntryMode {
  if (typeof document === 'undefined') return 'wizard';
  const value = document.cookie.split('; ').find(part => part.startsWith(`${COOKIE}=`))?.split('=')[1];
  return value === 'quick' ? 'quick' : 'wizard';
}

/** Cookie contains only a display preference. No credentials or personal records. */
export const useUiPreferencesStore = defineStore('uiPreferences', () => {
  const goalEntryMode = ref<GoalEntryMode>(readPreference());
  watch(goalEntryMode, mode => {
    if (typeof document !== 'undefined') document.cookie = `${COOKIE}=${mode}; Path=/; Max-Age=15552000; SameSite=Lax`;
  });
  function setGoalEntryMode(mode: GoalEntryMode) { goalEntryMode.value = mode; }
  return { goalEntryMode, setGoalEntryMode };
});
