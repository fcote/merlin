import React from 'react'
import { Redirect, Route } from 'react-router-dom'

import useAuth from '@hooks/auth/useAuth'

const PrivateRoute = ({ children, ...rest }) => {
  let auth = useAuth()

  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth.user ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: location },
            }}
          />
        )
      }
    />
  )
}

export default PrivateRoute
