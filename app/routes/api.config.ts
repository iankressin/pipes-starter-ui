import type { ActionFunctionArgs } from 'react-router'
import { createHash } from 'node:crypto'
import { db } from '~/services/db.server'

export function configHash(input: string, bytes = 8): string {
  // 8 bytes = 64-bit, produces 16 hex chars
  const h = createHash('sha256').update(input).digest()
  return h.subarray(0, bytes).toString('hex')
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { jsonConfig } = await request.json()

    if (typeof jsonConfig !== 'string' || jsonConfig.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid jsonConfig' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const hash = configHash(jsonConfig)

    // Try to insert, if hash exists (UNIQUE constraint violation), just return the hash
    try {
      await db.execute({
        sql: 'INSERT INTO sqd (json_config, config_hash) VALUES (?, ?)',
        args: [jsonConfig, hash],
      })

      return new Response(JSON.stringify({ hash }), {
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (insertError) {
      // If UNIQUE constraint fails, config already exists - just return the hash
      return new Response(JSON.stringify({ hash }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    console.error('Error saving config:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to save config' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
