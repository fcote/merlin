import { BarChartOutlined, LoginOutlined } from '@ant-design/icons'
import { Space, Card, Form, Input, Button } from 'antd'
import { Typography } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import useAuth from '@hooks/auth/useAuth'
import { useDocumentTitle } from '@hooks/useDocumentTitle'

import './LoginForm.style.less'

export type LoginFormType = {
  username?: string
  password?: string
}

const LoginForm = () => {
  useDocumentTitle('Login')

  let [isLoading, setIsLoading] = useState(false)
  const { signin } = useAuth()
  const navigate = useNavigate()

  const handleSubmitLogin = async (values: LoginFormType) => {
    setIsLoading(true)
    try {
      const res = await signin(values.username, values.password)
      if (res) navigate({ pathname: '/home' }, { replace: true })
    } catch {
      // The Apollo error link displays the sign-in error.
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form name="login-form" layout="vertical" onFinish={handleSubmitLogin}>
      <Typography.Title id="login-form-title">
        <BarChartOutlined />
      </Typography.Title>
      <Space className="login-form-space" direction="vertical">
        <Card>
          <Form.Item
            label="Username"
            name="username"
            rules={[
              {
                required: true,
                message: 'Please input your username',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: 'Please input your password',
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            className="login-form-submit-item"
            wrapperCol={{ offset: 4, span: 20 }}
          >
            <Button
              type="default"
              shape="round"
              size="large"
              loading={isLoading}
              htmlType="submit"
              icon={<LoginOutlined />}
            />
          </Form.Item>
        </Card>
      </Space>
    </Form>
  )
}

export default LoginForm
