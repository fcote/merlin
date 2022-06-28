import { Button } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import './LinkButton.style.less'

export type LinkButtonProps = {
  to: string
  icon: React.ReactNode
}

const LinkButton: React.FC<LinkButtonProps> = ({ to, icon }) => {
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
    />
  )
}

export default LinkButton
