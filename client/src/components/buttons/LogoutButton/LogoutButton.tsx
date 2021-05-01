import { LogoutOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

import useAuth from '@hooks/auth/useAuth'

import './LogoutButton.style.less'

const LogoutButton = () => {
  const auth = useAuth()
  const history = useHistory()
  const [isLoading, setIsLoading] = useState(false)

  const logout = async () => {
    setIsLoading(true)
    await auth.signout(auth.user.apiToken)
    setIsLoading(false)
    history.replace({ pathname: '/login' })
  }

  return (
    <Button
      type="text"
      size="large"
      id="logout-button"
      onClick={logout}
      icon={<LogoutOutlined />}
      loading={isLoading}
    />
  )
}

export default LogoutButton
