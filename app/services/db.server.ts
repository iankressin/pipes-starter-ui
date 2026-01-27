import { createClient } from '@libsql/client'
import { createHash } from 'node:crypto'

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL ?? '',
  authToken: process.env.TURSO_AUTH_TOKEN ?? '',
})

export function shortId(input: string, bytes = 8): string {
  // 8 bytes = 64-bit, produces 16 hex chars
  const h = createHash('sha256').update(input).digest()
  return h.subarray(0, bytes).toString('hex')
}
