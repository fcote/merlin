import { config } from '@config'

const getEndpoint = (path: string, params?: string[]) => {
  const base = config.get('endpoint')
  const urlParams = params ? `/${params.join('/')}` : ''
  return `${base}${path}${urlParams}`
}

export default getEndpoint
