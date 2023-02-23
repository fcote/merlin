import { SaveOutlined } from '@ant-design/icons'
import { PageHeader } from '@ant-design/pro-layout'
import { Form, Card, Input, Button, Row, Col, FormInstance } from 'antd'
import React, { useRef, useEffect } from 'react'

import successNotification from '@helpers/successNotification'

import { useSelfUpdateUser } from '@hooks/api/mutations/useSelfUpdateUser'
import { useSelfProfile } from '@hooks/api/queries/useSelfProfile/useSelfProfile'
import { useDocumentTitle } from '@hooks/useDocumentTitle'

import { SuccessMessage } from '@lib/messages'

import './Profile.style.less'

export type ProfileForm = {
  username?: string
  currency?: string
}

const Profile = () => {
  useDocumentTitle('Profile')

  const { data: user, refetch } = useSelfProfile()
  const { selfUpdateUser, selUpdateUserLoading } = useSelfUpdateUser()

  const form = useRef<FormInstance<ProfileForm>>()

  useEffect(() => {
    if (!form.current) return

    form.current.setFieldsValue({
      username: user?.username,
      currency: user?.currency,
    })
  }, [user])

  const handleSubmit = async (values: ProfileForm) => {
    await selfUpdateUser({
      variables: {
        inputs: {
          username: values.username,
          currency: values.currency,
        },
      },
    })
    successNotification(SuccessMessage.profileUpdate)
    await refetch()
  }

  return (
    <div className="profile-section">
      <PageHeader title="Profile" />
      <Row gutter={16} style={{ marginTop: '36px' }}>
        <Col span={6} />
        <Col span={12}>
          <Form
            ref={form}
            name="profile-form"
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Card bordered={false}>
              <Form.Item label="Username" name="username">
                <Input />
              </Form.Item>

              <Form.Item label="Currency" name="currency">
                <Input />
              </Form.Item>

              <Form.Item
                className="profile-form-submit-item"
                style={{ marginBottom: '8px' }}
              >
                <Button
                  type="default"
                  size="large"
                  htmlType="submit"
                  loading={selUpdateUserLoading}
                  icon={<SaveOutlined />}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Card>
          </Form>
        </Col>
        <Col span={6} />
      </Row>
    </div>
  )
}

export default Profile
