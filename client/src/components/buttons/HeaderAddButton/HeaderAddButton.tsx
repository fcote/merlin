import { PlusOutlined } from '@ant-design/icons'
import { Button, ButtonProps } from 'antd'
import React from 'react'

import './HeaderAddButton.style.less'

interface HeaderAddButtonProps extends ButtonProps {
  handleAdd: () => void
}

const HeaderAddButton: React.FC<HeaderAddButtonProps> = ({
  handleAdd,
  ...restProps
}) => {
  return (
    <Button
      className="header-add-button"
      onClick={handleAdd}
      icon={<PlusOutlined />}
      {...restProps}
    />
  )
}

export default HeaderAddButton
