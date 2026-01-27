import { index, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('api/contract-metadata', 'routes/api.contract-metadata.ts'),
  route('api/config', 'routes/api.config.ts'),
  route('api/config/:id', 'routes/api.config.$id.ts'),
] satisfies RouteConfig
