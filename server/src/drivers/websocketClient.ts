import { get, set } from 'lodash'
import { v4 as uuid } from 'uuid'
import WebSocket from 'ws'

import { timeout } from '@helpers/timeout'
import { ApolloUnauthorized } from '@typings/errors/apolloErrors'

export type WebsocketCommand = {
  message: any
  idField?: string
  wait?: number
  isLogin?: boolean
}

class WebsocketClient {
  public socket: WebSocket
  private isConnected: boolean

  constructor(private endpoint: string, private loginCommand?: any) {}

  private open = (endpoint: string) => {
    return new Promise<void>((resolve, reject) => {
      this.socket = new WebSocket(endpoint)
      this.socket.setMaxListeners(50)
      this.socket.on('error', (err) => {
        reject(err)
      })
      this.socket.once('open', () => {
        resolve()
      })
    })
  }

  private connect = async () => {
    if (!this.loginCommand) {
      this.isConnected = true
      return
    }

    const response = await this.sendCommand<{
      status: boolean
      streamSessionId: string
    }>({ message: this.loginCommand, wait: null, isLogin: true })

    if (!response?.status) {
      throw new ApolloUnauthorized('WRONG_PROVIDER_CREDENTIALS')
    }

    this.isConnected = true
  }

  close = () => {
    this.socket.close(1000)
  }

  sendCommand = async <T = any>(command: WebsocketCommand) => {
    const isLogin = command.isLogin ?? false
    const wait = command.wait ?? 500
    const message = { ...command.message }
    const requestId = uuid()
    if (command.idField) set(message, command.idField, requestId)

    if (!this.socket) await this.open(this.endpoint)
    if (!this.isConnected && !isLogin) await this.connect()

    const requestIdGuard = (data: any) => {
      return !command.idField || get(data, command.idField) === requestId
    }

    return new Promise<T>(async (resolve, reject) => {
      let response: T = null

      this.socket.send(JSON.stringify(message), (err) => {
        if (err) reject(err)
      })
      this.socket.on('message', (data: string) => {
        const parsedData = JSON.parse(data) as T
        if (!requestIdGuard(parsedData)) return
        response = parsedData
        if (!wait) resolve(response)
      })
      this.socket.on('error', (err) => {
        if (err) reject(err)
      })

      // Wait for xtb to send updated data
      if (wait) {
        await timeout(wait)
        resolve(response)
      }
    })
  }
}

export { WebsocketClient }
