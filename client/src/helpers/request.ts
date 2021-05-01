import { message } from 'antd'

export type ResponseType<T> = {
  success: boolean
  data: T
}

export type ResponseErrorType = {
  error: string
  message: string
}

export type RequestOptions<IT> = {
  urlParams?: { [key: string]: string }
  inputs?: IT
  apiToken?: string
}

export type Request = <RT, IT = any>(
  url: string,
  method: 'GET' | 'POST' | 'PUT'
) => (params?: RequestOptions<IT>) => Promise<RT>

const replaceUrlParams = (url: string, params: { [key: string]: string }) => {
  return Object.entries(params).reduce((finalUrl, [key, value]) => {
    return finalUrl.replace(`:${key}`, value)
  }, url)
}

const request = <RT, IT = any>(
  url: string,
  method: 'GET' | 'POST' | 'PUT'
) => async (params?: RequestOptions<IT>): Promise<RT> => {
  const getUrl = () => {
    if (!params?.urlParams) return url
    return replaceUrlParams(url, params.urlParams)
  }

  const options: RequestInit = { method, headers: {} }
  if (params?.inputs) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(params.inputs)
  }
  if (params?.apiToken) {
    options.headers['x-api-token'] = params.apiToken
  }

  try {
    const response = await fetch(getUrl(), options)
    const result = await response.json()

    if (response.status !== 200) {
      const errorResponse = result as ResponseErrorType
      throw new Error(errorResponse.error)
    }

    return (result as ResponseType<RT>).data
  } catch (e) {
    message.error(e.message)
    return null
  }
}

export default request
