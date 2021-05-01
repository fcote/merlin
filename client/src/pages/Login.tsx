import { Col, Layout, Row } from 'antd'
import React from 'react'

import LoginForm from '@components/forms/LoginForm/LoginForm'

const Login = () => {
  return (
    <Layout>
      <div className="site-layout-content">
        <Row>
          <Col span={9} />
          <Col span={6}>
            <LoginForm />
          </Col>
          <Col span={9} />
        </Row>
      </div>
    </Layout>
  )
}

export default Login
