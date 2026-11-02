<script lang="ts" setup></script>

<template>
  <section class="flex min-h-[calc(100vh-64px)] items-center px-4 py-10 sm:px-6 lg:px-8">
    <div class="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div class="hidden lg:block">
        <p class="m-0 text-sm font-bold uppercase text-emerald-500">
          <slot name="eyebrow" />
        </p>
        <h1 class="m-0 mt-3 max-w-xl text-4xl font-bold leading-tight">
          <slot name="title" />
        </h1>
        <p class="m-0 mt-5 max-w-lg text-lg leading-8 text-slate-400">
          <slot name="description" />
        </p>
      </div>

      <div class="mx-auto w-full max-w-md">
        <slot />
      </div>
    </div>
  </section>
</template>
