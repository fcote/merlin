import { Layout } from 'antd'
import { Content } from 'antd/es/layout/layout'
import 'katex/dist/katex.min.css'
import React from 'react'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'

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
    <Switch>
      <PrivateRoute path="/home">
        <Home />
      </PrivateRoute>
      <PrivateRoute path="/portfolio">
        <Portfolio />
      </PrivateRoute>
      <PrivateRoute path="/watchlist">
        <Watchlist />
      </PrivateRoute>
      <PrivateRoute path="/security/:ticker">
        <SecurityDetail />
      </PrivateRoute>
      <PrivateRoute path="/tracker">
        <Tracker />
      </PrivateRoute>
      <PrivateRoute path="/earnings-calendar">
        <EarningsCalendar />
      </PrivateRoute>
      <PrivateRoute path="/profile">
        <Profile />
      </PrivateRoute>
      <PrivateRoute path="/logs">
        <Logs />
      </PrivateRoute>
    </Switch>
  )

  return (
    <ProvideAuth>
      <BrowserRouter>
        <Layout style={{ minHeight: '100vh' }}>
          <Switch>
            <Route path="/login">
              <Login />
            </Route>
            <PrivateRoute path="/">
              {window.location.pathname === '/' && (
                <Redirect to={{ pathname: '/home' }} />
              )}
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
            </PrivateRoute>
          </Switch>
        </Layout>
      </BrowserRouter>
    </ProvideAuth>
  )
}

export default App
