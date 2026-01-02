declare module '@subsquid/pipes-cli/config/networks' {
  export const networks: Record<string, unknown>
}

declare module '@subsquid/pipes-cli/config/sinks' {
  export const sinks: ReadonlyArray<Record<string, unknown>>
}

declare module '@subsquid/pipes-cli/config/templates' {
  export const templateOptions: Record<string, ReadonlyArray<Record<string, unknown>>>
}
