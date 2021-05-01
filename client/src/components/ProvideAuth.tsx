import React from 'react'

import authContext from '@hooks/auth/context'
import { useProvideAuth } from '@hooks/auth/useProvideAuth'

const ProvideAuth = ({ children }) => {
  const auth = useProvideAuth()
  return <authContext.Provider value={auth}>{children}</authContext.Provider>
}

export default ProvideAuth
