import type { LoaderFunctionArgs } from 'react-router'
import { db } from '~/services/db.server'

export async function loader({ params }: LoaderFunctionArgs) {
  try {
    const { id: hash } = params

    if (!hash || typeof hash !== 'string' || hash.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid config hash' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const result = await db.execute({
      sql: 'SELECT json_config FROM sqd WHERE config_hash = ?',
      args: [hash],
    })

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Config not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const jsonConfig = result.rows[0]?.json_config as string

    return new Response(jsonConfig, {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching config:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to fetch config' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
