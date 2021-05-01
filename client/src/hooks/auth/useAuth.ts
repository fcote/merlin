import { useContext } from 'react'

import authContext from '@hooks/auth/context'

const useAuth = () => {
  return useContext(authContext)
}

export default useAuth
