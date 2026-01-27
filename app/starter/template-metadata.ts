import { z } from 'zod'
import type { NetworkType, TemplateId } from './types'

export type TemplateMetadata = {
  templateId: TemplateId
  templateName: string
  networkType: NetworkType
  paramsSchema?: z.ZodObject<any>
  defaultParams?: Record<string, any>
  disabled?: boolean
}

// ERC20 Transfers template
const erc20TransfersSchema = z.object({
  contractAddresses: z
    .array(z.string())
    .default(['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'])
    .describe('Array of erc20 contract addresses to track'),
})

// Uniswap V3 Swaps template
const uniswapV3SwapsSchema = z.object({
  factoryAddress: z
    .string()
    .default('0x1f98431c8ad98523631ae4a59f267346ea31f984')
    .describe('The Uniswap V3 compatible factory address to dynamically track pools'),
})

// Template metadata registry
export const templateMetadataRegistry: Record<string, TemplateMetadata> = {
  // EVM Templates
  erc20Transfers: {
    templateId: 'erc20Transfers',
    templateName: 'ERC20 Transfers',
    networkType: 'evm',
    paramsSchema: erc20TransfersSchema,
    defaultParams: {
      contractAddresses: ['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
    },
  },
  uniswapV3Swaps: {
    templateId: 'uniswapV3Swaps',
    templateName: 'Uniswap V3 Swaps',
    networkType: 'evm',
    paramsSchema: uniswapV3SwapsSchema,
    defaultParams: {
      factoryAddress: '0x1f98431c8ad98523631ae4a59f267346ea31f984',
    },
  },
  morphoBlue: {
    templateId: 'morphoBlue',
    templateName: 'Morpho Blue',
    networkType: 'evm',
    disabled: true,
  },
  uniswapV4: {
    templateId: 'uniswapV4',
    templateName: 'Uniswap V4',
    networkType: 'evm',
    disabled: true,
  },
  polymarket: {
    templateId: 'polymarket',
    templateName: 'Polymarket',
    networkType: 'evm',
    disabled: true,
  },
  custom: {
    templateId: 'custom',
    templateName: 'Bring your own contracts',
    networkType: 'evm',
    // Custom template uses CustomTemplateForm component
  },
  // SVM Templates
  tokenBalances: {
    templateId: 'tokenBalances',
    templateName: 'Token balances',
    networkType: 'svm',
    // No params needed
  },
}

export function getTemplateMetadata(templateId: TemplateId): TemplateMetadata | undefined {
  return templateMetadataRegistry[templateId]
}

export function needsParams(templateId: TemplateId): boolean {
  const metadata = getTemplateMetadata(templateId)
  return Boolean(metadata && (metadata.paramsSchema || templateId === 'custom'))
}
