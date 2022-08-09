import { Layout } from 'antd'
import { Content } from 'antd/es/layout/layout'
import 'katex/dist/katex.min.css'
import React from 'react'
import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom'

import '@style/main.less'

import PrivateRoutes from '@components/PrivateRoutes'
import ProvideAuth from '@components/ProvideAuth'
import { Scrollbar } from '@components/Scrollbar'
import SiderMenu from '@components/menus/SiderMenu/SiderMenu'
import SpotlightSearch from '@components/modals/SpotlightSearchModal/SpotlightSearchModal'

import EarningsCalendar from '@pages/EarningsCalendar/EarningsCalendar'
import Home from '@pages/Home/Home'
import Login from '@pages/Login'
import Logs from '@pages/Logs/Logs'
import Portfolio from '@pages/Portfolio/Portfolio'
import Profile from '@pages/Profile/Profile'
import SecurityDetail from '@pages/SecurityDetail/SecurityDetail'
import Tracker from '@pages/Tracker/Tracker'
import Watchlist from '@pages/Watchlist/Watchlist'

const App = () => {
  const MainRoute = (
    <div style={{ flex: 1 }}>
      <SpotlightSearch openKey="alt+KeyR" closeKey="Escape" />
      <SiderMenu />
      <Layout className="site-layout">
        <Content className="site-content">
          <Scrollbar>
            <Outlet />
          </Scrollbar>
        </Content>
      </Layout>
    </div>
  )

  return (
    <ProvideAuth>
      <Layout style={{ minHeight: '100vh', flex: 1 }}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={MainRoute}>
              <Route element={<PrivateRoutes />}>
                <Route path="home" element={<Home />} />
                <Route path="portfolio" element={<Portfolio />} />
                <Route path="watchlist" element={<Watchlist />} />
                <Route path="security/:ticker/*" element={<SecurityDetail />} />
                <Route path="tracker" element={<Tracker />} />
                <Route
                  path="earnings-calendar"
                  element={<EarningsCalendar />}
                />
                <Route path="profile" element={<Profile />} />
                <Route path="logs" element={<Logs />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </Layout>
    </ProvideAuth>
  )
}

export default App
