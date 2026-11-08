<script setup lang="ts">
import Textarea from 'primevue/textarea';
import { toRef } from 'vue'
import LifeboardMascot from '@/shared/components/Brand/LifeboardMascot.vue'
import { useJakkChat } from '../../composables/useJakkChat'

const props = defineProps<{ active?: boolean }>()
const {
  t, userName, input, editingId, replyToId, loadingReply, viewport, composer, remoteMode, transportError,
  messages, repliedMessage, editedMessage, time, submit, cancelEdit,
  startEdit, startReply, removeMessage, resetChat, keydown,
} = useJakkChat(toRef(props, 'active'))
</script>

<template>
  <section class="lb-jakk-chat" :aria-label="t.subtitle">
    <div class="lb-jakk-intro"><span class="lb-jakk-avatar"><LifeboardMascot size="sm" /></span><span><strong>Helper</strong><small>{{ t.subtitle }}</small></span><button type="button" class="lb-jakk-reset" :title="t.reset" :aria-label="t.reset" @click="resetChat"><i class="bi bi-arrow-counterclockwise" /></button></div>
    <p v-if="!remoteMode" class="lb-jakk-demo-note"><i class="bi bi-info-circle" />{{ t.demo }}</p>
    <p v-if="transportError" class="lb-jakk-demo-note lb-jakk-error" role="alert"><i class="bi bi-exclamation-triangle" />{{ transportError }}</p>
    <div ref="viewport" class="lb-jakk-messages" role="log" aria-live="polite" aria-relevant="additions text">
      <article v-for="message in messages" :key="message.id" :class="['lb-jakk-message', { 'is-me': message.author==='me' }]">
        <span v-if="message.author==='jakk'" class="lb-jakk-message-avatar"><LifeboardMascot size="sm" /></span>
        <div class="lb-jakk-bubble"><div class="lb-jakk-message-meta"><strong>{{ message.author === 'jakk' ? 'Helper' : userName }}</strong><span>{{ time(message.createdAt) }}</span></div>
          <button v-if="message.replyToId" class="lb-jakk-reply-preview" type="button" @click="replyToId = message.replyToId || null"><i class="bi bi-reply" />{{ messages.find(m => m.id === message.replyToId)?.body?.slice(0, 90) || '…' }}</button>
          <p>{{ message.body }}</p>
          <div class="lb-jakk-message-actions"><button type="button" :title="t.reply" :aria-label="t.reply" @click="startReply(message)"><i class="bi bi-reply" /></button><template v-if="message.author==='me'"><button type="button" :title="t.edit" :aria-label="t.edit" @click="startEdit(message)"><i class="bi bi-pencil" /></button><button type="button" :title="t.remove" :aria-label="t.remove" @click="removeMessage(message.id)"><i class="bi bi-trash" /></button></template></div>
        </div>
      </article>
      <div v-if="loadingReply" class="lb-jakk-typing"><LifeboardMascot size="sm" /><span>{{ t.typing }}</span><i class="bi bi-three-dots" /></div>
    </div>
    <div v-if="messages.length <= 3 && !input && !editingId" class="lb-jakk-suggestions"><button type="button" @click="input=t.focus;submit()">{{ t.focus }}</button><button type="button" @click="input=t.today;submit()">{{ t.today }}</button><button type="button" @click="input=t.review;submit()">{{ t.review }}</button></div>
    <div v-if="repliedMessage || editedMessage" class="lb-jakk-composer-state"><i :class="['bi', editingId ? 'bi-pencil' : 'bi-reply']" /><span>{{ editedMessage?.body || repliedMessage?.body }}</span><button type="button" :aria-label="t.cancel" @click="cancelEdit"><i class="bi bi-x-lg" /></button></div>
    <form class="lb-jakk-composer" @submit.prevent="submit"><button type="button" disabled class="lb-jakk-attach" :title="t.attachment" :aria-label="t.attachment"><i class="bi bi-paperclip" /></button><Textarea ref="composer" v-model="input" rows="1" :aria-label="t.prompt" :placeholder="t.prompt" maxlength="2000" @keydown="keydown" /><button type="submit" class="lb-jakk-send" :disabled="loadingReply || !input.trim()" :title="editingId ? t.save : t.send" :aria-label="editingId ? t.save : t.send"><i :class="['bi', editingId ? 'bi-check-lg' : 'bi-arrow-up']" /></button></form>
  </section>
</template>
