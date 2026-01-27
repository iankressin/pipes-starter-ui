import type { ActionFunctionArgs } from 'react-router'
import { db, shortId } from '~/services/db.server'

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { jsonConfig } = await request.json()

    if (typeof jsonConfig !== 'string' || jsonConfig.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid jsonConfig' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const hash = shortId(jsonConfig)

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
