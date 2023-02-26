import { SyncOutlined } from '@ant-design/icons'
import { Modal, Form, Input, Button, FormInstance } from 'antd'
import React, { useRef } from 'react'

import { LoginFormType } from '@components/forms/LoginForm/LoginForm'

import successNotification from '@helpers/successNotification'

import {
  useSelfUserAccountSync,
  UserAccountSyncInputs,
} from '@hooks/api/mutations/useSelfUserAccountSync'

import { SuccessMessage } from '@lib/messages'

interface UserAccountLoginModalProps {
  accountId: string
  accountLabel: string
  isVisible: boolean
  setIsVisible: (value: boolean) => void
  triggerRefresh: () => void
}

const UserAccountSyncModal = ({
  accountId,
  accountLabel,
  isVisible,
  setIsVisible,
  triggerRefresh,
}: UserAccountLoginModalProps) => {
  const form = useRef<FormInstance<LoginFormType>>()
  const { selfUserAccountSync, selfUserAccountSyncLoading, saveCredentials } =
    useSelfUserAccountSync()

  const handleClose = () => {
    form.current.resetFields()
    setIsVisible(false)
  }

  const handleSync = async (formInputs: LoginFormType) => {
    const inputs: UserAccountSyncInputs = {
      id: accountId,
      username: formInputs!.username,
      password: formInputs!.password,
    }
    await selfUserAccountSync({
      variables: { inputs },
    })
    saveCredentials(inputs)
    triggerRefresh()
    successNotification(SuccessMessage.accountSync, accountLabel)
    handleClose()
  }

  return (
    <Modal
      className="user-account-login-modal"
      title={accountLabel}
      open={isVisible}
      footer={null}
      closable={true}
      onCancel={handleClose}
    >
      <Form
        ref={form}
        name="user-account-login-form"
        layout="vertical"
        onFinish={handleSync}
      >
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

        <Form.Item style={{ marginBottom: '0', marginTop: '12px' }}>
          <Button
            style={{ width: '100%' }}
            size="large"
            loading={selfUserAccountSyncLoading}
            htmlType="submit"
            icon={<SyncOutlined />}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UserAccountSyncModal
