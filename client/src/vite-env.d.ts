/// <reference types="vite/client" />

// Tipado de las variables de entorno de Vite expuestas al cliente.
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
