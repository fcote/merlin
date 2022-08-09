import React from 'react'
import {
  Scrollbar as CustomScrollbar,
  ScrollbarProps,
} from 'react-scrollbars-custom'

const Scrollbar: React.FC<ScrollbarProps> = ({ children }) => {
  return (
    <CustomScrollbar
      className="main-scrollbar-container"
      wrapperProps={{
        renderer: (props) => {
          const { elementRef, ...restProps } = props
          return (
            <div
              {...restProps}
              ref={elementRef}
              className="scrollbar-wrapper"
            />
          )
        },
      }}
      contentProps={{
        renderer: (props) => {
          const { elementRef, ...restProps } = props
          return (
            <span
              {...restProps}
              ref={elementRef}
              className="scrollbar-content"
            />
          )
        },
      }}
      thumbYProps={{
        renderer: (props) => {
          const { elementRef, ...restProps } = props
          return (
            <div
              {...restProps}
              ref={elementRef}
              className="scrollbar-thumb-y"
            />
          )
        },
      }}
    >
      {children}
    </CustomScrollbar>
  )
}

export { Scrollbar }
