import { Layout } from 'antd'
import { Content } from 'antd/es/layout/layout'
import 'katex/dist/katex.min.css'
import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'

import '@style/main.less'

import PrivateRoute from '@components/PrivateRoute'
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
  const Router = (
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/security/:ticker" element={<SecurityDetail />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/earnings-calendar" element={<EarningsCalendar />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/logs" element={<Logs />} />
      </Route>
    </Routes>
  )

  if (window.location.pathname === '/') {
    return <Navigate to={{ pathname: '/home' }} />
  }

  return (
    <ProvideAuth>
      <BrowserRouter>
        <Layout style={{ minHeight: '100vh' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route
                path="/"
                element={
                  <div>
                    <SpotlightSearch openKey="alt+KeyR" closeKey="Escape" />
                    <SiderMenu />
                    <Layout className="site-layout">
                      <Content
                        style={{
                          margin: '24px 16px 0',
                          overflow: 'initial',
                        }}
                      >
                        <Scrollbar>{Router}</Scrollbar>
                      </Content>
                    </Layout>
                  </div>
                }
              />
            </Route>
          </Routes>
        </Layout>
      </BrowserRouter>
    </ProvideAuth>
  )
}

export default App
