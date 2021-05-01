import WebSocket from 'ws'

declare namespace WebSocketExtension {
  interface CustomWebSocket extends WebSocket {
    isAlive?: boolean
  }
}

export = WebSocketExtension
