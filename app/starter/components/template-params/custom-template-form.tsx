import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Badge } from '~/components/ui/badge'
import type { NetworkType, ContractMetadata, ContractEvent } from '../../types'
import { parseAddresses, validateAddress, truncateAddress } from '../../utils/validation'
import { Loader2, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react'

type CustomTemplateFormProps = {
  networkType: NetworkType
  network: string
  defaultValues?: { contracts?: ContractMetadata[] }
  onSubmit: (data: { contracts: ContractMetadata[] }) => void
  onCancel?: () => void
}

type ContractWithSelection = ContractMetadata & {
  selectedEvents: Set<string>
}

export function CustomTemplateForm({ networkType, network, defaultValues, onSubmit, onCancel }: CustomTemplateFormProps) {
  // Initialize with existing data if available
  const initialContracts = defaultValues?.contracts || []
  const hasExistingData = initialContracts.length > 0
  
  const [step, setStep] = useState<'input' | 'selection'>(hasExistingData ? 'selection' : 'input')
  const [addressInput, setAddressInput] = useState(
    hasExistingData ? initialContracts.map(c => c.contractAddress).join(', ') : ''
  )
  const [contracts, setContracts] = useState<ContractWithSelection[]>(
    hasExistingData
      ? initialContracts.map(contract => ({
          ...contract,
          selectedEvents: new Set(contract.contractEvents.map(e => e.name)),
        }))
      : []
  )
  const [expandedContracts, setExpandedContracts] = useState<Set<string>>(
    new Set(hasExistingData ? initialContracts.map(c => c.contractAddress) : [])
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addresses = parseAddresses(addressInput)
  const invalidAddresses = addresses.filter((addr) => !validateAddress(addr, networkType))
  const hasValidAddresses = addresses.length > 0 && invalidAddresses.length === 0

  const handleFetchMetadata = async () => {
    if (!hasValidAddresses) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/contract-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ networkType, network, addresses }),
      })

      if (!response.ok) {
        const maybeError = await response.json().catch(() => null)
        const message =
          (maybeError && typeof maybeError.error === 'string' && maybeError.error) ||
          `Failed to fetch contract metadata (${response.status})`
        throw new Error(message)
      }

      const metadata: ContractMetadata[] = await response.json()
      
      // Initialize with all events selected
      const contractsWithSelection: ContractWithSelection[] = metadata.map((contract) => ({
        ...contract,
        selectedEvents: new Set(contract.contractEvents.map((e) => e.name)),
      }))

      setContracts(contractsWithSelection)
      setExpandedContracts(new Set(contractsWithSelection.map((c) => c.contractAddress)))
      setStep('selection')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleContract = (address: string) => {
    setExpandedContracts((prev) => {
      const next = new Set(prev)
      if (next.has(address)) {
        next.delete(address)
      } else {
        next.add(address)
      }
      return next
    })
  }

  const toggleEvent = (contractAddress: string, eventName: string) => {
    setContracts((prev) =>
      prev.map((contract) => {
        if (contract.contractAddress === contractAddress) {
          const selectedEvents = new Set(contract.selectedEvents)
          if (selectedEvents.has(eventName)) {
            selectedEvents.delete(eventName)
          } else {
            selectedEvents.add(eventName)
          }
          return { ...contract, selectedEvents }
        }
        return contract
      })
    )
  }

  const selectAllEvents = (contractAddress: string) => {
    setContracts((prev) =>
      prev.map((contract) => {
        if (contract.contractAddress === contractAddress) {
          return {
            ...contract,
            selectedEvents: new Set(contract.contractEvents.map((e) => e.name)),
          }
        }
        return contract
      })
    )
  }

  const deselectAllEvents = (contractAddress: string) => {
    setContracts((prev) =>
      prev.map((contract) => {
        if (contract.contractAddress === contractAddress) {
          return { ...contract, selectedEvents: new Set() }
        }
        return contract
      })
    )
  }

  const handleSubmit = () => {
    // Filter out contracts with no selected events and format the data
    const formattedContracts: ContractMetadata[] = contracts
      .filter((contract) => contract.selectedEvents.size > 0)
      .map((contract) => ({
        contractAddress: contract.contractAddress,
        contractName: contract.contractName,
        contractEvents: contract.contractEvents.filter((event) => contract.selectedEvents.has(event.name)),
      }))

    if (formattedContracts.length === 0) {
      setError('Please select at least one event')
      return
    }

    onSubmit({ contracts: formattedContracts })
  }

  const totalSelectedEvents = contracts.reduce((sum, c) => sum + c.selectedEvents.size, 0)

  if (step === 'input') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="addresses" className="text-sm font-medium text-white">
            Contract Addresses
          </Label>
          <Textarea
            id="addresses"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder={
              networkType === 'evm'
                ? '0x1234..., 0x5678...'
                : 'Base58Address1, Base58Address2'
            }
            className="min-h-[100px] resize-none font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Enter contract addresses separated by commas or new lines
          </p>
        </div>

        {addresses.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-white">Parsed addresses ({addresses.length}):</p>
            <div className="flex flex-wrap gap-2">
              {addresses.map((addr, i) => (
                <Badge
                  key={i}
                  variant={validateAddress(addr, networkType) ? 'default' : 'secondary'}
                  className="font-mono text-xs"
                >
                  {truncateAddress(addr)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {invalidAddresses.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-red-500">Invalid addresses detected</p>
              <p className="text-xs text-red-400 mt-1">
                {networkType === 'evm'
                  ? 'EVM addresses must start with 0x and be 42 characters long'
                  : 'SVM addresses must be valid base58 (32-44 characters)'}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={handleFetchMetadata}
            disabled={!hasValidAddresses || loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching Metadata...
              </>
            ) : (
              'Next'
            )}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Selection step
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Select Events</p>
          <p className="text-xs text-muted-foreground">
            {totalSelectedEvents} events from {contracts.filter((c) => c.selectedEvents.size > 0).length} contracts
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => setStep('input')}>
          Back
        </Button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {contracts.map((contract) => {
          const isExpanded = expandedContracts.has(contract.contractAddress)
          const allSelected = contract.selectedEvents.size === contract.contractEvents.length
          const noneSelected = contract.selectedEvents.size === 0

          return (
            <div key={contract.contractAddress} className="rounded-lg border border-white/10 bg-black/20">
              <button
                type="button"
                onClick={() => toggleContract(contract.contractAddress)}
                className="flex w-full items-center justify-between p-3 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">{contract.contractName}</p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {truncateAddress(contract.contractAddress)}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {contract.selectedEvents.size}/{contract.contractEvents.length} events
                </Badge>
              </button>

              {isExpanded && (
                <div className="border-t border-white/10 p-3 space-y-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => selectAllEvents(contract.contractAddress)}
                      disabled={allSelected}
                      className="text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => deselectAllEvents(contract.contractAddress)}
                      disabled={noneSelected}
                      className="text-xs"
                    >
                      Clear
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {contract.contractEvents
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((event) => (
                        <label
                          key={event.name}
                          className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors"
                        >
                          <Checkbox
                            checked={contract.selectedEvents.has(event.name)}
                            onCheckedChange={() => toggleEvent(contract.contractAddress, event.name)}
                          />
                          <span className="text-sm text-white">{event.name}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="button" onClick={handleSubmit} disabled={totalSelectedEvents === 0} className="flex-1">
          Save Selection
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
