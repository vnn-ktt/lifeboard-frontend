<script setup lang="ts">
const props = withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}>(), {
  size: 'md',
  animated: false,
})

const pieces = [
  { class: 'piece--tl', x: 22, y: 22, rx: 18, fill: '#3CB487', accent: '#6BE0B4' },
  { class: 'piece--tr', x: 86, y: 22, rx: 18, fill: '#2F9A74', accent: '#62D7AB' },
  { class: 'piece--bl', x: 22, y: 86, rx: 18, fill: '#1F7A66', accent: '#56C9A0' },
  { class: 'piece--br', x: 86, y: 86, rx: 18, fill: '#D17D49', accent: '#F2B27E' },
]
</script>

<template>
  <span :class="['lb-mascot', `lb-mascot--${props.size}`, { 'is-animated': props.animated }]" role="img" aria-label="Lifeboard modular mark">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none" aria-hidden="true">
      <defs>
        <filter id="lbModShadow" x="0" y="0" width="160" height="160" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#0B231C" flood-opacity=".12"/>
        </filter>
      </defs>

      <ellipse cx="80" cy="145" rx="42" ry="7" fill="#0B231C" opacity=".08"/>

      <g filter="url(#lbModShadow)">
        <g v-for="piece in pieces" :key="piece.class" :class="['lb-mod-piece', piece.class]">
          <rect :x="piece.x" :y="piece.y" width="52" height="52" :rx="piece.rx" :fill="piece.fill"/>
          <path :d="`M${piece.x + 11} ${piece.y + 16}C${piece.x + 18} ${piece.y + 8} ${piece.x + 32} ${piece.y + 8} ${piece.x + 40} ${piece.y + 16}`" :stroke="piece.accent" stroke-width="4" stroke-linecap="round" opacity=".7"/>
          <path :d="`M${piece.x + 12} ${piece.y + 37}C${piece.x + 24} ${piece.y + 31} ${piece.x + 34} ${piece.y + 31} ${piece.x + 40} ${piece.y + 38}`" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity=".22"/>
        </g>
      </g>

      <path d="M80 47v-8" stroke="#FFF9F2" stroke-width="4" stroke-linecap="round" opacity=".72"/>
      <path d="M47 80h-8" stroke="#FFF9F2" stroke-width="4" stroke-linecap="round" opacity=".72"/>
      <path d="M113 80h8" stroke="#FFF9F2" stroke-width="4" stroke-linecap="round" opacity=".72"/>
      <path d="M80 113v8" stroke="#FFF9F2" stroke-width="4" stroke-linecap="round" opacity=".72"/>
    </svg>
  </span>
</template>
