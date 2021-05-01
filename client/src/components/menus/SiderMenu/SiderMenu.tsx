import {
  BankOutlined,
  LineChartOutlined,
  UnorderedListOutlined,
  WalletOutlined,
  FileSearchOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Menu } from 'antd'
import Sider from 'antd/es/layout/Sider'
import React from 'react'
import { Link } from 'react-router-dom'

import LinkButton from '@components/buttons/LinkButton/LinkButton'
import LogoutButton from '@components/buttons/LogoutButton/LogoutButton'

import './SiderMenu.style.less'

const SiderMenu = () => {
  return (
    <Sider className="main-sider" collapsed={true}>
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
      </Menu>
      <Menu className="main-sider-bottom-menu" theme="dark" mode="inline">
        <Menu.Item className="button-item" key="1" title="Logs">
          <LinkButton to="/logs" icon={<FileSearchOutlined />} />
        </Menu.Item>
        <Menu.Item className="button-item" key="2" title="Profile">
          <LinkButton to="/profile" icon={<UserOutlined />} />
        </Menu.Item>
        <Menu.Item className="button-item" key="3" title="Logout">
          <LogoutButton />
        </Menu.Item>
      </Menu>
    </Sider>
  )
}

export default SiderMenu
