import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import useAuth from '@hooks/auth/useAuth'

const PrivateRoutes = () => {
  let auth = useAuth()
  return auth ? <Outlet /> : <Navigate to="/login" />
}

export default PrivateRoutes
