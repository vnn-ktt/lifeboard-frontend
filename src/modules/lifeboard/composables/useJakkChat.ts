
import { computed, nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { useAuthStore } from '@/shared/stores/useAuthStore'
import { useLifeStore } from '../stores/useLifeStore'
import { useLifeI18n } from '../i18n'
import { createId } from '@/shared/utils/createId'
import { jakkMessages } from '../components/jakk/translations'
import type { ChatMessage } from '../components/jakk/types'


/** Adapted UX from the provided MessageFeed: message bubbles, actions, reply and composer.
 * The work UI-kit source requires private components and was not copied verbatim.
 * This is a self-contained, offline demo. No messages are sent to an AI or a server.
 */
export function useJakkChat(active: Readonly<Ref<boolean | undefined>>) {
const { lang, locale } = useLifeI18n()
const auth = useAuthStore()
const life = useLifeStore()
const t = computed(() => jakkMessages[lang.value])
const userName = computed(() => auth.profile?.nickname || auth.profile?.name || t.value.me)
const input = ref('')
const editingId = ref<string | null>(null)
const replyToId = ref<string | null>(null)
const loadingReply = ref(false)
const viewport = ref<HTMLElement | null>(null)
const composer = ref<HTMLTextAreaElement | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null
const remoteMode = false
const transportError = ref('')

function initialMessages(): ChatMessage[] {
  const timestamp = new Date().toISOString()
  return [
    { id: 'jakk-welcome', author: 'jakk', body: t.value.hello, createdAt: timestamp },
    { id: 'jakk-start', author: 'jakk', body: t.value.sample, createdAt: timestamp },
  ]
}
// Backend v1 has no chat endpoint. Keep demo text ephemeral to avoid
// leaking a previous account's messages to another account in this browser.
const messages = ref<ChatMessage[]>(initialMessages())

watch(messages, () => {
  void nextTick(() => { if (viewport.value) viewport.value.scrollTop = viewport.value.scrollHeight })
}, { deep: true })
watch(active, isActive => { if (isActive) void nextTick(() => { if (viewport.value) viewport.value.scrollTop = viewport.value.scrollHeight }) }, { immediate: true })
const repliedMessage = computed(() => messages.value.find(m => m.id === replyToId.value))
const editedMessage = computed(() => messages.value.find(m => m.id === editingId.value))
const time = (iso: string) => new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

function replaceTokens(value: string, tokens: Record<string, string | number>) {
  return value.replace(/\{(\w+)\}/g, (_, key: string) => String(tokens[key] ?? ''))
}
function createDemoReply(body: string): string {
  const normalized = body.toLowerCase()
  if (/(фокус|цел|priority|priorit|focus|ziel|ziel(e|en)|direction)/i.test(normalized)) {
    const goals = life.focusGoals.slice(0, 3)
    return goals.length ? replaceTokens(t.value.focusReply, { goals: goals.map(g => g.title).join(' · ') }) : t.value.noGoals
  }
  if (/(сегодня|делать|задач|today|task|heute|aufgabe|aktion)/i.test(normalized)) {
    const stats = life.taskStats(new Date())
    return replaceTokens(t.value.todayReply, stats)
  }
  if (/(недел|итог|рефлекс|week|review|woche|rückblick)/i.test(normalized)) {
    const stats = life.weekStats(new Date())
    return replaceTokens(t.value.reviewReply, stats)
  }
  return t.value.generalReply
}
async function submit() {
  const body = input.value.trim()
  if (!body || body.length > 2000 || loadingReply.value) return
  if (editingId.value) {
    const message = messages.value.find(m => m.id === editingId.value && m.author === 'me')
    if (message) { message.body = body; message.edited = true }
    cancelEdit()
    return
  }
  const messageId = createId()
  const replyId = replyToId.value
  messages.value.push({ id: messageId, author: 'me', body, createdAt: new Date().toISOString(), replyToId: replyId })
  input.value = ''
  replyToId.value = null
  loadingReply.value = true
  transportError.value = ''
  timer = setTimeout(() => {
    messages.value.push({ id: createId(), author: 'jakk', body: createDemoReply(body), createdAt: new Date().toISOString() })
    loadingReply.value = false
    timer = null
  }, 800)
}
function cancelEdit() { editingId.value = null; replyToId.value = null; input.value = '' }
function startEdit(message: ChatMessage) { editingId.value = message.id; replyToId.value = null; input.value = message.body; void nextTick(() => composer.value?.focus()) }
function startReply(message: ChatMessage) { editingId.value = null; input.value = ''; replyToId.value = message.id; void nextTick(() => composer.value?.focus()) }
function removeMessage(id: string) { messages.value = messages.value.filter(m => m.id !== id) }
function resetChat() { if (!confirm(t.value.resetConfirm)) return; messages.value = initialMessages(); cancelEdit() }
function keydown(event: KeyboardEvent) { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit() } }
onBeforeUnmount(() => { if (timer) clearTimeout(timer) })

  return {
    t, userName, input, editingId, replyToId, loadingReply, viewport, composer, remoteMode, transportError,
    messages, repliedMessage, editedMessage, time, submit, cancelEdit,
    startEdit, startReply, removeMessage, resetChat, keydown,
  }
}
