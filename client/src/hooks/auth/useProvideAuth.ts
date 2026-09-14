import client, { wsClient } from '@api/client'
import Cookies from 'js-cookie'
import { useState } from 'react'

import { useSignIn } from '@hooks/api/mutations/useSignIn'
import useUserFromCookies from '@hooks/auth/useUserFromCookies'

import User from '@lib/user'

export type IAuthContext = {
  user?: User
  signin?: (username: string, password: string) => Promise<User>
  signout?: (token: string) => Promise<boolean>
}

export const useProvideAuth = (): IAuthContext => {
  const cookiesUser = useUserFromCookies()
  const [user, setUser] = useState<User>(cookiesUser)
  const { signIn } = useSignIn()

  const signin = async (login: string, password: string) => {
    const res = await signIn({
      variables: { inputs: { username: login, password } },
    })
    if (!res) return null
    setUser(res)
    Cookies.set('userId', res.id)
    Cookies.set('username', res.username)
    Cookies.set('apiToken', res.apiToken)
    wsClient.terminate()

    return res
  }

  const signout = async () => {
    Cookies.remove('userId')
    Cookies.remove('username')
    Cookies.remove('apiToken')
    setUser(null)
    wsClient.terminate()
    await client.clearStore()

    return true
  }

  // Return the user object and auth methods
  return {
    user,
    signin,
    signout,
  }
}
