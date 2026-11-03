import { onBeforeUnmount, watch, type Ref } from 'vue'

/**
 * Lock the document while a modal is open, without disabling scrolling inside it.
 * Handles nested dialogs, restores the original inline styles and scroll position,
 * and avoids fixed-body layout shifts on mobile Safari.
 */
let holders = 0
let savedY = 0
let originalBody: Partial<CSSStyleDeclaration> | null = null
let originalHtmlOverflow = ''

function acquire(): void {
  if (typeof document === 'undefined') return
  holders += 1
  if (holders !== 1) return
  const body = document.body
  savedY = window.scrollY
  originalHtmlOverflow = document.documentElement.style.overflow
  originalBody = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
    overflow: body.style.overflow,
  }
  document.documentElement.style.overflow = 'hidden'
  body.style.position = 'fixed'
  body.style.top = `-${savedY}px`
  body.style.left = '0'
  body.style.right = '0'
  body.style.width = '100%'
  body.style.overflow = 'hidden'
}

function release(): void {
  if (typeof document === 'undefined' || holders === 0) return
  holders -= 1
  if (holders !== 0) return
  const body = document.body
  if (originalBody) {
    body.style.position = originalBody.position ?? ''
    body.style.top = originalBody.top ?? ''
    body.style.left = originalBody.left ?? ''
    body.style.right = originalBody.right ?? ''
    body.style.width = originalBody.width ?? ''
    body.style.overflow = originalBody.overflow ?? ''
  }
  document.documentElement.style.overflow = originalHtmlOverflow
  const previousScrollBehavior = document.documentElement.style.scrollBehavior
  document.documentElement.style.scrollBehavior = 'auto'
  window.scrollTo({ top: savedY, behavior: 'auto' })
  document.documentElement.style.scrollBehavior = previousScrollBehavior
  originalBody = null
}

export function useBodyScrollLock(open: Readonly<Ref<boolean>>): void {
  let held = false
  function sync(value: boolean): void {
    if (value && !held) { acquire(); held = true }
    else if (!value && held) { release(); held = false }
  }
  watch(open, sync, { immediate: true, flush: 'sync' })
  onBeforeUnmount(() => sync(false))
}
