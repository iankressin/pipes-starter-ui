import type { Config } from '@react-router/dev/config'

export default {
  // Enable SSR so route `action` handlers can run server-side.
  // We keep the app UX SPA-like, but POST endpoints (metadata) need a server runtime.
  ssr: true,
} satisfies Config
