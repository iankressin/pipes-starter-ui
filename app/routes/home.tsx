import { PipesStarter } from '~/starter/pipes-starter'
import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Pipe' }]
}

export default function Home() {
  return <PipesStarter />
}
