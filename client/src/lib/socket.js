import { io } from 'socket.io-client'

import { API_BASE_URL } from './api'

let socket
let currentToken = null

export function getSocket() {
  const token = localStorage.getItem('token') || ''

  if (!socket) {
    socket = io(API_BASE_URL, {
      autoConnect: false,
      withCredentials: true,
      auth: {
        token,
      },
    })

    currentToken = token
    socket.connect()
    return socket
  }

  if (currentToken !== token) {
    currentToken = token
    socket.auth = { token }

    if (socket.connected) {
      socket.disconnect().connect()
    } else {
      socket.connect()
    }
  }

  return socket
}