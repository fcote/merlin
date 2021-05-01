import { get } from 'lodash'

const getConfigValue = (name: string, defaultValue: string) => {
  return window[name] !== `$${name}` ? window[name] : defaultValue
}

const buildConfig = () => ({
  endpoint: getConfigValue('ENDPOINT', 'http://localhost:3000'),
})

const fullConfig = buildConfig()

export const config = {
  get: (path: string) => get(fullConfig, path),
}
