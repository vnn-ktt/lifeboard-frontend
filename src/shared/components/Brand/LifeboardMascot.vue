<script setup lang="ts">
withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' });
</script>

<template>
  <span :class="['lb-mascot', `lb-mascot--${size}`]" role="img" aria-label="Smiling cactus in a flower pot">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" fill="none">
      <ellipse cx="110" cy="196" rx="67" ry="12" fill="#102D28" opacity=".1"/>
      <g class="lb-cactus-body">
        <path d="M91 130V72c0-27 13-42 32-42s33 16 33 43v57" fill="#62B58D" stroke="#246E57" stroke-width="5"/>
        <path d="M100 119V91c0-11-6-15-14-15s-13 6-13 14v12c0 9-4 15-11 15s-12-5-12-13V88" stroke="#398767" stroke-width="13" stroke-linecap="round"/>
        <path d="M155 110c15-2 17-15 17-29V71c0-8 5-12 12-12s11 5 11 13v12" stroke="#398767" stroke-width="13" stroke-linecap="round"/>
        <path d="M110 55v10M137 68v10M107 88v11M137 96v9M121 109v10" stroke="#A7E0AD" stroke-width="3" stroke-linecap="round" opacity=".9"/>
        <path d="M117 72l-3-6m25 20 6-6m-33 21-6-5" stroke="#246E57" stroke-width="2" stroke-linecap="round"/>
      </g>
      <g class="lb-cactus-pot">
        <path d="M62 137h96l-10 49a10 10 0 0 1-10 8H82a10 10 0 0 1-10-8l-10-49Z" fill="#E6A67B" stroke="#B87355" stroke-width="4"/>
        <rect x="55" y="126" width="110" height="24" rx="11" fill="#F2BF99" stroke="#B87355" stroke-width="4"/>
        <path d="M78 164c10 5 51 6 65 0" stroke="#D88E68" stroke-width="4" stroke-linecap="round" opacity=".45"/>
        <circle cx="91" cy="165" r="4.5" fill="#513B3A"/><circle cx="129" cy="165" r="4.5" fill="#513B3A"/>
        <path d="M99 175q11 10 22 0" stroke="#513B3A" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="80" cy="174" r="6" fill="#EE8E87" opacity=".55"/><circle cx="140" cy="174" r="6" fill="#EE8E87" opacity=".55"/>
      </g>
    </svg>
  </span>
</template>
