import { CSSProperties, ReactNode } from 'react'

export const PageHeader = ({
  title,
  extra,
  children,
  className = '',
  style,
}: {
  title: ReactNode
  extra?: ReactNode
  children?: ReactNode
  className?: string
  style?: CSSProperties
}) => (
  <header className={`ant-page-header ${className}`} style={style}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div className="ant-page-header-heading-title">{title}</div>
      {extra && <div>{extra}</div>}
    </div>
    {children}
  </header>
)
