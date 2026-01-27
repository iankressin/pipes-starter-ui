import type { Sink, SinkOption } from '../../types'
import { cn } from '~/lib/utils'

type SinkStepProps = {
  sinks: readonly SinkOption[]
  selectedSink?: Sink
  onSinkSelect: (sink: Sink) => void
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-muted-foreground">{children}</span>
}

export function SinkStep({ sinks, selectedSink, onSinkSelect }: SinkStepProps) {
  return (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select where your indexed data should be stored. You can switch later if needed.
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {sinks.map((sink) => {
          const isSelected = sink.id === selectedSink
          return (
            <button
              key={sink.id}
              type="button"
              onClick={() => onSinkSelect(sink.id)}
              className={cn(
                'group rounded-xl border border-white/5 bg-black/20 p-4 text-left transition-all hover:-translate-y-[1px] hover:border-white/20 hover:bg-black/30',
                isSelected && 'border-purple-400/80 bg-purple-500/20 ring-2 ring-purple-400/30 hover:bg-purple-500/15',
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-white">{sink.name}</span>
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
                {sink.id === 'clickhouse' && <Tag>Analytics-first</Tag>}
                {sink.id === 'postgresql' && <Tag>Relational DB</Tag>}
                {sink.id === 'memory' && <Tag>Prototyping</Tag>}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
