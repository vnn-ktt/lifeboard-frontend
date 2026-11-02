<script setup lang="ts">
withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' });
</script>

<template>
  <div :class="['lb-mascot', `lb-mascot--${size}`]" aria-hidden="true">
    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="lb-mascot-shadow">
        <ellipse cx="110" cy="189" rx="54" ry="16" fill="rgba(17,24,39,0.08)" />
      </g>
      <g class="lb-mascot-sprout">
        <path d="M112 38C112 23 123 15 138 15C138 29 129 41 112 44V38Z" fill="var(--life-accent)" />
        <path d="M108 38C108 23 97 15 82 15C82 29 91 41 108 44V38Z" fill="var(--life-primary-2)" />
        <rect x="106" y="39" width="8" height="22" rx="4" fill="var(--life-primary)" />
      </g>
      <g class="lb-mascot-cards">
        <rect x="47" y="60" width="126" height="42" rx="18" fill="var(--life-surface)" stroke="var(--life-border)" stroke-width="3" />
        <rect x="37" y="92" width="146" height="46" rx="20" fill="var(--life-surface-2)" stroke="var(--life-border)" stroke-width="3" />
        <rect x="27" y="128" width="166" height="50" rx="22" fill="var(--life-surface-elevated)" stroke="var(--life-border)" stroke-width="3" />
      </g>
      <g class="lb-mascot-face">
        <circle cx="87" cy="115" r="5.5" fill="var(--life-text)" />
        <circle cx="133" cy="115" r="5.5" fill="var(--life-text)" />
        <path d="M88 133C95 141 104 145 110 145C116 145 125 141 132 133" stroke="var(--life-text)" stroke-width="6" stroke-linecap="round" />
      </g>
      <g class="lb-mascot-details">
        <rect x="61" y="73" width="32" height="8" rx="4" fill="var(--life-accent-soft)" />
        <rect x="98" y="73" width="47" height="8" rx="4" fill="var(--life-secondary-soft)" />
        <rect x="60" y="151" width="42" height="8" rx="4" fill="var(--life-accent-soft)" />
        <rect x="108" y="151" width="52" height="8" rx="4" fill="var(--life-secondary-soft)" />
      </g>
      <g class="lb-mascot-hands">
        <path d="M31 146C18 146 12 138 12 129C12 120 19 113 28 113" stroke="var(--life-primary)" stroke-width="7" stroke-linecap="round" />
        <path d="M189 146C202 146 208 138 208 129C208 120 201 113 192 113" stroke="var(--life-primary)" stroke-width="7" stroke-linecap="round" />
      </g>
    </svg>
  </div>
</template>
