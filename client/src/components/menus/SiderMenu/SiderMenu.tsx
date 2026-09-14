import {
  BankOutlined,
  LineChartOutlined,
  UnorderedListOutlined,
  WalletOutlined,
  FileSearchOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { Menu } from 'antd'
import { Layout } from 'antd'
import React from 'react'
import { Link } from 'react-router-dom'

import LinkButton from '@components/buttons/LinkButton/LinkButton'
import LogoutButton from '@components/buttons/LogoutButton/LogoutButton'

import './SiderMenu.style.less'

const SiderMenu = () => {
  return (
    <Layout.Sider className="main-sider" collapsed={true}>
      <div className="logo">
        <Link className="logoLink" to="/home">
          <LineChartOutlined className="logo" />
        </Link>
      </div>
      <Menu theme="dark" mode="inline">
        <Menu.Item key="1" icon={<WalletOutlined />}>
          <Link to="/portfolio">Portfolio</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<UnorderedListOutlined />}>
          <Link to="/watchlist">Watchlist</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<BankOutlined />}>
          <Link to="/tracker">Tracker</Link>
        </Menu.Item>
        <Menu.Item key="4" icon={<CalendarOutlined />}>
          <Link to="/earnings-calendar">Earnings</Link>
        </Menu.Item>
      </Menu>
      <nav className="main-sider-bottom-menu" aria-label="Account">
        <LinkButton
          to="/logs"
          aria-label="Logs"
          icon={<FileSearchOutlined />}
        />
        <LinkButton
          to="/profile"
          aria-label="Profile"
          icon={<UserOutlined />}
        />
        <LogoutButton />
      </nav>
    </Layout.Sider>
  )
}

export default SiderMenu
