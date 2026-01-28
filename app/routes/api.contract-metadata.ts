import type { ActionFunctionArgs } from 'react-router'
import { SqdAbiService } from '@iankressin/pipes-cli/services/sqd-abi'

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { networkType, network, addresses } = await request.json()

    if (networkType !== 'evm' && networkType !== 'svm') {
      return new Response(JSON.stringify({ error: `Invalid networkType: ${networkType}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (typeof network !== 'string' || network.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid network' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!Array.isArray(addresses) || addresses.some((a) => typeof a !== 'string')) {
      return new Response(JSON.stringify({ error: 'Invalid addresses' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }


    const abiService = new SqdAbiService()
    const metadata = await abiService.getContractData(networkType, network, addresses)

    return new Response(JSON.stringify(metadata), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error fetching contract metadata:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to fetch contract metadata' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}

