/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_FORM_ENDPOINT?: string;
  readonly PUBLIC_FORM_ACCESS_KEY?: string;
  readonly PUBLIC_INDEXABLE?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
