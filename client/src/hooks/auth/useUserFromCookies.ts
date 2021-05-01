import Cookies from 'js-cookie'

import User from '@lib/user'

const useUserFromCookies = () => {
  const { userId, username, apiToken } = Cookies.get()
  if (!userId || !username || !apiToken) return null

  return {
    id: userId,
    username,
    apiToken,
  } as User
}

export default useUserFromCookies
