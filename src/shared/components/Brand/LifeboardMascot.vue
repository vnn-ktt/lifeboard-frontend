<script setup lang="ts">
withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg'; animated?: boolean }>(), {
  size: 'md',
  animated: false,
})
</script>

<template>
  <span
    :class="['lb-mascot', `lb-mascot--${size}`, { 'is-growing': animated }]"
    role="img"
    aria-label="Lifeboard — cactus"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none">
      <defs>
        <linearGradient id="lbCactusStem" x1="34" y1="28" x2="116" y2="123" gradientUnits="userSpaceOnUse">
          <stop stop-color="#62C6A2"/><stop offset=".46" stop-color="#2D9A76"/><stop offset="1" stop-color="#1D745F"/>
        </linearGradient>
        <linearGradient id="lbCactusPot" x1="55" y1="114" x2="107" y2="150" gradientUnits="userSpaceOnUse">
          <stop stop-color="#E6A97F"/><stop offset="1" stop-color="#C98060"/>
        </linearGradient>
      </defs>
      <ellipse cx="82" cy="150" rx="39" ry="5" fill="#103D30" opacity=".12"/>
      <g class="lb-cactus-plant">
        <path d="M59 117V83H50C35 83 27 73 27 59V54C27 45 32 40 40 40S52 46 52 54V59C52 65 54 68 59 68V56C59 37 69 25 83 25S107 37 107 56V68H112C119 68 121 65 121 59V54C121 45 126 40 134 40S146 46 146 54V59C146 74 136 83 121 83H107V117Z" fill="url(#lbCactusStem)" stroke="#17614E" stroke-width="3.8" stroke-linejoin="round"/>
        <path d="M71 49C69 69 70 92 71 110M98 49C100 70 100 91 98 110" stroke="#A9E7CB" stroke-width="3" stroke-linecap="round" opacity=".54"/>
        <path d="M36 54V60M136 53V59" stroke="#B4E9D0" stroke-width="3" stroke-linecap="round" opacity=".68"/>
        <path d="M62 63L57 60M108 74L113 70M66 99L62 102M102 95L106 98" stroke="#206C53" stroke-width="1.8" stroke-linecap="round" opacity=".48"/>
      </g>
      <path d="M48 117H114L108 142C107 147 104 149 99 149H63C59 149 56 147 55 142Z" fill="url(#lbCactusPot)" stroke="#A76749" stroke-width="3.2" stroke-linejoin="round"/>
      <rect x="44" y="111" width="74" height="15" rx="5" fill="#EEBA91" stroke="#A76749" stroke-width="3.2"/>
      <path d="M64 135H98" stroke="#AA6F52" stroke-width="2.2" opacity=".48" stroke-linecap="round"/>
    </svg>
  </span>
</template>
