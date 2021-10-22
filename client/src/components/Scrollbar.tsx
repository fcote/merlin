import React from 'react'
import { Scrollbars, ScrollbarProps } from 'react-custom-scrollbars'

const Scrollbar: React.FC<ScrollbarProps> = ({ children, ...rest }) => {
  return (
    <Scrollbars
      autoHide={true}
      className="main-scrollbar-container"
      renderThumbVertical={(props) => (
        <div {...props} className="main-scrollbar" />
      )}
      renderThumbHorizontal={(props) => (
        <div {...props} className="main-scrollbar" />
      )}
      {...rest}
    >
      {children}
    </Scrollbars>
  )
}

export { Scrollbar }
