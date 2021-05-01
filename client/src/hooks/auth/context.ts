import { createContext } from 'react'

import { IAuthContext } from '@hooks/auth/useProvideAuth'

const authContext = createContext({} as IAuthContext)

export default authContext
