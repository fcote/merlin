import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import React, { HTMLAttributes } from 'react'

import './HeaderAddButton.style.less'

interface HeaderAddButtonProps extends HTMLAttributes<any> {
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
