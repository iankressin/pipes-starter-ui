import { useState } from 'react'
import { Badge } from '~/components/ui/badge'
import { Input } from '~/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'
import type { NetworkType, NetworkSummary } from '../../types'
import { cn } from '~/lib/utils'

type NetworkStepProps = {
  networkType: NetworkType
  networks: Record<NetworkType, readonly NetworkSummary[]>
  selectedNetwork?: string
  onNetworkTypeChange: (type: NetworkType) => void
  onNetworkSelect: (slug: string) => void
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-muted-foreground">{children}</span>
}

export function NetworkStep({
  networkType,
  networks,
  selectedNetwork,
  onNetworkTypeChange,
  onNetworkSelect,
}: NetworkStepProps) {
  const [networkSearch, setNetworkSearch] = useState('')

  const chainTypes = [
    { name: 'EVM', value: 'evm' as const },
    { name: 'SVM', value: 'svm' as const },
  ]

  const filteredNetworks = networks[networkType]?.filter((network) => {
    const query = networkSearch.toLowerCase()
    return (
      network.name.toLowerCase().includes(query) ||
      network.slug.toLowerCase().includes(query) ||
      network.chainId?.toLowerCase().includes(query)
    )
  })

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={networkType} onValueChange={(value) => onNetworkTypeChange(value as NetworkType)} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-2 lg:w-[300px]">
            {chainTypes.map((chain) => (
              <TabsTrigger key={chain.value} value={chain.value} className="text-white">
                {chain.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="w-full sm:w-80">
          <Input
            placeholder="Search networks…"
            value={networkSearch}
            onChange={(event) => setNetworkSearch(event.target.value)}
            className="bg-black/20 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {filteredNetworks?.map((network) => {
          const isSelected = network.slug === selectedNetwork
          const chainId = network.chainId ? `#${network.chainId}` : null
          const traces = network.traces
          const stateDiffs = network.stateDiffs

          return (
            <button
              key={network.slug}
              type="button"
              onClick={() => onNetworkSelect(network.slug)}
              className={cn(
                'group rounded-xl border border-white/5 bg-black/20 p-4 text-left transition-all hover:-translate-y-[1px] hover:border-white/20 hover:bg-black/30',
                isSelected &&
                  'border-purple-400/80 bg-purple-500/20 ring-2 ring-purple-400/30 hover:bg-purple-500/15',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-white">{network.name}</span>
                    {chainId && <span className="text-xs text-muted-foreground">{chainId}</span>}
                  </div>
                  <Badge
                    variant={network.type === 'mainnet' ? 'default' : 'secondary'}
                    className={cn('text-[10px]', network.type === 'testnet' && 'border-amber-500/30 text-amber-400')}
                  >
                    {network.type}
                  </Badge>
                </div>
                {isSelected ? (
                  <div className="flex size-5 items-center justify-center rounded-full border-2 border-purple-400">
                    <div className="size-2.5 rounded-full bg-purple-400" />
                  </div>
                ) : (
                  <div className="size-5 rounded-full border-2 border-white/30" />
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Tag>{chainId ? `ChainId: ${chainId}` : 'No chain id'}</Tag>
                {network.realtime && <Tag>Realtime</Tag>}
                {traces && <Tag>Traces</Tag>}
                {stateDiffs && <Tag>State diffs</Tag>}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
