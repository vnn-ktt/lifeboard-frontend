<template>
  <div class="lb-auth-shell">
    <RouterLink class="lb-auth-brand" to="/"><span class="lb-brand-mark"><i class="bi bi-layers-half" /></span><span>Lifeboard</span></RouterLink>
    <div class="lb-auth-spotlight"><span class="lb-auth-tag">YOUR PERSONAL OS</span><h1>Меньше шума.<br /><em>Больше своей жизни.</em></h1><p>Цели, привычки и небольшой шаг каждый день.</p></div>
    <div class="lb-auth-content"><slot /></div>
    <p class="lb-auth-footnote">Локальный прототип · Данные остаются в этом браузере</p>
  </div>
</template>
