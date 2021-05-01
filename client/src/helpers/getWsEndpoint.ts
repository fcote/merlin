import { config } from '@config'

const getWsEndpoint = (path: string) => {
  const base = config
    .get('endpoint')
    .replace('https://', 'wss://')
    .replace('http://', 'ws://')
  return `${base}${path}`
}

export default getWsEndpoint
