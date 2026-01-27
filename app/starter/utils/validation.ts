import type { NetworkType } from '../types'

export function sanitizeProjectFolder(name: string): string {
  if (!name || name.trim().length === 0) {
    return 'pipes-project'
  }

  let sanitized = name.trim()

  // Replace spaces with dashes
  sanitized = sanitized.replace(/\s+/g, '-')

  // Remove invalid characters: < > : " | ? * and ASCII control characters (0x00-0x1F)
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, '')

  // Remove leading/trailing dots and dashes
  sanitized = sanitized.replace(/^[.-]+|[.-]+$/g, '')

  // Remove consecutive dashes
  sanitized = sanitized.replace(/-+/g, '-')

  // Check for reserved Windows names and replace them
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i
  if (reservedNames.test(sanitized)) {
    sanitized = `project-${sanitized}`
  }

  // Ensure it's not empty after sanitization
  if (!sanitized || sanitized.length === 0) {
    return 'pipes-project'
  }

  return sanitized
}

export function validateEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function validateSvmAddress(address: string): boolean {
  // Base58 validation: 32-44 characters, no 0, O, I, l
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
}

export function validateAddress(address: string, networkType: NetworkType): boolean {
  if (networkType === 'evm') {
    return validateEvmAddress(address)
  }
  return validateSvmAddress(address)
}

export function parseAddresses(input: string): string[] {
  return input
    .split(/[,\s]+/)
    .map((addr) => addr.trim())
    .filter((addr) => addr.length > 0)
}

export function formatAddressesForDisplay(addresses: string[]): string {
  if (addresses.length === 0) return ''
  if (addresses.length === 1) return truncateAddress(addresses[0])
  return `${truncateAddress(addresses[0])} +${addresses.length - 1} more`
}

export function truncateAddress(address: string): string {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
