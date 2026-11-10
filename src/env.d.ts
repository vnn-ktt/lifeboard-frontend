/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Reserved for the next milestone. This release does not fetch from the API. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
