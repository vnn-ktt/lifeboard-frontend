<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';

const { t } = useI18n();

function handleImport() {
  // Will be implemented with file upload
}

function handleExportCSV() {
  // Will be implemented
}

function handleExportPDF() {
  // Will be implemented
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <p class="m-0 text-sm text-text-muted">
      {{ t('settings.importExport.description') }}
    </p>

    <!-- Import -->
    <section class="flex flex-col gap-3 rounded-lg border border-border bg-surface-alt p-4">
      <h3 class="m-0 text-sm font-semibold text-text">
        {{ t('settings.importExport.importTitle') }}
      </h3>
      <p class="m-0 text-xs text-text-muted">
        {{ t('settings.importExport.importHint') }}
      </p>
      <Button
        :label="t('settings.importExport.importButton')"
        icon="bi bi-upload"
        variant="outlined"
        size="small"
        class="w-fit"
        @click="handleImport"
      />
    </section>

    <!-- Export -->
    <section class="flex flex-col gap-3 rounded-lg border border-border bg-surface-alt p-4">
      <h3 class="m-0 text-sm font-semibold text-text">
        {{ t('settings.importExport.exportTitle') }}
      </h3>
      <p class="m-0 text-xs text-text-muted">
        {{ t('settings.importExport.exportHint') }}
      </p>
      <div class="flex flex-wrap gap-2">
        <Button
          :label="t('settings.importExport.exportCSV')"
          icon="bi bi-filetype-csv"
          variant="outlined"
          size="small"
          @click="handleExportCSV"
        />
        <Button
          :label="t('settings.importExport.exportPDF')"
          icon="bi bi-filetype-pdf"
          variant="outlined"
          size="small"
          @click="handleExportPDF"
        />
      </div>
    </section>
  </div>
</template>
