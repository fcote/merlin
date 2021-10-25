import { Menu, Col, Row } from 'antd'
import { takeRight } from 'lodash'
import React, { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { FinancialFreq } from '@lib/financial'
import { FinancialItemType } from '@lib/financialItem'
import { Security } from '@lib/security'

export type SecurityDetailMenuProps = {
  security?: Security
}

const SecurityDetailMenu: React.FC<SecurityDetailMenuProps> = ({
  security,
}) => {
  const location = useLocation()

  const subPage = useMemo(() => {
    const urlComponents = location.pathname.split('/')
    return takeRight(urlComponents, 2).shift() as FinancialItemType
  }, [location])

  const freq = useMemo(() => {
    const currentFreq = takeRight(
      location.pathname.split('/'),
      1
    ).shift() as FinancialFreq
    return Object.values(FinancialFreq).includes(currentFreq)
      ? currentFreq
      : FinancialFreq.Y
  }, [location])

  const MainMenu = (
    <Menu mode="horizontal" defaultSelectedKeys={[subPage]}>
      {security?.type === 'commonStock' && (
        <Menu.Item key="statement">
          <Link to={`/security/${security?.ticker}/statement/${freq}`}>
            Statements
          </Link>
        </Menu.Item>
      )}
      {security?.type === 'commonStock' && (
        <Menu.Item key="ratio">
          <Link to={`/security/${security?.ticker}/ratio/${freq}`}>Ratios</Link>
        </Menu.Item>
      )}
      {security?.type === 'commonStock' && (
        <Menu.Item key="estimate">
          <Link to={`/security/${security?.ticker}/estimate/${freq}`}>
            Analyst estimates
          </Link>
        </Menu.Item>
      )}
      <Menu.Item key="chart">
        <Link to={`/security/${security?.ticker}/chart`}>Chart</Link>
      </Menu.Item>
      {security?.type === 'commonStock' && (
        <Menu.Item key="earnings-calendar">
          <Link to={`/security/${security?.ticker}/earnings-calendar`}>
            Earnings calendar
          </Link>
        </Menu.Item>
      )}
      {security?.type === 'commonStock' && (
        <Menu.Item key="news">
          <Link to={`/security/${security?.ticker}/news`}>News</Link>
        </Menu.Item>
      )}
    </Menu>
  )

  const SubMenu = () => {
    if (!['statement', 'ratio', 'estimate'].includes(subPage)) return null

    return (
      <Menu
        mode="horizontal"
        defaultSelectedKeys={[freq]}
        style={{ float: 'right' }}
      >
        <Menu.Item key="Y">
          <Link to={`/security/${security?.ticker}/${subPage}/Y`}>Year</Link>
        </Menu.Item>
        <Menu.Item key="Q">
          <Link to={`/security/${security?.ticker}/${subPage}/Q`}>Quarter</Link>
        </Menu.Item>
      </Menu>
    )
  }

  return (
    <Row>
      <Col span={12}>{MainMenu}</Col>
      <Col span={12}>{SubMenu()}</Col>
    </Row>
  )
}

export default SecurityDetailMenu
