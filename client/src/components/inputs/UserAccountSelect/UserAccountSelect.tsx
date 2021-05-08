import { Input, Button, Select, Divider } from 'antd'
import React, { useState, ChangeEvent, useRef, useMemo } from 'react'

import { useSelfUserAccountUpsert } from '@hooks/api/mutations/useSelfUserAccountUpsert'
import { useSelfUserAccounts } from '@hooks/api/queries/useSelfUserAccounts'

import UserAccount, { UserAccountType } from '@lib/userAccount'

export type UserAccountSelectProps = {
  value?: string
  onChange?: (value: string) => void
  type: UserAccountType
}

const UserAccountSelect: React.FC<UserAccountSelectProps> = ({
  value: providedValue,
  onChange,
  type,
}) => {
  const newAccountInputRef = useRef<Input>()
  const [selectedUserAccountId, setSelectedUserAccountId] = useState<string>()
  const [newUserAccountName, setNewUserAccountName] = useState<string>()

  const {
    data: userAccounts,
    loading: userAccountsLoading,
    refetch,
  } = useSelfUserAccounts(type)
  const {
    selfUserAccountUpsert,
    selfUserAccountUpsertLoading,
  } = useSelfUserAccountUpsert()

  const handleSelectChange = (value: string) => {
    setSelectedUserAccountId(value)
    onChange?.(value)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewUserAccountName(event.target.value)
  }

  const handleAdd = async () => {
    const inputs: Partial<UserAccount> = {
      type,
      balance: 0,
      name: newUserAccountName,
    }
    await selfUserAccountUpsert({
      variables: { inputs },
    })
    await refetch({
      filters: { types: [type] },
    })
    newAccountInputRef.current.setValue(null)
  }

  const SelectOptions = userAccounts.map((ua) => (
    <Select.Option key={ua.id} value={ua.id}>
      {ua.name}
    </Select.Option>
  ))

  const NewAccountForm = (
    <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
      <Input
        ref={newAccountInputRef}
        style={{ flex: 'auto', marginRight: 8 }}
        placeholder="New account"
        onChange={handleInputChange}
      />
      <Button onClick={handleAdd} loading={selfUserAccountUpsertLoading}>
        Add
      </Button>
    </div>
  )

  const value = useMemo(() => {
    return providedValue || selectedUserAccountId
  }, [providedValue, selectedUserAccountId])

  return (
    <Select
      loading={userAccountsLoading}
      onChange={handleSelectChange}
      value={value}
      allowClear
      dropdownRender={(menu) => (
        <div>
          {menu}
          <Divider style={{ margin: '4px 0' }} />
          {NewAccountForm}
        </div>
      )}
    >
      {SelectOptions}
    </Select>
  )
}

export default UserAccountSelect
