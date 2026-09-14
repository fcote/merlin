import { Button, ButtonProps } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import './LinkButton.style.less'

export type LinkButtonProps = ButtonProps & {
  to: string
  icon: React.ReactNode
}

const LinkButton: React.FC<LinkButtonProps> = ({ to, icon, ...props }) => {
  const navigate = useNavigate()

  const goToLink = async () => {
    navigate({ pathname: to })
  }

  return (
    <Button
      type="text"
      size="large"
      className="link-button"
      onClick={goToLink}
      icon={icon}
      {...props}
    />
  )
}

export default LinkButton
