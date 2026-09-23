/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Endpoint externo (Lambda/Function URL) que recibe el formulario. */
  readonly PUBLIC_CONTACT_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
