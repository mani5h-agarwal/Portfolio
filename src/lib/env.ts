// Typed access to environment variables. Only VITE_* vars reach the browser.
// Add new vars here and to src/vite-env.d.ts and .env.example.
export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? 'React App',
  apiUrl: import.meta.env.VITE_API_URL ?? '',
} as const
